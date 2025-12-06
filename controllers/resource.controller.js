const Resource = require("../models/resource.model");

const createResource = async (req, res) => {
  const { type } = req.body;
  try {
    const files = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      type: file.mimetype,
    }));

    const resource = await Resource.create({
      title: req.body.title,
      uploadedBy: req.user._id,
      files,
      type,
    });

    res.status(201).json({
      message: "Resource uploaded successfully",
      resource,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createResource };
