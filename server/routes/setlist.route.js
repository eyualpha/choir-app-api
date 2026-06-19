const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const setlistController = require("../controllers/setlist.controller");

const setlistRouter = express.Router();

setlistRouter.get("/", isAuthenticated, asyncHandler(setlistController.listSetlists));
setlistRouter.get("/templates", isAuthenticated, asyncHandler(setlistController.listTemplates));
setlistRouter.get("/:id", isAuthenticated, asyncHandler(setlistController.getSetlist));
setlistRouter.post("/", isAuthenticated, isAdmin, asyncHandler(setlistController.createSetlist));
setlistRouter.patch("/:id", isAuthenticated, isAdmin, asyncHandler(setlistController.updateSetlist));
setlistRouter.post("/:id/submit", isAuthenticated, isAdmin, asyncHandler(setlistController.submitForReview));
setlistRouter.post("/:id/approve", isAuthenticated, isAdmin, asyncHandler(setlistController.approveSetlist));
setlistRouter.post("/:id/archive", isAuthenticated, isAdmin, asyncHandler(setlistController.archiveSetlist));
setlistRouter.post("/:id/duplicate", isAuthenticated, isAdmin, asyncHandler(setlistController.duplicateSetlist));
setlistRouter.post("/:id/attach-event", isAuthenticated, isAdmin, asyncHandler(setlistController.attachToEvent));
setlistRouter.post("/:id/reorder", isAuthenticated, isAdmin, asyncHandler(setlistController.reorderItems));

module.exports = { setlistRouter };
