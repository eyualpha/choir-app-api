const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { cloudResourceTypeForMime } = require("./resourceType");

const uploadBufferToCloudinary = (fileBuffer, mimetype, folder = "uploads") => {
  const resource_type = cloudResourceTypeForMime(mimetype);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type, folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const destroyCloudinaryAsset = async (publicId, mimeType) => {
  if (!publicId) return;
  const resource_type = cloudResourceTypeForMime(mimeType);
  await cloudinary.uploader.destroy(publicId, { resource_type });
};

module.exports = { uploadBufferToCloudinary, destroyCloudinaryAsset };
