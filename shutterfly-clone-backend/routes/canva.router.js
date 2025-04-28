const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const constants = require("../config/constants");
const {
  getAuthorizationUrl,
  AUTH_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_CODE_VERIFIER_COOKIE_NAME,
  getBasicAuthClient,
  setToken,
  getAccessTokenForUser,
  getUserClient,
  getToken,
  deleteToken,
} = require("../helpers/canva.helper");
const { OauthService } = require("../services/canvas.service");
const { encrypt } = require("../helpers/crypto.helper");
const db = require("../models");
const { checkValidity } = require("../middlewares/checkValidity");
const { checkCanvaAuth } = require("../middlewares/checkCanvaAuth");

const endpoints = {
  REDIRECT: "/oauth/redirect",
  SUCCESS: "/success",
  FAILURE: "/failure",
  AUTHORIZE: "/authorize",
  IS_AUTHORIZED: "/isauthorized",
  REVOKE: "/revoke",
  TOKEN: "/token",
};

const router = express.Router();

router.get(endpoints.REDIRECT, async (req, res) => {
  const authorizationCode = req.query.code;
  const state = req.query.state;
  if (typeof authorizationCode !== "string" || typeof state !== "string") {
    const params = new URLSearchParams({
      error:
        typeof req.query.error === "string" ? req.query.error : "Unknown error",
    });
    return res.redirect(`${endpoints.FAILURE}?${params.toString()}`);
  }

  try {
    const codeVerifier = req.signedCookies[OAUTH_CODE_VERIFIER_COOKIE_NAME];
    if (state !== req.signedCookies[OAUTH_STATE_COOKIE_NAME]) {
      throw new Error(
        `Invalid state ${state} != ${req.signedCookies[OAUTH_STATE_COOKIE_NAME]}`
      );
    }

    const params = {
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
      code: authorizationCode,
      redirect_uri: constants.REDIRECT_URI,
    };

    const result = await OauthService.exchangeAccessToken({
      client: getBasicAuthClient(),
      body: params,
      bodySerializer: (params) => params.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (result.error) {
      return res.status(result.response.status).json(result.error);
    }

    const token = result.data;
    if (!token) {
      throw new Error(
        "No token returned when exchanging oauth code for token, but no error was returned either."
      );
    }

    const claims = jwt.decode(token.access_token);
    const claimsSub = claims.sub;
    if (!claimsSub) {
      throw new Error("Unable to extract claims sub from access token.");
    }

    res.cookie(AUTH_COOKIE_NAME, claimsSub, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      secure: process.env.NODE_ENV === "production",
      signed: true,
    });
    await setToken(token, claimsSub);

    return res.redirect("/api/canva/success");
  } catch (error) {
    const url = new URL(endpoints.FAILURE, process.env.BACKEND_URL);
    if (error instanceof Error) {
      url.searchParams.append("error", error.message || error.toString());
    }
    return res.redirect(url.toString());
  }
});

router.get(endpoints.AUTHORIZE, async (req, res) => {
  const codeVerifier = crypto.randomBytes(96).toString("base64url");
  const state = crypto.randomBytes(96).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest()
    .toString("base64url");

  const url = getAuthorizationUrl(constants.REDIRECT_URI, state, codeChallenge);
  const cookieConfiguration = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 20, // 20 minutes
    sameSite: "lax", // since we will be redirecting back from Canva, we need the cookies to be sent with every request to our domain
    secure: process.env.NODE_ENV === "production",
    signed: true,
  };

  res
    .cookie(OAUTH_STATE_COOKIE_NAME, state, cookieConfiguration)
    .cookie(OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, cookieConfiguration)
    .redirect(url);
});

router.get(endpoints.SUCCESS, async (req, res) => {
  res.render("auth_success", {
    countdownSecs: 2,
    message: "authorization_success",
  });
});

router.get(endpoints.FAILURE, async (req, res) => {
  res.render("auth_failure", {
    countdownSecs: 10,
    message: "authorization_error",
    errorMessage: req.query.error || "Unknown error",
  });
});

router.get(endpoints.REVOKE, async (req, res) => {
  const user = req.signedCookies[AUTH_COOKIE_NAME];

  let token = null;
  try {
    token = await getToken(user);
  } catch (error) {
    res.sendStatus(200);
    return;
  }

  res.clearCookie(AUTH_COOKIE_NAME);
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const client_id = process.env.CANVA_CLIENT_ID;
    if (!client_id) {
      throw new Error("'CANVA_CLIENT_ID' env variable is undefined");
    }

    const client_secret = process.env.CANVA_CLIENT_SECRET;
    if (!client_secret) {
      throw new Error("'CANVA_CLIENT_SECRET' env variable is undefined");
    }

    const params = {
      client_secret,
      client_id,
      // Revoking the refresh token revokes the consent and the access token,
      // this is the way for Connect API clients to disconnect users.
      token: token.refresh_token,
    };

    if (token) {
      await OauthService.revokeTokens({
        client: getBasicAuthClient(),
        // by default, the body is JSON stringified, but given this endpoint expects form URL encoded data
        // we need to override the `bodySerializer`
        body: params,
        bodySerializer: (params) => params.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    }
  } catch (e) {
    console.log(e);
    return res.sendStatus(401);
  }

  return res.sendStatus(200);
});

// Others
router.get(endpoints.TOKEN, checkCanvaAuth, async (req, res) => {
  // Only our FE may ask for the user's token
  if (req.headers.origin !== process.env.FRONTEND_URL) {
    return res.status(401).send("Unauthorized");
  }
  return res.status(200).send(req.token);
});

module.exports = router;
