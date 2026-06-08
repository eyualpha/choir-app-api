const PracticeLog = require("../models/practiceLog.model");
const Song = require("../models/song.model");
const User = require("../models/user.model");
const ChoirEvent = require("../models/event.model");
const { ValidationError, NotFoundError, ForbiddenError } = require("../utils/errors");
const { paginateQuery } = require("../utils/pagination");
const { toStartOfDay, toEndOfDay } = require("../utils/dateHelpers");

const FOCUS_AREAS = ["pitch", "rhythm", "dynamics", "memorization", "blend", "general"];

const validatePracticePayload = (payload) => {
  const errors = [];
  if (!payload.durationMinutes || payload.durationMinutes < 5 || payload.durationMinutes > 480) {
    errors.push("durationMinutes must be between 5 and 480");
  }
  if (payload.focusArea && !FOCUS_AREAS.includes(payload.focusArea)) {
    errors.push(`focusArea must be one of: ${FOCUS_AREAS.join(", ")}`);
  }
  if (payload.selfRating !== undefined && (payload.selfRating < 1 || payload.selfRating > 5)) {
    errors.push("selfRating must be between 1 and 5");
  }
  if (errors.length) throw new ValidationError("Invalid practice log payload", errors);
};

const listPracticeLogs = async (query = {}, requester) => {
  const filter = {};
  if (query.memberId) {
    if (requester.role !== "admin" && String(requester.id) !== String(query.memberId)) {
      throw new ForbiddenError("You can only view your own practice logs");
    }
    filter.member = query.memberId;
  } else if (requester.role !== "admin") {
    filter.member = requester.id;
  }
  if (query.song) filter.song = query.song;
  if (query.focusArea) filter.focusArea = query.focusArea;
  if (query.sharedOnly === "true") filter.sharedWithDirector = true;
  if (query.from || query.to) {
    filter.practicedAt = {};
    if (query.from) filter.practicedAt.$gte = toStartOfDay(query.from);
    if (query.to) filter.practicedAt.$lte = toEndOfDay(query.to);
  }
  return paginateQuery(PracticeLog, filter, query, { practicedAt: -1 });
};

const getPracticeLogById = async (id, requester) => {
  const log = await PracticeLog.findById(id)
    .populate("member", "name email voicePart")
    .populate("song", "title composer keySignature")
    .populate("event", "title startAt");
  if (!log) throw new NotFoundError("Practice log");
  if (
    requester.role !== "admin" &&
    String(log.member._id || log.member) !== String(requester.id)
  ) {
    throw new ForbiddenError("You can only view your own practice logs");
  }
  return log;
};

const createPracticeLog = async (payload, memberId) => {
  validatePracticePayload(payload);
  const member = await User.findById(memberId);
  if (!member) throw new NotFoundError("Member");
  if (payload.song) {
    const song = await Song.findById(payload.song);
    if (!song) throw new NotFoundError("Song");
  }
  if (payload.event) {
    const event = await ChoirEvent.findById(payload.event);
    if (!event) throw new NotFoundError("Event");
  }
  return PracticeLog.create({
    ...payload,
    member: memberId,
    voicePart: payload.voicePart || member.voicePart,
  });
};

const updatePracticeLog = async (id, payload, requester) => {
  validatePracticePayload({ ...payload, durationMinutes: payload.durationMinutes || 30 });
  const log = await PracticeLog.findById(id);
  if (!log) throw new NotFoundError("Practice log");
  if (requester.role !== "admin" && String(log.member) !== String(requester.id)) {
    throw new ForbiddenError("You can only update your own practice logs");
  }
  Object.assign(log, payload);
  await log.save();
  return log;
};

const deletePracticeLog = async (id, requester) => {
  const log = await PracticeLog.findById(id);
  if (!log) throw new NotFoundError("Practice log");
  if (requester.role !== "admin" && String(log.member) !== String(requester.id)) {
    throw new ForbiddenError("You can only delete your own practice logs");
  }
  await log.deleteOne();
  return { deleted: true };
};

const shareWithDirector = async (id, requester) => {
  const log = await PracticeLog.findById(id);
  if (!log) throw new NotFoundError("Practice log");
  if (String(log.member) !== String(requester.id)) {
    throw new ForbiddenError("You can only share your own practice logs");
  }
  log.sharedWithDirector = true;
  await log.save();
  return log;
};

const getMemberPracticeStats = async (memberId, days = 90) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await PracticeLog.find({
    member: memberId,
    practicedAt: { $gte: since },
  });
  const totalMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const byFocus = logs.reduce((acc, log) => {
    acc[log.focusArea] = (acc[log.focusArea] || 0) + 1;
    return acc;
  }, {});
  const avgRating =
    logs.length > 0
      ? logs.reduce((sum, log) => sum + (log.selfRating || 0), 0) / logs.length
      : 0;
  return {
    memberId,
    periodDays: days,
    sessionCount: logs.length,
    totalMinutes,
    averageSessionMinutes: logs.length ? Math.round(totalMinutes / logs.length) : 0,
    averageSelfRating: Number(avgRating.toFixed(2)),
    byFocusArea: byFocus,
  };
};

const getDirectorPracticeFeed = async (query = {}) => {
  const filter = { sharedWithDirector: true };
  if (query.from || query.to) {
    filter.practicedAt = {};
    if (query.from) filter.practicedAt.$gte = toStartOfDay(query.from);
    if (query.to) filter.practicedAt.$lte = toEndOfDay(query.to);
  }
  return paginateQuery(PracticeLog, filter, query, { practicedAt: -1 });
};

const getSongPracticeHeatmap = async (songId, days = 60) => {
  const song = await Song.findById(songId);
  if (!song) throw new NotFoundError("Song");
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await PracticeLog.find({ song: songId, practicedAt: { $gte: since } });
  const byDay = {};
  for (const log of logs) {
    const key = log.practicedAt.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + log.durationMinutes;
  }
  return { songId, songTitle: song.title, periodDays: days, minutesByDay: byDay };
};

module.exports = {
  listPracticeLogs,
  getPracticeLogById,
  createPracticeLog,
  updatePracticeLog,
  deletePracticeLog,
  shareWithDirector,
  getMemberPracticeStats,
  getDirectorPracticeFeed,
  getSongPracticeHeatmap,
};
