const User = require("../models/user.model");
const Song = require("../models/song.model");
const ChoirEvent = require("../models/event.model");
const Setlist = require("../models/setlist.model");
const Resource = require("../models/resource.model");
const Announcement = require("../models/annoucement.model");
const { ValidationError } = require("../utils/errors");
const { safeRegex } = require("../utils/sanitize");

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS_PER_TYPE = 10;

const normalizeQuery = (query) => {
  const term = String(query || "").trim();
  if (term.length < MIN_QUERY_LENGTH) {
    throw new ValidationError(`Search query must be at least ${MIN_QUERY_LENGTH} characters`);
  }
  return term;
};

const searchMembers = async (term, limit = MAX_RESULTS_PER_TYPE) => {
  const regex = safeRegex(term);
  return User.find({
    isActive: true,
    $or: [
      { name: regex },
      { email: regex },
      { voicePart: regex },
      { subTeam: regex },
    ],
  })
    .select("name email voicePart role subTeam")
    .limit(limit);
};

const searchSongs = async (term, limit = MAX_RESULTS_PER_TYPE) => {
  const regex = safeRegex(term);
  return Song.find({
    isActive: true,
    $or: [{ title: regex }, { composer: regex }, { tags: regex }],
  })
    .select("title composer category difficulty keySignature")
    .limit(limit);
};

const searchEvents = async (term, limit = MAX_RESULTS_PER_TYPE) => {
  const regex = safeRegex(term);
  return ChoirEvent.find({
    $or: [{ title: regex }, { description: regex }, { location: regex }],
  })
    .select("title eventType status startAt endAt location")
    .sort({ startAt: -1 })
    .limit(limit);
};

const searchSetlists = async (term, limit = MAX_RESULTS_PER_TYPE) => {
  const regex = safeRegex(term);
  return Setlist.find({
    status: { $ne: "archived" },
    $or: [{ title: regex }, { description: regex }, { tags: term }],
  })
    .select("title status totalEstimatedMinutes isTemplate")
    .limit(limit);
};

const searchResources = async (term, limit = MAX_RESULTS_PER_TYPE) => {
  const regex = safeRegex(term);
  return Resource.find({
    $or: [{ title: regex }, { description: regex }, { type: regex }],
  })
    .select("title type file createdAt")
    .limit(limit);
};

const searchAnnouncements = async (term, limit = MAX_RESULTS_PER_TYPE) => {
  const regex = safeRegex(term);
  return Announcement.find({
    isActive: true,
    $or: [{ title: regex }, { message: regex }],
  })
    .select("title message createdAt")
    .sort({ createdAt: -1 })
    .limit(limit);
};

const globalSearch = async (query, types = []) => {
  const term = normalizeQuery(query);
  const allowed = ["members", "songs", "events", "setlists", "resources", "announcements"];
  const selected = types.length ? types.filter((t) => allowed.includes(t)) : allowed;
  const results = { query: term, results: {} };

  const tasks = [];
  if (selected.includes("members")) tasks.push(searchMembers(term).then((r) => ({ members: r })));
  if (selected.includes("songs")) tasks.push(searchSongs(term).then((r) => ({ songs: r })));
  if (selected.includes("events")) tasks.push(searchEvents(term).then((r) => ({ events: r })));
  if (selected.includes("setlists")) tasks.push(searchSetlists(term).then((r) => ({ setlists: r })));
  if (selected.includes("resources")) tasks.push(searchResources(term).then((r) => ({ resources: r })));
  if (selected.includes("announcements")) {
    tasks.push(searchAnnouncements(term).then((r) => ({ announcements: r })));
  }

  const chunks = await Promise.all(tasks);
  for (const chunk of chunks) Object.assign(results.results, chunk);

  results.totalMatches = Object.values(results.results).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );
  return results;
};

module.exports = {
  globalSearch,
  searchMembers,
  searchSongs,
  searchEvents,
  searchSetlists,
  searchResources,
  searchAnnouncements,
};
