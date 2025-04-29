import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './authContext';
import { BASE_URL } from '../config';

export type Notification = {
  _id: string;
  type: 'room_invitation' | 'system';
  message: string;
  roomId?: string;
  read: boolean;
  createdAt: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  clearError: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_URL = BASE_URL;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update unread count when user or notifications change
  useEffect(() => {
    if (user) {
      setUnreadCount(user.unreadNotifications || 0);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Fetch notifications when token changes or component mounts
  useEffect(() => {
    if (token) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch notifications error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setNotifications(notifications.map(notification => 
          notification._id === notificationId ? { ...notification, read: true } : notification
        ));
        return true;
      } else {
        setError(data.error || 'Failed to mark notification as read');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Mark notification error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        return true;
      } else {
        setError(data.error || 'Failed to mark all notifications as read');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Mark all notifications error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    if (!token) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setNotifications(notifications.filter(notification => notification._id !== notificationId));
        return true;
      } else {
        setError(data.error || 'Failed to delete notification');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Delete notification error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};