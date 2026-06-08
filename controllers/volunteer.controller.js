const volunteerService = require("../services/volunteerService");
const { created, success } = require("../utils/apiResponse");

const listShifts = async (req, res) => {
  const result = await volunteerService.listShifts(req.query);
  return success(res, { shifts: result.items, meta: result.meta });
};

const getShift = async (req, res) => {
  const shift = await volunteerService.getShiftById(req.params.id);
  return success(res, { shift });
};

const createShift = async (req, res) => {
  const shift = await volunteerService.createShift(req.body, req.user.id);
  return created(res, { shift }, "Volunteer shift created");
};

const updateShift = async (req, res) => {
  const shift = await volunteerService.updateShift(req.params.id, req.body);
  return success(res, { shift }, "Volunteer shift updated");
};

const deactivateShift = async (req, res) => {
  const shift = await volunteerService.deactivateShift(req.params.id);
  return success(res, { shift }, "Volunteer shift deactivated");
};

const assignMember = async (req, res) => {
  const shift = await volunteerService.assignMember(
    req.params.id,
    req.body.memberId,
    req.body.status
  );
  return success(res, { shift }, "Member assigned to shift");
};

const updateAssignment = async (req, res) => {
  const shift = await volunteerService.updateAssignmentStatus(
    req.params.id,
    req.params.memberId,
    req.body.status
  );
  return success(res, { shift }, "Assignment status updated");
};

const removeAssignment = async (req, res) => {
  const shift = await volunteerService.removeAssignment(req.params.id, req.params.memberId);
  return success(res, { shift }, "Assignment removed");
};

const memberShifts = async (req, res) => {
  const memberId = req.params.memberId || req.user.id;
  const result = await volunteerService.getMemberShifts(memberId, req.query);
  return success(res, { shifts: result.items, meta: result.meta });
};

const openShifts = async (req, res) => {
  const shifts = await volunteerService.getOpenShifts(Number(req.query.days) || 30);
  return success(res, { shifts, count: shifts.length });
};

const summaryByRole = async (_req, res) => {
  const summary = await volunteerService.getShiftSummaryByRole();
  return success(res, { summary });
};

module.exports = {
  listShifts,
  getShift,
  createShift,
  updateShift,
  deactivateShift,
  assignMember,
  updateAssignment,
  removeAssignment,
  memberShifts,
  openShifts,
  summaryByRole,
};
