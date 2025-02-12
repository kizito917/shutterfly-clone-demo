// External imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");
const { createToken, verifyTokenExpiration } = db.AuthToken;

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
        await db.User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: passwordHash,
        });

        return apiResponse("Success", "User registered successfully", null, 200, res);
    } catch (err) {
        return apiResponse("Error", "Internal server error", null, 500, res);
    }
}

const signIn = async (req, res) => {
    try {
        // Check if user email exists
        const { email, password } = req.body;
        const user = await db.User.findOne({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return apiResponse(
                "Error",
                "Email is not associated with any account",
                null,
                400,
                res
            );
        }

        // Validate password supplied by user
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return apiResponse(
                "Error",
                "Incorrect Email and password combination",
                null,
                400,
                res
            );
        }

        // Sign and Authorize user with jwt
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRATION,
        });

        const refreshToken = await createToken(user);

        const clonedUserPayload = {
            token,
            refreshToken,
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };

        return apiResponse("Success", "Login successful", clonedUserPayload, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to process sign in", null, 500, res);
    }
};

module.exports = {
    registerUser,
    signIn
}