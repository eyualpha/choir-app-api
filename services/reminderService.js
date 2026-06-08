const ChoirEvent = require("../models/event.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const { sendEmail } = require("../utils/sendEmail");
const { ValidationError } = require("../utils/errors");
const { addDays, formatDateLabel } = require("../utils/dateHelpers");

const REMINDER_TYPES = ["event_upcoming", "assignment_due", "rehearsal_plan_published", "volunteer_shift"];

const createInAppReminder = async ({ userId, title, body, type, relatedId }) => {
  if (!REMINDER_TYPES.includes(type)) {
    throw new ValidationError(`type must be one of: ${REMINDER_TYPES.join(", ")}`);
  }
  return Notification.create({
    recipient: userId,
    title,
    body,
    category: type === "assignment_due" ? "assignment" : "event",
    relatedId,
    relatedModel: "ChoirEvent",
    metadata: { reminderType: type },
  });
};

const sendEventReminders = async (daysAhead = 1) => {
  const windowStart = addDays(new Date(), daysAhead);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = addDays(windowStart, 1);
  const events = await ChoirEvent.find({
    status: "scheduled",
    reminderSent: false,
    startAt: { $gte: windowStart, $lt: windowEnd },
  });
  const members = await User.find({ role: "member", isActive: true }).select("name email");
  const results = [];
  for (const event of events) {
    for (const member of members) {
      const title = `Upcoming: ${event.title}`;
      const body = `${event.title} is scheduled for ${formatDateLabel(event.startAt)} at ${event.location || "TBD"}.`;
      await createInAppReminder({
        userId: member._id,
        title,
        body,
        type: "event_upcoming",
        relatedId: event._id,
      });
      if (member.email) {
        await sendEmail({
          to: member.email,
          subject: title,
          text: body,
        });
      }
    }
    event.reminderSent = true;
    await event.save();
    results.push({ eventId: event._id, notified: members.length });
  }
  return { eventsProcessed: results.length, details: results };
};

const sendTargetedReminder = async ({ userIds, title, body, type, relatedId, sendEmailToo = false }) => {
  if (!Array.isArray(userIds) || !userIds.length) {
    throw new ValidationError("userIds array is required");
  }
  if (!title || !body) throw new ValidationError("title and body are required");
  const users = await User.find({ _id: { $in: userIds }, isActive: true });
  const created = [];
  for (const user of users) {
    const notification = await createInAppReminder({
      userId: user._id,
      title,
      body,
      type: type || "event_upcoming",
      relatedId,
    });
    created.push(notification);
    if (sendEmailToo && user.email) {
      await sendEmail({ to: user.email, subject: title, text: body });
    }
  }
  return { count: created.length, notifications: created };
};

const listPendingReminders = async () => {
  const upcoming = await ChoirEvent.find({
    status: "scheduled",
    reminderSent: false,
    startAt: { $gte: new Date() },
  })
    .sort({ startAt: 1 })
    .limit(50);
  return upcoming.map((event) => ({
    eventId: event._id,
    title: event.title,
    startAt: event.startAt,
    daysUntil: Math.ceil((event.startAt - new Date()) / (24 * 60 * 60 * 1000)),
  }));
};

const getReminderStats = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const notifications = await Notification.find({
    "metadata.reminderType": { $in: REMINDER_TYPES },
    createdAt: { $gte: since },
  });
  const byType = notifications.reduce((acc, item) => {
    const key = item.metadata?.reminderType || item.category;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return {
    periodDays: days,
    total: notifications.length,
    byType,
    readRate:
      notifications.length > 0
        ? Number(
            (
              notifications.filter((n) => n.isRead).length / notifications.length
            ).toFixed(2)
          )
        : 0,
  };
};

module.exports = {
  createInAppReminder,
  sendEventReminders,
  sendTargetedReminder,
  listPendingReminders,
  getReminderStats,
  REMINDER_TYPES,
};
