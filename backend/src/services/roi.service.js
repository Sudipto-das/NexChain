const { Investment, RoiHistory, User } = require('../models');

const MAX_DAYS_LOOKBACK = 7;

function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateRoiAmount(investmentAmount, dailyRoiPercentage) {
  return Number((investmentAmount * dailyRoiPercentage / 100).toFixed(2));
}

function calculateDayNumber(startDate, targetDate) {
  const start = getStartOfDay(startDate);
  const target = getStartOfDay(targetDate);
  const diffTime = target - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

async function processDailyRoi(targetDate = new Date()) {
  const processDate = getStartOfDay(targetDate);
  const results = {
    processed: 0,
    skipped: 0,
    errors: [],
    totalRoiDistributed: 0,
  };

  const activeInvestments = await Investment.find({
    status: 'Active',
    endDate: { $gte: processDate },
  }).lean();

  for (const investment of activeInvestments) {
    try {
      const dayNumber = calculateDayNumber(investment.startDate, processDate);
      
      if (dayNumber < 1 || dayNumber > investment.planDurationDays) {
        results.skipped++;
        continue;
      }

      const existingRoi = await RoiHistory.findOne({
        investment: investment._id,
        date: processDate,
      }).lean();

      if (existingRoi) {
        results.skipped++;
        continue;
      }

      const roiAmount = calculateRoiAmount(investment.investmentAmount, investment.dailyRoiPercentage);

      const session = await Investment.startSession();
      session.startTransaction();

      try {
        await RoiHistory.create([{
          user: investment.user,
          investment: investment._id,
          roiAmount,
          date: processDate,
          status: 'Credited',
          dayNumber,
        }], { session });

        await User.findByIdAndUpdate(
          investment.user,
          {
            $inc: {
              walletBalance: roiAmount,
              totalRoiEarned: roiAmount,
            },
          },
          { session }
        );

        await session.commitTransaction();
        
        results.processed++;
        results.totalRoiDistributed += roiAmount;
      } catch (txnError) {
        await session.abortTransaction();
        throw txnError;
      } finally {
        await session.endSession();
      }
    } catch (error) {
      results.errors.push({
        investmentId: investment._id.toString(),
        error: error.message,
      });
    }
  }

  return results;
}

async function processRoiForDateRange(startDate, endDate) {
  const results = {
    totalProcessed: 0,
    totalSkipped: 0,
    totalErrors: 0,
    totalRoiDistributed: 0,
    dailyResults: [],
  };

  const current = getStartOfDay(startDate);
  const end = getStartOfDay(endDate);

  while (current <= end) {
    const dailyResult = await processDailyRoi(current);
    results.totalProcessed += dailyResult.processed;
    results.totalSkipped += dailyResult.skipped;
    results.totalErrors += dailyResult.errors.length;
    results.totalRoiDistributed += dailyResult.totalRoiDistributed;
    results.dailyResults.push({
      date: new Date(current),
      ...dailyResult,
    });
    current.setDate(current.getDate() + 1);
  }

  return results;
}

async function getRoiStats(userId, startDate, endDate) {
  const match = { user: userId };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = getStartOfDay(startDate);
    if (endDate) match.date.$lte = getStartOfDay(endDate);
  }

  const [stats, history] = await Promise.all([
    RoiHistory.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRoi: { $sum: '$roiAmount' },
          count: { $sum: 1 },
          avgRoi: { $avg: '$roiAmount' },
        },
      },
    ]),
    RoiHistory.find(match)
      .sort({ date: -1 })
      .lean(),
  ]);

  return {
    summary: stats[0] || { totalRoi: 0, count: 0, avgRoi: 0 },
    history,
  };
}

module.exports = {
  processDailyRoi,
  processRoiForDateRange,
  getRoiStats,
  calculateRoiAmount,
  calculateDayNumber,
  getStartOfDay,
};