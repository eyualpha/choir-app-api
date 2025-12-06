const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = "raw";
    let folder = "choir_app";
    const mime = file.mimetype;

    if (mime.startsWith("image/")) resourceType = "image";
    else if (mime.startsWith("audio/")) resourceType = "video";
    else if (mime.startsWith("video/")) resourceType = "video";
    else resourceType = "raw";

    return {
      folder,
      resource_type: resourceType,
      type: "upload",
      access_mode: "public",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
