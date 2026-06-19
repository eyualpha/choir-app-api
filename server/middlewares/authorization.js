const { ForbiddenError } = require("../utils/errors");

const requireSelfOrAdmin = (paramName = "memberId") => (req, _res, next) => {
  const targetId = req.params[paramName];
  if (!targetId) return next(new ForbiddenError());

  const isSelf = String(req.user.id) === String(targetId);
  const isAdminUser = req.user.role === "admin";

  if (isSelf || isAdminUser) return next();
  return next(new ForbiddenError());
};

const requireSelfOrAdminFromUserId = (paramName = "userId") => (req, _res, next) => {
  const targetId = req.params[paramName];
  if (!targetId) return next(new ForbiddenError());

  const isSelf = String(req.user.id) === String(targetId);
  const isAdminUser = req.user.role === "admin";

  if (isSelf || isAdminUser) return next();
  return next(new ForbiddenError());
};

module.exports = { requireSelfOrAdmin, requireSelfOrAdminFromUserId };
