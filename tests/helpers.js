const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function createUser({
  name = "Test User",
  email = "user@test.com",
  password = "password123",
  role = "member",
  voicePart = "Soprano",
  isActive = true,
  isPasswordChanged = false,
  subTeam = null,
} = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({
    name,
    email,
    passwordHash,
    role,
    voicePart,
    isActive,
    isPasswordChanged,
    subTeam,
  });
}

function buildAuthHeader(user) {
  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
  return `Bearer ${token}`;
}

module.exports = { createUser, buildAuthHeader };
