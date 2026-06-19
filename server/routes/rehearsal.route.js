const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const rehearsalController = require("../controllers/rehearsal.controller");

const rehearsalRouter = express.Router();

rehearsalRouter.get("/:eventId", isAuthenticated, asyncHandler(rehearsalController.getPlan));
rehearsalRouter.put("/:eventId", isAuthenticated, isAdmin, asyncHandler(rehearsalController.upsertPlan));
rehearsalRouter.post("/:eventId/publish", isAuthenticated, isAdmin, asyncHandler(rehearsalController.publishPlan));
rehearsalRouter.post("/:eventId/items", isAuthenticated, isAdmin, asyncHandler(rehearsalController.addItem));
rehearsalRouter.delete("/:eventId/items/:order", isAuthenticated, isAdmin, asyncHandler(rehearsalController.removeItem));

module.exports = { rehearsalRouter };
