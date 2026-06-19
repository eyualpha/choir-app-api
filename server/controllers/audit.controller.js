const auditService = require("../services/auditService");
const { success } = require("../utils/apiResponse");

const listLogs = async (req, res) => {
  const result = await auditService.listAuditLogs(req.query);
  return success(res, { logs: result.items, meta: result.meta });
};

const entityHistory = async (req, res) => {
  const history = await auditService.getEntityHistory(req.params.entityType, req.params.entityId);
  return success(res, { history, count: history.length });
};

const actorActivity = async (req, res) => {
  const activity = await auditService.getActorActivity(
    req.params.actorId,
    Number(req.query.days) || 30
  );
  return success(res, { activity });
};

const summary = async (req, res) => {
  const report = await auditService.getAuditSummary(Number(req.query.days) || 7);
  return success(res, { report });
};

module.exports = { listLogs, entityHistory, actorActivity, summary };
