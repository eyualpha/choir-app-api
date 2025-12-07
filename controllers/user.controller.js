const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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

// Update profile photo for the authenticated user
// Expects multipart/form-data with field name "avatar"
const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
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
        streamifier.createReadStream(req.file.buffer).pipe(stream);
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

module.exports = { getUsers, deleteUser, updateProfilePhoto };
