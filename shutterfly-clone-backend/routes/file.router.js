// External imports
const express = require('express');
const multer = require('multer');

// Internal imports
const { checkValidity } = require('../middlewares/checkValidity');
const { uploadImage, retrieveImage } = require('../controllers/file.controller');

const router = express.Router();

// Multer storage and filecheck setup
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "assets/images");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${file.originalname}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "png" || file.mimetype.split("/")[1] === "jpeg" || file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "webp" || file.mimetype.split("/")[1] === "avif" || file.mimetype.split("/")[1] === "gif") {
        cb(null, true);
    } else {
        cb(new Error("Not a Valid Image!!!"), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});


router.post('/upload', checkValidity, upload.single('image'), uploadImage);

router.get('/image/:imageId', checkValidity, retrieveImage);

module.exports = router;