const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { asyncHandler } = require("../middlewares/asyncHandler");
const calendarController = require("../controllers/calendar.controller");

const calendarRouter = express.Router();

calendarRouter.get("/", isAuthenticated, asyncHandler(calendarController.unifiedCalendar));
calendarRouter.get("/day/:date", isAuthenticated, asyncHandler(calendarController.dayAgenda));
calendarRouter.get("/week", isAuthenticated, asyncHandler(calendarController.weekOverview));
calendarRouter.get("/month/:year/:month", isAuthenticated, isAdmin, asyncHandler(calendarController.monthDensity));

module.exports = { calendarRouter };
