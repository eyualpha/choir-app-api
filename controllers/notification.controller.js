const notificationService = require("../services/notificationService");
const { created, success } = require("../utils/apiResponse");

const listMine = async (req, res) => {
  const result = await notificationService.listNotifications(req.user.id, req.query);
  return success(res, { notifications: result.items, meta: result.meta });
};

const unreadCount = async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  return success(res, { count });
};

const markRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  return success(res, { notification });
};

const markAllRead = async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return success(res, { result }, "All notifications marked as read");
};

const remove = async (req, res) => {
  const notification = await notificationService.deleteNotification(req.params.id, req.user.id);
  return success(res, { notification }, "Notification deleted");
};

const createForMember = async (req, res) => {
  const notification = await notificationService.createNotification({
    recipientId: req.body.recipientId,
    title: req.body.title,
    body: req.body.body,
    category: req.body.category,
    relatedId: req.body.relatedId,
    relatedModel: req.body.relatedModel,
    metadata: req.body.metadata,
  });
  return created(res, { notification });
};

module.exports = {
  listMine,
  unreadCount,
  markRead,
  markAllRead,
  remove,
  createForMember,
};
