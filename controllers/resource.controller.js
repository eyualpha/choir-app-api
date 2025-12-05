const Resource = require("../models/resource.model");

const createResource = async (req, res) => {
  try {
    const { title, description, type } = req.body;

    const resources = req.files.map((file) => ({
      title,
      description,
      type,
      file: {
        url: file.path,
        public_id: file.filename,
        mimeType: file.mimetype,
        size: file.size,
      },
      uploadedBy: req.user.id,
    }));

    const createdResources = await Resource.insertMany(resources);

    res.json({
      message: "Resources uploaded successfully",
      resources: createdResources,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createResource };
