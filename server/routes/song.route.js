const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const songController = require("../controllers/song.controller");

const songRouter = express.Router();

songRouter.get("/", isAuthenticated, asyncHandler(songController.listSongs));
songRouter.get("/gaps/voice-parts", isAuthenticated, isAdmin, asyncHandler(songController.voicePartGaps));
songRouter.get("/:id", isAuthenticated, asyncHandler(songController.getSong));
songRouter.post("/", isAuthenticated, isAdmin, asyncHandler(songController.createSong));
songRouter.patch("/:id", isAuthenticated, isAdmin, asyncHandler(songController.updateSong));
songRouter.delete("/:id", isAuthenticated, isAdmin, asyncHandler(songController.archiveSong));
songRouter.post("/:id/perform", isAuthenticated, isAdmin, asyncHandler(songController.recordPerformance));
songRouter.post("/tags/bulk", isAuthenticated, isAdmin, asyncHandler(songController.bulkTag));

module.exports = { songRouter };
