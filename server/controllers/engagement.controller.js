const engagementService = require("../services/engagementService");
const { success } = require("../utils/apiResponse");

const memberScore = async (req, res) => {
  const score = await engagementService.getMemberEngagementScore(
    req.params.memberId,
    Number(req.query.days) || 90
  );
  return success(res, { score });
};

const leaderboard = async (req, res) => {
  const leaders = await engagementService.getEngagementLeaderboard(
    Number(req.query.days) || 90,
    Number(req.query.limit) || 20
  );
  return success(res, { leaders, count: leaders.length });
};

const atRisk = async (req, res) => {
  const members = await engagementService.getAtRiskMembers(
    Number(req.query.days) || 60,
    Number(req.query.threshold) || 0.35
  );
  return success(res, { members, count: members.length });
};

const listEngagement = async (req, res) => {
  const result = await engagementService.listMemberEngagement(req.query);
  return success(res, { engagement: result.items, meta: result.meta });
};

module.exports = { memberScore, leaderboard, atRisk, listEngagement };
