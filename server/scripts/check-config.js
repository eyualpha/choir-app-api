require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const results = { db: null, email: null, warnings: [] };

if (!process.env.MONGODB_URI) {
  results.warnings.push("MONGODB_URI is not set");
} else if (process.env.MONGODB_URI.includes("<db_password>")) {
  results.warnings.push("MONGODB_URI still contains placeholder <db_password>");
}

if (!process.env.JWT_SECRET) {
  results.warnings.push("JWT_SECRET is not set");
} else if (process.env.JWT_SECRET.length < 32) {
  results.warnings.push(
    `JWT_SECRET is ${process.env.JWT_SECRET.length} characters — HarmoniQ requires at least 32`
  );
}

async function checkDb() {
  const uri = (process.env.MONGODB_URI || "").trim();
  if (!uri || uri.includes("<db_password>")) {
    results.db = { ok: false, error: "MONGODB_URI not configured" };
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const dbName = mongoose.connection.db.databaseName;
    results.db = { ok: true, database: dbName };
    await mongoose.disconnect();
  } catch (err) {
    results.db = { ok: false, error: err.message };
  }
}

async function checkEmail() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    results.email = { ok: false, error: "EMAIL_USER or EMAIL_PASS not set" };
    return;
  }
  const pass = process.env.EMAIL_PASS.replace(/\s/g, "");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: pass,
    },
  });
  try {
    await transporter.verify();
    results.email = { ok: true, user: process.env.EMAIL_USER };
  } catch (err) {
    results.email = { ok: false, error: err.message };
  }
}

async function main() {
  await checkDb();
  await checkEmail();
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.db?.ok && results.email?.ok ? 0 : 1);
}

main();
