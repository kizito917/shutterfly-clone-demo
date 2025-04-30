const { CANVA_ENDPOINTS } = require("../config/constants");
const { apiResponse } = require("../helpers/apiResponse.helper");
const db = require("../models");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const jwt = require("jsonwebtoken");
const constants = require("../config/constants");
const {
  getAuthorizationUrl,
  AUTH_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_CODE_VERIFIER_COOKIE_NAME,
  getBasicAuthClient,
  setToken,
  getUserClient,
  getToken,
} = require("../helpers/canva.helper");
const {
  OauthService,
  AssetService,
  client: DefaultClient,
  ExportService,
} = require("../services/canva.service");

const redirectHandler = async (req, res) => {
  const authorizationCode = req.query.code;
  const state = req.query.state;
  if (typeof authorizationCode !== "string" || typeof state !== "string") {
    const params = new URLSearchParams({
      error:
        typeof req.query.error === "string" ? req.query.error : "Unknown error",
    });
    return res.redirect(`${CANVA_ENDPOINTS.FAILURE}?${params.toString()}`);
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
    const url = new URL(CANVA_ENDPOINTS.FAILURE, process.env.BACKEND_URL);
    if (error instanceof Error) {
      url.searchParams.append("error", error.message || error.toString());
    }
    return res.redirect(url.toString());
  }
};

const authorizeUser = async (_, res) => {
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
};

const authSuccessRedirect = async (req, res) => {
  res.render("auth_success", {
    countdownSecs: 2,
    message: "authorization_success",
  });
};

const authFailureRedirect = async (req, res) => {
  res.render("auth_failure", {
    countdownSecs: 10,
    message: "authorization_error",
    errorMessage: req.query.error || "Unknown error",
  });
};

const revokeTokenHandler = async (req, res) => {
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
};

const getTokenHandler = async (req, res) => {
  // Only our FE may ask for the user's token
  if (req.headers.origin !== process.env.FRONTEND_URL) {
    return res.status(401).send("Unauthorized");
  }
  return res.status(200).send(req.token);
};

const getImageInfo = async (req, res) => {
  try {
    const { imageId } = req.params;

    // Check if ID is valid
    const imageDetails = await db.UserImage.findOne({
      where: { id: imageId },
    });

    if (!imageDetails) {
      return apiResponse(
        "Error",
        "Image not found. Invalid ID provided",
        null,
        404,
        res
      );
    }

    return apiResponse(
      "Success",
      "Image design retrieved successfully",
      imageDetails,
      200,
      res
    );
  } catch (err) {
    return apiResponse(
      "Error",
      "Unable to retrieve requested image",
      null,
      500,
      res
    );
  }
};

const createDesign = async (req, res) => {
  if (!req.body.id)
    return apiResponse("Error", "Please provide design id", null, 400, res);

  // Check if ID is valid
  const imageDetails = await db.UserImage.findOne({
    where: { id: req.body.id },
  });

  if (!imageDetails) {
    return apiResponse(
      "Error",
      "Image not found. Invalid ID provided",
      null,
      404,
      res
    );
  }

  // Get image path and construct full path
  const imagePath = imageDetails.imagePath;
  const fullPath = path.join(process.cwd(), imagePath);

  try {
    // Read the file
    const imageBuffer = await fs.readFile(fullPath);
    const name =
      "New Design " +
      crypto.randomUUID().split("-")[0] +
      path.extname(imagePath);

    const userToken = await getToken(req.signedCookies[AUTH_COOKIE_NAME]);
    const result = await AssetService.createAssetUploadJob({
      client: getUserClient(userToken.access_token),
      headers: {
        "Asset-Upload-Metadata": {
          name_base64: btoa(name),
        },
      },
      body: imageBuffer,
      bodySerializer: (body) => body,
    });

    if (result.error) {
      console.error(result.error);
      return apiResponse("Error", "Failed to upload image", null, 500, res);
    }

    // Send the image
    return apiResponse(
      "Success",
      "Access upload job done",
      { ...result.data, name },
      200,
      res
    );
  } catch (fileErr) {
    // Handle file reading errors
    if (fileErr.code === "ENOENT") {
      return apiResponse(
        "Error",
        "Image file not found on server",
        null,
        404,
        res
      );
    }
    console.log("File err", fileErr);
    return apiResponse("Error", "Internal Server error", null, 500, res);
  }
};

const updateImageDesign = async (req, res) => {
  if (!req.body.canvaDesignId || !req.body.canvaDesignUrl)
    return apiResponse(
      "Error",
      "Please provide canvaDesignId, canvaDesignUrl",
      null,
      400,
      res
    );

  try {
    // Check if ID is valid
    const imageDetails = await db.UserImage.findOne({
      where: { id: Number(req.params.imageId) },
    });

    if (!imageDetails)
      return apiResponse("Error", "Invalid design image id", null, 404, res);

    // Update image
    imageDetails.canvaDesignId = req.body.canvaDesignId;
    imageDetails.canvaDesignUrl = req.body.canvaDesignUrl;

    await imageDetails.save();

    return apiResponse(
      "Success",
      "Image design updated successfully",
      imageDetails,
      200,
      res
    );
  } catch (error) {
    console.log(error);
    return apiResponse("Error", "Internal server error", null, 500, res);
  }
};

const returnNavHandler = async (req, res) => {
  const correlationJwt = req.query.correlation_jwt;
  if (!correlationJwt) {
    res.redirect(process.env.FRONTEND_URL);
    return;
  }

  const decodedCorrelationJwt = jwt.decode(correlationJwt);

  const designId = parseInt(
    atob(decodeURIComponent(decodedCorrelationJwt.correlation_state))
  );
  if (Number.isNaN(designId)) {
    res.redirect(process.env.FRONTEND_URL);
    return;
  }

  // Update userimage with exported image from canva
  try {
    const userToken = await getToken(req.signedCookies[AUTH_COOKIE_NAME]);
    const userClient = getUserClient(userToken.access_token);
    const exportJobResponse = await ExportService.createDesignExportJob({
      client: userClient,
      body: {
        design_id: decodedCorrelationJwt.design_id,
        format: {
          type: "png",
          pages: [1], // Get only the first page
          lossless: true,
          width: 1000,
          height: 1000,
        },
      },
    });

    if (exportJobResponse.error) {
      console.error(exportJobResponse.error);
      throw new Error(exportJobResponse.error.message);
    }

    const redirectUri = new URL(
      "/editor2/" + designId,
      process.env.FRONTEND_URL
    );
    redirectUri.searchParams.set("jobId", exportJobResponse.data.job.id);
    redirectUri.searchParams.set("designId", designId);
    res.redirect(redirectUri.toString());
  } catch (error) {
    console.error(error);
    return apiResponse("Error", "Internal server error", null, 500, res);
  }
};

const updateImageWithCanva = async (req, res) => {
  try {
    const { newAssetURL } = req.body;
    if (!newAssetURL) {
      return apiResponse(
        "Error",
        "Provide designId, newAssetURL",
        null,
        400,
        res
      );
    }

    const response = await fetch(newAssetURL);
    const buffer = await response.arrayBuffer();
    const design = await db.UserImage.findOne({
      where: { id: req.params.imageId },
    });

    const assetPath = path.join(
      __dirname,
      "..",
      "assets",
      "images",
      path.basename(design.imagePath)
    );
    await fs.writeFile(assetPath, Buffer.from(buffer));
    return apiResponse("Success", "Update successful", null, 200, res);
  } catch (err) {
    console.log(err);
    return apiResponse("Error", "Internal server error", null, 500, res);
  }
};

module.exports = {
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
};
