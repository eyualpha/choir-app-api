const connectDB = require("./config/mongodb");
const { createApp } = require("./app");

const CACHE_KEY = "__harmoniqApp";

async function getApp() {
  if (global[CACHE_KEY]) {
    return global[CACHE_KEY];
  }

  const required = ["MONGODB_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  await connectDB();
  const app = createApp();
  global[CACHE_KEY] = app;
  return app;
}

module.exports = { getApp };
