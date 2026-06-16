const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { requireSelfOrAdmin } = require("../middlewares/authorization");
const { asyncHandler } = require("../middlewares/asyncHandler");
const rsvpController = require("../controllers/rsvp.controller");

const rsvpRouter = express.Router();

rsvpRouter.get(
  "/events/:eventId",
  isAuthenticated,
  asyncHandler(rsvpController.getEventRsvps)
);
rsvpRouter.get(
  "/events/:eventId/me",
  isAuthenticated,
  asyncHandler(rsvpController.getMyRsvp)
);
rsvpRouter.post(
  "/events/:eventId",
  isAuthenticated,
  asyncHandler(rsvpController.submitRsvp)
);
rsvpRouter.delete(
  "/events/:eventId",
  isAuthenticated,
  asyncHandler(rsvpController.deleteRsvp)
);
rsvpRouter.get(
  "/members/:memberId",
  isAuthenticated,
  requireSelfOrAdmin("memberId"),
  asyncHandler(rsvpController.getMemberRsvps)
);
rsvpRouter.delete(
  "/events/:eventId/members/:memberId",
  isAuthenticated,
  requireSelfOrAdmin("memberId"),
  asyncHandler(rsvpController.deleteRsvp)
);

module.exports = { rsvpRouter };
