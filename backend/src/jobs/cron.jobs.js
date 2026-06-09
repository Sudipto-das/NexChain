const cron = require('node-cron');
const { processDailyRoi } = require('../services/roi.service');
const { processLevelIncomeForAllActiveInvestments } = require('../services/referral.service');

let roiJob = null;
let referralJob = null;
let isRoiRunning = false;
let isReferralRunning = false;

async function runDailyRoiJob() {
  if (isRoiRunning) {
    console.log('[cron] ROI job already running, skipping');
    return;
  }

  isRoiRunning = true;
  const startTime = Date.now();
  console.log('[cron] Starting daily ROI calculation...');

  try {
    const result = await processDailyRoi();
    const duration = Date.now() - startTime;
    console.log('[cron] Daily ROI completed', {
      processed: result.processed,
      skipped: result.skipped,
      errors: result.errors.length,
      totalRoiDistributed: result.totalRoiDistributed,
      duration: `${duration}ms`,
    });

    if (result.errors.length > 0) {
      console.error('[cron] ROI job errors:', result.errors);
    }
  } catch (error) {
    console.error('[cron] Daily ROI job failed:', error);
  } finally {
    isRoiRunning = false;
  }
}

async function runReferralIncomeJob() {
  if (isReferralRunning) {
    console.log('[cron] Referral income job already running, skipping');
    return;
  }

  isReferralRunning = true;
  const startTime = Date.now();
  console.log('[cron] Starting referral level income calculation...');

  try {
    const result = await processLevelIncomeForAllActiveInvestments();
    const duration = Date.now() - startTime;
    console.log('[cron] Referral level income completed', {
      totalInvestments: result.totalInvestments,
      totalCredited: result.totalCredited,
      totalErrors: result.totalErrors,
      duration: `${duration}ms`,
    });

    if (result.totalErrors > 0) {
      console.error('[cron] Referral job had errors:', result.investmentResults.filter(r => r.errors.length > 0));
    }
  } catch (error) {
    console.error('[cron] Referral income job failed:', error);
  } finally {
    isReferralRunning = false;
  }
}

function startCronJobs() {
  const roiSchedule = process.env.ROI_CRON_SCHEDULE || '0 0 * * *';
  const referralSchedule = process.env.REFERRAL_CRON_SCHEDULE || '0 1 * * *';

  roiJob = cron.schedule(roiSchedule, runDailyRoiJob, {
    scheduled: true,
    timezone: process.env.TZ || 'UTC',
  });

  referralJob = cron.schedule(referralSchedule, runReferralIncomeJob, {
    scheduled: true,
    timezone: process.env.TZ || 'UTC',
  });

  console.log('[cron] Jobs scheduled:');
  console.log(`  - Daily ROI: ${roiSchedule} (${process.env.TZ || 'UTC'})`);
  console.log(`  - Referral Income: ${referralSchedule} (${process.env.TZ || 'UTC'})`);
}

function stopCronJobs() {
  if (roiJob) {
    roiJob.stop();
    roiJob = null;
    console.log('[cron] Daily ROI job stopped');
  }
  if (referralJob) {
    referralJob.stop();
    referralJob = null;
    console.log('[cron] Referral income job stopped');
  }
}

async function triggerRoiJobManually() {
  console.log('[cron] Manual trigger: Daily ROI');
  await runDailyRoiJob();
}

async function triggerReferralJobManually() {
  console.log('[cron] Manual trigger: Referral Income');
  await runReferralIncomeJob();
}

function getJobStatus() {
  return {
    roi: {
      scheduled: !!roiJob,
      running: isRoiRunning,
      schedule: process.env.ROI_CRON_SCHEDULE || '0 0 * * *',
    },
    referral: {
      scheduled: !!referralJob,
      running: isReferralRunning,
      schedule: process.env.REFERRAL_CRON_SCHEDULE || '0 1 * * *',
    },
  };
}

module.exports = {
  startCronJobs,
  stopCronJobs,
  triggerRoiJobManually,
  triggerReferralJobManually,
  getJobStatus,
  runDailyRoiJob,
  runReferralIncomeJob,
};