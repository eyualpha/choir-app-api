const connectDB = require("./config/mongodb");
const { createApp } = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = createApp();

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Unable to start server - DB connection failed:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
