// const crypto = require("node:crypto");
// const jose = require("jose");
// const sdk = require('canva_connect_api');
// const { createClient } = require("@hey-api/client-fetch");

// const OauthApi = sdk.OauthApi;
// const apiClient = new sdk.ApiClient();
// const oauthApi = new OauthApi(apiClient);

// const endpoints = {
//     BACKEND_RETURN_NAV: "/return-nav",
//     FRONTEND_RETURN_NAV: "/return-nav",
// };
  
// const globals = {
//     redirectUri: "",
// };
// const AUTH_COOKIE_NAME = "aut";
// const OAUTH_STATE_COOKIE_NAME = "oas";
// const OAUTH_CODE_VERIFIER_COOKIE_NAME = "ocv";

// globals.redirectUri = new URL(
//     '/oauth/redirect',
//     process.env.BACKEND_URL,
// ).toString();

// const verifyToken = async (token) => {
//     try {
//       const publicKeysURL = new URL(
//         "rest/v1/connect/keys",
//         process.env.BASE_CANVA_CONNECT_API_URL,
//       );
//       const JWKS = jose.createRemoteJWKSet(publicKeysURL);
//       const { protectedHeader } = await jose.jwtVerify(token, JWKS, {
//         audience: process.env.CANVA_CLIENT_ID,
//       });

//       return !!protectedHeader;
//     } catch (error) {
//       console.error("Failed to verify correlation_jwt:", error);
//       return false;
//     }
// };

// export function getBasicAuthClient() {
//     const credentials = `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`;
//     const localClient = createClient({
//         headers: {
//             Authorization: `Basic ${Buffer.from(credentials).toString("base64")}`,
//         },
//         baseUrl: process.env.BASE_CANVA_CONNECT_API_URL,
//     });
  
//     localClient.interceptors.response.use((res) => {
//         const requestId = res.headers.get("x-request-id");
//         if (res.status >= 400) {
//             console.warn(`Response status ${res.status} on ${res.url}: request id: ${requestId}, ${res.body}`);
//         } else {
//             console.log(`Response status ${res.status} on ${res.url}: request id: ${requestId}`);
//         }

//         return res;
//     });
  
//     return localClient;
// }  

// const canvaRedirect = async (req, res) => {
//     const authorizationCode = req.query.code;
//     const state = req.query.state;
//     if (typeof authorizationCode !== "string" || typeof state !== "string") {
//         const params = new URLSearchParams({
//         error:
//             typeof req.query.error === "string" ? req.query.error : "Unknown error",
//         });
//         return res.redirect(`/failure?${params.toString()}`);
//     }

//     try {
//         if (state !== req.signedCookies[OAUTH_STATE_COOKIE_NAME]) {
//             throw new Error(
//                 `Invalid state ${state} != ${req.signedCookies[OAUTH_STATE_COOKIE_NAME]}`,
//             );
//         }

//         const codeVerifier = req.signedCookies[OAUTH_CODE_VERIFIER_COOKIE_NAME];

//         const params = {
//             grant_type: "authorization_code",
//             code_verifier: codeVerifier,
//             code: authorizationCode,
//             redirect_uri: globals.redirectUri,
//         };

//         const result = await oauthApi.exchangeAccessToken({
//         client: getBasicAuthClient(),
//         body: params,
//         // by default, the body is JSON stringified, but given this endpoint expects form URL encoded data
//         // we need to override the `bodySerializer`
//         bodySerializer: (params) => params.toString(),
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//             },
//         });

//         if (result.error) {
//             console.error(result.error);
//             return res.status(result.response.status).json(result.error);
//         }

//         const token = result.data;
//         if (!token) {
//             throw new Error(
//                 "No token returned when exchanging oauth code for token, but no error was returned either.",
//             );
//         }

//         const claims = jose.decodeJwt(token.access_token);
//         const claimsSub = claims.sub;
//         if (!claimsSub) {
//             throw new Error("Unable to extract claims sub from access token.");
//         }

//         res.cookie(AUTH_COOKIE_NAME, claimsSub, {
//             httpOnly: true,
//             maxAge: 1000 * 60 * 60 * 24 * 3, // 3 days
//             // SameSite default is "lax"; for cookies used for authentication it should be
//             // "strict" but while in development "lax" is more convenient.
//             // We can't use "none", even in development, because that requires Secure, which
//             // requires https, which we don't want to set up for local development.
//             // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
//             sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//             secure: process.env.NODE_ENV === "production",
//             signed: true,
//         });

//         // TODO: SAVE TOKEN IN DB
//         //await setToken(token, claimsSub, db);

//         return res.redirect('/success');
//     } catch (error) {
//         console.error(error);
//         const url = new URL('/failure', process.env.BACKEND_URL);
//         if (error instanceof Error) {
//             url.searchParams.append("error", error.message || error.toString());
//         }
//         return res.redirect(url.toString());
//     }
// }

