const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const eventController = require("../controllers/event.controller");

const eventRouter = express.Router();

eventRouter.get("/", isAuthenticated, asyncHandler(eventController.listEvents));
eventRouter.get("/upcoming", isAuthenticated, asyncHandler(eventController.upcomingEvents));
eventRouter.get("/conflicts", isAuthenticated, isAdmin, asyncHandler(eventController.scheduleConflicts));
eventRouter.get("/:id", isAuthenticated, asyncHandler(eventController.getEvent));
eventRouter.post("/", isAuthenticated, isAdmin, asyncHandler(eventController.createEvent));
eventRouter.patch("/:id", isAuthenticated, isAdmin, asyncHandler(eventController.updateEvent));
eventRouter.post("/:id/cancel", isAuthenticated, isAdmin, asyncHandler(eventController.cancelEvent));
eventRouter.post("/:id/complete", isAuthenticated, isAdmin, asyncHandler(eventController.completeEvent));

module.exports = { eventRouter };
