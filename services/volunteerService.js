const VolunteerShift = require("../models/volunteerShift.model");
const ChoirEvent = require("../models/event.model");
const User = require("../models/user.model");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { isValidDateRange } = require("../utils/dateHelpers");
const { paginateQuery } = require("../utils/pagination");

const SHIFT_ROLES = ["usher", "sound", "projection", "greeter", "setup", "cleanup", "other"];

const validateShiftPayload = (payload, isUpdate = false) => {
  const errors = [];
  if (!isUpdate || payload.title !== undefined) {
    if (!payload.title || !String(payload.title).trim()) errors.push("title is required");
  }
  if (!isUpdate || payload.role !== undefined) {
    if (!payload.role || !SHIFT_ROLES.includes(payload.role)) {
      errors.push(`role must be one of: ${SHIFT_ROLES.join(", ")}`);
    }
  }
  if (!isUpdate || payload.startAt !== undefined || payload.endAt !== undefined) {
    if (!payload.startAt || !payload.endAt) {
      errors.push("startAt and endAt are required");
    } else if (!isValidDateRange(payload.startAt, payload.endAt)) {
      errors.push("startAt must be before endAt");
    }
  }
  if (payload.slots !== undefined && (payload.slots < 1 || payload.slots > 50)) {
    errors.push("slots must be between 1 and 50");
  }
  if (errors.length) throw new ValidationError("Invalid volunteer shift payload", errors);
};

const listShifts = async (query = {}) => {
  const filter = { isActive: true };
  if (query.role) filter.role = query.role;
  if (query.event) filter.event = query.event;
  if (query.from || query.to) {
    filter.startAt = {};
    if (query.from) filter.startAt.$gte = new Date(query.from);
    if (query.to) filter.startAt.$lte = new Date(query.to);
  }
  if (query.hasOpenSlots === "true") {
    filter.$expr = { $lt: [{ $size: "$assignedMembers" }, "$slots"] };
  }
  return paginateQuery(VolunteerShift, filter, query, { startAt: 1 });
};

const getShiftById = async (id) => {
  const shift = await VolunteerShift.findById(id)
    .populate("assignedMembers.member", "name email voicePart role")
    .populate("createdBy", "name email")
    .populate("event", "title startAt endAt location");
  if (!shift) throw new NotFoundError("Volunteer shift");
  return shift;
};

const createShift = async (payload, userId) => {
  validateShiftPayload(payload);
  if (payload.event) {
    const event = await ChoirEvent.findById(payload.event);
    if (!event) throw new NotFoundError("Event");
  }
  return VolunteerShift.create({ ...payload, createdBy: userId, assignedMembers: [] });
};

const updateShift = async (id, payload) => {
  validateShiftPayload(payload, true);
  const shift = await VolunteerShift.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!shift) throw new NotFoundError("Volunteer shift");
  return shift;
};

const deactivateShift = async (id) => {
  const shift = await VolunteerShift.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!shift) throw new NotFoundError("Volunteer shift");
  return shift;
};

const assignMember = async (shiftId, memberId, status = "pending") => {
  const shift = await VolunteerShift.findById(shiftId);
  if (!shift) throw new NotFoundError("Volunteer shift");
  const member = await User.findById(memberId);
  if (!member) throw new NotFoundError("Member");
  const confirmedCount = shift.assignedMembers.filter((e) => e.status === "confirmed").length;
  if (status === "confirmed" && confirmedCount >= shift.slots) {
    throw new ValidationError("All volunteer slots are already confirmed");
  }
  const existing = shift.assignedMembers.find((e) => String(e.member) === String(memberId));
  if (existing) {
    existing.status = status;
    existing.assignedAt = new Date();
  } else {
    shift.assignedMembers.push({ member: memberId, status, assignedAt: new Date() });
  }
  await shift.save();
  return shift.populate("assignedMembers.member", "name email voicePart");
};

const updateAssignmentStatus = async (shiftId, memberId, status) => {
  const allowed = ["confirmed", "pending", "declined"];
  if (!allowed.includes(status)) {
    throw new ValidationError(`status must be one of: ${allowed.join(", ")}`);
  }
  return assignMember(shiftId, memberId, status);
};

const removeAssignment = async (shiftId, memberId) => {
  const shift = await VolunteerShift.findById(shiftId);
  if (!shift) throw new NotFoundError("Volunteer shift");
  shift.assignedMembers = shift.assignedMembers.filter(
    (entry) => String(entry.member) !== String(memberId)
  );
  await shift.save();
  return shift;
};

const getMemberShifts = async (memberId, query = {}) => {
  const member = await User.findById(memberId);
  if (!member) throw new NotFoundError("Member");
  const filter = {
    isActive: true,
    "assignedMembers.member": memberId,
  };
  if (query.status) filter["assignedMembers.status"] = query.status;
  return paginateQuery(VolunteerShift, filter, query, { startAt: 1 });
};

const getOpenShifts = async (days = 30) => {
  const until = new Date();
  until.setDate(until.getDate() + days);
  const shifts = await VolunteerShift.find({
    isActive: true,
    startAt: { $gte: new Date(), $lte: until },
  }).sort({ startAt: 1 });
  return shifts.filter((shift) => shift.openSlots > 0);
};

const getShiftSummaryByRole = async () => {
  const shifts = await VolunteerShift.find({ isActive: true, startAt: { $gte: new Date() } });
  const summary = {};
  for (const shift of shifts) {
    if (!summary[shift.role]) {
      summary[shift.role] = { totalShifts: 0, totalSlots: 0, filledSlots: 0, openSlots: 0 };
    }
    summary[shift.role].totalShifts += 1;
    summary[shift.role].totalSlots += shift.slots;
    summary[shift.role].filledSlots += shift.filledSlots;
    summary[shift.role].openSlots += shift.openSlots;
  }
  return summary;
};

module.exports = {
  listShifts,
  getShiftById,
  createShift,
  updateShift,
  deactivateShift,
  assignMember,
  updateAssignmentStatus,
  removeAssignment,
  getMemberShifts,
  getOpenShifts,
  getShiftSummaryByRole,
};
