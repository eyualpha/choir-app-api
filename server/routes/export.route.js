const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const exportController = require("../controllers/export.controller");

const exportRouter = express.Router();

exportRouter.get("/members", isAuthenticated, isAdmin, asyncHandler(exportController.exportMembers));
exportRouter.get("/events", isAuthenticated, isAdmin, asyncHandler(exportController.exportEvents));
exportRouter.get("/songs", isAuthenticated, isAdmin, asyncHandler(exportController.exportSongs));
exportRouter.get("/attendance/:eventId", isAuthenticated, isAdmin, asyncHandler(exportController.exportAttendance));
exportRouter.get("/setlists/:id", isAuthenticated, isAdmin, asyncHandler(exportController.exportSetlistData));
exportRouter.get("/practice/:memberId", isAuthenticated, isAdmin, asyncHandler(exportController.exportPracticeSummary));

module.exports = { exportRouter };
