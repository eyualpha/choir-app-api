const Resource = require("../models/resource.model");
const cloudinary = require("../config/cloudinary");

/**
 * Helpers
 */
const inferResourceType = (mimetype, explicitType) => {
  // explicitType preferred (from req.body.type)
  if (explicitType) {
    const t = explicitType.toLowerCase();
    if (["lyrics", "pdf", "audio", "video"].includes(t)) return t;
  }

  if (!mimetype) return "pdf"; // fallback

  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("text/")) return "lyrics";
  // some docs: docx, msword -> treat as pdf (raw)
  if (mimetype.includes("word") || mimetype.includes("officedocument"))
    return "pdf";

  // default to pdf for unknowns (so it can be downloaded)
  return "pdf";
};

/**
 * Map to cloudinary resource_type
 */
const cloudResourceTypeForMime = (mimetype) => {
  if (!mimetype) return "raw";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "video"; // cloudinary treats audio as video
  return "raw"; // pdf, text, docs, zips etc.
};

/**
 * Create resources - multiple files allowed
 * route: POST /api/resources/upload
 */
const createResource = async (req, res) => {
  try {
    const { title, description } = req.body;
    const explicitType = req.body.type; // optional
    const userId = req.user?.id || req.user?._id; // auth middleware may have id or _id

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required." });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded." });
    }

    const createdResources = [];

    for (const file of req.files) {
      // file.filename = public_id created by multer-storage-cloudinary
      // file.path may sometimes not be the correct URL for raw files; so we compute the url using cloudinary.url
      const publicId = file.filename || file.public_id || file.publicId;
      const mimeType =
        file.mimetype || (file.mimetype && file.mimetype.toLowerCase());
      const size = file.size || 0;

      // infer high-level resource type for your model
      const inferredType = inferResourceType(mimeType, explicitType);

      // compute correct cloudinary resource_type
      const cloudResourceType = cloudResourceTypeForMime(mimeType);

      // Build canonical secure url using cloudinary (ensures raw files use /raw/upload/)
      // If publicId is missing, fallback to file.path
      let url = file.path || file.secure_url || null;
      try {
        if (publicId) {
          // cloudinary.url builds a url according to resource_type
          url = cloudinary.url(publicId, {
            resource_type: cloudResourceType,
            secure: true,
          });
        }
      } catch (err) {
        // fallback: keep whatever multer provided
        console.warn("cloudinary.url() failed for", publicId, err.message);
      }

      // create resource document in DB
      const resourceDoc = await Resource.create({
        title,
        description,
        type: inferredType,
        file: {
          url,
          public_id: publicId,
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
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
      error: error.message,
    });
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
    if (!resource) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    // delete from cloudinary (determine resource type)
    const publicId = resource.file?.public_id;
    if (publicId) {
      // decide resource_type for destroy: if publicId refers to a raw file, use raw
      const mime = resource.file?.mimeType;
      const cloudResourceType = cloudResourceTypeForMime(mime);

      // destroy with the right resource_type
      await cloudinary.uploader.destroy(publicId, {
        resource_type: cloudResourceType,
      });
    }

    await Resource.findByIdAndDelete(resourceId);

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete Resource Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createResource, getAllResources, deleteResource };
