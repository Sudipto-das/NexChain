const express = require('express');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');
const { triggerRoiJobManually, triggerReferralJobManually, getJobStatus } = require('../jobs/cron.jobs');
const { processRoiForDateRange, getRoiStats } = require('../services/roi.service');
const { processLevelIncomeForAllActiveInvestments, getLevelIncomeStats } = require('../services/referral.service');

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/cron/status', (req, res) => {
  res.json({
    success: true,
    jobs: getJobStatus(),
  });
});

router.post('/cron/roi/trigger', async (req, res) => {
  try {
    await triggerRoiJobManually();
    res.json({ success: true, message: 'Daily ROI job triggered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/cron/referral/trigger', async (req, res) => {
  try {
    await triggerReferralJobManually();
    res.json({ success: true, message: 'Referral income job triggered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/cron/roi/backfill', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required (ISO format)',
      });
    }
    const result = await processRoiForDateRange(new Date(startDate), new Date(endDate));
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/roi/stats', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }
    const stats = await getRoiStats(userId, startDate ? new Date(startDate) : null, endDate ? new Date(endDate) : null);
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/referral/process-all', async (req, res) => {
  try {
    const { customPercentages } = req.body;
    const result = await processLevelIncomeForAllActiveInvestments(customPercentages || {});
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/referral/stats', async (req, res) => {
  try {
    const { receiverId, startDate, endDate } = req.query;
    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'receiverId is required' });
    }
    const stats = await getLevelIncomeStats(receiverId, startDate ? new Date(startDate) : null, endDate ? new Date(endDate) : null);
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;