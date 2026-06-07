const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexchain-dev-secret-change-me';

const { User } = require('../models');

/**
 * Verifies the Bearer token from the Authorization header and attaches the
 * authenticated user to `req.user` (excluding the password).
 *
 * Responses:
 *   401 — missing/malformed token, invalid signature, expired token
 *   403 — user no longer exists or account is not Active
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or malformed Authorization header' });
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' });
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

module.exports = { requireAuth };
