const path = require("path");
const fs = require("fs");
const express = require("express");

const envPaths = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "..", ".env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath, quiet: true });
  }
}

const { getApp } = require("./bootstrap");

const validateEnv = () => {
  const required = ["MONGODB_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters for security");
  }
};

// Vercel requires an Express import + exported app from index.js
const app = express();

app.use(async (req, res, next) => {
  try {
    const realApp = await getApp();
    realApp(req, res, next);
  } catch (err) {
    console.error("HarmoniQ API init failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Server initialization failed",
      detail: process.env.VERCEL ? undefined : err.message,
    });
  }
});

module.exports = app;

// Local dev: node server/index.js
if (require.main === module) {
  try {
    validateEnv();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  getApp()
    .then((realApp) => {
      realApp.listen(PORT, () => {
        console.log(`HarmoniQ API running on port ${PORT}`);
      });
    })
    .catch(() => {
      console.error("Unable to start server - DB connection failed");
      process.exit(1);
    });
}
