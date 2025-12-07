const transporter = require("../config/nodemailer");
const {
  sendTemporaryPasswordEmail,
  AssignmentEmail,
} = require("./emailTemplate");
require("dotenv").config();

const sendEmail = async (email, subject, text) => {
  const htmlContent = sendTemporaryPasswordEmail(subject, text);
  const mailOptions = {
    from: '"Choir Support" <' + process.env.EMAIL_USER + ">",
    to: email,
    subject: subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP email sent to ${email}`);

  return true;
};

const sendAssignmentEmail = async (email, username, assignmentType) => {
  console.log(email, username, assignmentType);
  const htmlContent = AssignmentEmail(username, assignmentType);
  const mailOptions = {
    from: '"Choir Support" <' + process.env.EMAIL_USER + ">",
    to: email,
    subject: "Your Fellowship Service Assignment",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Assignment email sent to ${email}`);

  return true;
};
module.exports = { sendEmail, sendAssignmentEmail };
