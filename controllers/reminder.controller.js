const reminderService = require("../services/reminderService");
const { success } = require("../utils/apiResponse");

const sendEventReminders = async (req, res) => {
  const daysAhead = Number(req.body.daysAhead) || 1;
  const result = await reminderService.sendEventReminders(daysAhead);
  return success(res, result, "Event reminders sent");
};

const sendTargeted = async (req, res) => {
  const result = await reminderService.sendTargetedReminder(req.body);
  return success(res, result, "Targeted reminders sent");
};

const listPending = async (_req, res) => {
  const pending = await reminderService.listPendingReminders();
  return success(res, { pending, count: pending.length });
};

const stats = async (req, res) => {
  const result = await reminderService.getReminderStats(Number(req.query.days) || 30);
  return success(res, { stats: result });
};

module.exports = { sendEventReminders, sendTargeted, listPending, stats };
