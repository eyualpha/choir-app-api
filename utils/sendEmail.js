const transporter = require("../config/nodemailer");
const {
  sendTemporaryPasswordEmail,
  AssignmentEmail,
  PasswordResetOtpEmail,
} = require("./emailTemplate");
require("dotenv").config();

const resolveEmailArgs = (emailOrOptions, subject, text) => {
  if (typeof emailOrOptions === "object" && emailOrOptions !== null) {
    return {
      email: emailOrOptions.to,
      subject: emailOrOptions.subject,
      text: emailOrOptions.text,
    };
  }
  return { email: emailOrOptions, subject, text };
};

const sendEmail = async (emailOrOptions, subject, text) => {
  const { email, subject: subj, text: body } = resolveEmailArgs(emailOrOptions, subject, text);
  const htmlContent = sendTemporaryPasswordEmail(subj, body);
  const mailOptions = {
    from: '"HarmoniQ" <' + process.env.EMAIL_USER + ">",
    to: email,
    subject: subj,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

const sendResetOtpEmail = async (email, otp) => {
  const htmlContent = PasswordResetOtpEmail(otp);
  const mailOptions = {
    from: '"HarmoniQ" <' + process.env.EMAIL_USER + ">",
    to: email,
    subject: "Your password reset code",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

const sendAssignmentEmail = async (email, username, assignmentType) => {
  const htmlContent = AssignmentEmail(username, assignmentType);
  const mailOptions = {
    from: '"HarmoniQ" <' + process.env.EMAIL_USER + ">",
    to: email,
    subject: "Your Fellowship Service Assignment",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

module.exports = { sendEmail, sendAssignmentEmail, sendResetOtpEmail };
