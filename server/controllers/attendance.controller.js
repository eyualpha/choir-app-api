const attendanceService = require("../services/attendanceService");
const { created, success } = require("../utils/apiResponse");

const markAttendance = async (req, res) => {
  const record = await attendanceService.markAttendance({
    eventId: req.params.eventId,
    memberId: req.body.memberId,
    status: req.body.status,
    notes: req.body.notes,
    checkedInBy: req.user.id,
  });
  return created(res, { record }, "Attendance recorded");
};

const bulkMarkAttendance = async (req, res) => {
  const records = await attendanceService.bulkMarkAttendance(
    req.params.eventId,
    req.body.entries,
    req.user.id
  );
  return created(res, { records, count: records.length }, "Attendance batch saved");
};

const getEventAttendance = async (req, res) => {
  const result = await attendanceService.getAttendanceForEvent(req.params.eventId);
  return success(res, result);
};

const getMemberHistory = async (req, res) => {
  const result = await attendanceService.getMemberAttendanceHistory(
    req.params.memberId,
    Number(req.query.limit) || 20
  );
  return success(res, result);
};

const voicePartRates = async (req, res) => {
  const rates = await attendanceService.getAttendanceRateByVoicePart(Number(req.query.days) || 90);
  return success(res, { rates });
};

module.exports = {
  markAttendance,
  bulkMarkAttendance,
  getEventAttendance,
  getMemberHistory,
  voicePartRates,
};
