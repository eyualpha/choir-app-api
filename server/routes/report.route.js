const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const reportController = require("../controllers/report.controller");

const reportRouter = express.Router();

reportRouter.get("/dashboard", isAuthenticated, isAdmin, asyncHandler(reportController.dashboard));
reportRouter.get("/member-growth", isAuthenticated, isAdmin, asyncHandler(reportController.memberGrowth));
reportRouter.get("/song-usage", isAuthenticated, isAdmin, asyncHandler(reportController.songUsage));
reportRouter.get("/event-completion", isAuthenticated, isAdmin, asyncHandler(reportController.eventCompletion));

module.exports = { reportRouter };
