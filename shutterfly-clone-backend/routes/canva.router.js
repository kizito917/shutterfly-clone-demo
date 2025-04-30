const express = require("express");
const {
  redirectHandler,
  authorizeUser,
  authSuccessRedirect,
  authFailureRedirect,
  revokeTokenHandler,
  getTokenHandler,
  getImageInfo,
  createDesign,
  updateImageDesign,
  returnNavHandler,
  updateImageWithCanva,
} = require("../controllers/canva.controller");
const { checkValidity } = require("../middlewares/checkValidity");
const { checkCanvaAuth } = require("../middlewares/checkCanvaAuth");

const { CANVA_ENDPOINTS } = require("../config/constants");

const router = express.Router();

router.get(CANVA_ENDPOINTS.REDIRECT, redirectHandler);

router.get(CANVA_ENDPOINTS.AUTHORIZE, authorizeUser);

router.get(CANVA_ENDPOINTS.SUCCESS, authSuccessRedirect);

router.get(CANVA_ENDPOINTS.FAILURE, authFailureRedirect);

router.get(CANVA_ENDPOINTS.REVOKE, revokeTokenHandler);

// Others
router.get(CANVA_ENDPOINTS.TOKEN, checkCanvaAuth, getTokenHandler);

// Get info about an uploaded image
router.get("/image/:imageId", checkValidity, getImageInfo);

// Upload asset to canva
router.post("/create-design", createDesign);

router.post("/image/:imageId", updateImageDesign);

router.get("/return-nav", returnNavHandler);

router.patch("/image/:imageId", updateImageWithCanva);

module.exports = router;
