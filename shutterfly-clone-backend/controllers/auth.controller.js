// External imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");
const { createToken } = db.AuthToken;

async  function processSsoSignIn(userData) {
    let user;
    user = await db.User.findOne({
        where: {
            email: userData.email
        }
    });

    if (!user) {
        user = await db.User.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: '',
            isSsoUser: true
        });
    }

    // Generate jwt token for user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });
    user.token = token;
    user.save();

    const convertedData = user.toJSON();
    const refreshToken = await createToken(convertedData);

    delete convertedData.password;
    delete convertedData.token;

    return {
        status: 200,
        message: 'sso signin successful',
        data: {
            token,
            refreshToken,
            user: convertedData
        }
    };
}

const registerUser = async (req, res) => {
    try {
        // Check if email exists for another user
        const { firstName, lastName, email, password } = req.body;
        const user = await db.User.findOne({
            where: { email: email.toLowerCase() },
        });
        if (user) {
            return apiResponse("Error", "Email already exist", null, 409, res);
        }

        // Hash password and create user details
        const passwordHash = await bcrypt.hash(password, 15);
        const createdUser = await db.User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: passwordHash,
        });

        const token = await jwt.sign({ id: createdUser.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION })

        createdUser.token = token;
        createdUser.save();

        const convertedData = createdUser.toJSON();
        const refreshToken = await createToken(convertedData);

        delete convertedData.password;
        delete convertedData.token;

        return apiResponse("Success", "User registered successfully", {user: convertedData, token, refreshToken}, 200, res);
    } catch (err) {
        return apiResponse("Error", "Internal server error", null, 500, res);
    }
}

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.User.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return apiResponse("Error", "Email is not associated with any account", null, 400, res);
        }

        // Validate password supplied by user
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return apiResponse("Error", "Incorrect Email and password combination", null, 400, res);
        }

        // Sign and Authorize user with jwt
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });

        user.token = token;
        user.save();

        const convertedData = user.toJSON();
        const refreshToken = await createToken(convertedData);

        delete convertedData.password;
        delete convertedData.token;

        return apiResponse("Success", "Login successful", { user: convertedData, token, refreshToken }, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to process sign in", null, 500, res);
    }
};

const googleLogin = () => {

}

const googleLoginCallback = async (req, res) => {
    try {
      const { status, data } = await processSsoSignIn(req.user);
      if (status !== 200) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?type=invalid`);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/signin-success?token=${data.token}&refreshToken=${data.refreshToken}`);
    } catch (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?type=invalid`);
    }
}

module.exports = {
    registerUser,
    signIn,
    googleLogin,
    googleLoginCallback
}