const rsvpService = require("../services/rsvpService");
const { created, success } = require("../utils/apiResponse");

const submitRsvp = async (req, res) => {
  const memberId = req.body.memberId && req.user.role === "admin"
    ? req.body.memberId
    : req.user.id;

  const rsvp = await rsvpService.submitRsvp({
    eventId: req.params.eventId,
    memberId,
    status: req.body.status,
    note: req.body.note,
  });
  return created(res, { rsvp }, "RSVP recorded");
};

const getEventRsvps = async (req, res) => {
  const result = await rsvpService.getEventRsvps(req.params.eventId);
  return success(res, result);
};

const getMemberRsvps = async (req, res) => {
  const result = await rsvpService.getMemberRsvps(
    req.params.memberId,
    Number(req.query.limit) || 20
  );
  return success(res, result);
};

const getMyRsvp = async (req, res) => {
  const rsvp = await rsvpService.getMyRsvpForEvent(req.params.eventId, req.user.id);
  return success(res, { rsvp });
};

const deleteRsvp = async (req, res) => {
  const memberId = req.params.memberId || req.user.id;
  const result = await rsvpService.deleteRsvp(
    req.params.eventId,
    memberId,
    req.user.id,
    req.user.role === "admin"
  );
  return success(res, { rsvp: result }, "RSVP removed");
};

module.exports = {
  submitRsvp,
  getEventRsvps,
  getMemberRsvps,
  getMyRsvp,
  deleteRsvp,
};
