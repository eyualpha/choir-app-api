const express = require("express");
const userRouter = express.Router();
const { getUsers } = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");

userRouter.get("/", isAuthenticated, isAdmin, getUsers);

module.exports = { userRouter };
