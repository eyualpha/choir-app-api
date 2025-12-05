const emailTemplate = (subject, text) => {
  return `
  <div style="font-family:sans-serif; padding:20px;">
    <h2 style="color:#2d6cdf;">${subject}</h2>
    <p>${text}</p>
  </div>
    `;
};

module.exports = { emailTemplate };
