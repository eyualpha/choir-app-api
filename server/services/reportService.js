const User = require("../models/user.model");
const ChoirEvent = require("../models/event.model");
const Song = require("../models/song.model");
const AttendanceRecord = require("../models/attendance.model");
const Announcement = require("../models/annoucement.model");
const Resource = require("../models/resource.model");
const Notification = require("../models/notification.model");

const getDashboardSummary = async () => {
  const [
    memberCount,
    adminCount,
    upcomingEvents,
    activeSongs,
    attendanceLast30,
    unreadNotifications,
    activeAnnouncements,
    resourceCount,
  ] = await Promise.all([
    User.countDocuments({ role: "member", isActive: true }),
    User.countDocuments({ role: "admin", isActive: true }),
    ChoirEvent.countDocuments({ status: "scheduled", startAt: { $gte: new Date() } }),
    Song.countDocuments({ isActive: true }),
    AttendanceRecord.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    Notification.countDocuments({ isRead: false }),
    Announcement.countDocuments({ isActive: true }),
    Resource.countDocuments(),
  ]);

  return {
    members: { total: memberCount, admins: adminCount },
    events: { upcoming: upcomingEvents },
    library: { activeSongs, resources: resourceCount },
    engagement: {
      attendanceRecordsLast30Days: attendanceLast30,
      unreadNotifications,
      activeAnnouncements,
    },
    generatedAt: new Date().toISOString(),
  };
};

const getMemberGrowthReport = async (months = 6) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const members = await User.find({ createdAt: { $gte: since } }).select("createdAt role voicePart");
  const buckets = {};
  for (const member of members) {
    const key = `${member.createdAt.getFullYear()}-${String(member.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { month: key, total: 0, byRole: { admin: 0, member: 0 } };
    buckets[key].total += 1;
    buckets[key].byRole[member.role] = (buckets[key].byRole[member.role] || 0) + 1;
  }
  return Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month));
};

const getSongUsageReport = async () => {
  const songs = await Song.find({ isActive: true })
    .select("title category performanceCount lastPerformedAt difficulty")
    .sort({ performanceCount: -1, title: 1 });
  return {
    mostPerformed: songs.slice(0, 10),
    neverPerformed: songs.filter((song) => song.performanceCount === 0),
    byCategory: songs.reduce((acc, song) => {
      acc[song.category] = (acc[song.category] || 0) + 1;
      return acc;
    }, {}),
  };
};

const getEventCompletionReport = async (days = 180) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const events = await ChoirEvent.find({ startAt: { $gte: since } }).select(
    "title eventType status startAt endAt"
  );
  const summary = events.reduce(
    (acc, event) => {
      acc.total += 1;
      acc.byStatus[event.status] = (acc.byStatus[event.status] || 0) + 1;
      acc.byType[event.eventType] = (acc.byType[event.eventType] || 0) + 1;
      return acc;
    },
    { total: 0, byStatus: {}, byType: {} }
  );
  return { summary, events };
};

module.exports = {
  getDashboardSummary,
  getMemberGrowthReport,
  getSongUsageReport,
  getEventCompletionReport,
};
