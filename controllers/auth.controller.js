const bcrypt = require("bcrypt");
const User = require("../models/user.model");
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

module.exports = { registerUser };
