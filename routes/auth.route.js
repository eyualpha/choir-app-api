const express = require("express");
const {
  registerUser,
  login,
  requestPasswordReset,
  verifyResetOtp,
  setNewPassword,
} = require("../controllers/auth.controller");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");
const { authLimiter, otpLimiter } = require("../middlewares/rateLimiter");

const authRouter = express.Router();

authRouter.post("/register", isAuthenticated, isAdmin, registerUser);
authRouter.post("/login", authLimiter, login);
authRouter.post("/reset-password", otpLimiter, requestPasswordReset);
authRouter.post("/reset-password/verify", otpLimiter, verifyResetOtp);
authRouter.post("/reset-password/set", otpLimiter, setNewPassword);

module.exports = { authRouter };
