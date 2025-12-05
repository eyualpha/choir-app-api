const transporter = require("../config/nodemailer");
require("dotenv").config();

const emailTemplate = (subject, text) =>
  `
  <div style="font-family:sans-serif; padding:20px;">
    <h2 style="color:#2d6cdf;">${subject}</h2>
    <p>${text}</p>
  </div>
    `;

const sendEmail = async (email, subject, text) => {
  console.log(email, subject, text);
  const mailOptions = {
    from: '"Choir Support" <' + process.env.EMAIL_USER + ">",
    to: email,
    subject: subject,
    html: emailTemplate(subject, text),
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP email sent to ${email}`);

  return true;
};
module.exports = sendEmail;
