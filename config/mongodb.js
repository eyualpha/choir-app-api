const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const msg = "MONGODB_URI is not set in environment variables";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // rethrow so callers can decide what to do (exit, retry, etc.)
    throw error;
  }
};

module.exports = connectDB;
