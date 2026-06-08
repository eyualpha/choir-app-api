const rosterService = require("../services/rosterService");
const { success } = require("../utils/apiResponse");

const listRoster = async (req, res) => {
  const result = await rosterService.listRoster(req.query);
  return success(res, result);
};

const getProfile = async (req, res) => {
  const profile = await rosterService.getProfileByUserId(req.params.userId);
  return success(res, profile);
};

const upsertProfile = async (req, res) => {
  const isDirector = req.user.role === "admin";
  const targetId = req.params.userId || req.user.id;
  const profile = await rosterService.upsertProfile(targetId, req.body, isDirector);
  return success(res, profile, "Profile updated");
};

const updateDirectorNotes = async (req, res) => {
  const profile = await rosterService.updateDirectorNotes(req.params.userId, req.body.notes);
  return success(res, { profile }, "Director notes updated");
};

const refreshStreak = async (req, res) => {
  const profile = await rosterService.refreshAttendanceStreak(req.params.userId);
  return success(res, { profile }, "Attendance streak refreshed");
};

const voicePartDistribution = async (_req, res) => {
  const report = await rosterService.getVoicePartDistribution();
  return success(res, { report });
};

const availabilityReport = async (req, res) => {
  const report = await rosterService.getAvailabilityReport(req.params.day);
  return success(res, { report });
};

const tagMembers = async (req, res) => {
  const profiles = await rosterService.tagMembers(req.body.userIds, req.body.tag);
  return success(res, { profiles, count: profiles.length }, "Members tagged");
};

const listByTag = async (req, res) => {
  const result = await rosterService.listByTag(req.params.tag, req.query);
  return success(res, { profiles: result.items, meta: result.meta });
};

module.exports = {
  listRoster,
  getProfile,
  upsertProfile,
  updateDirectorNotes,
  refreshStreak,
  voicePartDistribution,
  availabilityReport,
  tagMembers,
  listByTag,
};
