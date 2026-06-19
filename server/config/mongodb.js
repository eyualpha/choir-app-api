const mongoose = require("mongoose");
require("dotenv").config({ quiet: true });

const connectDB = async () => {
  const uri = (process.env.MONGODB_URI || "").trim();

  if (!uri) {
    const msg = "MONGODB_URI is not set in environment variables";
    console.error(msg);
    throw new Error(msg);
  }

  if (uri.includes("<db_password>") || uri.includes("<username>")) {
    const msg = "MONGODB_URI still contains placeholders — paste your full Atlas connection string";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected successfully (${mongoose.connection.db.databaseName})`);
    return mongoose.connection;
  } catch (error) {
    if (error.code === "ENOTFOUND" && error.syscall === "querySrv") {
      console.error(
        "MongoDB: cluster hostname not found. Copy the connection string from Atlas → Connect → Drivers."
      );
    } else if (error.code === 8000 || error.codeName === "AtlasError") {
      console.error(
        "MongoDB authentication failed. Reset the database user password in Atlas and update MONGODB_URI."
      );
    } else {
      console.error("MongoDB connection error:", error.message);
    }
    throw error;
  }
};

module.exports = connectDB;
