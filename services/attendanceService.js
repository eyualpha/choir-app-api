const AttendanceRecord = require("../models/attendance.model");
const ChoirEvent = require("../models/event.model");
const User = require("../models/user.model");
const { ValidationError, NotFoundError } = require("../utils/errors");

const ATTENDANCE_STATUSES = ["present", "late", "excused", "absent"];

const ensureEventExists = async (eventId) => {
  const event = await ChoirEvent.findById(eventId);
  if (!event) throw new NotFoundError("Event");
  return event;
};

const markAttendance = async ({ eventId, memberId, status, notes, checkedInBy }) => {
  if (!ATTENDANCE_STATUSES.includes(status)) {
    throw new ValidationError(`status must be one of: ${ATTENDANCE_STATUSES.join(", ")}`);
  }
  await ensureEventExists(eventId);
  const member = await User.findById(memberId);
  if (!member) throw new NotFoundError("Member");

  const record = await AttendanceRecord.findOneAndUpdate(
    { event: eventId, member: memberId },
    {
      status,
      notes: notes || "",
      checkedInBy,
      checkedInAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("member", "name email voicePart role");

  return record;
};

const bulkMarkAttendance = async (eventId, entries, checkedInBy) => {
  if (!Array.isArray(entries) || !entries.length) {
    throw new ValidationError("entries array is required");
  }
  await ensureEventExists(eventId);
  const results = [];
  for (const entry of entries) {
    const record = await markAttendance({
      eventId,
      memberId: entry.memberId,
      status: entry.status || "present",
      notes: entry.notes,
      checkedInBy,
    });
    results.push(record);
  }
  return results;
};

const getAttendanceForEvent = async (eventId) => {
  await ensureEventExists(eventId);
  const records = await AttendanceRecord.find({ event: eventId })
    .populate("member", "name email voicePart subTeam")
    .populate("checkedInBy", "name email")
    .sort({ checkedInAt: -1 });
  const summary = ATTENDANCE_STATUSES.reduce((acc, status) => {
    acc[status] = records.filter((r) => r.status === status).length;
    return acc;
  }, {});
  return { records, summary, total: records.length };
};

const getMemberAttendanceHistory = async (memberId, limit = 20) => {
  const member = await User.findById(memberId);
  if (!member) throw new NotFoundError("Member");
  const records = await AttendanceRecord.find({ member: memberId })
    .populate("event", "title startAt eventType status")
    .sort({ createdAt: -1 })
    .limit(limit);
  const summary = ATTENDANCE_STATUSES.reduce((acc, status) => {
    acc[status] = records.filter((r) => r.status === status).length;
    return acc;
  }, {});
  return { member: { id: member._id, name: member.name, email: member.email }, records, summary };
};

const getAttendanceRateByVoicePart = async (days = 90) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const records = await AttendanceRecord.find({ createdAt: { $gte: since } }).populate(
    "member",
    "voicePart"
  );
  const grouped = {};
  for (const record of records) {
    const part = record.member?.voicePart || "Other";
    if (!grouped[part]) grouped[part] = { present: 0, total: 0 };
    grouped[part].total += 1;
    if (record.status === "present" || record.status === "late") grouped[part].present += 1;
  }
  return Object.entries(grouped).map(([voicePart, stats]) => ({
    voicePart,
    attendanceRate: stats.total ? Number(((stats.present / stats.total) * 100).toFixed(1)) : 0,
    totalRecords: stats.total,
  }));
};

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceForEvent,
  getMemberAttendanceHistory,
  getAttendanceRateByVoicePart,
};
