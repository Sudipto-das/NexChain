const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'nexchain-dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const NODE_ENV = process.env.NODE_ENV || 'development';
const COOKIE_NAME = process.env.COOKIE_NAME || 'nexchain_token';
// 7 days in ms, must match the JWT expiry semantics above.
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Password hashing using bcrypt.
 * - bcrypt is the de-facto standard for password storage in Node.
 * - The salt is generated and stored inline with the hash, so we never
 *   need a separate salt column.
 */
function hashPassword(plain) {
  return bcrypt.hashSync(plain, BCRYPT_SALT_ROUNDS);
}

function verifyPassword(plain, stored) {
  if (!stored) return false;
  return bcrypt.compareSync(plain, stored);
}

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Sets the JWT on an httpOnly cookie. The cookie is the primary token
 * transport — we do NOT also return the token in the response body, so it
 * cannot be read by client-side JS (XSS-resistant).
 *
 * - httpOnly: JS cannot read the cookie
 * - sameSite: 'lax'  — protects against CSRF for top-level navigations
 * - secure:    true   in production (HTTPS only)
 */
function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

/**
 * POST /api/auth/signup
 * Body: { fullName, email, mobileNumber, password, referralCode? }
 */
async function signup(req, res, next) {
  try {
    console.log('[debug] signup entered, next type =', typeof next);
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
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
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
    console.log('[debug] signup catch, err:', err && err.message, 'next type =', typeof next, 'stack:', err && err.stack);
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
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Login successful',
      user,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/logout
 * Clears the auth cookie. Safe to call even if the user is not logged in.
 */
function logout(_req, res) {
  clearAuthCookie(res);
  return res.json({ success: true, message: 'Logged out' });
}

module.exports = { signup, login, logout };

