const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { resourceRouter } = require("./routes/resource.route");
const { authRouter } = require("./routes/auth.route");
const { userRouter } = require("./routes/user.route");
const { announcementRouter } = require("./routes/announcemnt.route");
const { assignmentRouter } = require("./routes/assignment.route");

function createApp() {
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

  app.get("/api/health", (req, res) => {
    const state = mongoose.connection.readyState;
    res.json({
      status: state === 1 ? "ok" : "unavailable",
      mongooseState: state,
    });
  });

  return app;
}

module.exports = { createApp };
