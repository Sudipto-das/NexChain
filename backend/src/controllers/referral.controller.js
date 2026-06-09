const { User } = require('../models');

/**
 * GET /api/referrals/direct
 * Returns direct referrals (level 1) for the authenticated user.
 * Query params: page (default 1), limit (default 20)
 */
async function getDirectReferrals(req, res, next) {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [referrals, total] = await Promise.all([
      User.find({ referredBy: userId })
        .select('fullName email mobileNumber referralCode walletBalance totalRoiEarned totalLevelIncomeEarned accountStatus createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ referredBy: userId }),
    ]);

    return res.json({
      success: true,
      referrals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/referrals/tree
 * Returns the complete referral tree for the authenticated user.
 * Uses recursive aggregation to build the tree structure.
 * Query param: maxDepth (default 10) - maximum depth to traverse
 */
async function getReferralTree(req, res, next) {
  try {
    const userId = req.user._id;
    const maxDepth = Math.min(20, Math.max(1, parseInt(req.query.maxDepth) || 10));

    // Build referral tree using MongoDB's $graphLookup
    const tree = await User.aggregate([
      { $match: { _id: userId } },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'referredBy',
          as: 'referralTree',
          maxDepth,
          depthField: 'level',
          restrictSearchWithMatch: {},
        },
      },
      {
        $project: {
          _id: 0,
          referralTree: {
            $map: {
              input: '$referralTree',
              as: 'user',
              in: {
                _id: '$$user._id',
                fullName: '$$user.fullName',
                email: '$$user.email',
                mobileNumber: '$$user.mobileNumber',
                referralCode: '$$user.referralCode',
                walletBalance: '$$user.walletBalance',
                totalRoiEarned: '$$user.totalRoiEarned',
                totalLevelIncomeEarned: '$$user.totalLevelIncomeEarned',
                accountStatus: '$$user.accountStatus',
                createdAt: '$$user.createdAt',
                level: '$$user.level',
                referredBy: '$$user.referredBy',
              },
            },
          },
        },
      },
    ]);

    const referralTree = tree[0]?.referralTree || [];

    // Group by level for easier frontend consumption
    const treeByLevel = referralTree.reduce((acc, user) => {
      const level = user.level || 1;
      if (!acc[level]) acc[level] = [];
      acc[level].push(user);
      return acc;
    }, {});

    // Calculate stats per level
    const levelStats = Object.entries(treeByLevel).map(([level, users]) => ({
      level: parseInt(level),
      count: users.length,
      totalWalletBalance: users.reduce((sum, u) => sum + (u.walletBalance || 0), 0),
      totalRoiEarned: users.reduce((sum, u) => sum + (u.totalRoiEarned || 0), 0),
      totalLevelIncomeEarned: users.reduce((sum, u) => sum + (u.totalLevelIncomeEarned || 0), 0),
    }));

    return res.json({
      success: true,
      referralTree,
      treeByLevel,
      levelStats,
      totalReferrals: referralTree.length,
      maxDepth,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/referrals/stats
 * Returns referral statistics for the authenticated user.
 */
async function getReferralStats(req, res, next) {
  try {
    const userId = req.user._id;

    // Count direct referrals
    const directCount = await User.countDocuments({ referredBy: userId });

    // Get total downline count using aggregation
    const downlineAgg = await User.aggregate([
      { $match: { _id: userId } },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'referredBy',
          as: 'downline',
          maxDepth: 20,
        },
      },
      { $project: { totalDownline: { $size: '$downline' } } },
    ]);

    const totalDownline = downlineAgg[0]?.totalDownline || 0;

    // Get referral income stats
    const { ReferralIncome } = require('../models');
    const incomeStats = await ReferralIncome.aggregate([
      { $match: { receiver: userId } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          totalAmount: { $sum: '$incomeAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalLevelIncome = incomeStats.reduce((sum, s) => sum + s.totalAmount, 0);

    return res.json({
      success: true,
      stats: {
        directReferrals: directCount,
        totalDownline,
        totalLevelIncome,
        incomeByLevel: incomeStats.map(s => ({
          level: s._id,
          count: s.count,
          totalAmount: s.totalAmount,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDirectReferrals,
  getReferralTree,
  getReferralStats,
};