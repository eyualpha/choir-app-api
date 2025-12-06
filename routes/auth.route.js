const express = require("express");
const { registerUser, login } = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", login);

module.exports = { authRouter };
