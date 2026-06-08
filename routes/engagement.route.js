const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const engagementController = require("../controllers/engagement.controller");

const engagementRouter = express.Router();

engagementRouter.get("/", isAuthenticated, isAdmin, asyncHandler(engagementController.listEngagement));
engagementRouter.get("/leaderboard", isAuthenticated, isAdmin, asyncHandler(engagementController.leaderboard));
engagementRouter.get("/at-risk", isAuthenticated, isAdmin, asyncHandler(engagementController.atRisk));
engagementRouter.get("/members/:memberId", isAuthenticated, asyncHandler(engagementController.memberScore));

module.exports = { engagementRouter };
