const express = require('express');

const { getDashboard } = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', getDashboard);

module.exports = router;