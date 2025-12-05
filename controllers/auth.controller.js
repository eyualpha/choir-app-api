const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const sendEmail = require("../utils/sendEmail");

require("dotenv").config();

const registerUser = async (req, res) => {
  try {
    const { name, email, role, voicePart } = req.body;
    console.log(req.body);

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
      `Welcome! Your temporary password is: ${tempPassword}`
    );

    res.json({ message: "User created and email sent", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, login };
