const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      // Find personal notifications + broadcast notifications (where user is null)
      const notifications = await Notification.find({
        $or: [{ user: req.user._id }, { user: null }]
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return ApiResponse.success(res, { notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      if (id === 'all') {
        await Notification.updateMany({ $or: [{ user: req.user._id }, { user: null }] }, { isRead: true });
        return ApiResponse.success(res, null, 'All notifications marked as read');
      }

      await Notification.findByIdAndUpdate(id, { isRead: true });
      return ApiResponse.success(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async broadcastNotification(req, res, next) {
    try {
      const { title, message, type = 'PROMOTION', data = {} } = req.body;
      const notification = await Notification.create({
        user: null, // Broadcast to all
        title,
        message,
        type,
        data
      });

      return ApiResponse.created(res, notification, 'Promotional notification broadcasted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
