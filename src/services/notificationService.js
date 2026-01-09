/**
 * Notification Service
 * Manages notifications and activity logs
 */

let notifications = [];
let subscribers = [];

// Load from localStorage
const loadNotifications = () => {
  try {
    const saved = localStorage.getItem('lendwise_notifications');
    if (saved) {
      notifications = JSON.parse(saved);
    }
  } catch (e) {
    notifications = [];
  }
};

// Save to localStorage
const saveNotifications = () => {
  localStorage.setItem('lendwise_notifications', JSON.stringify(notifications));
  notifySubscribers();
};

// Notify all subscribers
const notifySubscribers = () => {
  subscribers.forEach(callback => callback([...notifications]));
};

// Initialize
loadNotifications();

export const notificationService = {
  /**
   * Add a new notification
   */
  add(notification) {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      ...notification,
      read: false,
      timestamp: new Date().toLocaleString(),
    };
    notifications.unshift(newNotification);
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
    }
    saveNotifications();
    return newNotification;
  },

  /**
   * Get all notifications
   */
  getAll() {
    return [...notifications];
  },

  /**
   * Mark notification as read
   */
  markAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      saveNotifications();
    }
  },

  /**
   * Clear all notifications
   */
  clearAll() {
    notifications = [];
    saveNotifications();
  },

  /**
   * Subscribe to notification changes
   */
  subscribe(callback) {
    subscribers.push(callback);
    return () => {
      subscribers = subscribers.filter(cb => cb !== callback);
    };
  },
};

