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
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "file", maxCount: 1 }, // fallback field name some clients use
  ]),
  updateProfilePhoto
);

module.exports = { userRouter };
