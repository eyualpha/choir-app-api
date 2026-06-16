const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { resourceRouter } = require("./routes/resource.route");
const { authRouter } = require("./routes/auth.route");
const { userRouter } = require("./routes/user.route");
const { announcementRouter } = require("./routes/announcemnt.route");
const { assignmentRouter } = require("./routes/assignment.route");
const { eventRouter } = require("./routes/event.route");
const { songRouter } = require("./routes/song.route");
const { attendanceRouter } = require("./routes/attendance.route");
const { notificationRouter } = require("./routes/notification.route");
const { rehearsalRouter } = require("./routes/rehearsal.route");
const { reportRouter } = require("./routes/report.route");
const { setlistRouter } = require("./routes/setlist.route");
const { volunteerRouter } = require("./routes/volunteer.route");
const { practiceLogRouter } = require("./routes/practiceLog.route");
const { rosterRouter } = require("./routes/roster.route");
const { searchRouter } = require("./routes/search.route");
const { exportRouter } = require("./routes/export.route");
const { calendarRouter } = require("./routes/calendar.route");
const { auditRouter } = require("./routes/audit.route");
const { engagementRouter } = require("./routes/engagement.route");
const { rsvpRouter } = require("./routes/rsvp.route");
const { reminderRouter } = require("./routes/reminder.route");
const { requestLogger } = require("./middlewares/requestLogger");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

function createApp() {
  const app = express();

  app.use(requestLogger);
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
  app.use("/api/events", eventRouter);
  app.use("/api/songs", songRouter);
  app.use("/api/attendance", attendanceRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/rehearsals", rehearsalRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/setlists", setlistRouter);
  app.use("/api/volunteers", volunteerRouter);
  app.use("/api/practice-logs", practiceLogRouter);
  app.use("/api/roster", rosterRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/exports", exportRouter);
  app.use("/api/calendar", calendarRouter);
  app.use("/api/audit", auditRouter);
  app.use("/api/engagement", engagementRouter);
  app.use("/api/rsvp", rsvpRouter);
  app.use("/api/reminders", reminderRouter);

  app.get("/", (_req, res) => {
    res.json({
      name: "HarmoniQ API",
      description: "Intelligent choir management platform",
      version: "2.0.0",
      status: "running",
    });
  });

  app.get("/api/health", (_req, res) => {
    const state = mongoose.connection.readyState;
    res.json({
      status: state === 1 ? "ok" : "unavailable",
      service: "HarmoniQ API",
      mongooseState: state,
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
