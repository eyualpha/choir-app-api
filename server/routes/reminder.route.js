const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { asyncHandler } = require("../middlewares/asyncHandler");
const reminderController = require("../controllers/reminder.controller");

const reminderRouter = express.Router();

reminderRouter.get("/pending", isAuthenticated, isAdmin, asyncHandler(reminderController.listPending));
reminderRouter.get("/stats", isAuthenticated, isAdmin, asyncHandler(reminderController.stats));
reminderRouter.post("/events", isAuthenticated, isAdmin, asyncHandler(reminderController.sendEventReminders));
reminderRouter.post("/targeted", isAuthenticated, isAdmin, asyncHandler(reminderController.sendTargeted));

module.exports = { reminderRouter };
