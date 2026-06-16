const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { requireSelfOrAdminFromUserId } = require("../middlewares/authorization");
const { asyncHandler } = require("../middlewares/asyncHandler");
const rosterController = require("../controllers/roster.controller");

const rosterRouter = express.Router();

rosterRouter.get("/", isAuthenticated, isAdmin, asyncHandler(rosterController.listRoster));
rosterRouter.get("/voice-parts", isAuthenticated, isAdmin, asyncHandler(rosterController.voicePartDistribution));
rosterRouter.get("/availability/:day", isAuthenticated, isAdmin, asyncHandler(rosterController.availabilityReport));
rosterRouter.get("/tags/:tag", isAuthenticated, isAdmin, asyncHandler(rosterController.listByTag));
rosterRouter.get(
  "/:userId",
  isAuthenticated,
  requireSelfOrAdminFromUserId("userId"),
  asyncHandler(rosterController.getProfile)
);
rosterRouter.put(
  "/:userId",
  isAuthenticated,
  requireSelfOrAdminFromUserId("userId"),
  asyncHandler(rosterController.upsertProfile)
);
rosterRouter.patch("/:userId/director-notes", isAuthenticated, isAdmin, asyncHandler(rosterController.updateDirectorNotes));
rosterRouter.post("/:userId/refresh-streak", isAuthenticated, isAdmin, asyncHandler(rosterController.refreshStreak));
rosterRouter.post("/tag", isAuthenticated, isAdmin, asyncHandler(rosterController.tagMembers));

module.exports = { rosterRouter };
