// src/components/common/NotificationBadge.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/scout/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data?.success) {
        const count = response.data.unreadCount || 0;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('❌ Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate('/notifications');
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <button 
      className={`notification-badge ${unreadCount > 0 ? 'has-notifications' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${unreadCount} unread notifications`}
      aria-label={`${unreadCount} unread notifications`}
    >
      <i className="fas fa-bell"></i>
      {unreadCount > 0 && (
        <span className="badge-count">{unreadCount}</span>
      )}
      {showTooltip && unreadCount > 0 && (
        <div className="notification-tooltip">
          You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </div>
      )}
    </button>
  );
};

export default NotificationBadge;