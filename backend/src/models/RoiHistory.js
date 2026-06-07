const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * ROI History schema
 * - Append-only ledger of daily ROI credits against an investment.
 * - One document per (investment, day) — written by the daily ROI cron and
 *   used to render ROI history charts and compute totals.
 * - status lets you distinguish "credited to wallet" vs "pending" (e.g.
 *   if the wallet credit is processed asynchronously after the ledger entry).
 */
const roiHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    investment: {
      type: Schema.Types.ObjectId,
      ref: 'Investment',
      required: true,
      index: true,
    },

    roiAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Credited', 'Reversed'],
      default: 'Credited',
      index: true,
    },

    // Day-of the investment (1, 2, 3, ...) — convenient for "Day X earnings" displays.
    dayNumber: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Most common query: a user's ROI history, newest first.
roiHistorySchema.index({ user: 1, date: -1 });
// Idempotency guard for the daily cron: never credit the same (investment, day) twice.
// Normalize "date" to the start of the day in the cron before writing.
roiHistorySchema.index({ investment: 1, date: 1 }, { unique: true });
// Useful for status rollups (e.g. "find all pending credits to process").
roiHistorySchema.index({ status: 1, date: -1 });

const RoiHistory = mongoose.model('RoiHistory', roiHistorySchema);

module.exports = RoiHistory;
