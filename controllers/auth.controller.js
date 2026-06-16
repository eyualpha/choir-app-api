const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const MemberProfile = require("../models/memberProfile.model");

const { sendEmail, sendResetOtpEmail } = require("../utils/sendEmail");
const { sanitizeUser } = require("../utils/userResponse");
const { generateOtp, hashOtp, verifyOtp } = require("../utils/otp");
const { auditFromRequest } = require("../utils/auditHelper");

require("dotenv").config();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VOICE_PARTS = ["Soprano", "Alto", "Tenor", "Bass", "Other"];

const registerUser = async (req, res) => {
  try {
    const { name, email, voicePart } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (voicePart && !VOICE_PARTS.includes(voicePart)) {
      return res.status(400).json({
        success: false,
        message: `voicePart must be one of: ${VOICE_PARTS.join(", ")}`,
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name,
      email,
      role: "member",
      voicePart: voicePart || "Other",
      passwordHash,
    });

    await MemberProfile.create({
      user: user._id,
      joinedAt: user.createdAt,
    });

    await sendEmail(
      email,
      "Your HarmoniQ Account Has Been Created",
      `Your temporary password is: ${tempPassword}. Please log in and change it immediately.`
    );

    await auditFromRequest(req, {
      action: "create",
      entityType: "User",
      entityId: user._id,
      summary: `Registered member ${email}`,
    });

    res.status(201).json({
      success: true,
      message: "User created and welcome email sent",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Register User Error:", err);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "User account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const payload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    await auditFromRequest(req, {
      action: "login",
      entityType: "User",
      entityId: user._id,
      summary: `User logged in: ${user.email}`,
    });

    res.json({
      success: true,
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
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Generic response to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset code has been sent to that email",
      });
    }

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = await hashOtp(otp);
    user.resetOtpExpires = expires;
    await user.save();

    await sendResetOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "If an account exists, a reset code has been sent to that email",
    });
  } catch (err) {
    console.error("Request Password Reset Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and otp are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    const now = new Date();
    const otpValid = await verifyOtp(otp, user.resetOtp);
    if (!otpValid || user.resetOtpExpires < now) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const setNewPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    const now = new Date();
    const otpValid = await verifyOtp(otp, user.resetOtp);
    if (!otpValid || user.resetOtpExpires < now) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.isPasswordChanged = true;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Set New Password Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
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
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
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
    res.status(500).json({ success: false, message: "Server error while updating password" });
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
