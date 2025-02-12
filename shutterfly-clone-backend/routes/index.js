// External imports
const { Router } = require("express");

// Internal imports
const authRoute = require('./auth.router');
const fileRouter = require('./file.router');

const router = Router();

router.use('/auth', authRoute);
router.use('/file', fileRouter);

module.exports = router;