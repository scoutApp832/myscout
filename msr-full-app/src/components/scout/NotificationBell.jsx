import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dropdownRef = useRef(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Clear messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ✅ Fetch unread count (for badge)
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('🔔 Unread count response:', response.data);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('❌ Error fetching unread count:', err);
    }
  };

  // ✅ Fetch notifications (for dropdown)
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('⚠️ No token found');
        setNotifications([]);
        return;
      }

      console.log(
        '📡 Fetching notifications from:',
        `${API_URL}/notifications?limit=20`
      );

      const response = await axios.get(`${API_URL}/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Notification response:', response.data);

      // ✅ Handle different response structures
      let notifs = [];

      if (
        response.data?.success &&
        Array.isArray(response.data.notifications)
      ) {
        notifs = response.data.notifications;
      } else if (
        response.data?.notifications &&
        Array.isArray(response.data.notifications)
      ) {
        notifs = response.data.notifications;
      } else if (Array.isArray(response.data)) {
        notifs = response.data;
      }

      console.log(`✅ Found ${notifs.length} notifications`);

      if (notifs.length > 0) {
        console.log('📋 First notification:', notifs[0]);
      }

      setNotifications(notifs);

      if (response.data?.unreadCount !== undefined) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);

      if (err.response) {
        console.error('❌ Response status:', err.response.status);
        console.error('❌ Response data:', err.response.data);

        setError(
          err.response.data?.message || 'Failed to load notifications'
        );
      } else {
        setError('Network error. Please try again.');
      }

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark as read and navigate
  const markAsRead = async (id, link, metadata) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      setIsOpen(false);

      // ✅ IMPROVED LINK HANDLING
      let finalLink = link;

      // If link is empty, check metadata
      if (!finalLink && metadata) {
        finalLink =
          metadata.attendance_link || metadata.link || null;
      }

      // If still empty, check if notification has link in data
      if (!finalLink) {
        const notification = notifications.find((n) => n.id === id);

        if (notification) {
          finalLink =
            notification.link ||
            notification.metadata?.attendance_link ||
            null;
        }
      }

      console.log('🔗 Opening link:', finalLink);

      if (
        finalLink &&
        finalLink !== '#' &&
        finalLink !== '/#' &&
        finalLink !== ''
      ) {
        if (finalLink.startsWith('http')) {
          window.open(finalLink, '_blank');
        } else {
          navigate(finalLink);
        }
      } else {
        // If no link, just show a message or navigate to notifications page
        console.log('ℹ️ No link available for this notification');
        // Optionally navigate to notifications page
        // navigate('/notifications');
      }
    } catch (err) {
      console.error('❌ Error marking as read:', err);
      setError('Failed to mark as read');
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read: true }))
      );

      setUnreadCount(0);
      setSuccess('✅ All notifications marked as read');
    } catch (err) {
      console.error('❌ Error marking all as read:', err);
      setError('Failed to mark all as read');
    }
  };

  // ✅ DELETE SINGLE NOTIFICATION
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Remove from state
      const deletedNotif = notifications.find((n) => n.id === id);

      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );

      // ✅ Update unread count if it was unread
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setSuccess('✅ Notification deleted');
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  // ✅ DELETE ALL READ NOTIFICATIONS
  const handleDeleteAllRead = async () => {
    const readCount = notifications.filter(
      (n) => n.is_read
    ).length;

    if (readCount === 0) {
      setError('No read notifications to delete');
      return;
    }

    if (
      !window.confirm(
        `Delete ${readCount} read notification(s)?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `${API_URL}/notifications/read-all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ✅ Remove all read notifications from state
      setNotifications((prev) =>
        prev.filter((n) => !n.is_read)
      );

      setSuccess(
        `✅ ${readCount} read notification(s) deleted`
      );
    } catch (err) {
      console.error(
        '❌ Error deleting read notifications:',
        err
      );
      setError('Failed to delete read notifications');
    }
  };

  // ✅ DELETE ALL NOTIFICATIONS
  const handleDeleteAll = async () => {
    if (notifications.length === 0) {
      setError('No notifications to delete');
      return;
    }

    if (
      !window.confirm(
        `Delete all ${notifications.length} notifications? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `${API_URL}/notifications/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // ✅ Clear all notifications
      setNotifications([]);
      setUnreadCount(0);

      setSuccess(`✅ All notifications deleted`);
    } catch (err) {
      console.error(
        '❌ Error deleting all notifications:',
        err
      );
      setError('Failed to delete all notifications');
    }
  };

  // ✅ Toggle dropdown
  const toggleDropdown = () => {
    console.log(
      '🔔 Toggling dropdown, isOpen:',
      isOpen
    );

    if (!isOpen) {
      console.log(
        '🔔 Opening dropdown, fetching notifications...'
      );
      fetchNotifications();
    }

    setIsOpen(!isOpen);
  };

  // ✅ Format time ago
  const timeAgo = (date) => {
    if (!date) return 'Just now';

    try {
      const now = new Date();
      const diff = now - new Date(date);

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;

      return new Date(date).toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  // ✅ Get notification icon
  const getIcon = (type) => {
    const icons = {
      announcement: 'fa-bullhorn',
      event: 'fa-calendar-alt',
      course: 'fa-book',
      payment: 'fa-money-bill',
      achievement: 'fa-trophy',
      attendance: 'fa-clipboard-check',
      system: 'fa-cog',
      warning: 'fa-exclamation-triangle',
      success: 'fa-check-circle',
      info: 'fa-info-circle'
    };

    return icons[type] || 'fa-bell';
  };

  // ✅ Get notification color
  const getColor = (type) => {
    const colors = {
      announcement: '#FFD100',
      event: '#0d6efd',
      course: '#6f42c1',
      payment: '#28a745',
      achievement: '#fd7e14',
      attendance: '#6A1B9A',
      system: '#6c757d',
      warning: '#dc3545',
      success: '#28a745',
      info: '#17a2b8'
    };

    return colors[type] || '#6c757d';
  };

  // ✅ Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // ✅ Get notification action text
  const getActionText = (type) => {
    const actions = {
      attendance: '📋 Mark Attendance',
      announcement: '📢 Read More',
      event: '📅 View Event',
      course: '📚 View Course',
      payment: '💳 View Payment',
      achievement: '🏆 View Achievement'
    };

    return actions[type] || '🔗 View Details';
  };

  return (
    <div
      className="notification-bell"
      ref={dropdownRef}
    >
      {/* Bell Button */}
      <button
        className={`bell-button ${
          unreadCount > 0 ? 'has-notifications' : ''
        }`}
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>

        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="dropdown-header">
            <h4>
              <i className="fas fa-bell"></i>
              Notifications

              {unreadCount > 0 && (
                <span className="unread-badge">
                  {unreadCount} new
                </span>
              )}
            </h4>

            <div className="header-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read"
                  onClick={markAllAsRead}
                >
                  <i className="fas fa-check-double"></i>
                  Mark All Read
                </button>
              )}

              {notifications.some(
                (n) => n.is_read
              ) && (
                <button
                  className="delete-all-read"
                  onClick={handleDeleteAllRead}
                >
                  <i className="fas fa-trash"></i>
                  Delete Read
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  className="delete-all"
                  onClick={handleDeleteAll}
                >
                  <i className="fas fa-trash-alt"></i>
                  Delete All
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="notification-message error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="notification-message success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          {/* Body */}
          <div className="dropdown-body">
            {loading ? (
              <div className="loading">
                <div className="spinner-small"></div>
                <span>Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications</p>
                <span className="empty-sub">
                  You're all caught up!
                </span>
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread =
                  notification.is_read === false &&
                  notification.read !== true;

                const icon =
                  notification.icon ||
                  getIcon(notification.type);

                const color =
                  notification.color ||
                  getColor(notification.type);

                const actionText =
                  getActionText(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      isUnread ? 'unread' : ''
                    }`}
                  >
                    <div
                      className="notification-icon"
                      style={{
                        backgroundColor:
                          color + '20',
                        color: color
                      }}
                    >
                      <i
                        className={`fas ${icon}`}
                      ></i>
                    </div>

                    <div
                      className="notification-content"
                      onClick={() =>
                        markAsRead(
                          notification.id,
                          notification.link
                        )
                      }
                    >
                      <div className="notification-title">
                        {notification.title}

                        {isUnread && (
                          <span className="new-dot">
                            ●
                          </span>
                        )}
                      </div>

                      <div className="notification-message">
                        {notification.message}
                      </div>

                      <div className="notification-actions-row">
                        <span className="notification-action">
                          {actionText}
                        </span>

                        <span className="notification-time">
                          {timeAgo(
                            notification.created_at
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ✅ DELETE BUTTON */}
                    <button
                      className="notification-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(
                          notification.id
                        );
                      }}
                      title="Delete notification"
                    >
                      <i className="fas fa-times"></i>
                    </button>

                    {isUnread && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="dropdown-footer">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-bell {
          position: relative;
          display: inline-block;
          max-width: 100%;
        }

        .bell-button {
          position: relative;
          background: none;
          border: none;
          font-size: 22px;
          color: #4a5568;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bell-button:hover {
          background: #f0f0f0;
        }

        .bell-button.has-notifications {
          color: #2b6cb0;
        }

        .bell-button .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #e53e3e;
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 50%;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1.5s infinite;
          box-sizing: border-box;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.1);
          }
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 460px;
          max-width: calc(100vw - 24px);
          max-height: 580px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideDown 0.2s ease;
          box-sizing: border-box;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
          flex-wrap: wrap;
          gap: 8px;
          min-width: 0;
        }

        .dropdown-header h4 {
          margin: 0;
          font-size: 16px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex-wrap: wrap;
        }

        .dropdown-header h4 i {
          color: #2b6cb0;
          flex-shrink: 0;
        }

        .unread-badge {
          background: #2b6cb0;
          color: white;
          padding: 1px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          min-width: 0;
        }

        .mark-all-read,
        .delete-all-read,
        .delete-all {
          background: none;
          border: none;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .mark-all-read {
          color: #2b6cb0;
        }

        .mark-all-read:hover {
          background: #dbeafe;
        }

        .delete-all-read {
          color: #e53e3e;
        }

        .delete-all-read:hover {
          background: #fed7d7;
        }

        .delete-all {
          color: #dc3545;
        }

        .delete-all:hover {
          background: #fed7d7;
        }

        .notification-message {
          padding: 10px 16px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #e5e7eb;
          min-width: 0;
          box-sizing: border-box;
        }

        .notification-message.error {
          background: #fef2f2;
          color: #991b1b;
        }

        .notification-message.success {
          background: #f0fdf4;
          color: #065f46;
        }

        .dropdown-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 400px;
          min-height: 0;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          color: #6b7280;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #2b6cb0;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        .empty {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
          box-sizing: border-box;
        }

        .empty i {
          font-size: 36px;
          color: #d1d5db;
          margin-bottom: 10px;
        }

        .empty p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }

        .empty-sub {
          font-size: 13px;
          color: #9ca3af;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f1f3f4;
          position: relative;
          min-width: 0;
          box-sizing: border-box;
        }

        .notification-item:hover {
          background: #f7fafc;
        }

        .notification-item.unread {
          background: #f0f7ff;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
          cursor: pointer;
          overflow: hidden;
        }

        .notification-title {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          word-break: break-word;
        }

        .new-dot {
          color: #2b6cb0;
          font-size: 10px;
          flex-shrink: 0;
        }

        .notification-message {
          color: #6b7280;
          font-size: 13px;
          margin-top: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          padding: 0;
          border: none;
          background: none;
          word-break: break-word;
        }

        .notification-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          flex-wrap: wrap;
          gap: 4px;
          min-width: 0;
        }

        .notification-action {
          font-size: 12px;
          font-weight: 600;
          color: #2b6cb0;
          word-break: break-word;
        }

        .notification-time {
          color: #a0aec0;
          font-size: 11px;
          white-space: nowrap;
        }

        .unread-indicator {
          width: 6px;
          height: 6px;
          background: #2b6cb0;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .notification-delete {
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 12px;
          transition: all 0.2s;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notification-delete:hover {
          color: #e53e3e;
          background: #fed7d7;
        }

        .dropdown-footer {
          padding: 10px 16px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          flex-shrink: 0;
        }

        .dropdown-footer button {
          background: none;
          border: none;
          color: #2b6cb0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          max-width: 100%;
        }

        .dropdown-footer button:hover {
          text-decoration: underline;
        }

        /* =========================================
           TABLET
           ========================================= */
        @media (max-width: 768px) {
          .notification-dropdown {
            width: min(460px, calc(100vw - 24px));
            max-width: calc(100vw - 24px);
            right: 0;
            max-height: min(580px, calc(100vh - 80px));
          }

          .dropdown-header {
            flex-direction: column;
            align-items: stretch;
          }

          .dropdown-header h4 {
            width: 100%;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .notification-item {
            padding: 10px 12px;
          }

          .dropdown-body {
            max-height: min(400px, calc(100vh - 230px));
          }
        }

        /* =========================================
           SMALL TABLETS / LARGE PHONES
           ========================================= */
        @media (max-width: 600px) {
          .notification-dropdown {
            width: calc(100vw - 20px);
            max-width: calc(100vw - 20px);
            right: 0;
            border-radius: 10px;
          }

          .dropdown-header {
            padding: 12px;
          }

          .header-actions {
            gap: 4px;
          }

          .mark-all-read,
          .delete-all-read,
          .delete-all {
            font-size: 11px;
            padding: 4px 6px;
          }

          .notification-item {
            gap: 9px;
            padding: 10px;
          }

          .notification-icon {
            width: 34px;
            height: 34px;
            font-size: 13px;
          }

          .notification-title {
            font-size: 13px;
          }

          .notification-message {
            font-size: 12px;
          }

          .notification-action {
            font-size: 11px;
          }

          .notification-time {
            font-size: 10px;
          }
        }

        /* =========================================
           MOBILE
           ========================================= */
        @media (max-width: 480px) {
          .notification-bell {
            max-width: 100%;
          }

          .bell-button {
            font-size: 20px;
            padding: 7px;
          }

          .bell-button .badge {
            font-size: 10px;
            min-width: 17px;
            height: 17px;
            padding: 2px 5px;
          }

          .notification-dropdown {
            position: fixed;
            top: 60px;
            left: 10px;
            right: 10px;
            width: auto;
            max-width: none;
            max-height: calc(100vh - 75px);
            border-radius: 10px;
          }

          .dropdown-header {
            padding: 10px;
          }

          .dropdown-header h4 {
            font-size: 14px;
            gap: 6px;
          }

          .unread-badge {
            font-size: 10px;
            padding: 1px 7px;
          }

          .header-actions {
            width: 100%;
            display: flex;
            align-items: stretch;
            justify-content: flex-start;
          }

          .header-actions button {
            font-size: 10px;
            padding: 4px 5px;
          }

          .notification-item {
            padding: 9px;
            gap: 8px;
          }

          .notification-icon {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }

          .notification-title {
            font-size: 12px;
            line-height: 1.35;
          }

          .notification-message {
            font-size: 11px;
            line-height: 1.4;
          }

          .notification-actions-row {
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            gap: 2px;
          }

          .notification-action {
            font-size: 10px;
          }

          .notification-time {
            font-size: 9px;
          }

          .notification-delete {
            padding: 4px;
            font-size: 11px;
          }

          .unread-indicator {
            width: 5px;
            height: 5px;
          }

          .dropdown-footer {
            padding: 9px 10px;
          }

          .dropdown-footer button {
            font-size: 13px;
          }

          .dropdown-body {
            max-height: calc(100vh - 215px);
          }

          .loading {
            padding: 30px 15px;
          }

          .empty {
            padding: 30px 15px;
          }
        }

        /* =========================================
           VERY SMALL PHONES
           ========================================= */
        @media (max-width: 360px) {
          .notification-dropdown {
            top: 55px;
            left: 6px;
            right: 6px;
          }

          .dropdown-header {
            padding: 9px;
          }

          .header-actions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3px;
          }

          .header-actions button {
            width: 100%;
            justify-content: center;
          }

          .notification-item {
            padding: 8px;
            gap: 7px;
          }

          .notification-icon {
            width: 30px;
            height: 30px;
            font-size: 11px;
          }

          .notification-title {
            font-size: 11px;
          }

          .notification-message {
            font-size: 10px;
          }

          .notification-action {
            font-size: 9px;
          }

          .notification-time {
            font-size: 9px;
          }

          .notification-delete {
            padding: 3px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;