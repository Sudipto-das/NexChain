const express = require('express');

const { signup, login, logout } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Example of a protected route — useful for clients to verify a stored token
// and for the frontend to refresh the user object after a page reload.
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