// const canvaAuthSuccess = async (req, res) => {
//     res.render("auth_success", {
//         countdownSecs: 2,
//         message: "authorization_success",
//     });
// }

// const canvaAuthFailure = async (req, res) => {
//     res.render("auth_failure", {
//         countdownSecs: 10,
//         message: "authorization_error",
//         errorMessage: req.query.error || "Unknown error",
//     });
// }

// const canvaAuthorization = async (req, res) => {
//     const codeVerifier = crypto.randomBytes(96).toString("base64url");
//     // We use random data for the state for CSRF prevention.
//     // You *can* use the state parameter to store user state (such as the current page) as well, if you like
//     const state = crypto.randomBytes(96).toString("base64url");
//     const codeChallenge = crypto
//         .createHash("sha256")
//         .update(codeVerifier)
//         .digest()
//         .toString("base64url");

//     const url = getAuthorizationUrl(globals.redirectUri, state, codeChallenge);
//     const cookieConfiguration = {
//         httpOnly: true,
//         maxAge: 1000 * 60 * 60 * 20, // 20 minutes
//         sameSite: "lax", // since we will be redirecting back from Canva, we need the cookies to be sent with every request to our domain
//         secure: process.env.NODE_ENV === "production",
//         signed: true,
//     };

//     return (
//         res
//         // By setting the state as a cookie, we bind it to the user agent.
//         // https://portswigger.net/web-security/csrf/preventing
//         // https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
//         .cookie(OAUTH_STATE_COOKIE_NAME, state, cookieConfiguration)
//         // We set the code verifier as a cookie for convenience in this example.
//         // It could also be stored in the database.
//         .cookie(
//             OAUTH_CODE_VERIFIER_COOKIE_NAME,
//             codeVerifier,
//             cookieConfiguration,
//         )
//         .redirect(url)
//     );
// }

// const revokeCanvasAuthorization = async (req, res) => {
//     const user = req.signedCookies[AUTH_COOKIE_NAME];
//     const token = await getToken(user, db);

//     res.clearCookie(AUTH_COOKIE_NAME);
//     if (!token) {
//         return res.status(401).send("Unauthorized");
//     }

//     try {
//         const client_id = process.env.CANVA_CLIENT_ID;
//         if (!client_id) {
//             throw new Error("'CANVA_CLIENT_ID' env variable is undefined");
//         }

//         const client_secret = process.env.CANVA_CLIENT_SECRET;
//         if (!client_secret) {
//             throw new Error("'CANVA_CLIENT_SECRET' env variable is undefined");
//         }

//         const params = {
//             client_secret,
//             client_id,
//             // Revoking the refresh token revokes the consent and the access token,
//             // this is the way for Connect API clients to disconnect users.
//             token: token.refresh_token,
//         };

//         await oauthApi.revokeTokens({
//             client: getBasicAuthClient(),
//             // by default, the body is JSON stringified, but given this endpoint expects form URL encoded data
//             // we need to override the `bodySerializer`
//             body: params,
//             bodySerializer: (params) => params.toString(),
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//             },
//         });
//     } catch (e) {
//         console.log(e);
//         return res.sendStatus(401);
//     } finally {
//         console.log("REVOKE COMPLETED...");
//         //await deleteToken(user, db);
//     }

//     return res.sendStatus(200);
// }

// const returnNavController = async (req, res) => {
//     const correlationJwt = req.query.correlation_jwt;

//     if (typeof correlationJwt !== "string") {
//         console.log("Error: url search query 'correlation_jwt' was not found.");
//         return res.sendStatus(400).json(); // bad request
//     }

//     const isVerified = await verifyToken(correlationJwt);

//     if (!isVerified) {
//         console.log("Unable to process Return Nav request.");
//         return res.sendStatus(400).json(); // bad request
//     }

//     /**
//      * For more info on the parsed and decoded JWT refer to the canva.dev docs:
//      * https://www.canva.dev/docs/connect/return-navigation-guide/#step-3-parse-the-return-url
//      */
//     const parsedJwt = jose.decodeJwt(correlationJwt);

//     const designId = parsedJwt.design_id;
//     const correlationState = parsedJwt.correlation_state;

//     const returnNavBase = new URL(
//         endpoints.FRONTEND_RETURN_NAV,
//         process.env.FRONTEND_URL,
//     ).toString();

//     const frontendReturnNavUrl = `${returnNavBase}?design_id=${designId}&correlation_state=${correlationState}`;

//     res.redirect(frontendReturnNavUrl);
// }

// module.exports = {
//     canvaRedirect,
//     canvaAuthSuccess,
//     canvaAuthFailure,
//     canvaAuthorization,
//     revokeCanvasAuthorization,
//     returnNavController
// }