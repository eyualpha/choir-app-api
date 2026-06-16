const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { requireSelfOrAdmin } = require("../middlewares/authorization");
const { asyncHandler } = require("../middlewares/asyncHandler");
const practiceLogController = require("../controllers/practiceLog.controller");

const practiceLogRouter = express.Router();

practiceLogRouter.get("/", isAuthenticated, asyncHandler(practiceLogController.listLogs));
practiceLogRouter.get("/feed", isAuthenticated, isAdmin, asyncHandler(practiceLogController.directorFeed));
practiceLogRouter.get(
  "/stats/:memberId",
  isAuthenticated,
  requireSelfOrAdmin("memberId"),
  asyncHandler(practiceLogController.memberStats)
);
practiceLogRouter.get("/songs/:songId/heatmap", isAuthenticated, isAdmin, asyncHandler(practiceLogController.songHeatmap));
practiceLogRouter.get("/:id", isAuthenticated, asyncHandler(practiceLogController.getLog));
practiceLogRouter.post("/", isAuthenticated, asyncHandler(practiceLogController.createLog));
practiceLogRouter.patch("/:id", isAuthenticated, asyncHandler(practiceLogController.updateLog));
practiceLogRouter.delete("/:id", isAuthenticated, asyncHandler(practiceLogController.deleteLog));
practiceLogRouter.post("/:id/share", isAuthenticated, asyncHandler(practiceLogController.shareLog));

module.exports = { practiceLogRouter };
