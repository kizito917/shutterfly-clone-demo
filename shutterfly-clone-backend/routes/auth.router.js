// External imports
const express = require('express');

// Internal imports
const { signIn, registerUser } = require('../controllers/auth.controller');

const router = express.Router();

// Route to register a new account
router.post('/signup', registerUser);

// Route to sign in
router.post('/signin', signIn);

module.exports = router;