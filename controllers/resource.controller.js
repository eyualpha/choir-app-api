const Resource = require("../models/resource.model");

const createResource = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const userId = req.user?._id; // optional if you track uploads

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadedResources = [];

    for (const file of req.files) {
      const newResource = await Resource.create({
        title,
        description,
        type,

        file: {
          url: file.path,
          public_id: file.filename, // <-- Cloudinary stored public id
          mimeType: file.mimetype,
          size: file.size,
        },

        uploadedBy: userId,
      });

      uploadedResources.push(newResource);
    }

    res.status(201).json({
      success: true,
      message: "Resources uploaded successfully",
      resources: uploadedResources,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email");

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Fetch Resources Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
};

module.exports = { createResource, getAllResources };
