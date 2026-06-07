const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'nexchain-dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Password hashing using Node's built-in scrypt.
 * - scrypt is memory-hard and ships with Node — no native build step.
 * - Stored format: "scrypt:N:r:p:saltHex:hashHex"
 *   Parameters are kept inline so we can tune cost later without a migration.
 */
const SCRYPT_N = 16384;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_LEN);
  const derived = crypto.scryptSync(plain, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_r,
    p: SCRYPT_p,
  });
  return `scrypt:${SCRYPT_N}:${SCRYPT_r}:${SCRYPT_p}:${salt.toString('hex')}:${derived.toString('hex')}`;
}

function verifyPassword(plain, stored) {
  if (!stored || !stored.startsWith('scrypt:')) return false;
  const [, N, r, p, saltHex, hashHex] = stored.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = crypto.scryptSync(plain, salt, expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  // Constant-time comparison to avoid timing leaks.
  return crypto.timingSafeEqual(derived, expected);
}

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/signup
 * Body: { fullName, email, mobileNumber, password, referralCode? }
 */
async function signup(req, res, next) {
  try {
    const { fullName, email, mobileNumber, password, referralCode } = req.body || {};

    if (!fullName || !email || !mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, mobileNumber and password are required',
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    // Reject duplicates explicitly so the client gets a clear message
    // (the unique index on email would also throw, but a clean 409 is friendlier).
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    // Resolve referrer from referralCode, if provided.
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: String(referralCode).trim() }).select('_id');
      if (!referrer) {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }
      referredBy = referrer._id;
    }

    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      password: hashPassword(password),
      referredBy,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user,
    });
  } catch (err) {
    // Mongoose validation errors → 400 with a useful message
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message,
        details: err.errors,
      });
    }
    // Duplicate-key (e.g. race on email or referralCode) → 409
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    return next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    // password has select:false, so explicitly request it.
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.accountStatus !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus.toLowerCase()}`,
      });
    }

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    // Strip password before sending the user back (toJSON transform handles this,
    // but since we loaded with select:+password, the transform still drops it).
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, login };
