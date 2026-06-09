const { Investment, User } = require('../models');

/**
 * GET /api/dashboard
 * Returns dashboard summary for the authenticated user:
 * - totalInvestments: sum of all investment amounts
 * - totalRoiEarned: from user document
 * - totalLevelIncomeEarned: from user document
 * - walletBalance: from user document
 */
async function getDashboard(req, res, next) {
  try {
    const userId = req.user._id;

    // Get total investments sum
    const investmentAggregation = await Investment.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalInvestments: { $sum: '$investmentAmount' } } },
    ]);

    const totalInvestments = investmentAggregation.length > 0 ? investmentAggregation[0].totalInvestments : 0;

    // Get user's financial summary fields
    const user = await User.findById(userId).select('walletBalance totalRoiEarned totalLevelIncomeEarned').lean();

    return res.json({
      success: true,
      dashboard: {
        totalInvestments,
        totalRoiEarned: user.totalRoiEarned,
        totalLevelIncomeEarned: user.totalLevelIncomeEarned,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getDashboard };