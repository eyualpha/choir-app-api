const User = require("../models/user.model");

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash") // hide password
      .sort({ createdAt: -1 }); // newest first

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

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete profile from Cloudinary if exists
    if (user.profile?.public_id) {
      await cloudinary.uploader.destroy(user.profile.public_id);
    }

    // Delete user from DB
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

module.exports = { getUsers, deleteUser };
