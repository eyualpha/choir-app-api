const Resource = require("../models/resource.model");
const {
  uploadBufferToCloudinary,
  destroyCloudinaryAsset,
} = require("../utils/cloudinaryUpload");
const {
  inferResourceType,
} = require("../utils/resourceType");

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
      const uploadedFile = await uploadBufferToCloudinary(file.buffer, mimeType);

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
      await destroyCloudinaryAsset(publicId, resource.file?.mimeType);
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
