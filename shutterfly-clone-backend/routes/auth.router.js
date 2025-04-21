// External imports
const express = require('express');
const passport = require('passport');

// Internal imports
const { signIn, registerUser, googleLoginCallback } = require('../controllers/auth.controller');

const router = express.Router();

// Route to register a new account
router.post('/signup', registerUser);

// Route to sign in
router.post('/signin', signIn);

// Google signin initialization
router.get('/google-signin', passport.authenticate('google'));

// Google callback url route
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?type=invalid' }),
    googleLoginCallback
);  

module.exports = router;