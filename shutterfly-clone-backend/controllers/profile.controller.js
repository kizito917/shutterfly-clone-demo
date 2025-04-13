// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");

const getUserProfileDetails = async (req, res) => {
    try {
        const profile = await db.User.findOne({
            where: { id: req.user.id },
            attributes: {exclude: ['password', 'token']},
            include: [
                {
                    model: db.UserImage,
                    as: 'userImages'
                },
            ]
        });

        if (!profile) {
            return apiResponse("Error", "User profile details not found", null, 404, res);
        }

        return apiResponse("Success", "User profile details retrieved successfully", profile, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to retrieve user profile details", null, 500, res);
    }
}

module.exports = {
    getUserProfileDetails
}