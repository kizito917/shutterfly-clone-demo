// External imports
const express = require('express');

// Internal imports
const { checkValidity } = require('../middlewares/checkValidity');
const { retrieveUserOrders, retrieveOrderDetails } = require('../controllers/order.controller');

const router = express.Router();

// Route to retrieve user orders
router.get('/all', checkValidity, retrieveUserOrders);

// Route to retrieve order details
router.get('/:id', checkValidity, retrieveOrderDetails);

module.exports = router;