const searchService = require("../services/searchService");
const { success } = require("../utils/apiResponse");

const globalSearch = async (req, res) => {
  const types = req.query.types ? String(req.query.types).split(",") : [];
  const results = await searchService.globalSearch(req.query.q, types);
  return success(res, results);
};

module.exports = { globalSearch };
