const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Referral / Level Income schema
 * - One document per level-income credit event.
 * - receiver = the user who earned the commission (the upline).
 * - generator = the user whose activity produced the commission (the downline).
 * - level = the depth in the referral tree (1 = direct, 2 = second level, ...).
 *   Storing the level as a number makes "total income per level" aggregation
 *   trivial with $group.
 * - An optional investmentId ties the income to the specific investment that
 *   triggered it, useful for audit / dispute resolution.
 */
const referralIncomeSchema = new Schema(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver (upline) is required'],
      index: true,
    },

    generator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Generator (downline) is required'],
      index: true,
    },

    level: {
      type: Number,
      required: true,
      min: 1,
      max: 20, // sanity cap — referral trees rarely go this deep
    },

    incomeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Most common query: "show me my level income, newest first"
referralIncomeSchema.index({ receiver: 1, date: -1 });
// Useful for the cron: "has this receiver already been credited for this investment today at level N?"
// Enforces idempotency if you wire a unique index here in the service layer.
referralIncomeSchema.index({ receiver: 1, generator: 1, level: 1, sourceInvestment: 1, date: 1 });

const ReferralIncome = mongoose.model('ReferralIncome', referralIncomeSchema);

module.exports = ReferralIncome;
