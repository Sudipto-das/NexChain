const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

/**
 * User schema
 * - Stores authentication + financial summary fields
 * - referralCode is unique, auto-generated, and used to attribute downline users
 * - referredBy is the parent user (self-referencing ref) — used to walk the referral tree
 * - Wallet and earnings fields are denormalized counters updated atomically as
 *   ROI / level income accrues. Keeping them on the user avoids repeated $sum
 *   aggregations when showing a dashboard.
 */
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },

    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return password by default
    },

    referralCode: {
      type: String,
      unique: true,
      index: true,
      // Generated in a pre-validate hook below.
    },

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true, // index for fast "all users referred by X" lookups
    },

    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRoiEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalLevelIncomeEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    accountStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Banned'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    toJSON: {
      // Strip sensitive / internal fields from JSON output
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Compound index — useful for listing active users by recent signup (admin views)
userSchema.index({ accountStatus: 1, createdAt: -1 });

/**
 * Generate a unique referral code before validation runs.
 * 8 hex chars from a CSPRNG, uppercased and prefixed for readability
 * (e.g. "NC-3F9B2A1C"). Uniqueness is enforced by the unique index on
 * referralCode — collisions are vanishingly rare at 32 bits of entropy.
 */
userSchema.pre('validate', function (next) {
  if (!this.referralCode) {
    this.referralCode = 'NC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
