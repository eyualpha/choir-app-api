const path = require("path");
const fs = require("fs");

// Load .env from server folder, then repo root (for monorepo layout)
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
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be at least 32 characters for security");
    process.exit(1);
  }
};

validateEnv();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const app = await getApp();
    app.listen(PORT, () => {
      console.log(`HarmoniQ API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start server - DB connection failed");
    process.exit(1);
  }
};

startServer();
