import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CreateAnnouncement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    district: 'all',
    audience: ['all'],
    signature: '',
    send_email: false,
    schedule_date: ''
  });

  const announcementTypes = [
    { value: 'general', label: 'General' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'event', label: 'Event' },
    { value: 'information', label: 'Information' },
    { value: 'achievement', label: 'Achievement' }
  ];

  const audienceOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'leaders', label: 'Leaders Only' },
    { value: 'scouts', label: 'Scouts Only' },
    { value: 'public', label: 'Public' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAudienceChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      let audience = [...prev.audience];
      if (checked) {
        audience.push(value);
      } else {
        audience = audience.filter(a => a !== value);
      }
      return { ...prev, audience };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      
      let apiUrl;
      if (user?.role === 'national_commissioner') {
        apiUrl = `${API_URL}/national/announcements`;
      } else if (user?.role === 'district_commissioner') {
        apiUrl = `${API_URL}/district/announcements`;
      } else {
        setError('You do not have permission to create announcements');
        setLoading(false);
        return;
      }

      const response = await axios.post(apiUrl, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setSuccess('Announcement created successfully!');
        setFormData({
          title: '',
          content: '',
          announcement_type: 'general',
          district: 'all',
          audience: ['all'],
          signature: '',
          send_email: false,
          schedule_date: ''
        });
        
        setTimeout(() => {
          if (user?.role === 'national_commissioner') {
            navigate('/national-announcements');
          } else {
            navigate('/district-announcements');
          }
        }, 2000);
      } else {
        setError(response.data?.message || 'Failed to create announcement');
      }
      
    } catch (err) {
      console.error('❌ Create announcement error:', err);
      setError(err.response?.data?.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user?.role === 'national_commissioner') {
      navigate('/national-announcements');
    } else {
      navigate('/district-announcements');
    }
  };

  return (
    <div className="create-announcement-container">
      <div className="create-announcement-header">
        <h2>
          <i className="fas fa-plus-circle" style={{ color: '#FFD100' }}></i>
          Create New Announcement
        </h2>
        <p>Create an announcement to share with users</p>
      </div>

      {error && (
        <div className="console.log console.log-error">
          <i className="fas fa-exclamation-circle"></i>
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="console.log console.log-success">
          <i className="fas fa-check-circle"></i>
          <div>
            <strong>Success</strong>
            <p>{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-announcement-form">
        <div className="form-group">
          <label htmlFor="title">Title <span className="required">*</span></label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter announcement title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content <span className="required">*</span></label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter announcement content"
            required
            rows="6"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="announcement_type">Type</label>
            <select
              id="announcement_type"
              name="announcement_type"
              value={formData.announcement_type}
              onChange={handleChange}
            >
              {announcementTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="district">District</label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="e.g., Gasabo or 'all' for national"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Audience</label>
          <div className="audience-checkboxes">
            {audienceOptions.map(option => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={formData.audience.includes(option.value)}
                  onChange={handleAudienceChange}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="signature">Signature</label>
            <input
              type="text"
              id="signature"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              placeholder="Your signature (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="schedule_date">Schedule Date</label>
            <input
              type="datetime-local"
              id="schedule_date"
              name="schedule_date"
              value={formData.schedule_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="send_email"
              checked={formData.send_email}
              onChange={handleChange}
            />
            Send email notification to all recipients
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            <i className="fas fa-times"></i> Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span> Creating...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Create Announcement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncement;