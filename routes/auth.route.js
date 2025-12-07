const express = require("express");
const {
  registerUser,
  login,
  requestPasswordReset,
  verifyResetOtp,
  setNewPassword,
} = require("../controllers/auth.controller");
const { isAdmin } = require("../controllers/isAdmin.controller");

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", login);
authRouter.post("/reset-password", requestPasswordReset);
authRouter.post("/reset-password/verify", verifyResetOtp);
authRouter.post("/reset-password/set", setNewPassword);

module.exports = { authRouter };
