const { User, ReferralIncome, Investment } = require('../models');

const DEFAULT_LEVEL_PERCENTAGES = {
  1: 5,
  2: 3,
  3: 2,
  4: 1,
  5: 1,
};

function getLevelPercentage(level, customPercentages = {}) {
  return customPercentages[level] ?? DEFAULT_LEVEL_PERCENTAGES[level] ?? 0;
}

async function getReferralUpline(userId, maxLevel = 20) {
  const upline = [];
  let currentUserId = userId;
  let level = 0;

  while (level < maxLevel) {
    const user = await User.findById(currentUserId).select('referredBy').lean();
    if (!user || !user.referredBy) break;

    level++;
    upline.push({
      userId: user.referredBy,
      level,
    });
    currentUserId = user.referredBy;
  }

  return upline;
}

async function calculateAndCreditLevelIncome(generatorId, investmentAmount, sourceInvestmentId, customPercentages = {}) {
  const results = {
    credited: [],
    skipped: [],
    errors: [],
    totalCredited: 0,
  };

  const upline = await getReferralUpline(generatorId);

  for (const { userId: receiverId, level } of upline) {
    const percentage = getLevelPercentage(level, customPercentages);
    
    if (percentage <= 0) {
      results.skipped.push({ level, receiverId, reason: 'No percentage configured for this level' });
      continue;
    }

    const incomeAmount = Number((investmentAmount * percentage / 100).toFixed(2));

    if (incomeAmount <= 0) {
      results.skipped.push({ level, receiverId, reason: 'Calculated income amount is zero' });
      continue;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await ReferralIncome.findOne({
      receiver: receiverId,
      generator: generatorId,
      level,
      sourceInvestment: sourceInvestmentId,
      date: today,
    }).lean();

    if (existing) {
      results.skipped.push({ level, receiverId, reason: 'Already credited for this investment today' });
      continue;
    }

    const session = await ReferralIncome.startSession();
    session.startTransaction();

    try {
      await ReferralIncome.create([{
        receiver: receiverId,
        generator: generatorId,
        level,
        incomeAmount,
        sourceInvestment: sourceInvestmentId,
        date: today,
      }], { session });

      await User.findByIdAndUpdate(
        receiverId,
        {
          $inc: {
            walletBalance: incomeAmount,
            totalLevelIncomeEarned: incomeAmount,
          },
        },
        { session }
      );

      await session.commitTransaction();
      
      results.credited.push({
        level,
        receiverId,
        incomeAmount,
        percentage,
      });
      results.totalCredited += incomeAmount;
    } catch (txnError) {
      await session.abortTransaction();
      results.errors.push({ level, receiverId, error: txnError.message });
    } finally {
      await session.endSession();
    }
  }

  return results;
}

async function processLevelIncomeForInvestment(investmentId, customPercentages = {}) {
  const investment = await Investment.findById(investmentId).lean();
  
  if (!investment) {
    throw new Error('Investment not found');
  }

  if (investment.status !== 'Active') {
    return { credited: [], skipped: [], errors: [], totalCredited: 0 };
  }

  return calculateAndCreditLevelIncome(
    investment.user,
    investment.investmentAmount,
    investment._id,
    customPercentages
  );
}

async function processLevelIncomeForAllActiveInvestments(customPercentages = {}) {
  const results = {
    totalInvestments: 0,
    totalCredited: 0,
    totalErrors: 0,
    investmentResults: [],
  };

  const activeInvestments = await Investment.find({ status: 'Active' }).lean();
  results.totalInvestments = activeInvestments.length;

  for (const investment of activeInvestments) {
    try {
      const result = await calculateAndCreditLevelIncome(
        investment.user,
        investment.investmentAmount,
        investment._id,
        customPercentages
      );
      results.totalCredited += result.totalCredited;
      results.totalErrors += result.errors.length;
      results.investmentResults.push({
        investmentId: investment._id,
        ...result,
      });
    } catch (error) {
      results.totalErrors++;
      results.investmentResults.push({
        investmentId: investment._id,
        credited: [],
        skipped: [],
        errors: [{ error: error.message }],
        totalCredited: 0,
      });
    }
  }

  return results;
}

async function getLevelIncomeStats(receiverId, startDate, endDate) {
  const match = { receiver: receiverId };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const [stats, history] = await Promise.all([
    ReferralIncome.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          totalAmount: { $sum: '$incomeAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    ReferralIncome.find(match)
      .populate('generator', 'fullName email referralCode')
      .sort({ date: -1 })
      .lean(),
  ]);

  const totalAmount = stats.reduce((sum, s) => sum + s.totalAmount, 0);

  return {
    summary: {
      totalAmount,
      totalTransactions: stats.reduce((sum, s) => sum + s.count, 0),
      byLevel: stats.map(s => ({
        level: s._id,
        count: s.count,
        totalAmount: s.totalAmount,
      })),
    },
    history,
  };
}

async function getLevelIncomeByGenerator(generatorId, startDate, endDate) {
  const match = { generator: generatorId };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  return ReferralIncome.find(match)
    .populate('receiver', 'fullName email referralCode')
    .sort({ date: -1 })
    .lean();
}

module.exports = {
  calculateAndCreditLevelIncome,
  processLevelIncomeForInvestment,
  processLevelIncomeForAllActiveInvestments,
  getLevelIncomeStats,
  getLevelIncomeByGenerator,
  getReferralUpline,
  DEFAULT_LEVEL_PERCENTAGES,
};