const reportService = require("../services/reportService");
const { success } = require("../utils/apiResponse");

const dashboard = async (_req, res) => {
  const summary = await reportService.getDashboardSummary();
  return success(res, { summary });
};

const memberGrowth = async (req, res) => {
  const report = await reportService.getMemberGrowthReport(Number(req.query.months) || 6);
  return success(res, { report });
};

const songUsage = async (_req, res) => {
  const report = await reportService.getSongUsageReport();
  return success(res, { report });
};

const eventCompletion = async (req, res) => {
  const report = await reportService.getEventCompletionReport(Number(req.query.days) || 180);
  return success(res, { report });
};

module.exports = {
  dashboard,
  memberGrowth,
  songUsage,
  eventCompletion,
};
