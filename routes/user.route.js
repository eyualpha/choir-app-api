const express = require("express");
const userRouter = express.Router();
const {
  getUsers,
  deleteUser,
  updateProfilePhoto,
  updateSubTeam,
  updateProfile,
  setActiveStatus,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { updatePassword } = require("../controllers/auth.controller");
const upload = require("../middlewares/upload");

userRouter.get("/", isAuthenticated, getUsers);
userRouter.delete("/:id", isAuthenticated, isAdmin, deleteUser);
userRouter.post("/change-password", isAuthenticated, updatePassword);
userRouter.patch("/:id/subteam", isAuthenticated, isAdmin, updateSubTeam);
userRouter.patch("/:id/profile", isAuthenticated, updateProfile);
userRouter.patch("/:id/status", isAuthenticated, isAdmin, setActiveStatus);
userRouter.post(
  "/profile/photo",
  isAuthenticated,
  upload.any(),
  updateProfilePhoto
);

module.exports = { userRouter };
