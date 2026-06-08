const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const volunteerController = require("../controllers/volunteer.controller");

const volunteerRouter = express.Router();

volunteerRouter.get("/", isAuthenticated, asyncHandler(volunteerController.listShifts));
volunteerRouter.get("/open", isAuthenticated, asyncHandler(volunteerController.openShifts));
volunteerRouter.get("/summary", isAuthenticated, isAdmin, asyncHandler(volunteerController.summaryByRole));
volunteerRouter.get("/members/:memberId", isAuthenticated, asyncHandler(volunteerController.memberShifts));
volunteerRouter.get("/:id", isAuthenticated, asyncHandler(volunteerController.getShift));
volunteerRouter.post("/", isAuthenticated, isAdmin, asyncHandler(volunteerController.createShift));
volunteerRouter.patch("/:id", isAuthenticated, isAdmin, asyncHandler(volunteerController.updateShift));
volunteerRouter.delete("/:id", isAuthenticated, isAdmin, asyncHandler(volunteerController.deactivateShift));
volunteerRouter.post("/:id/assign", isAuthenticated, isAdmin, asyncHandler(volunteerController.assignMember));
volunteerRouter.patch("/:id/assignments/:memberId", isAuthenticated, asyncHandler(volunteerController.updateAssignment));
volunteerRouter.delete("/:id/assignments/:memberId", isAuthenticated, isAdmin, asyncHandler(volunteerController.removeAssignment));

module.exports = { volunteerRouter };
