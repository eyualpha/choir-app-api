const User = require("../models/user.model");
const ChoirEvent = require("../models/event.model");
const Song = require("../models/song.model");
const AttendanceRecord = require("../models/attendance.model");
const Setlist = require("../models/setlist.model");
const PracticeLog = require("../models/practiceLog.model");
const { ValidationError } = require("../utils/errors");
const { formatDateLabel } = require("../utils/dateHelpers");

const toCsvRow = (values) =>
  values
    .map((value) => {
      const text = value === null || value === undefined ? "" : String(value);
      if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    })
    .join(",");

const exportMembersCsv = async () => {
  const members = await User.find({ role: "member", isActive: true }).select(
    "name email voicePart subTeam createdAt"
  );
  const header = ["name", "email", "voicePart", "subTeam", "joinedAt"];
  const rows = members.map((member) =>
    toCsvRow([
      member.name,
      member.email,
      member.voicePart,
      member.subTeam || "",
      member.createdAt?.toISOString() || "",
    ])
  );
  return [toCsvRow(header), ...rows].join("\n");
};

const exportEventsCsv = async (from, to) => {
  const filter = {};
  if (from || to) {
    filter.startAt = {};
    if (from) filter.startAt.$gte = new Date(from);
    if (to) filter.startAt.$lte = new Date(to);
  }
  const events = await ChoirEvent.find(filter)
    .populate("createdBy", "name email")
    .sort({ startAt: 1 });
  const header = [
    "title",
    "eventType",
    "status",
    "startAt",
    "endAt",
    "location",
    "createdBy",
  ];
  const rows = events.map((event) =>
    toCsvRow([
      event.title,
      event.eventType,
      event.status,
      event.startAt?.toISOString(),
      event.endAt?.toISOString(),
      event.location,
      event.createdBy?.name || "",
    ])
  );
  return [toCsvRow(header), ...rows].join("\n");
};

const exportAttendanceCsv = async (eventId) => {
  if (!eventId) throw new ValidationError("eventId is required");
  const records = await AttendanceRecord.find({ event: eventId })
    .populate("member", "name email voicePart")
    .populate("checkedInBy", "name");
  const header = ["memberName", "email", "voicePart", "status", "checkedInAt", "checkedInBy"];
  const rows = records.map((record) =>
    toCsvRow([
      record.member?.name,
      record.member?.email,
      record.member?.voicePart,
      record.status,
      record.checkedInAt?.toISOString(),
      record.checkedInBy?.name || "",
    ])
  );
  return [toCsvRow(header), ...rows].join("\n");
};

const exportSongCatalogCsv = async () => {
  const songs = await Song.find({ isActive: true }).sort({ title: 1 });
  const header = [
    "title",
    "composer",
    "category",
    "difficulty",
    "keySignature",
    "performanceCount",
    "lastPerformedAt",
    "tags",
  ];
  const rows = songs.map((song) =>
    toCsvRow([
      song.title,
      song.composer,
      song.category,
      song.difficulty,
      song.keySignature,
      song.performanceCount,
      song.lastPerformedAt?.toISOString() || "",
      (song.tags || []).join(";"),
    ])
  );
  return [toCsvRow(header), ...rows].join("\n");
};

const exportSetlistPdfData = async (setlistId) => {
  const setlist = await Setlist.findById(setlistId)
    .populate("items.song", "title composer keySignature tempo")
    .populate("event", "title startAt location");
  if (!setlist) throw new ValidationError("Setlist not found");
  return {
    title: setlist.title,
    event: setlist.event
      ? {
          title: setlist.event.title,
          date: formatDateLabel(setlist.event.startAt),
          location: setlist.event.location,
        }
      : null,
    totalMinutes: setlist.totalEstimatedMinutes,
    items: setlist.items.map((item, index) => ({
      order: index + 1,
      title: item.song?.title,
      composer: item.song?.composer,
      key: item.keyOverride || item.song?.keySignature,
      notes: item.notes,
      soloist: item.soloist,
    })),
    generatedAt: new Date().toISOString(),
  };
};

const exportPracticeSummaryJson = async (memberId, days = 90) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await PracticeLog.find({
    member: memberId,
    practicedAt: { $gte: since },
  }).populate("song", "title");
  return {
    memberId,
    periodDays: days,
    sessions: logs.map((log) => ({
      practicedAt: log.practicedAt,
      durationMinutes: log.durationMinutes,
      focusArea: log.focusArea,
      song: log.song?.title,
      selfRating: log.selfRating,
    })),
    totals: {
      sessions: logs.length,
      minutes: logs.reduce((sum, log) => sum + log.durationMinutes, 0),
    },
  };
};

module.exports = {
  exportMembersCsv,
  exportEventsCsv,
  exportAttendanceCsv,
  exportSongCatalogCsv,
  exportSetlistPdfData,
  exportPracticeSummaryJson,
};
