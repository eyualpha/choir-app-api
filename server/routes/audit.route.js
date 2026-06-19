const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const auditController = require("../controllers/audit.controller");

const auditRouter = express.Router();

auditRouter.get("/", isAuthenticated, isAdmin, asyncHandler(auditController.listLogs));
auditRouter.get("/summary", isAuthenticated, isAdmin, asyncHandler(auditController.summary));
auditRouter.get("/actors/:actorId", isAuthenticated, isAdmin, asyncHandler(auditController.actorActivity));
auditRouter.get("/:entityType/:entityId", isAuthenticated, isAdmin, asyncHandler(auditController.entityHistory));

module.exports = { auditRouter };
