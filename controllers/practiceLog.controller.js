const practiceLogService = require("../services/practiceLogService");
const { created, success } = require("../utils/apiResponse");

const listLogs = async (req, res) => {
  const result = await practiceLogService.listPracticeLogs(req.query, req.user);
  return success(res, { logs: result.items, meta: result.meta });
};

const getLog = async (req, res) => {
  const log = await practiceLogService.getPracticeLogById(req.params.id, req.user);
  return success(res, { log });
};

const createLog = async (req, res) => {
  const log = await practiceLogService.createPracticeLog(req.body, req.user.id);
  return created(res, { log }, "Practice log created");
};

const updateLog = async (req, res) => {
  const log = await practiceLogService.updatePracticeLog(req.params.id, req.body, req.user);
  return success(res, { log }, "Practice log updated");
};

const deleteLog = async (req, res) => {
  const result = await practiceLogService.deletePracticeLog(req.params.id, req.user);
  return success(res, result, "Practice log deleted");
};

const shareLog = async (req, res) => {
  const log = await practiceLogService.shareWithDirector(req.params.id, req.user);
  return success(res, { log }, "Practice log shared with director");
};

const memberStats = async (req, res) => {
  const memberId = req.params.memberId || req.user.id;
  const stats = await practiceLogService.getMemberPracticeStats(
    memberId,
    Number(req.query.days) || 90
  );
  return success(res, { stats });
};

const directorFeed = async (req, res) => {
  const result = await practiceLogService.getDirectorPracticeFeed(req.query);
  return success(res, { logs: result.items, meta: result.meta });
};

const songHeatmap = async (req, res) => {
  const heatmap = await practiceLogService.getSongPracticeHeatmap(
    req.params.songId,
    Number(req.query.days) || 60
  );
  return success(res, { heatmap });
};

module.exports = {
  listLogs,
  getLog,
  createLog,
  updateLog,
  deleteLog,
  shareLog,
  memberStats,
  directorFeed,
  songHeatmap,
};
