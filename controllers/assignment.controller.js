const ChoirAssignment = require("../models/assignment.model");
const User = require("../models/user.model");
const { sendAssignmentEmail } = require("../utils/sendEmail");

const addUserToCategory = async (req, res) => {
  try {
    const { userId, category } = req.body;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const validCategories = ["leadSingers", "backupSingers", "prayerTeam"];
    if (!validCategories.includes(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }

    let assignment = await ChoirAssignment.findOne();

    if (!assignment) {
      assignment = new ChoirAssignment({ assignedBy: req.user.id });
    }

    if (assignment[category].includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User already assigned to this category",
      });
    }

    assignment[category].push(userId);

    await assignment.save();
    await sendAssignmentEmail(targetUser.email, targetUser.name, category);

    res.status(200).json({
      success: true,
      message: `User added to ${category} successfully`,
      assignment,
    });
  } catch (error) {
    console.error("Add User to Category Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeUserFromCategory = async (req, res) => {
  try {
    const { userId, category } = req.body;

    const validCategories = ["leadSingers", "backupSingers", "prayerTeam"];
    if (!validCategories.includes(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }

    const assignment = await ChoirAssignment.findOne();
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "No assignment document found" });
    }

    assignment[category] = assignment[category].filter(
      (id) => id.toString() !== userId
    );

    await assignment.save();

    res.status(200).json({
      success: true,
      message: `User removed from ${category} successfully`,
      assignment,
    });
  } catch (error) {
    console.error("Remove User from Category Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    const assignment = await ChoirAssignment.findOne()
      .populate("leadSingers", "name email voicePart profile")
      .populate("backupSingers", "name email voicePart profile")
      .populate("prayerTeam", "name email profile")
      .populate("assignedBy", "name email");

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "No assignments found" });
    }

    res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Get Assignments Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssignments,
  removeUserFromCategory,
  addUserToCategory,
};
