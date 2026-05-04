const Category     = require("../models/Category.model");
const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/response.util");

const getCategories = async (req, res) => {
  try {
    const { type } = req.query; 
    const filter = { isActive: true };
    if (type) filter.type = type;

    const categories = await Category.find(filter).lean();
    return sendSuccess(res, { categories });
  } catch (err) {
    return sendError(res, "Failed to fetch categories", 500);
  }
};

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 50);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments({ userId: req.user.id }),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    return sendSuccess(res, { notifications, unreadCount, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    return sendError(res, "Failed to fetch notifications", 500);
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return sendError(res, "Notification not found", 404);
    return sendSuccess(res, { notification });
  } catch (err) {
    return sendError(res, "Failed to update notification", 500);
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return sendSuccess(res, {}, "All notifications marked as read");
  } catch (err) {
    return sendError(res, "Failed to update notifications", 500);
  }
};

module.exports = {
  getCategories,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
