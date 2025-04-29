const path = require("path");
// Helper function to determine content type based on file extension
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };

  return contentTypes[ext] || "application/octet-stream";
};

module.exports = {
  getContentType,
};
