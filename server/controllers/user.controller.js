const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const SUBTEAM_OPTIONS = ["pray", "zema", "evang", "social", null];
const VOICE_PARTS = ["Soprano", "Alto", "Tenor", "Bass", "Other"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.profile?.public_id) {
      await cloudinary.uploader.destroy(user.profile.public_id);
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a user's sub-team category (admin only)
const updateSubTeam = async (req, res) => {
  try {
    const { id } = req.params;
    let { subTeam } = req.body;

    if (subTeam === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "subTeam is required" });
    }

    // Allow clearing the sub-team assignment by sending null/empty string
    if (subTeam === "" || subTeam === null) {
      subTeam = null;
    }

    if (!SUBTEAM_OPTIONS.includes(subTeam)) {
      return res.status(400).json({
        success: false,
        message: `subTeam must be one of: ${SUBTEAM_OPTIONS.filter(
          Boolean
        ).join(", ")} or null`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { subTeam },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Sub-team updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update SubTeam Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update profile photo for the authenticated user
// Expects multipart/form-data with field name "avatar"
const updateProfilePhoto = async (req, res) => {
  try {
    // Support multer.any() (array) and .single/.fields shapes
    const file = Array.isArray(req.files)
      ? req.files[0]
      : (req.files && req.files.avatar && req.files.avatar[0]) ||
        (req.files && req.files.file && req.files.file[0]) ||
        req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete previous profile image if present
    if (user.profile?.public_id) {
      await cloudinary.uploader.destroy(user.profile.public_id, {
        resource_type: "image",
      });
    }

    // Upload new image from buffer using a stream
    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles", resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            return resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const uploaded = await uploadFromBuffer();

    user.profile = {
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };

    await user.save();

    const sanitized = user.toObject();
    delete sanitized.passwordHash;

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      user: sanitized,
    });
  } catch (error) {
    console.error("Update Profile Photo Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.role !== "admin" && String(req.user.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { name, email, voicePart } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
      updates.email = email;
    }
    if (voicePart !== undefined) {
      if (!VOICE_PARTS.includes(voicePart)) {
        return res.status(400).json({
          success: false,
          message: `voicePart must be one of: ${VOICE_PARTS.join(", ")}`,
        });
      }
      updates.voicePart = voicePart;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const setActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive boolean is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: isActive ? "User activated" : "User deactivated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Set Active Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getUsers, deleteUser, updateProfilePhoto, updateSubTeam, updateProfile, setActiveStatus };
