const { apiResponse } = require("../helpers/apiResponse.helper");
const {
  AUTH_COOKIE_NAME,
  getAccessTokenForUser,
  getUserClient,
} = require("../helpers/canva.helper");
const db = require("../models");

const checkCanvaAuth = async (req, res, next) => {
  const id = req.signedCookies[AUTH_COOKIE_NAME];
  if (!id) return apiResponse("Error", "Unauthorized", null, 401, res);

  try {
    const token = await getAccessTokenForUser(id, db);
    const client = getUserClient(token);
    req.client = client;
    req.token = token;
  } catch (error) {
    return apiResponse("Error", "Unauthorized", null, 401, res);
  }
  next();
};

module.exports = {
  checkCanvaAuth,
};
