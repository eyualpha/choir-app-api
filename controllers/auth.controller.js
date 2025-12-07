const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const { sendEmail, sendResetOtpEmail } = require("../utils/sendEmail");

require("dotenv").config();

const registerUser = async (req, res) => {
  try {
    const { name, email, role, voicePart } = req.body;

    const tempPassword = Math.random().toString(36).slice(-8);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name,
      email,
      role,
      voicePart,
      passwordHash,
    });

    await sendEmail(
      email,
      "Your Choir Account Has Been Created",
      ` ${tempPassword}`
    );

    res.json({ message: "User created and email sent", user });
  } catch (err) {
    console.error("Register User Error:", err);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      details: err,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ message: "User account is deactivated" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const payload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        voicePart: user.voicePart,
        isPasswordChanged: user.isPasswordChanged,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error", error: err.message, stack: err.stack });
  }
};

// Request a password reset: generates an OTP and emails it to the user
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = expires;
    await user.save();

    await sendResetOtpEmail(user.email, otp);

    return res.status(200).json({
      message: "Reset code sent to email",
      expiresAt: expires,
    });
  } catch (err) {
    console.error("Request Password Reset Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message, stack: err.stack });
  }
};

// Verify OTP for password reset (no password change yet)
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and otp are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const now = new Date();
    if (user.resetOtp !== otp || user.resetOtpExpires < now) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    return res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message, stack: err.stack });
  }
};

// Set new password using a valid OTP
const setNewPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const now = new Date();
    if (user.resetOtp !== otp || user.resetOtpExpires < now) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.passwordHash = hashedPassword;
    user.isPasswordChanged = true;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Set New Password Error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message, stack: err.stack });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Both password fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        passwordHash: hashedPassword,
        isPasswordChanged: true,
      },
      { new: true }
    ).select("-passwordHash");

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating password",
      error: error.message,
      stack: error.stack,
      details: error,
    });
  }
};

module.exports = {
  registerUser,
  login,
  updatePassword,
  requestPasswordReset,
  verifyResetOtp,
  setNewPassword,
};
