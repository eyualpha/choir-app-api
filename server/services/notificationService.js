const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { paginateQuery } = require("../utils/pagination");

const createNotification = async ({
  recipientId,
  title,
  body,
  category = "system",
  relatedId,
  relatedModel,
  metadata = {},
}) => {
  if (!recipientId || !title || !body) {
    throw new ValidationError("recipientId, title, and body are required");
  }
  const recipient = await User.findById(recipientId);
  if (!recipient) throw new NotFoundError("Recipient");
  return Notification.create({
    recipient: recipientId,
    title,
    body,
    category,
    relatedId,
    relatedModel,
    metadata,
  });
};

const notifyMany = async (recipientIds, payload) => {
  if (!Array.isArray(recipientIds) || !recipientIds.length) {
    throw new ValidationError("recipientIds must be a non-empty array");
  }
  const docs = recipientIds.map((recipientId) => ({
    recipient: recipientId,
    title: payload.title,
    body: payload.body,
    category: payload.category || "system",
    relatedId: payload.relatedId,
    relatedModel: payload.relatedModel,
    metadata: payload.metadata || {},
  }));
  return Notification.insertMany(docs);
};

const listNotifications = async (userId, query = {}) => {
  const filter = { recipient: userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead === "true";
  if (query.category) filter.category = query.category;
  return paginateQuery(Notification, filter, query, { createdAt: -1 });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });
  if (!notification) throw new NotFoundError("Notification");
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return result;
};

const getUnreadCount = async (userId) =>
  Notification.countDocuments({ recipient: userId, isRead: false });

const deleteNotification = async (notificationId, userId) => {
  const deleted = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
  if (!deleted) throw new NotFoundError("Notification");
  return deleted;
};

module.exports = {
  createNotification,
  notifyMany,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
