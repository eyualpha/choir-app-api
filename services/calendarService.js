const ChoirEvent = require("../models/event.model");
const VolunteerShift = require("../models/volunteerShift.model");
const Setlist = require("../models/setlist.model");
const RehearsalPlan = require("../models/rehearsalPlan.model");
const { ValidationError } = require("../utils/errors");
const { toStartOfDay, toEndOfDay, formatDateLabel } = require("../utils/dateHelpers");

const buildRangeFilter = (from, to) => {
  if (!from && !to) throw new ValidationError("from or to date is required");
  const filter = {};
  filter.startAt = {};
  if (from) filter.startAt.$gte = toStartOfDay(from);
  if (to) filter.startAt.$lte = toEndOfDay(to);
  return filter;
};

const getCalendarEvents = async (from, to) => {
  const events = await ChoirEvent.find(buildRangeFilter(from, to))
    .populate("createdBy", "name")
    .sort({ startAt: 1 });
  return events.map((event) => ({
    id: event._id,
    type: "event",
    title: event.title,
    eventType: event.eventType,
    status: event.status,
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.location,
    createdBy: event.createdBy?.name,
  }));
};

const getCalendarVolunteerShifts = async (from, to) => {
  const shifts = await VolunteerShift.find({
    isActive: true,
    ...buildRangeFilter(from, to),
  }).sort({ startAt: 1 });
  return shifts.map((shift) => ({
    id: shift._id,
    type: "volunteer_shift",
    title: shift.title,
    role: shift.role,
    startAt: shift.startAt,
    endAt: shift.endAt,
    openSlots: shift.openSlots,
    filledSlots: shift.filledSlots,
  }));
};

const getUnifiedCalendar = async (from, to, include = ["events", "volunteer_shifts"]) => {
  const items = [];
  if (include.includes("events")) {
    items.push(...(await getCalendarEvents(from, to)));
  }
  if (include.includes("volunteer_shifts")) {
    items.push(...(await getCalendarVolunteerShifts(from, to)));
  }
  items.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  return {
    from: from || null,
    to: to || null,
    count: items.length,
    items,
  };
};

const getEventDayAgenda = async (date) => {
  const dayStart = toStartOfDay(date);
  const dayEnd = toEndOfDay(date);
  const [events, shifts, setlists] = await Promise.all([
    ChoirEvent.find({ startAt: { $gte: dayStart, $lte: dayEnd } }).sort({ startAt: 1 }),
    VolunteerShift.find({ isActive: true, startAt: { $gte: dayStart, $lte: dayEnd } }),
    Setlist.find({ status: "approved" }).populate("event", "title startAt"),
  ]);
  const daySetlists = setlists.filter(
    (setlist) =>
      setlist.event &&
      setlist.event.startAt >= dayStart &&
      setlist.event.startAt <= dayEnd
  );
  const rehearsalPlans = await RehearsalPlan.find({
    event: { $in: events.filter((e) => e.eventType === "rehearsal").map((e) => e._id) },
    published: true,
  }).populate("items.song", "title");
  return {
    date: formatDateLabel(dayStart),
    events,
    volunteerShifts: shifts,
    setlists: daySetlists,
    rehearsalPlans,
  };
};

const getWeekOverview = async (anchorDate) => {
  const start = toStartOfDay(anchorDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const calendar = await getUnifiedCalendar(start, end);
  const byDay = {};
  for (const item of calendar.items) {
    const key = new Date(item.startAt).toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(item);
  }
  return { weekStart: start, weekEnd: end, days: byDay, totalItems: calendar.count };
};

const getMonthDensity = async (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const events = await ChoirEvent.find({ startAt: { $gte: start, $lte: end } });
  const density = {};
  for (const event of events) {
    const key = event.startAt.toISOString().slice(0, 10);
    density[key] = (density[key] || 0) + 1;
  }
  return { year, month, totalEvents: events.length, density };
};

module.exports = {
  getCalendarEvents,
  getCalendarVolunteerShifts,
  getUnifiedCalendar,
  getEventDayAgenda,
  getWeekOverview,
  getMonthDensity,
};
