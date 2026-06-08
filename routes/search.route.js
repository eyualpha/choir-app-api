const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const { asyncHandler } = require("../middlewares/asyncHandler");
const searchController = require("../controllers/search.controller");

const searchRouter = express.Router();

searchRouter.get("/", isAuthenticated, asyncHandler(searchController.globalSearch));

module.exports = { searchRouter };
