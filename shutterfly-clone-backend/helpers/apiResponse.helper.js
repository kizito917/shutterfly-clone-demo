const apiResponse = (responseType, message, data, status, expressResponseInstance) => {
    expressResponseInstance.status(status).json({
        responseType,
        message,
        data
    });
}

module.exports = {
    apiResponse
}