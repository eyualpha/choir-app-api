const rehearsalService = require("../services/rehearsalService");
const { created, success } = require("../utils/apiResponse");

const getPlan = async (req, res) => {
  const plan = await rehearsalService.getPlanByEvent(req.params.eventId);
  return success(res, { plan });
};

const upsertPlan = async (req, res) => {
  const plan = await rehearsalService.upsertPlan(req.params.eventId, req.body, req.user.id);
  return success(res, { plan }, "Rehearsal plan saved");
};

const publishPlan = async (req, res) => {
  const plan = await rehearsalService.publishPlan(req.params.eventId);
  return success(res, { plan }, "Rehearsal plan published");
};

const addItem = async (req, res) => {
  const plan = await rehearsalService.addPlanItem(req.params.eventId, req.body, req.user.id);
  return created(res, { plan }, "Rehearsal item added");
};

const removeItem = async (req, res) => {
  const plan = await rehearsalService.removePlanItem(req.params.eventId, req.params.order);
  return success(res, { plan }, "Rehearsal item removed");
};

module.exports = {
  getPlan,
  upsertPlan,
  publishPlan,
  addItem,
  removeItem,
};
