const Resource = require("../models/resource.model");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier"); // to upload buffer directly

const inferResourceType = (mimetype, explicitType) => {
  if (explicitType) {
    const t = explicitType.toLowerCase();
    if (["lyrics", "pdf", "audio", "video"].includes(t)) return t;
  }

  if (!mimetype) return "pdf";

  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("text/")) return "lyrics";
  if (mimetype.includes("word") || mimetype.includes("officedocument"))
    return "pdf";

  return "pdf";
};

const cloudResourceTypeForMime = (mimetype) => {
  if (!mimetype) return "raw";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "video"; // Cloudinary treats audio as video
  return "raw";
};

// Helper to upload a single file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, mimetype, folder = "uploads") => {
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

/**
 * Create resources - multiple files allowed
 * route: POST /api/resources/upload
 */
const createResource = async (req, res) => {
  try {
    const { title, description } = req.body;
    const explicitType = req.body.type;
    const userId = req.user?.id || req.user?._id;

    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Title is required." });
    if (!req.files || req.files.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded." });

    const createdResources = [];

    for (const file of req.files) {
      const mimeType = file.mimetype;
      const size = file.size || 0;

      const inferredType = inferResourceType(mimeType, explicitType);

      // Upload to Cloudinary
      const uploadedFile = await uploadToCloudinary(file.buffer, mimeType);

      const resourceDoc = await Resource.create({
        title,
        description,
        type: inferredType,
        file: {
          url: uploadedFile.secure_url,
          public_id: uploadedFile.public_id,
          mimeType,
          size,
        },
        uploadedBy: userId,
      });

      createdResources.push(resourceDoc);
    }

    return res.status(201).json({
      success: true,
      message: "Resources uploaded successfully",
      resources: createdResources,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all resources
 * route: GET /api/resources
 */
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email");

    return res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Fetch Resources Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete resource (and remove file from Cloudinary)
 * route: DELETE /api/resources/:id
 */
const deleteResource = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = await Resource.findById(resourceId);
    if (!resource)
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });

    const publicId = resource.file?.public_id;
    if (publicId) {
      const mime = resource.file?.mimeType;
      const resource_type = cloudResourceTypeForMime(mime);
      await cloudinary.uploader.destroy(publicId, { resource_type });
    }

    await Resource.findByIdAndDelete(resourceId);

    return res
      .status(200)
      .json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete Resource Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createResource, getAllResources, deleteResource };
