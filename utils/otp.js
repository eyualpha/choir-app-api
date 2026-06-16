const bcrypt = require("bcrypt");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const hashOtp = async (otp) => bcrypt.hash(otp, 10);

const verifyOtp = async (otp, hash) => {
  if (!otp || !hash) return false;
  return bcrypt.compare(otp, hash);
};

module.exports = { generateOtp, hashOtp, verifyOtp };
