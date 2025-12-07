const sendTemporaryPasswordEmail = (subject, password) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
      body {
        font-family: 'Helvetica', Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        padding: 20px;
        background-color: #1a73e8; /* Added background for title */
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        font-size: 16px;
        color: #333333;
        line-height: 1.6;
      }
      .password-box {
        background-color: #f1c40f; /* Highlight password with background color */
        padding: 15px;
        text-align: center;
        font-size: 20px;
        font-weight: bold; /* Bold text */
        color: #000000;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #888888;
        padding: 20px;
        border-top: 1px solid #e4e4e4;
      }
      @media screen and (max-width: 600px) {
        .container {
          width: 90%;
        }
        .password-box {
          font-size: 18px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>ASTUECSF CHOIR</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>You requested a temporary password to access your ASTUECSF CHOIR account.</p>
        <div class="password-box"><h1>${password}</h1></div>
        <p>Please use this password to log in and make sure to change it immediately after logging in for security reasons.</p>
        <p>Here is your link to login:</p>
        <p><a href="https://choir-app-front.vercel.app/login">login</a></p>
        <p>Welcome to ASTUECSF CHOIR! 🎶</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ASTUECSF CHOIR. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

const AssignmentEmail = (userName, assignmentType) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Fellowship Service Assignment</title>
    <style>
      body {
        font-family: 'Helvetica', Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        padding: 20px;
        background-color: #1a73e8;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        font-size: 16px;
        color: #333333;
        line-height: 1.6;
      }
      .assignment-box {
        background-color: #f1c40f; /* highlight role */
        padding: 15px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        color: #000000;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #888888;
        padding: 20px;
        border-top: 1px solid #e4e4e4;
      }
      @media screen and (max-width: 600px) {
        .container {
          width: 90%;
        }
        .assignment-box {
          font-size: 18px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>ASTUECSF CHOIR</h1>
      </div>
      <div class="content">
        <p>Hello ${userName},</p>
        <p>We are excited to inform you that you have been assigned a role in the choir.</p>
        <div class="assignment-box">${assignmentType}</div>
        <p>This assignment will also be displayed as a banner on your profile for everyone to see. Thank you for your participation and dedication!</p>
        <p>Keep shining and making beautiful music! 🎶</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ASTUECSF CHOIR. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

const PasswordResetOtpEmail = (otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Code</title>
    <style>
      body {
        font-family: 'Helvetica', Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        padding: 20px;
        background-color: #1a73e8;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        font-size: 16px;
        color: #333333;
        line-height: 1.6;
      }
      .otp-box {
        background-color: #f1c40f;
        padding: 15px;
        text-align: center;
        font-size: 26px;
        font-weight: bold;
        color: #000000;
        border-radius: 5px;
        letter-spacing: 4px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #888888;
        padding: 20px;
        border-top: 1px solid #e4e4e4;
      }
      @media screen and (max-width: 600px) {
        .container {
          width: 90%;
        }
        .otp-box {
          font-size: 22px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>ASTUECSF CHOIR</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset the password for your account. Use the code below to continue.</p>
        <div class="otp-box">${otp}</div>
        <p>This code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ASTUECSF CHOIR. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = {
  sendTemporaryPasswordEmail,
  AssignmentEmail,
  PasswordResetOtpEmail,
};
