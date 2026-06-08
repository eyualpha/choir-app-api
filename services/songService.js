const Song = require("../models/song.model");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { paginateQuery } = require("../utils/pagination");

const CATEGORIES = ["worship", "hymn", "special", "seasonal", "practice"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const validateSongPayload = (payload, isUpdate = false) => {
  const errors = [];
  if (!isUpdate || payload.title !== undefined) {
    if (!payload.title || !String(payload.title).trim()) errors.push("title is required");
  }
  if (payload.category && !CATEGORIES.includes(payload.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  }
  if (payload.difficulty && !DIFFICULTIES.includes(payload.difficulty)) {
    errors.push(`difficulty must be one of: ${DIFFICULTIES.join(", ")}`);
  }
  if (errors.length) throw new ValidationError("Invalid song payload", errors);
};

const listSongs = async (query = {}) => {
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.tag) filter.tags = query.tag;
  return paginateQuery(Song, filter, query, { title: 1 });
};

const getSongById = async (id) => {
  const song = await Song.findById(id).populate("addedBy", "name email");
  if (!song) throw new NotFoundError("Song");
  return song;
};

const createSong = async (payload, userId) => {
  validateSongPayload(payload);
  const existing = await Song.findOne({
    title: new RegExp(`^${payload.title.trim()}$`, "i"),
    isActive: true,
  });
  if (existing) {
    throw new ValidationError("A song with this title already exists");
  }
  return Song.create({ ...payload, addedBy: userId });
};

const updateSong = async (id, payload) => {
  validateSongPayload(payload, true);
  const song = await Song.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!song) throw new NotFoundError("Song");
  return song;
};

const archiveSong = async (id) => {
  const song = await Song.findById(id);
  if (!song) throw new NotFoundError("Song");
  song.isActive = false;
  await song.save();
  return song;
};

const recordPerformance = async (id) => {
  const song = await Song.findById(id);
  if (!song) throw new NotFoundError("Song");
  song.performanceCount += 1;
  song.lastPerformedAt = new Date();
  await song.save();
  return song;
};

const getSongsByVoicePartGap = async () => {
  const songs = await Song.find({ isActive: true }).select("title voiceParts category");
  return songs
    .map((song) => {
      const parts = new Set((song.voiceParts || []).map((vp) => vp.part));
      const missing = ["Soprano", "Alto", "Tenor", "Bass"].filter((p) => !parts.has(p));
      return { songId: song._id, title: song.title, category: song.category, missingParts: missing };
    })
    .filter((entry) => entry.missingParts.length > 0);
};

const bulkTagSongs = async (songIds, tag) => {
  if (!Array.isArray(songIds) || !songIds.length || !tag) {
    throw new ValidationError("songIds array and tag are required");
  }
  const result = await Song.updateMany(
    { _id: { $in: songIds }, isActive: true },
    { $addToSet: { tags: tag } }
  );
  return result;
};

module.exports = {
  listSongs,
  getSongById,
  createSong,
  updateSong,
  archiveSong,
  recordPerformance,
  getSongsByVoicePartGap,
  bulkTagSongs,
};
