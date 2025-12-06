const multer = require("multer");

// Use memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
