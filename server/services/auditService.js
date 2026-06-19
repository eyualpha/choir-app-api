const AuditLog = require("../models/auditLog.model");
const { paginateQuery } = require("../utils/pagination");
const { ValidationError } = require("../utils/errors");

const ACTIONS = [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "assign",
  "approve",
  "archive",
  "export",
  "reminder_sent",
];

const recordAudit = async ({
  actorId,
  action,
  entityType,
  entityId,
  summary,
  metadata,
  ipAddress,
  userAgent,
}) => {
  if (!ACTIONS.includes(action)) {
    throw new ValidationError(`action must be one of: ${ACTIONS.join(", ")}`);
  }
  if (!entityType) throw new ValidationError("entityType is required");
  return AuditLog.create({
    actor: actorId,
    action,
    entityType,
    entityId,
    summary: summary || "",
    metadata: metadata || {},
    ipAddress: ipAddress || "",
    userAgent: userAgent || "",
  });
};

const listAuditLogs = async (query = {}) => {
  const filter = {};
  if (query.actor) filter.actor = query.actor;
  if (query.action) filter.action = query.action;
  if (query.entityType) filter.entityType = query.entityType;
  if (query.entityId) filter.entityId = query.entityId;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  return paginateQuery(AuditLog, filter, query, { createdAt: -1 });
};

const getEntityHistory = async (entityType, entityId) => {
  return AuditLog.find({ entityType, entityId })
    .populate("actor", "name email role")
    .sort({ createdAt: -1 });
};

const getActorActivity = async (actorId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await AuditLog.find({ actor: actorId, createdAt: { $gte: since } }).sort({
    createdAt: -1,
  });
  const byAction = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  return { actorId, periodDays: days, totalActions: logs.length, byAction, recent: logs.slice(0, 20) };
};

const getAuditSummary = async (days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const logs = await AuditLog.find({ createdAt: { $gte: since } });
  const byEntity = logs.reduce((acc, log) => {
    acc[log.entityType] = (acc[log.entityType] || 0) + 1;
    return acc;
  }, {});
  const byAction = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  return { periodDays: days, total: logs.length, byEntity, byAction };
};

module.exports = {
  recordAudit,
  listAuditLogs,
  getEntityHistory,
  getActorActivity,
  getAuditSummary,
  ACTIONS,
};
