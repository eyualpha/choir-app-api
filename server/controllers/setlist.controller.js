const setlistService = require("../services/setlistService");
const { created, success } = require("../utils/apiResponse");

const listSetlists = async (req, res) => {
  const result = await setlistService.listSetlists(req.query);
  return success(res, { setlists: result.items, meta: result.meta });
};

const getSetlist = async (req, res) => {
  const setlist = await setlistService.getSetlistById(req.params.id);
  return success(res, { setlist });
};

const createSetlist = async (req, res) => {
  const setlist = await setlistService.createSetlist(req.body, req.user.id);
  return created(res, { setlist }, "Setlist created");
};

const updateSetlist = async (req, res) => {
  const setlist = await setlistService.updateSetlist(req.params.id, req.body);
  return success(res, { setlist }, "Setlist updated");
};

const submitForReview = async (req, res) => {
  const setlist = await setlistService.submitForReview(req.params.id);
  return success(res, { setlist }, "Setlist submitted for review");
};

const approveSetlist = async (req, res) => {
  const setlist = await setlistService.approveSetlist(req.params.id, req.user.id);
  return success(res, { setlist }, "Setlist approved");
};

const archiveSetlist = async (req, res) => {
  const setlist = await setlistService.archiveSetlist(req.params.id);
  return success(res, { setlist }, "Setlist archived");
};

const duplicateSetlist = async (req, res) => {
  const setlist = await setlistService.duplicateSetlist(req.params.id, req.user.id, req.body);
  return created(res, { setlist }, "Setlist duplicated");
};

const attachToEvent = async (req, res) => {
  const setlist = await setlistService.attachToEvent(req.params.id, req.body.eventId);
  return success(res, { setlist }, "Setlist attached to event");
};

const reorderItems = async (req, res) => {
  const setlist = await setlistService.reorderItems(req.params.id, req.body.orderedSongIds);
  return success(res, { setlist }, "Setlist items reordered");
};

const listTemplates = async (_req, res) => {
  const templates = await setlistService.getTemplates();
  return success(res, { templates, count: templates.length });
};

module.exports = {
  listSetlists,
  getSetlist,
  createSetlist,
  updateSetlist,
  submitForReview,
  approveSetlist,
  archiveSetlist,
  duplicateSetlist,
  attachToEvent,
  reorderItems,
  listTemplates,
};
