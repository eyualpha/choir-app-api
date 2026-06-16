const Announcement = require("../models/annoucement.model");
const { uploadBufferToCloudinary, destroyCloudinaryAsset } = require("../utils/cloudinaryUpload");

const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const attachments = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadBufferToCloudinary(
          file.buffer,
          file.mimetype,
          "announcements"
        );
        attachments.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
          mimeType: file.mimetype,
        });
      }
    }

    const announcement = await Announcement.create({
      title,
      message,
      attachments,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create Announcement Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    console.error("Get Announcements Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    for (const attachment of announcement.attachments || []) {
      await destroyCloudinaryAsset(attachment.public_id, attachment.mimeType);
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete Announcement Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement,
};
