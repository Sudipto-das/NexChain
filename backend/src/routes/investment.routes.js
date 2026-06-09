const express = require('express');

const { createInvestment, getUserInvestments, getInvestmentById } = require('../controllers/investment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', createInvestment);
router.get('/', getUserInvestments);
router.get('/:id', getInvestmentById);

module.exports = router;