const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexchain-dev-secret-change-me';
const COOKIE_NAME = process.env.COOKIE_NAME || 'nexchain_token';

const { User } = require('../models');

/**
 * Extracts the JWT from the request, preferring the httpOnly cookie set by
 * the auth controller. Falls back to a `Authorization: Bearer <token>` header
 * for non-browser clients (mobile apps, server-to-server calls).
 *
 * Returns null when no token is present.
 */
function extractToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    const t = header.slice('Bearer '.length).trim();
    if (t) return t;
  }
  return null;
}

/**
 * Verifies the JWT and attaches the authenticated user to `req.user`
 * (excluding the password).
 *
 * Responses:
 *   401 — missing token, invalid signature, expired token
 *   403 — user no longer exists or account is not Active
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(403).json({ success: false, message: 'User no longer exists' });
    }
    if (user.accountStatus !== 'Active') {
      return res.status(403).json({ success: false, message: `Account is ${user.accountStatus.toLowerCase()}` });
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Middleware to require admin role.
 * Assumes user document has an isAdmin or role field.
 * Adjust based on your user model.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  // Check if user is admin - adjust based on your user model
  // For now, we'll check for an isAdmin flag or role field
  if (req.user.isAdmin === true || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
}

module.exports = { requireAuth, requireAdmin };
