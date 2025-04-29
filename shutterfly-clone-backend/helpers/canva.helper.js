const { OauthService, ExportService } = require("../services/canva.service");
const { createClient } = require("@hey-api/client-fetch");
const { encrypt, decrypt } = require("./crypto.helper");
const jwt = require("jsonwebtoken");
const db = require("../models");
const AUTH_COOKIE_NAME = "aut";
const OAUTH_STATE_COOKIE_NAME = "oas";
const OAUTH_CODE_VERIFIER_COOKIE_NAME = "ocv";

async function getToken(cookie) {
  const canvaToken = await db.CanvaToken.findOne({
    where: {
      claim: cookie,
    },
  });
  if (!canvaToken) return;

  const decrypted = await decrypt(JSON.parse(canvaToken.token));
  return JSON.parse(decrypted);
}

async function deleteToken(id) {
  await db.CanvaToken.destroy({
    where: { claim: id },
  });
}

async function setToken(token, id) {
  const encrypted = await encrypt(JSON.stringify(token));
  const existing = await db.CanvaToken.findOne({
    where: { claim: id },
  });
  if (existing) {
    existing.token = JSON.stringify(encrypted);
    await existing.save();
  } else {
    await db.CanvaToken.createToken(JSON.stringify(encrypted), id);
  }
}

async function getAccessTokenForUser(id) {
  const storedToken = await getToken(id);
  if (!storedToken) {
    throw new Error("No token found for user");
  }

  // If the access token is not expiring in the next 10 minutes, we can keep using it
  const claims = jwt.decode(storedToken.access_token);
  const refreshBufferSeconds = 60 * 10; // 10 minutes;
  if (claims.exp) {
    const aBitBeforeExpirationSeconds = claims.exp - refreshBufferSeconds;
    const nowSeconds = Date.now() / 1000;
    if (nowSeconds < aBitBeforeExpirationSeconds) {
      return storedToken.access_token;
    }
  }

  // Otherwise, we need to refresh the token
  const refreshToken = storedToken.refresh_token;

  const params = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  const result = await OauthService.exchangeAccessToken(params);

  if (result.error) {
    throw new Error(`Failed to refresh token ${result.error}`);
  }
  if (!result.data) {
    throw new Error(
      "No data returned when exchanging oauth code for token, but no error was returned either."
    );
  }
  const refreshedToken = result.data;

  await setToken(refreshedToken, id);

  return refreshedToken.access_token;
}

const cookieAuth = async (req, res, next, db) => {
  try {
    const token = await getAccessTokenForUser(
      req.signedCookies[AUTH_COOKIE_NAME],
      db
    );
    req.token = token;
  } catch (error) {
    return res.status(401).send("Unauthorized");
  }
  next();
};

function getAuthorizationUrl(redirectUri, state, codeChallenge) {
  const scopes = [
    "asset:read",
    "asset:write",
    "brandtemplate:content:read",
    "brandtemplate:meta:read",
    "design:content:read",
    "design:content:write",
    "design:meta:read",
    "profile:read",
  ];
  const scopeString = scopes.join(" ");

  const clientId = process.env.CANVA_CLIENT_ID;
  const authBaseUrl = process.env.BASE_CANVA_CONNECT_AUTH_URL;

  if (!clientId) {
    throw new Error("'CANVA_CLIENT_ID' env variable not found.");
  }

  if (!authBaseUrl) {
    throw new Error("'BASE_CANVA_CONNECT_AUTH_URL' env variable not found.");
  }

  const url = new URL(`${authBaseUrl}/oauth/authorize`);
  url.searchParams.append("code_challenge", codeChallenge);
  url.searchParams.append("code_challenge_method", "S256");
  url.searchParams.append("scope", scopeString);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("state", state);

  return url.toString();
}

function getBasicAuthClient() {
  const credentials = `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`;
  const localClient = createClient({
    headers: {
      Authorization: `Basic ${Buffer.from(credentials).toString("base64")}`,
    },
    baseUrl: process.env.BASE_CANVA_CONNECT_API_URL,
  });

  localClient.interceptors.response.use((res) => {
    const requestId = res.headers.get("x-request-id");
    if (res.status >= 400) {
      console.warn(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}, ${res.body}`
      );
    } else {
      console.log(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}`
      );
    }
    return res;
  });

  return localClient;
}

function getUserClient(token) {
  const localClient = createClient({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseUrl: process.env.BASE_CANVA_CONNECT_API_URL,
  });

  localClient.interceptors.response.use((res) => {
    const requestId = res.headers.get("x-request-id");
    if (res.status >= 400) {
      console.warn(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}}`
      );
    } else {
      console.log(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}`
      );
    }
    return res;
  });

  return localClient;
}

async function getDesignExportJobStatus(exportId, userClient) {
  const result = await ExportService.getDesignExportJob({
    client: userClient,
    path: {
      exportId,
    },
  });

  if (result.error) {
    console.error(result.error);
    throw new Error(result.error.message);
  }

  const jobData = result.data;
  console.log("JOB DATA", jobData)
  
  // TODO: Execute actual task

  return jobData;
}

function poll(
  job, // () => Promise<T>,
  opts = {}
) {
  const {
    initialDelayMs = 500,
    increaseFactor = 1.6,
    maxDelayMs = 10 * 1_000,
  } = opts;

  const exponentialDelay = (n) =>
    Math.min(initialDelayMs * Math.pow(increaseFactor, n), maxDelayMs);

  const pollJob = async (attempt = 0) => {
    const delayMs = exponentialDelay(attempt);
    const statusResult = await job();

    const status = statusResult.job.status.toLocaleLowerCase();

    switch (status) {
      case "success":
      case "failed":
        return statusResult;
      case "in_progress":
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs);
        });
        return pollJob(attempt + 1);
      default:
        throw new Error(`Unknown job status ${status}`);
    }
  };

  return pollJob();
}

module.exports = {
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_CODE_VERIFIER_COOKIE_NAME,
  cookieAuth,
  setToken,
  getToken,
  deleteToken,
  getAuthorizationUrl,
  getBasicAuthClient,
  getAccessTokenForUser,
  getUserClient,
  poll,
  getDesignExportJobStatus,
};
