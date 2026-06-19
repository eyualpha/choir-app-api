const eventService = require("../services/eventService");
const { created, success } = require("../utils/apiResponse");

const listEvents = async (req, res) => {
  const result = await eventService.listEvents(req.query);
  return success(res, { events: result.items, meta: result.meta });
};

const getEvent = async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  return success(res, { event });
};

const createEvent = async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user.id);
  return created(res, { event }, "Event created");
};

const updateEvent = async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  return success(res, { event }, "Event updated");
};

const cancelEvent = async (req, res) => {
  const event = await eventService.cancelEvent(req.params.id, req.body.reason);
  return success(res, { event }, "Event cancelled");
};

const completeEvent = async (req, res) => {
  const event = await eventService.completeEvent(req.params.id);
  return success(res, { event }, "Event completed");
};

const upcomingEvents = async (req, res) => {
  const events = await eventService.getUpcomingEvents(Number(req.query.days) || 14);
  return success(res, { events, count: events.length });
};

const scheduleConflicts = async (req, res) => {
  const conflicts = await eventService.checkScheduleConflict(
    req.query.startAt,
    req.query.endAt,
    req.query.excludeId
  );
  return success(res, { conflicts, count: conflicts.length });
};

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  cancelEvent,
  completeEvent,
  upcomingEvents,
  scheduleConflicts,
};
