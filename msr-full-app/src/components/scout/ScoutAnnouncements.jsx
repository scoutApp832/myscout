import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ScoutAnnouncements = () => {
  const { user } = useAuth();
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const hasFetched = useRef(false);
  const unreadRef = useRef(0);

  // ✅ Get the correct API endpoint based on user role
  const getApiUrl = () => {
    const userRole = user?.role;
    
    if (!userRole) {
      return `${API_URL}/scout/announcements`;
    }
    
    if (userRole === 'national_commissioner' || 
        userRole === 'national-commissioner' || 
        userRole === 'super_admin' || 
        userRole === 'admin') {
      return `${API_URL}/national/announcements`;
    } else if (userRole === 'district_commissioner' || userRole === 'district_commissioner') {
      return `${API_URL}/district/announcements`;
    } else {
      return `${API_URL}/scout/announcements`;
    }
  };

  // ✅ Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view announcements');
        setLoading(false);
        return;
      }

      console.log('📢 Fetching announcements...');
      
      const apiUrl = getApiUrl();
      console.log(`📢 Fetching from: ${apiUrl}`);

      const response = await axios.get(apiUrl, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let announcementsData = [];
      
      // ✅ Handle different response structures
      if (response.data?.success) {
        announcementsData = response.data.announcements || [];
      } else if (Array.isArray(response.data)) {
        announcementsData = response.data;
      } else if (response.data?.data?.announcements) {
        announcementsData = response.data.data.announcements;
      }

      console.log(`📢 Found ${announcementsData.length} announcements`);

      // ✅ Format announcements
      const formattedAnnouncements = announcementsData.map(item => {
        const readKey = `announcement_read_${item.id}`;
        const isRead = localStorage.getItem(readKey) === 'true';
        
        return {
          id: item.id,
          title: item.title || 'Untitled',
          content: item.content || item.message || '',
          message: item.content || item.message || '',
          announcement_type: item.announcement_type || item.type || 'general',
          type: item.announcement_type || item.type || 'general',
          district: item.district || 'all',
          audience: item.audience || ['all'],
          status: item.status || 'published',
          author_id: item.author_id || item.created_by,
          author: item.author || item.creator || { full_name: 'Commissioner' },
          is_pinned: item.is_pinned || false,
          is_public: item.is_public || false,
          created_at: item.created_at || item.createdAt || new Date().toISOString(),
          updated_at: item.updated_at || item.updatedAt,
          published_at: item.published_at || item.publishedAt,
          is_read: isRead,
          read: isRead
        };
      });

      const unread = formattedAnnouncements.filter(a => !a.is_read).length;
      
      setAnnouncements(formattedAnnouncements);
      setUnreadCount(unread);
      unreadRef.current = unread;
      setLastChecked(new Date());
      
      console.log(`📢 ${formattedAnnouncements.length} announcements, ${unread} unread`);
      
    } catch (err) {
      console.error('❌ Error fetching announcements:', err);
      
      let errorMessage = 'Failed to load announcements';
      if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view announcements';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to view announcements';
      } else if (err.response?.status === 404) {
        errorMessage = 'Announcements endpoint not found. Please contact support.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Mark a single announcement as read
  const markAsRead = (id) => {
    const readKey = `announcement_read_${id}`;
    
    if (localStorage.getItem(readKey) === 'true') {
      return;
    }
    
    localStorage.setItem(readKey, 'true');
    
    setAnnouncements(prev =>
      prev.map(a => 
        a.id === id ? { ...a, is_read: true, read: true } : a
      )
    );
    
    const newUnreadCount = Math.max(0, unreadRef.current - 1);
    setUnreadCount(newUnreadCount);
    unreadRef.current = newUnreadCount;
    
    console.log(`📢 Marked announcement ${id} as read, ${newUnreadCount} remaining`);
  };

  // ✅ Mark all announcements as read
  const markAllAsRead = () => {
    announcements.forEach(a => {
      const readKey = `announcement_read_${a.id}`;
      localStorage.setItem(readKey, 'true');
    });
    
    setAnnouncements(prev =>
      prev.map(a => ({ ...a, is_read: true, read: true }))
    );
    
    setUnreadCount(0);
    unreadRef.current = 0;
    
    console.log('📢 All announcements marked as read');
  };

  // ✅ Refresh announcements
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  // ✅ Initial fetch and auto-refresh
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAnnouncements();
    }
    
    const intervalId = setInterval(() => {
      fetchAnnouncements();
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [user]); // ✅ Re-fetch when user changes

  // ✅ Filter announcements
  const getFilteredAnnouncements = () => {
    if (filter === 'unread') {
      return announcements.filter(a => !a.is_read && !a.read);
    }
    return announcements;
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  // ✅ Helper functions
  const getTypeColor = (type) => {
    const types = {
      'urgent': 'red',
      'important': 'orange',
      'event': 'blue',
      'course': 'purple',
      'achievement': 'green',
      'general': 'gray',
      'information': 'teal',
      'notice': 'indigo'
    };
    return types[type] || 'gray';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'urgent': 'fa-exclamation-triangle',
      'important': 'fa-flag',
      'event': 'fa-calendar-alt',
      'course': 'fa-book',
      'achievement': 'fa-trophy',
      'general': 'fa-bullhorn',
      'information': 'fa-info-circle',
      'notice': 'fa-clipboard-list'
    };
    return icons[type] || 'fa-bullhorn';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-RW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'urgent': 'Urgent',
      'important': 'Important',
      'event': 'Event',
      'course': 'Course',
      'achievement': 'Achievement',
      'general': 'General',
      'information': 'Information',
      'notice': 'Notice'
    };
    return labels[type] || 'General';
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="scout-announcements-container">
        <div className="announcements-loading-section">
          <div className="spinner-small"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="scout-announcements-container">
        <div className="announcements-error-section">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => {
            setError('');
            fetchAnnouncements();
          }} className="btn-retry">
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scout-announcements-container">
      {/* Header */}
      <div className="announcements-header">
        <div className="header-left">
          <h2>
            <i className="fas fa-bullhorn" style={{ color: '#FFD100' }}></i>
            Announcements
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </h2>
        </div>
        <div className="header-right">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({announcements.length})
            </button>
            <button 
              className={filter === 'unread' ? 'active' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button 
              className="btn-mark-all-read"
              onClick={markAllAsRead}
            >
              <i className="fas fa-check-double"></i> Mark All Read
            </button>
          )}
          <button 
            className="btn-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Last checked */}
      {lastChecked && (
        <div className="last-checked">
          <i className="far fa-clock"></i>
          Last updated: {lastChecked.toLocaleTimeString()}
        </div>
      )}

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-bell-slash"></i>
          <h3>No announcements</h3>
          <p>
            {filter === 'unread' 
              ? "You have no unread announcements." 
              : "No announcements available."}
          </p>
        </div>
      ) : (
        <div className="announcements-list">
          {filteredAnnouncements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`announcement-card ${!announcement.is_read && !announcement.read ? 'unread' : ''} ${announcement.is_pinned ? 'pinned' : ''}`}
              onClick={() => {
                if (!announcement.is_read && !announcement.read) {
                  markAsRead(announcement.id);
                }
              }}
            >
              {/* Badges */}
              <div className="announcement-badge">
                {announcement.is_pinned && (
                  <span className="badge-pinned">
                    <i className="fas fa-thumbtack"></i> Pinned
                  </span>
                )}
                <span className={`badge-type ${getTypeColor(announcement.announcement_type)}`}>
                  <i className={`fas ${getTypeIcon(announcement.announcement_type)}`}></i>
                  {getTypeLabel(announcement.announcement_type)}
                </span>
                {!announcement.is_read && !announcement.read && (
                  <span className="badge-new">NEW</span>
                )}
              </div>

              {/* Title */}
              <h3 className="announcement-title">
                {announcement.title}
              </h3>

              {/* Content */}
              <div className="announcement-content">
                <p>{announcement.content}</p>
              </div>

              {/* Footer */}
              <div className="announcement-footer">
                <div className="footer-left">
                  <span className="announcement-author">
                    <i className="fas fa-user"></i>
                    {announcement.author?.full_name || 'Commissioner'}
                  </span>
                  <span className="announcement-date">
                    <i className="far fa-calendar"></i>
                    {formatDate(announcement.created_at)}
                  </span>
                  {announcement.district && announcement.district !== 'all' && (
                    <span className="announcement-district">
                      <i className="fas fa-map-marker-alt"></i>
                      {announcement.district}
                    </span>
                  )}
                </div>
                <div className="footer-right">
                  {!announcement.is_read && !announcement.read && (
                    <span className="unread-indicator">
                      <i className="fas fa-circle"></i> Unread
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .scout-announcements-container {
          max-width: 950px;
          margin: 0 auto;
          padding: 20px;
          min-height: 300px;
        }

        .announcements-loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #6B7280;
          min-height: 200px;
        }

        .spinner-small {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #2b6cb0;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .announcements-error-section {
          text-align: center;
          padding: 40px 20px;
          color: #e53e3e;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .announcements-error-section i {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .announcements-error-section p {
          margin-bottom: 16px;
          color: #4a5568;
        }

        .btn-retry {
          padding: 8px 20px;
          background: #2b6cb0;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-retry:hover {
          background: #1a4f8b;
        }

        .announcements-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .header-left h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .badge {
          background: #e53e3e;
          color: white;
          padding: 2px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          animation: pulse-badge 1.5s infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-buttons {
          display: flex;
          gap: 6px;
        }

        .filter-buttons button {
          padding: 6px 14px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          color: #4a5568;
          transition: all 0.2s;
        }

        .filter-buttons button:hover {
          background: #f7fafc;
          border-color: #a0aec0;
        }

        .filter-buttons button.active {
          background: #2b6cb0;
          color: white;
          border-color: #2b6cb0;
        }

        .btn-mark-all-read {
          padding: 6px 14px;
          background: #805ad5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-mark-all-read:hover {
          background: #6b46c1;
        }

        .btn-refresh {
          padding: 6px 14px;
          background: #38a169;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #2f855a;
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .last-checked {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #4a5568;
        }

        .empty-state i {
          font-size: 48px;
          color: #a0aec0;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .empty-state p {
          color: #718096;
        }

        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .announcement-card {
          background: white;
          border-radius: 12px;
          padding: 20px 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
          cursor: pointer;
        }

        .announcement-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .announcement-card.unread {
          border-left: 4px solid #2b6cb0;
          background: #f7fafc;
        }

        .announcement-card.pinned {
          border: 2px solid #ecc94b;
          background: #fefcbf;
        }

        .announcement-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .badge-pinned {
          background: #ecc94b;
          color: #744210;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-type {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .badge-type.red { background: #fed7d7; color: #9b2c2c; }
        .badge-type.orange { background: #fef3c7; color: #975a16; }
        .badge-type.blue { background: #dbeafe; color: #1e40af; }
        .badge-type.purple { background: #e9d8fd; color: #6b46c1; }
        .badge-type.green { background: #c6f6d5; color: #276749; }
        .badge-type.gray { background: #e2e8f0; color: #4a5568; }
        .badge-type.teal { background: #c4f1f9; color: #234e52; }
        .badge-type.indigo { background: #c3dafe; color: #3730a3; }

        .badge-new {
          background: #2b6cb0;
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .announcement-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .announcement-content p {
          color: #4a5568;
          line-height: 1.7;
          margin: 0 0 16px 0;
        }

        .announcement-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .announcement-author,
        .announcement-date,
        .announcement-district {
          font-size: 13px;
          color: #6B7280;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .footer-right {
          display: flex;
          align-items: center;
        }

        .unread-indicator {
          font-size: 12px;
          color: #2b6cb0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .unread-indicator i {
          font-size: 8px;
        }

        @media (max-width: 768px) {
          .announcements-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-right {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-buttons {
            flex: 1;
          }

          .filter-buttons button {
            flex: 1;
            text-align: center;
          }

          .btn-mark-all-read,
          .btn-refresh {
            width: 100%;
            justify-content: center;
          }

          .announcement-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .footer-right {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 480px) {
          .scout-announcements-container {
            padding: 10px;
          }

          .announcement-card {
            padding: 16px;
          }

          .announcement-title {
            font-size: 17px;
          }

          .badge-type,
          .badge-pinned,
          .badge-new {
            font-size: 10px;
            padding: 1px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScoutAnnouncements;