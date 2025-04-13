// External imports
const express = require('express');


// Internal imports
const { checkValidity } = require('../middlewares/checkValidity');
const { getUserProfileDetails } = require('../controllers/profile.controller');

const router = express.Router();

// Route to get user profile details
router.get('/', checkValidity, getUserProfileDetails)

module.exports = router;