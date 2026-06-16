const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { requireSelfOrAdmin } = require("../middlewares/authorization");
const { asyncHandler } = require("../middlewares/asyncHandler");
const engagementController = require("../controllers/engagement.controller");

const engagementRouter = express.Router();

engagementRouter.get("/", isAuthenticated, isAdmin, asyncHandler(engagementController.listEngagement));
engagementRouter.get("/leaderboard", isAuthenticated, isAdmin, asyncHandler(engagementController.leaderboard));
engagementRouter.get("/at-risk", isAuthenticated, isAdmin, asyncHandler(engagementController.atRisk));
engagementRouter.get(
  "/members/:memberId",
  isAuthenticated,
  requireSelfOrAdmin("memberId"),
  asyncHandler(engagementController.memberScore)
);

module.exports = { engagementRouter };
