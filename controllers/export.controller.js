const exportService = require("../services/exportService");
const { success } = require("../utils/apiResponse");

const exportMembers = async (_req, res) => {
  const csv = await exportService.exportMembersCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="members.csv"');
  return res.status(200).send(csv);
};

const exportEvents = async (req, res) => {
  const csv = await exportService.exportEventsCsv(req.query.from, req.query.to);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="events.csv"');
  return res.status(200).send(csv);
};

const exportAttendance = async (req, res) => {
  const csv = await exportService.exportAttendanceCsv(req.params.eventId);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendance-${req.params.eventId}.csv"`);
  return res.status(200).send(csv);
};

const exportSongs = async (_req, res) => {
  const csv = await exportService.exportSongCatalogCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="songs.csv"');
  return res.status(200).send(csv);
};

const exportSetlistData = async (req, res) => {
  const data = await exportService.exportSetlistPdfData(req.params.id);
  return success(res, { setlistExport: data });
};

const exportPracticeSummary = async (req, res) => {
  const data = await exportService.exportPracticeSummaryJson(
    req.params.memberId,
    Number(req.query.days) || 90
  );
  return success(res, { practiceSummary: data });
};

module.exports = {
  exportMembers,
  exportEvents,
  exportAttendance,
  exportSongs,
  exportSetlistData,
  exportPracticeSummary,
};
