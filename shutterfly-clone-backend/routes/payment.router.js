// External imports
const express = require('express');

// Internal imports
const { checkValidity } = require('../middlewares/checkValidity');
const { createCheckoutSession } = require('../controllers/payment.controller');

const router = express.Router();

// Route to get user profile details
router.post('/checkout', checkValidity, createCheckoutSession);

module.exports = router;