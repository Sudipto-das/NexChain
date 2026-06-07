const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Investment schema
 * - One document per user commitment into a plan.
 * - Plan-specific knobs (duration, daily ROI %) are snapshotted onto the
 *   investment at creation time. That way, if the plan is later edited or
 *   deleted, historical investments still compute correctly.
 * - endDate is computed from startDate + planDurationDays and used by the
 *   daily ROI cron to know when to stop accruing.
 */
const investmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    investmentAmount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [0, 'Investment amount must be positive'],
    },

    // ---- Plan snapshot (captured at the time of investment) ----
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    planDurationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      // Optional: keep a link back to the plan template for auditing.
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      // Indexed together with status for "active investments ending soon" queries.
      index: true,
    },

    dailyRoiPercentage: {
      type: Number,
      required: true,
      min: 0,
      // Stored as a percent (e.g. 1.5 means 1.5% per day), not a fraction.
    },

    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index — supports "user's active investments" and dashboard rollups.
investmentSchema.index({ user: 1, status: 1 });
// Compound index — supports the daily ROI cron: "find active investments ending after X"
investmentSchema.index({ status: 1, endDate: 1 });

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
