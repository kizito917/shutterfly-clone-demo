// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");

const retrieveUserOrders = async (req, res) => {
    try {
        const orders = await db.Order.findAll({
            where: {
                userId: req.user.id
            },
            include: [
                {
                    model: 'OrderItem',
                    as: 'orderItem'
                }
            ]
        });

        return apiResponse("Success", "User orders retrieved successfully...", orders, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to retrieve user orders", null, 500, res);
    }
}

const retrieveOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await db.Order.findOne({
            where: { id },
            include: [
                {
                    model: 'OrderItem',
                    as: 'orderItem'
                }
            ]
        });

        if (!order) {
            return apiResponse("Error", "Order details not found. Invalid ID provided", null, 404, res);
        }

        return apiResponse("Success", "Order details retrieved successfully...", order, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to retrieve order details", null, 500, res);
    }
}

module.exports = {
    retrieveUserOrders,
    retrieveOrderDetails
}