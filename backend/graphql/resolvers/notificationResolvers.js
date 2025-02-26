import { Notification } from "../../models/index.js";

const notificationResolvers = {
  Query: {
    // Get all notifications for a user
    getUserNotifications: async (_, { userId, limit = 20, offset = 0 }) => {
      return await Notification.find({ userId })
        .sort({ createdAt: -1 }) // Newest first
        .skip(offset)
        .limit(limit);
    },
    
    // Get unread notification count
    getUnreadNotificationCount: async (_, { userId }) => {
      return await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });
    }
  },

  Mutation: {
    // Mark a single notification as read
    markNotificationRead: async (_, { id, userId }) => {
      // Check if notification belongs to user
      const notification = await Notification.findById(id);
      
      if (!notification) {
        throw new Error("Notification not found");
      }
      
      if (notification.userId !== userId) {
        throw new Error("You don't have permission to update this notification");
      }
      
      return await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
    },
    
    // Mark all notifications for a user as read
    markAllNotificationsRead: async (_, { userId }) => {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      
      return true;
    },
    
    // Delete a notification
    deleteNotification: async (_, { id, userId }) => {
      // Check if notification belongs to user
      const notification = await Notification.findById(id);
      
      if (!notification) {
        throw new Error("Notification not found");
      }
      
      if (notification.userId !== userId) {
        throw new Error("You don't have permission to delete this notification");
      }
      
      await Notification.findByIdAndDelete(id);
      return true;
    },
    
    // Delete all notifications for a user
    deleteAllNotifications: async (_, { userId }) => {
      await Notification.deleteMany({ userId });
      return true;
    }
  }
};

export default notificationResolvers;