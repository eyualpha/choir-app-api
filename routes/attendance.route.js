const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const attendanceController = require("../controllers/attendance.controller");

const attendanceRouter = express.Router();

attendanceRouter.get("/reports/voice-parts", isAuthenticated, isAdmin, asyncHandler(attendanceController.voicePartRates));
attendanceRouter.get("/members/:memberId", isAuthenticated, asyncHandler(attendanceController.getMemberHistory));
attendanceRouter.get("/events/:eventId", isAuthenticated, asyncHandler(attendanceController.getEventAttendance));
attendanceRouter.post("/events/:eventId", isAuthenticated, isAdmin, asyncHandler(attendanceController.markAttendance));
attendanceRouter.post("/events/:eventId/bulk", isAuthenticated, isAdmin, asyncHandler(attendanceController.bulkMarkAttendance));

module.exports = { attendanceRouter };
