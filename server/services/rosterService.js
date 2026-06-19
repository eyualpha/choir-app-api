const MemberProfile = require("../models/memberProfile.model");
const User = require("../models/user.model");
const AttendanceRecord = require("../models/attendance.model");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { paginateQuery } = require("../utils/pagination");
const { safeRegex } = require("../utils/sanitize");

const EXPERIENCE_LEVELS = ["new", "developing", "experienced", "veteran"];
const VOICE_PARTS = ["Soprano", "Alto", "Tenor", "Bass", "Other"];

const validateProfilePayload = (payload) => {
  const errors = [];
  if (payload.experienceLevel && !EXPERIENCE_LEVELS.includes(payload.experienceLevel)) {
    errors.push(`experienceLevel must be one of: ${EXPERIENCE_LEVELS.join(", ")}`);
  }
  if (payload.secondaryVoicePart && !["", ...VOICE_PARTS].includes(payload.secondaryVoicePart)) {
    errors.push(`secondaryVoicePart must be one of: ${VOICE_PARTS.join(", ")} or empty`);
  }
  if (payload.bio && payload.bio.length > 1000) errors.push("bio cannot exceed 1000 characters");
  if (payload.goals && payload.goals.length > 500) errors.push("goals cannot exceed 500 characters");
  if (payload.directorNotes && payload.directorNotes.length > 2000) {
    errors.push("directorNotes cannot exceed 2000 characters");
  }
  if (errors.length) throw new ValidationError("Invalid member profile payload", errors);
};

const listRoster = async (query = {}) => {
  const userFilter = { role: "member", isActive: true };
  if (query.voicePart) userFilter.voicePart = query.voicePart;
  if (query.subTeam) userFilter.subTeam = query.subTeam;
  if (query.search) {
    const regex = safeRegex(query.search);
    userFilter.$or = [{ name: regex }, { email: regex }];
  }
  const users = await User.find(userFilter).select("name email voicePart subTeam role createdAt");
  const profileFilter = {};
  if (query.experienceLevel) profileFilter.experienceLevel = query.experienceLevel;
  const profiles = await MemberProfile.find({
    user: { $in: users.map((u) => u._id) },
    ...profileFilter,
  });
  const profileMap = new Map(profiles.map((p) => [String(p.user), p]));
  const roster = users.map((user) => ({
    user,
    profile: profileMap.get(String(user._id)) || null,
  }));
  return { roster, count: roster.length };
};

const getProfileByUserId = async (userId, isDirector = false) => {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) throw new NotFoundError("User");
  let profile = await MemberProfile.findOne({ user: userId });
  if (!profile) {
    profile = await MemberProfile.create({
      user: userId,
      joinedAt: user.createdAt,
    });
  }
  const profileData = profile.toObject();
  if (!isDirector) {
    delete profileData.directorNotes;
  }
  return { user, profile: profileData };
};

const upsertProfile = async (userId, payload, isDirector = false) => {
  validateProfilePayload(payload);
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User");
  const safePayload = { ...payload };
  if (!isDirector) {
    delete safePayload.directorNotes;
    delete safePayload.attendanceStreak;
    delete safePayload.lastAttendanceAt;
  }
  const profile = await MemberProfile.findOneAndUpdate(
    { user: userId },
    { $set: safePayload, $setOnInsert: { user: userId, joinedAt: user.createdAt } },
    { upsert: true, new: true, runValidators: true }
  );
  return { user, profile };
};

const updateDirectorNotes = async (userId, notes) => {
  if (notes && notes.length > 2000) {
    throw new ValidationError("directorNotes cannot exceed 2000 characters");
  }
  const profile = await MemberProfile.findOneAndUpdate(
    { user: userId },
    { directorNotes: notes || "" },
    { upsert: true, new: true }
  );
  if (!profile) throw new NotFoundError("Member profile");
  return profile;
};

const refreshAttendanceStreak = async (userId) => {
  const records = await AttendanceRecord.find({ member: userId })
    .sort({ checkedInAt: -1 })
    .limit(30)
    .select("status checkedInAt");
  let streak = 0;
  for (const record of records) {
    if (record.status === "present" || record.status === "late") streak += 1;
    else break;
  }
  const profile = await MemberProfile.findOneAndUpdate(
    { user: userId },
    {
      attendanceStreak: streak,
      lastAttendanceAt: records[0]?.checkedInAt || null,
    },
    { upsert: true, new: true }
  );
  return profile;
};

const getVoicePartDistribution = async () => {
  const members = await User.find({ role: "member", isActive: true }).select("voicePart");
  const distribution = VOICE_PARTS.reduce((acc, part) => {
    acc[part] = 0;
    return acc;
  }, {});
  for (const member of members) {
    const part = member.voicePart || "Other";
    distribution[part] = (distribution[part] || 0) + 1;
  }
  return { total: members.length, distribution };
};

const getAvailabilityReport = async (day) => {
  const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  if (!validDays.includes(day)) {
    throw new ValidationError(`day must be one of: ${validDays.join(", ")}`);
  }
  const profiles = await MemberProfile.find({ [`availability.${day}`]: true }).populate(
    "user",
    "name email voicePart subTeam"
  );
  return {
    day,
    availableCount: profiles.length,
    members: profiles.map((p) => p.user),
  };
};

const tagMembers = async (userIds, tag) => {
  if (!Array.isArray(userIds) || !userIds.length) {
    throw new ValidationError("userIds array is required");
  }
  if (!tag || !String(tag).trim()) throw new ValidationError("tag is required");
  const results = [];
  for (const userId of userIds) {
    const profile = await MemberProfile.findOneAndUpdate(
      { user: userId },
      { $addToSet: { tags: tag.trim() } },
      { upsert: true, new: true }
    );
    results.push(profile);
  }
  return results;
};

const listByTag = async (tag, query = {}) => {
  const filter = { tags: tag };
  return paginateQuery(MemberProfile, filter, query, { updatedAt: -1 });
};

module.exports = {
  listRoster,
  getProfileByUserId,
  upsertProfile,
  updateDirectorNotes,
  refreshAttendanceStreak,
  getVoicePartDistribution,
  getAvailabilityReport,
  tagMembers,
  listByTag,
};
