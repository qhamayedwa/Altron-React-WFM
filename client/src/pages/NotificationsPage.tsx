import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  priority: string;
  category: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
  notification_types: {
    display_name: string;
    icon: string;
    color: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? '?unread_only=true' : '';
      const response = await apiClient.get(`/notifications${params}`);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.post(`/notifications/${id}/mark-read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/mark-all-read');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      urgent: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary',
    };
    return badges[priority] || 'secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2>
            <i className="bi bi-bell me-2"></i>
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount}</span>
            )}
          </h2>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
        <div className="col-md-6 text-end">
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-outline-secondary" onClick={markAllAsRead}>
              <i className="bi bi-check-all me-1"></i>
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-inbox me-2"></i>
          {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
        </div>
      ) : (
        <div className="list-group">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`list-group-item list-group-item-action ${!notification.is_read ? 'list-group-item-light border-start border-primary border-3' : ''}`}
            >
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <span className={`badge bg-${getPriorityBadge(notification.priority)} me-2`}>
                      {notification.priority.toUpperCase()}
                    </span>
                    <span className="badge bg-secondary me-2">
                      {notification.category || 'General'}
                    </span>
                    <small className="text-muted">
                      {formatDate(notification.created_at)}
                    </small>
                  </div>
                  
                  <h6 className="mb-1 fw-bold">{notification.title}</h6>
                  <p className="mb-2">{notification.message}</p>
                  
                  {notification.action_url && notification.action_text && (
                    <Link
                      to={notification.action_url}
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      {notification.action_text}
                    </Link>
                  )}
                  
                  {!notification.is_read && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <i className="bi bi-check me-1"></i>
                      Mark as Read
                    </button>
                  )}
                </div>
                
                {!notification.is_read && (
                  <span className="badge bg-primary rounded-pill ms-2">New</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
