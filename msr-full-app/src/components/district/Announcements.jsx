import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    audience: ['all'],
    send_email: false,
    signature: ''
  });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [user?.role]);

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

      let apiUrl;
      if (user?.role === 'national_commissioner') {
        apiUrl = `${API_URL}/national/announcements`;
      } else if (user?.role === 'district_commissioner') {
        apiUrl = `${API_URL}/district/announcements`;
      } else if (user?.role === 'unit_leader' || user?.role === 'scout') {
        apiUrl = `${API_URL}/scout/announcements`;
      } else {
        apiUrl = `${API_URL}/announcements`;
      }
      
      console.log(`📢 Fetching announcements from: ${apiUrl}`);
      console.log(`👤 User role: ${user?.role}`);

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Announcements response:', response.data);

      let announcementsData = [];
      if (response.data?.success) {
        announcementsData = response.data.announcements || [];
      } else if (Array.isArray(response.data)) {
        announcementsData = response.data;
      } else if (response.data?.data) {
        announcementsData = response.data.data;
      } else if (response.data?.announcements) {
        announcementsData = response.data.announcements;
      }

      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      
    } catch (err) {
      console.error('❌ Fetch announcements error:', err);
      
      if (err.response?.status === 403) {
        setError('You do not have permission to view announcements');
      } else if (err.response?.status === 401) {
        setError('Please login to view announcements');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to load announcements');
      }
      
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchAnnouncements();
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setCreateError('Title and content are required');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');

      const token = localStorage.getItem('token');
      const userDistrict = user?.member?.district || user?.district;
      
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type || 'general',
        district: userDistrict || 'all',
        audience: formData.audience || ['all'],
        send_email: formData.send_email || false,
        signature: formData.signature || user?.full_name || 'District Commissioner'
      };

      console.log('📤 Creating announcement:', payload);

      const response = await axios.post(`${API_URL}/district/announcements`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Announcement created:', response.data);

      // Reset form and close modal
      setFormData({
        title: '',
        content: '',
        type: 'general',
        audience: ['all'],
        send_email: false,
        signature: ''
      });
      setShowCreateModal(false);
      
      // Refresh announcements
      await fetchAnnouncements();
      
    } catch (err) {
      console.error('❌ Create announcement error:', err);
      setCreateError(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleAudienceChange = (value) => {
    let newAudience = [];
    if (value === 'all') {
      newAudience = ['all'];
    } else if (value === 'scouts') {
      newAudience = ['scout'];
    } else if (value === 'unit_leaders') {
      newAudience = ['unit_leader'];
    } else if (value === 'district_commissioners') {
      newAudience = ['district_commissioner'];
    } else {
      newAudience = [value];
    }
    setFormData({ ...formData, audience: newAudience });
  };

  if (loading) {
    return (
      <div className="announcements-loading">
        <div className="spinner"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="announcements-error">
        <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: '#dc3545' }}></i>
        <h3>Error Loading Announcements</h3>
        <p>{error}</p>
        <button onClick={handleRetry} className="btn-primary">
          <i className="fas fa-redo"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <h2>
          <i className="fas fa-bullhorn" style={{ color: '#006B3F' }}></i> 
          Announcements
          <span className="announcement-count">{announcements.length}</span>
        </h2>
        {(user?.role === 'district_commissioner' || user?.role === 'national_commissioner') && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i> New Announcement
          </button>
        )}
      </div>

      <div className="announcements-list">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="announcement-card">
            <div className="announcement-header">
              <div className="announcement-title">
                <h3>{announcement.title}</h3>
                <span className={`announcement-type ${announcement.announcement_type || 'general'}`}>
                  {announcement.announcement_type || 'general'}
                </span>
              </div>
              <div className="announcement-meta">
                {announcement.district === 'all' && (
                  <span className="national-badge">
                    <i className="fas fa-flag"></i> National
                  </span>
                )}
                {announcement.district && announcement.district !== 'all' && (
                  <span className="district-badge">
                    <i className="fas fa-map-marker-alt"></i> {announcement.district}
                  </span>
                )}
                {announcement.audience && announcement.audience.length > 0 && (
                  <span className="audience-badge">
                    <i className="fas fa-users"></i> {announcement.audience.join(', ')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="announcement-content">
              <p>{announcement.content}</p>
            </div>
            
            <div className="announcement-footer">
              <div className="announcement-author">
                <i className="fas fa-user"></i> 
                <span>{announcement.author?.full_name || 'Unknown'}</span>
              </div>
              <div className="announcement-date">
                <i className="fas fa-calendar"></i> 
                <span>{new Date(announcement.created_at).toLocaleDateString('en-RW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-bullhorn" style={{ color: '#006B3F' }}></i>
                Create New Announcement
              </h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              {createError && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle"></i> {createError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  className="form-control"
                  rows="5"
                  placeholder="Enter announcement content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Announcement Type</label>
                <select
                  id="type"
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                  <option value="event">Event</option>
                  <option value="training">Training</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="audience">Send To</label>
                <select
                  id="audience"
                  className="form-control"
                  value={formData.audience[0] || 'all'}
                  onChange={(e) => handleAudienceChange(e.target.value)}
                >
                  <option value="all">All District Members</option>
                  <option value="scouts">Scouts Only</option>
                  <option value="unit_leaders">Unit Leaders Only</option>
                  <option value="district_commissioners">District Commissioners Only</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.send_email}
                    onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                  />
                  Send email notification
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="signature">Signature</label>
                <input
                  type="text"
                  id="signature"
                  className="form-control"
                  placeholder="Your signature"
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                />
                <small className="form-text text-muted">
                  This will appear at the bottom of the announcement
                </small>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> Publish Announcement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .announcements-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .announcements-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }

        .announcements-header h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          color: #1f2937;
          margin: 0;
        }

        .announcement-count {
          background: #006B3F;
          color: white;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .announcement-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .announcement-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .announcement-title {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .announcement-title h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #1f2937;
        }

        .announcement-type {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .announcement-type.general {
          background: #e5e7eb;
          color: #6b7280;
        }

        .announcement-type.important {
          background: #fcd11630;
          color: #b45309;
        }

        .announcement-type.urgent {
          background: #fde8eb;
          color: #ce1126;
        }

        .announcement-type.event {
          background: #e6eef9;
          color: #003da5;
        }

        .announcement-type.training {
          background: #e8f5ee;
          color: #006b3f;
        }

        .announcement-type.meeting {
          background: #fef3c7;
          color: #92400e;
        }

        .announcement-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .national-badge, .district-badge, .audience-badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .national-badge {
          background: #dbeafe;
          color: #1e40af;
        }

        .district-badge {
          background: #e8f5ee;
          color: #006b3f;
        }

        .audience-badge {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .announcement-content {
          margin: 12px 0;
        }

        .announcement-content p {
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
        }

        .announcement-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .announcement-author, .announcement-date {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary {
          background: #006B3F;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: #004D2D;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #1f2937;
          border: 1px solid #d1d5db;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1f2937;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .form-group input[type="checkbox"] {
          margin-right: 8px;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #006B3F;
          box-shadow: 0 0 0 3px rgba(0,107,63,0.1);
        }

        textarea.form-control {
          resize: vertical;
        }

        .form-text {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 4px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-danger {
          background: #fde8eb;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .announcements-loading, .announcements-error, .announcements-empty {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          text-align: center;
          gap: 16px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #006B3F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .announcements-empty h3 {
          color: #1f2937;
          margin: 0;
        }

        .announcements-empty p {
          color: #6b7280;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default Announcements;