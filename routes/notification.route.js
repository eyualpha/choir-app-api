const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const notificationController = require("../controllers/notification.controller");

const notificationRouter = express.Router();

notificationRouter.get("/", isAuthenticated, asyncHandler(notificationController.listMine));
notificationRouter.get("/unread-count", isAuthenticated, asyncHandler(notificationController.unreadCount));
notificationRouter.patch("/read-all", isAuthenticated, asyncHandler(notificationController.markAllRead));
notificationRouter.patch("/:id/read", isAuthenticated, asyncHandler(notificationController.markRead));
notificationRouter.delete("/:id", isAuthenticated, asyncHandler(notificationController.remove));
notificationRouter.post("/", isAuthenticated, isAdmin, asyncHandler(notificationController.createForMember));

module.exports = { notificationRouter };
