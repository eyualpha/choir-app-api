const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.resetOtp;
  delete obj.resetOtpExpires;
  return obj;
};

module.exports = { sanitizeUser };
