const REDIRECT_URI = new URL(
  "/api/canva/oauth/redirect",
  process.env.BACKEND_URL
).toString();

module.exports = {
  REDIRECT_URI,
};
