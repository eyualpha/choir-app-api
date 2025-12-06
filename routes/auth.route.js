const express = require("express");
const { registerUser, login } = require("../controllers/auth.controller");
const { isAdmin } = require("../controllers/isAdmin.controller");

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", login);

module.exports = { authRouter };
