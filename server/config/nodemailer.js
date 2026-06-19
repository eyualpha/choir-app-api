const nodemailer = require("nodemailer");
require("dotenv").config();

const emailPass = (process.env.EMAIL_PASS || "").replace(/\s/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPass,
  },
});
module.exports = transporter;
