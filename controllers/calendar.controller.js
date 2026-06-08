const calendarService = require("../services/calendarService");
const { success } = require("../utils/apiResponse");
const { parseCommaList } = require("../validators/commonValidators");

const unifiedCalendar = async (req, res) => {
  const include = parseCommaList(req.query.include);
  const calendar = await calendarService.getUnifiedCalendar(
    req.query.from,
    req.query.to,
    include.length ? include : undefined
  );
  return success(res, { calendar });
};

const dayAgenda = async (req, res) => {
  const agenda = await calendarService.getEventDayAgenda(req.params.date);
  return success(res, { agenda });
};

const weekOverview = async (req, res) => {
  const overview = await calendarService.getWeekOverview(req.query.date || new Date());
  return success(res, { overview });
};

const monthDensity = async (req, res) => {
  const density = await calendarService.getMonthDensity(
    Number(req.params.year),
    Number(req.params.month)
  );
  return success(res, { density });
};

module.exports = { unifiedCalendar, dayAgenda, weekOverview, monthDensity };
