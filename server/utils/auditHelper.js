const { recordAudit } = require("../services/auditService");

const auditFromRequest = async (req, { action, entityType, entityId, summary, metadata }) => {
  try {
    await recordAudit({
      actorId: req.user?.id,
      action,
      entityType,
      entityId,
      summary,
      metadata,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

module.exports = { auditFromRequest };
