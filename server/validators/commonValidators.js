const mongoose = require("mongoose");
const { ValidationError } = require("../utils/errors");

const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });
  if (missing.length) {
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
  }
};

const requireObjectId = (value, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ValidationError(`Invalid ${label}`);
  }
};

const requireEnum = (value, allowed, label) => {
  if (value !== undefined && !allowed.includes(value)) {
    throw new ValidationError(`${label} must be one of: ${allowed.join(", ")}`);
  }
};

const requirePositiveInt = (value, label, { min = 1, max = 1000 } = {}) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new ValidationError(`${label} must be an integer between ${min} and ${max}`);
  }
  return parsed;
};

const sanitizeString = (value, maxLength = 500) => {
  if (value === undefined || value === null) return "";
  const text = String(value).trim();
  if (text.length > maxLength) {
    throw new ValidationError(`Text exceeds maximum length of ${maxLength}`);
  }
  return text;
};

const parseBooleanQuery = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return value === "true" || value === true;
};

const parseDateQuery = (value, label) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`Invalid ${label} date`);
  }
  return date;
};

const parseCommaList = (value) => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

module.exports = {
  requireFields,
  requireObjectId,
  requireEnum,
  requirePositiveInt,
  sanitizeString,
  parseBooleanQuery,
  parseDateQuery,
  parseCommaList,
};
