const { Investment, User } = require('../models');

/**
 * POST /api/investments
 * Body: { planName, planDurationDays, dailyRoiPercentage, investmentAmount, planId? }
 * Creates a new investment for the authenticated user.
 */
async function createInvestment(req, res, next) {
  try {
    const { planName, planDurationDays, dailyRoiPercentage, investmentAmount, planId } = req.body || {};

    if (!planName || !planDurationDays || !dailyRoiPercentage || !investmentAmount) {
      return res.status(400).json({
        success: false,
        message: 'planName, planDurationDays, dailyRoiPercentage, and investmentAmount are required',
      });
    }

    if (investmentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Investment amount must be positive',
      });
    }

    if (planDurationDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Plan duration must be at least 1 day',
      });
    }

    if (dailyRoiPercentage < 0) {
      return res.status(400).json({
        success: false,
        message: 'Daily ROI percentage cannot be negative',
      });
    }

    const user = req.user;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + planDurationDays);

    const investment = await Investment.create({
      user: user._id,
      investmentAmount,
      planName,
      planDurationDays,
      planId: planId || null,
      startDate,
      endDate,
      dailyRoiPercentage,
      status: 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      investment,
    });
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message,
        details: err.errors,
      });
    }
    return next(err);
  }
}

/**
 * GET /api/investments
 * Returns all investments for the authenticated user.
 * Query params: status (optional) - filter by status (Active, Completed, Cancelled)
 */
async function getUserInvestments(req, res, next) {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    const investments = await Investment.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      investments,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/investments/:id
 * Returns a single investment by ID for the authenticated user.
 */
async function getInvestmentById(req, res, next) {
  try {
    const { id } = req.params;

    const investment = await Investment.findOne({ _id: id, user: req.user._id }).lean();

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found',
      });
    }

    return res.json({
      success: true,
      investment,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createInvestment,
  getUserInvestments,
  getInvestmentById,
};