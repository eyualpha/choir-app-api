const path = require("path");
const fs = require("fs");

// Local dev: load .env files. On Vercel, env vars are injected by the platform.
const envPaths = [
  path.join(__dirname, "..", "server", ".env"),
  path.join(__dirname, "..", ".env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath, quiet: true });
  }
}

const { getApp } = require("../server/bootstrap");

module.exports = async (req, res) => {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error("HarmoniQ API init failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Server initialization failed",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
};
