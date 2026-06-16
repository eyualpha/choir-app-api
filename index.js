const connectDB = require("./config/mongodb");
const { createApp } = require("./app");
require("dotenv").config({ quiet: true });

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
const app = createApp();

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Unable to start server - DB connection failed");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`HarmoniQ API running on port ${PORT}`);
  });
};

startServer();
