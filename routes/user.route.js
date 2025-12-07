const express = require("express");
const userRouter = express.Router();
const {
  getUsers,
  deleteUser,
  updateProfilePhoto,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const { updatePassword } = require("../controllers/auth.controller");
const upload = require("../middlewares/upload");

userRouter.get("/", isAuthenticated, getUsers);
userRouter.delete("/:id", isAuthenticated, isAdmin, deleteUser);
userRouter.post("/change-password", isAuthenticated, updatePassword);
userRouter.post(
  "/profile/photo",
  isAuthenticated,
  upload.any(), // accept any single file field to avoid Unexpected field errors
  updateProfilePhoto
);

module.exports = { userRouter };
