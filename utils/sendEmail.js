const transporter = require("../config/nodemailer");
const { sendTemporaryPasswordEmail } = require("./emailTemplate");
require("dotenv").config();

const sendEmail = async (email, subject, text) => {
  console.log(email, subject, text);
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
module.exports = sendEmail;
