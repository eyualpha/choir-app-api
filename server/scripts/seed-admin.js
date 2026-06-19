const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const envPaths = [
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", ".env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath, quiet: true });
  }
}

const connectDB = require("../config/mongodb");
const User = require("../models/user.model");
const MemberProfile = require("../models/memberProfile.model");

const DEFAULT_EMAIL = "admin@harmoniq.local";
const DEFAULT_NAME = "HarmoniQ Super Admin";
const DEFAULT_PASSWORD = "HarmoniQAdmin2026!";

async function seedSuperAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const name = (process.env.SEED_ADMIN_NAME || DEFAULT_NAME).trim();
  const password = process.env.SEED_ADMIN_PASSWORD || DEFAULT_PASSWORD;

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Configure .env before seeding.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.isActive = true;
      await existing.save();
      console.log(`Updated existing user to admin: ${email}`);
    } else {
      console.log(`Super admin already exists: ${email}`);
      console.log("No changes made. Use login or reset password if needed.");
    }
    await mongooseDisconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    role: "admin",
    voicePart: "Other",
    passwordHash,
    isActive: true,
    isPasswordChanged: true,
  });

  await MemberProfile.create({
    user: user._id,
    joinedAt: user.createdAt,
  });

  console.log("Super admin created successfully.");
  console.log("---");
  console.log(`Email:    ${email}`);
  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log("Password: (from SEED_ADMIN_PASSWORD in .env)");
  } else {
    console.log(`Password: ${password}`);
    console.log("Set SEED_ADMIN_PASSWORD in .env to use a custom password.");
  }
  console.log("---");
  console.log("Log in at /login, then register members via POST /api/auth/register (admin only).");

  await mongooseDisconnect();
}

async function mongooseDisconnect() {
  const mongoose = require("mongoose");
  await mongoose.disconnect();
}

seedSuperAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
