const REDIRECT_URI = new URL(
  "/api/canva/oauth/redirect",
  process.env.BACKEND_URL
).toString();

const CANVA_ENDPOINTS = {
  REDIRECT: "/oauth/redirect",
  SUCCESS: "/success",
  FAILURE: "/failure",
  AUTHORIZE: "/authorize",
  IS_AUTHORIZED: "/isauthorized",
  REVOKE: "/revoke",
  TOKEN: "/token",
};

module.exports = {
  REDIRECT_URI,
  CANVA_ENDPOINTS,
};
