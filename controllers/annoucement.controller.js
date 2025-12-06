const Announcement = require("../models/annoucement.model");

const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    const attachments =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
        mimeType: file.mimetype,
      })) || [];

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
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

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
