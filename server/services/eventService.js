const ChoirEvent = require("../models/event.model");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { isValidDateRange, overlaps } = require("../utils/dateHelpers");
const { paginateQuery } = require("../utils/pagination");

const EVENT_TYPES = ["rehearsal", "performance", "meeting", "outreach", "recording"];
const EVENT_STATUSES = ["scheduled", "completed", "cancelled"];

const validateEventPayload = (payload, isUpdate = false) => {
  const errors = [];
  if (!isUpdate || payload.title !== undefined) {
    if (!payload.title || !String(payload.title).trim()) errors.push("title is required");
  }
  if (!isUpdate || payload.startAt !== undefined || payload.endAt !== undefined) {
    if (!payload.startAt || !payload.endAt) {
      errors.push("startAt and endAt are required");
    } else if (!isValidDateRange(payload.startAt, payload.endAt)) {
      errors.push("startAt must be before endAt");
    }
  }
  if (payload.eventType && !EVENT_TYPES.includes(payload.eventType)) {
    errors.push(`eventType must be one of: ${EVENT_TYPES.join(", ")}`);
  }
  if (payload.status && !EVENT_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${EVENT_STATUSES.join(", ")}`);
  }
  if (errors.length) throw new ValidationError("Invalid event payload", errors);
};

const listEvents = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.eventType) filter.eventType = query.eventType;
  if (query.from || query.to) {
    filter.startAt = {};
    if (query.from) filter.startAt.$gte = new Date(query.from);
    if (query.to) filter.startAt.$lte = new Date(query.to);
  }
  const result = await paginateQuery(ChoirEvent, filter, query, { startAt: 1 });
  return result;
};

const getEventById = async (id) => {
  const event = await ChoirEvent.findById(id).populate("createdBy", "name email role");
  if (!event) throw new NotFoundError("Event");
  return event;
};

const createEvent = async (payload, userId) => {
  validateEventPayload(payload);
  const conflicting = await ChoirEvent.findOne({
    status: "scheduled",
    $or: [
      {
        startAt: { $lte: new Date(payload.endAt) },
        endAt: { $gte: new Date(payload.startAt) },
      },
    ],
    eventType: payload.eventType || "rehearsal",
  });
  if (conflicting && payload.eventType === "rehearsal") {
    throw new ValidationError("Another rehearsal is already scheduled in this time window");
  }
  return ChoirEvent.create({ ...payload, createdBy: userId });
};

const updateEvent = async (id, payload) => {
  validateEventPayload(payload, true);
  const event = await ChoirEvent.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!event) throw new NotFoundError("Event");
  return event;
};

const cancelEvent = async (id, reason = "") => {
  const event = await ChoirEvent.findById(id);
  if (!event) throw new NotFoundError("Event");
  event.status = "cancelled";
  if (reason) event.notes = `${event.notes}\nCancelled: ${reason}`.trim();
  await event.save();
  return event;
};

const completeEvent = async (id) => {
  const event = await ChoirEvent.findById(id);
  if (!event) throw new NotFoundError("Event");
  event.status = "completed";
  await event.save();
  return event;
};

const getUpcomingEvents = async (days = 14) => {
  const now = new Date();
  const until = new Date();
  until.setDate(until.getDate() + days);
  return ChoirEvent.find({
    status: "scheduled",
    startAt: { $gte: now, $lte: until },
  })
    .sort({ startAt: 1 })
    .populate("createdBy", "name email");
};

const checkScheduleConflict = async (startAt, endAt, excludeId = null) => {
  const filter = {
    status: "scheduled",
    startAt: { $lt: new Date(endAt) },
    endAt: { $gt: new Date(startAt) },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  const conflicts = await ChoirEvent.find(filter).select("title startAt endAt eventType");
  return conflicts.map((event) => ({
    id: event._id,
    title: event.title,
    overlaps: overlaps(startAt, endAt, event.startAt, event.endAt),
    eventType: event.eventType,
  }));
};

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  completeEvent,
  getUpcomingEvents,
  checkScheduleConflict,
};
