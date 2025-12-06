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

module.exports = { getUsers };
