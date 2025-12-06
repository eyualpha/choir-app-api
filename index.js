const express = require("express");
const connectDB = require("./config/mongodb");
const cors = require("cors");
const fs = require("fs");
const { resourceRouter } = require("./routes/resource.route");
const { authRouter } = require("./routes/auth.route");
const { userRouter } = require("./routes/user.route");
const { announcementRouter } = require("./routes/announcemnt.route");
const { assignmentRouter } = require("./routes/assignment.route");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://choir-app-front.vercel.app"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/users", userRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/assignments", assignmentRouter);

app.get("/", (req, res) => {
  res.send("Choir App API is running");
});

// Health endpoint to check DB connection state in production
const mongoose = require("mongoose");
app.get("/api/health", (req, res) => {
  const state = mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  res.json({
    status: state === 1 ? "ok" : "unavailable",
    mongooseState: state,
  });
});

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Unable to start server - DB connection failed:", err);
    // Exit so the platform (or you) can restart or surface the error
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
