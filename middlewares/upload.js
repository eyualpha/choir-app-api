const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../configs/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.body.isGallery ? "choir/gallery" : "choir/resources";

    return {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "mp3", "wav", "mp4", "pdf"],
      public_id: `${Date.now()}_${file.originalname}`,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
