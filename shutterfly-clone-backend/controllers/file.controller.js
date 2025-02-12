// External imports
const fs = require('fs').promises;
const path = require('path');

// Internal imports
const db = require("../models/index");
const { apiResponse } = require("../helpers/apiResponse.helper");

// Helper function to determine content type based on file extension
const getContentType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
};

const uploadImage = async (req, res) => {
    console.log("I got in")
    try {
        const uploadedImage = await db.UserImage.create({
            user: req.user.id,
            imagePath: req.file.path
        })

        return apiResponse("Success", "Image uploaded successfully", uploadedImage, 200, res);
    } catch (err) {
        return apiResponse("Error", "Unable to upload image", null, 500, res);
    }
}

const retrieveImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        // Check if ID is valid
        const imageDetails = await db.UserImage.findOne({
            where: {id: imageId}
        });

        if (!imageDetails) {
            return apiResponse("Error", "Image not found. Invalid ID provided", null, 404, res);
        }

        // Get image path and construct full path
        const imagePath = imageDetails.imagePath;
        const fullPath = path.join(process.cwd(), imagePath);

        try {
            // Read the file
            const imageBuffer = await fs.readFile(fullPath);

            // Set appropriate headers
            res.setHeader('Content-Type', getContentType(imagePath));
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

            // Send the image
            return res.send(imageBuffer);
        } catch (fileErr) {
            // Handle file reading errors
            if (fileErr.code === 'ENOENT') {
                return apiResponse("Error", "Image file not found on server", null, 404, res);
            }
            throw fileErr; // Re-throw other errors to be caught by outer catch block
        }
    } catch (err) {
        return apiResponse("Error", "Unable to retrieve requested image", null, 500, res);
    }
}

module.exports = {
    uploadImage,
    retrieveImage
}