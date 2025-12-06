const express = require("express");
const userRouter = express.Router();
const { getUsers, deleteUser } = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");

userRouter.get("/", isAuthenticated, getUsers);
userRouter.delete("/:id", isAuthenticated, deleteUser);

module.exports = { userRouter };
