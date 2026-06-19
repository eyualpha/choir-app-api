const User = require("../models/user.model");
const AttendanceRecord = require("../models/attendance.model");
const PracticeLog = require("../models/practiceLog.model");
const Notification = require("../models/notification.model");
const Assignment = require("../models/assignment.model");
const ChoirEvent = require("../models/event.model");
const { paginateQuery } = require("../utils/pagination");
const { NotFoundError } = require("../utils/errors");

const SCORE_WEIGHTS = {
  attendance: 0.4,
  practice: 0.3,
  assignments: 0.2,
  notifications: 0.1,
};

const computeAttendanceScore = async (memberId, days = 90) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const events = await ChoirEvent.countDocuments({ startAt: { $gte: since }, status: { $ne: "cancelled" } });
  if (!events) return 0;
  const attended = await AttendanceRecord.countDocuments({
    member: memberId,
    status: { $in: ["present", "late"] },
    checkedInAt: { $gte: since },
  });
  return Math.min(attended / events, 1);
};

const computePracticeScore = async (memberId, days = 90) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await PracticeLog.find({ member: memberId, practicedAt: { $gte: since } });
  if (!logs.length) return 0;
  const totalMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const targetMinutes = days * 10;
  return Math.min(totalMinutes / targetMinutes, 1);
};

const computeAssignmentScore = async (memberId) => {
  const assignment = await Assignment.findOne();
  if (!assignment) return 1;
  const categories = ["leadSingers", "backupSingers", "prayerTeam"];
  const isAssigned = categories.some((category) =>
    assignment[category].some((id) => String(id) === String(memberId))
  );
  return isAssigned ? 1 : 0.5;
};

const computeNotificationScore = async (memberId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const total = await Notification.countDocuments({ recipient: memberId, createdAt: { $gte: since } });
  if (!total) return 1;
  const read = await Notification.countDocuments({
    recipient: memberId,
    createdAt: { $gte: since },
    isRead: true,
  });
  return read / total;
};

const getMemberEngagementScore = async (memberId, days = 90) => {
  const member = await User.findById(memberId);
  if (!member) throw new NotFoundError("Member");
  const [attendance, practice, assignments, notifications] = await Promise.all([
    computeAttendanceScore(memberId, days),
    computePracticeScore(memberId, days),
    computeAssignmentScore(memberId, days),
    computeNotificationScore(memberId, 30),
  ]);
  const composite =
    attendance * SCORE_WEIGHTS.attendance +
    practice * SCORE_WEIGHTS.practice +
    assignments * SCORE_WEIGHTS.assignments +
    notifications * SCORE_WEIGHTS.notifications;
  return {
    memberId,
    memberName: member.name,
    periodDays: days,
    scores: {
      attendance: Number(attendance.toFixed(2)),
      practice: Number(practice.toFixed(2)),
      assignments: Number(assignments.toFixed(2)),
      notifications: Number(notifications.toFixed(2)),
    },
    composite: Number(composite.toFixed(2)),
    tier: composite >= 0.75 ? "high" : composite >= 0.45 ? "medium" : "low",
  };
};

const getEngagementLeaderboard = async (days = 90, limit = 20) => {
  const members = await User.find({ role: "member", isActive: true }).select("name email voicePart");
  const scores = [];
  for (const member of members) {
    const engagement = await getMemberEngagementScore(member._id, days);
    scores.push(engagement);
  }
  return scores.sort((a, b) => b.composite - a.composite).slice(0, limit);
};

const getAtRiskMembers = async (days = 60, threshold = 0.35) => {
  const members = await User.find({ role: "member", isActive: true });
  const atRisk = [];
  for (const member of members) {
    const engagement = await getMemberEngagementScore(member._id, days);
    if (engagement.composite < threshold) atRisk.push(engagement);
  }
  return atRisk.sort((a, b) => a.composite - b.composite);
};

const listMemberEngagement = async (query = {}) => {
  const filter = { role: "member", isActive: true };
  if (query.voicePart) filter.voicePart = query.voicePart;
  const result = await paginateQuery(User, filter, query, { name: 1 });
  const enriched = [];
  for (const member of result.items) {
    const engagement = await getMemberEngagementScore(member._id, Number(query.days) || 90);
    enriched.push({ member, engagement });
  }
  return { items: enriched, meta: result.meta };
};

module.exports = {
  getMemberEngagementScore,
  getEngagementLeaderboard,
  getAtRiskMembers,
  listMemberEngagement,
  SCORE_WEIGHTS,
};
