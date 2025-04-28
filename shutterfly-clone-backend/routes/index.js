// External imports
const { Router } = require("express");

// Internal imports
const authRoute = require('./auth.router');
const fileRoute = require('./file.router');
const profileRoute = require('./profile.router');
const canvaRoute = require('./canva.router')

const router = Router();

router.use('/auth', authRoute);
router.use('/file', fileRoute);
router.use('/profile', profileRoute);
router.use('/canva', canvaRoute)

module.exports = router;