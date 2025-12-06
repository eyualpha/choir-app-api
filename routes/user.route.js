const express = require("express");
const userRouter = express.Router();
const { getUsers, deleteUser } = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { updatePassword } = require("../controllers/auth.controller");

userRouter.get("/", isAuthenticated, getUsers);
userRouter.delete("/:id", isAuthenticated, isAdmin, deleteUser);
userRouter.post("/change-password", isAuthenticated, updatePassword);

module.exports = { userRouter };
