// External imports
const jwt = require('jsonwebtoken');

// Internal imports
const { apiResponse } = require('../helpers/apiResponse.helper');

const checkValidity = async (req, res, next) => {
	const bearerHeader = req.headers['authorization'];
	if (typeof bearerHeader !== 'undefined') {
		req.token = bearerHeader;
		try {
			const decoded = await jwt.verify(req.token, process.env.JWT_SECRET)
			req.user = decoded
			next();
		} catch (error) {
			return apiResponse('Error', 'Unauthorized', null, 401, res);
		}
	} else {
		return apiResponse('Error', 'Unauthorized', null, 401, res);
	}
};

module.exports = {
    checkValidity,
}