import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load notifications from service
    const loadNotifications = () => {
      const allNotifications = notificationService.getAll();
      setNotifications(allNotifications);
    };

    loadNotifications();

    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id) => {
    notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
  };
}

