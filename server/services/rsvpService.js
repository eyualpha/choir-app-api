const EventRsvp = require("../models/eventRsvp.model");
const ChoirEvent = require("../models/event.model");
const User = require("../models/user.model");
const { ValidationError, NotFoundError, ForbiddenError } = require("../utils/errors");

const RSVP_STATUSES = ["attending", "not_attending", "maybe"];

const submitRsvp = async ({ eventId, memberId, status, note }) => {
  if (!RSVP_STATUSES.includes(status)) {
    throw new ValidationError(`status must be one of: ${RSVP_STATUSES.join(", ")}`);
  }

  const event = await ChoirEvent.findById(eventId);
  if (!event) throw new NotFoundError("Event");
  if (event.status === "cancelled") {
    throw new ValidationError("Cannot RSVP to a cancelled event");
  }

  const member = await User.findById(memberId);
  if (!member || !member.isActive) throw new NotFoundError("Member");

  const rsvp = await EventRsvp.findOneAndUpdate(
    { event: eventId, member: memberId },
    { status, note: note || "" },
    { upsert: true, new: true, runValidators: true }
  );

  return rsvp;
};

const getEventRsvps = async (eventId) => {
  const event = await ChoirEvent.findById(eventId);
  if (!event) throw new NotFoundError("Event");

  const rsvps = await EventRsvp.find({ event: eventId })
    .populate("member", "name email voicePart")
    .sort({ updatedAt: -1 });

  const summary = RSVP_STATUSES.reduce((acc, s) => {
    acc[s] = rsvps.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return { event, rsvps, summary, total: rsvps.length };
};

const getMemberRsvps = async (memberId, limit = 20) => {
  const rsvps = await EventRsvp.find({ member: memberId })
    .populate("event", "title eventType status startAt endAt location")
    .sort({ updatedAt: -1 })
    .limit(limit);

  return { rsvps, count: rsvps.length };
};

const getMyRsvpForEvent = async (eventId, memberId) => {
  const rsvp = await EventRsvp.findOne({ event: eventId, member: memberId });
  return rsvp;
};

const deleteRsvp = async (eventId, memberId, requesterId, isAdmin) => {
  if (!isAdmin && String(memberId) !== String(requesterId)) {
    throw new ForbiddenError("You can only remove your own RSVP");
  }

  const rsvp = await EventRsvp.findOneAndDelete({ event: eventId, member: memberId });
  if (!rsvp) throw new NotFoundError("RSVP");
  return rsvp;
};

module.exports = {
  submitRsvp,
  getEventRsvps,
  getMemberRsvps,
  getMyRsvpForEvent,
  deleteRsvp,
  RSVP_STATUSES,
};
