const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const safeRegex = (value, flags = "i") => new RegExp(escapeRegex(value), flags);

module.exports = { escapeRegex, safeRegex };
