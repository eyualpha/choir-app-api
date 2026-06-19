const RehearsalPlan = require("../models/rehearsalPlan.model");
const ChoirEvent = require("../models/event.model");
const Song = require("../models/song.model");
const { ValidationError, NotFoundError } = require("../utils/errors");

const ensureRehearsalEvent = async (eventId) => {
  const event = await ChoirEvent.findById(eventId);
  if (!event) throw new NotFoundError("Event");
  if (event.eventType !== "rehearsal") {
    throw new ValidationError("Rehearsal plans can only be attached to rehearsal events");
  }
  return event;
};

const validateItems = async (items = []) => {
  if (!Array.isArray(items)) throw new ValidationError("items must be an array");
  for (const item of items) {
    if (!item.order || item.order < 1) throw new ValidationError("each item requires a positive order");
    if (item.song) {
      const song = await Song.findById(item.song);
      if (!song) throw new NotFoundError("Song in rehearsal plan");
    }
  }
};

const getPlanByEvent = async (eventId) => {
  const plan = await RehearsalPlan.findOne({ event: eventId })
    .populate("items.song", "title composer keySignature tempo")
    .populate("preparedBy", "name email");
  if (!plan) throw new NotFoundError("Rehearsal plan");
  return plan;
};

const upsertPlan = async (eventId, payload, userId) => {
  await ensureRehearsalEvent(eventId);
  if (payload.items) await validateItems(payload.items);
  const plan = await RehearsalPlan.findOneAndUpdate(
    { event: eventId },
    {
      ...payload,
      event: eventId,
      preparedBy: userId,
    },
    { upsert: true, new: true, runValidators: true }
  ).populate("items.song", "title composer keySignature");
  return plan;
};

const publishPlan = async (eventId) => {
  const plan = await RehearsalPlan.findOne({ event: eventId });
  if (!plan) throw new NotFoundError("Rehearsal plan");
  if (!plan.items.length) throw new ValidationError("Cannot publish an empty rehearsal plan");
  plan.published = true;
  await plan.save();
  return plan;
};

const addPlanItem = async (eventId, item, userId) => {
  const plan = await RehearsalPlan.findOne({ event: eventId });
  if (!plan) {
    return upsertPlan(eventId, { items: [item], preparedBy: userId }, userId);
  }
  await validateItems([item]);
  plan.items.push(item);
  plan.items.sort((a, b) => a.order - b.order);
  plan.preparedBy = userId;
  await plan.save();
  return plan.populate("items.song", "title composer keySignature");
};

const removePlanItem = async (eventId, order) => {
  const plan = await RehearsalPlan.findOne({ event: eventId });
  if (!plan) throw new NotFoundError("Rehearsal plan");
  plan.items = plan.items.filter((item) => item.order !== Number(order));
  await plan.save();
  return plan;
};

module.exports = {
  getPlanByEvent,
  upsertPlan,
  publishPlan,
  addPlanItem,
  removePlanItem,
};
