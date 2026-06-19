const toStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toEndOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const isValidDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate <= endDate;
};

const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
};

const formatDateLabel = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const overlaps = (aStart, aEnd, bStart, bEnd) => {
  const startA = new Date(aStart);
  const endA = new Date(aEnd);
  const startB = new Date(bStart);
  const endB = new Date(bEnd);
  return startA <= endB && startB <= endA;
};

module.exports = {
  toStartOfDay,
  toEndOfDay,
  isValidDateRange,
  addDays,
  formatDateLabel,
  overlaps,
};
