const songService = require("../services/songService");
const { created, success } = require("../utils/apiResponse");

const listSongs = async (req, res) => {
  const result = await songService.listSongs(req.query);
  return success(res, { songs: result.items, meta: result.meta });
};

const getSong = async (req, res) => {
  const song = await songService.getSongById(req.params.id);
  return success(res, { song });
};

const createSong = async (req, res) => {
  const song = await songService.createSong(req.body, req.user.id);
  return created(res, { song }, "Song added to library");
};

const updateSong = async (req, res) => {
  const song = await songService.updateSong(req.params.id, req.body);
  return success(res, { song }, "Song updated");
};

const archiveSong = async (req, res) => {
  const song = await songService.archiveSong(req.params.id);
  return success(res, { song }, "Song archived");
};

const recordPerformance = async (req, res) => {
  const song = await songService.recordPerformance(req.params.id);
  return success(res, { song }, "Performance recorded");
};

const voicePartGaps = async (_req, res) => {
  const gaps = await songService.getSongsByVoicePartGap();
  return success(res, { gaps, count: gaps.length });
};

const bulkTag = async (req, res) => {
  const result = await songService.bulkTagSongs(req.body.songIds, req.body.tag);
  return success(res, { result }, "Tags updated");
};

module.exports = {
  listSongs,
  getSong,
  createSong,
  updateSong,
  archiveSong,
  recordPerformance,
  voicePartGaps,
  bulkTag,
};
