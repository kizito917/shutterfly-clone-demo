// External imports
const express = require('express');

// Internal imports
const { processPaymentWebhook } = require('../controllers/payment.controller');
const router = express.Router();

// Route to handle payment webhook
router.post('/', processPaymentWebhook);

module.exports = router;