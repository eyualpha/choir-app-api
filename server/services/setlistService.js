const Setlist = require("../models/setlist.model");
const Song = require("../models/song.model");
const ChoirEvent = require("../models/event.model");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { paginateQuery } = require("../utils/pagination");

const SETLIST_STATUSES = ["draft", "review", "approved", "archived"];

const validateSetlistPayload = (payload, isUpdate = false) => {
  const errors = [];
  if (!isUpdate || payload.title !== undefined) {
    if (!payload.title || !String(payload.title).trim()) errors.push("title is required");
  }
  if (payload.status && !SETLIST_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${SETLIST_STATUSES.join(", ")}`);
  }
  if (payload.items !== undefined) {
    if (!Array.isArray(payload.items)) errors.push("items must be an array");
    else if (!payload.items.length && !isUpdate) errors.push("items cannot be empty on create");
    else {
      for (const item of payload.items) {
        if (!item.order || item.order < 1) errors.push("each item requires a positive order");
        if (!item.song) errors.push("each item requires a song reference");
      }
    }
  }
  if (errors.length) throw new ValidationError("Invalid setlist payload", errors);
};

const ensureSongsExist = async (items = []) => {
  for (const item of items) {
    const song = await Song.findById(item.song);
    if (!song || !song.isActive) throw new NotFoundError(`Song ${item.song}`);
  }
};

const listSetlists = async (query = {}) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.isTemplate !== undefined) filter.isTemplate = query.isTemplate === "true";
  if (query.event) filter.event = query.event;
  if (query.search) filter.$text = { $search: query.search };
  if (query.tag) filter.tags = query.tag;
  return paginateQuery(Setlist, filter, query, { updatedAt: -1 });
};

const getSetlistById = async (id) => {
  const setlist = await Setlist.findById(id)
    .populate("items.song", "title composer keySignature tempo category difficulty")
    .populate("preparedBy", "name email")
    .populate("approvedBy", "name email")
    .populate("event", "title startAt endAt eventType");
  if (!setlist) throw new NotFoundError("Setlist");
  return setlist;
};

const createSetlist = async (payload, userId) => {
  validateSetlistPayload(payload);
  if (payload.items) await ensureSongsExist(payload.items);
  if (payload.event) {
    const event = await ChoirEvent.findById(payload.event);
    if (!event) throw new NotFoundError("Event");
  }
  return Setlist.create({ ...payload, preparedBy: userId });
};

const updateSetlist = async (id, payload) => {
  validateSetlistPayload(payload, true);
  if (payload.items) await ensureSongsExist(payload.items);
  const setlist = await Setlist.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!setlist) throw new NotFoundError("Setlist");
  return setlist;
};

const submitForReview = async (id) => {
  const setlist = await Setlist.findById(id);
  if (!setlist) throw new NotFoundError("Setlist");
  if (!setlist.items.length) throw new ValidationError("Cannot submit an empty setlist for review");
  setlist.status = "review";
  await setlist.save();
  return setlist;
};

const approveSetlist = async (id, approverId) => {
  const setlist = await Setlist.findById(id);
  if (!setlist) throw new NotFoundError("Setlist");
  if (setlist.status !== "review") {
    throw new ValidationError("Only setlists in review status can be approved");
  }
  setlist.status = "approved";
  setlist.approvedBy = approverId;
  setlist.approvedAt = new Date();
  await setlist.save();
  return setlist;
};

const archiveSetlist = async (id) => {
  const setlist = await Setlist.findByIdAndUpdate(
    id,
    { status: "archived" },
    { new: true }
  );
  if (!setlist) throw new NotFoundError("Setlist");
  return setlist;
};

const duplicateSetlist = async (id, userId, overrides = {}) => {
  const source = await Setlist.findById(id).lean();
  if (!source) throw new NotFoundError("Setlist");
  const copy = await Setlist.create({
    title: overrides.title || `${source.title} (Copy)`,
    description: source.description,
    items: source.items,
    tags: source.tags,
    isTemplate: overrides.isTemplate ?? false,
    event: overrides.event || undefined,
    status: "draft",
    preparedBy: userId,
  });
  return copy;
};

const attachToEvent = async (id, eventId) => {
  const event = await ChoirEvent.findById(eventId);
  if (!event) throw new NotFoundError("Event");
  const setlist = await Setlist.findByIdAndUpdate(
    id,
    { event: eventId },
    { new: true, runValidators: true }
  );
  if (!setlist) throw new NotFoundError("Setlist");
  return setlist;
};

const reorderItems = async (id, orderedSongIds) => {
  if (!Array.isArray(orderedSongIds) || !orderedSongIds.length) {
    throw new ValidationError("orderedSongIds array is required");
  }
  const setlist = await Setlist.findById(id);
  if (!setlist) throw new NotFoundError("Setlist");
  const itemMap = new Map(setlist.items.map((item) => [String(item.song), item.toObject()]));
  const reordered = [];
  orderedSongIds.forEach((songId, index) => {
    const existing = itemMap.get(String(songId));
    if (existing) {
      reordered.push({ ...existing, order: index + 1 });
    }
  });
  if (!reordered.length) throw new ValidationError("No matching songs found for reorder");
  setlist.items = reordered;
  await setlist.save();
  return setlist;
};

const getTemplates = async () => {
  return Setlist.find({ isTemplate: true, status: { $ne: "archived" } })
    .sort({ title: 1 })
    .select("title description totalEstimatedMinutes tags items");
};

module.exports = {
  listSetlists,
  getSetlistById,
  createSetlist,
  updateSetlist,
  submitForReview,
  approveSetlist,
  archiveSetlist,
  duplicateSetlist,
  attachToEvent,
  reorderItems,
  getTemplates,
};
