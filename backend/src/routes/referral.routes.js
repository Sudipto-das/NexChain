const express = require('express');

const { getDirectReferrals, getReferralTree, getReferralStats } = require('../controllers/referral.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/direct', getDirectReferrals);
router.get('/tree', getReferralTree);
router.get('/stats', getReferralStats);

module.exports = router;