import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// Scout Color System
const SCOUT = {
  purple: '#6A1B9A',
  gold: '#FFD100',
  green: '#2E7D32',
  blue: '#2196F3',
  red: '#D32F2F',
  white: '#FFFFFF',
  dark: '#263238',
  lightBg: '#F5F7FA',
  gray: '#6B7280',
  border: '#E5E7EB',
  success: '#2E7D32',
  warning: '#FF9800',
  danger: '#D32F2F',
  info: '#2196F3',
};

const MyIdeals = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    suggestion: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const categories = [
    'Partnership Opportunity',
    'Project Suggestion',
    'Community Need',
    'Scouting Initiative',
    'Funding Idea',
    'Other'
  ];

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      console.log('📥 Fetching ideas...');
      const response = await axios.get(`${API_URL}/donation/ideas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Full response:', response);
      console.log('📊 Response data:', response.data);
      
      // Handle different response structures
      let ideasData = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        ideasData = data;
      } else if (data.success && data.ideas) {
        ideasData = data.ideas;
      } else if (data.ideas && Array.isArray(data.ideas)) {
        ideasData = data.ideas;
      } else if (data.data && Array.isArray(data.data)) {
        ideasData = data.data;
      } else if (data && typeof data === 'object') {
        // If it's an object with numeric keys, convert to array
        const values = Object.values(data);
        if (values.length > 0 && Array.isArray(values[0])) {
          ideasData = values[0];
        } else if (values.some(v => typeof v === 'object' && v !== null)) {
          ideasData = values.filter(v => typeof v === 'object' && v !== null);
        }
      }
      
      console.log('✅ Processed ideas:', ideasData.length, ideasData);
      setIdeas(ideasData);
      
    } catch (err) {
      console.error('❌ Error fetching ideas:', err);
      console.error('❌ Error response:', err.response);
      setError(err.response?.data?.message || 'Failed to load ideas');
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      
      console.log('📤 Submitting idea:', formData);
      const response = await axios.post(`${API_URL}/donation/ideas`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Submit response:', response.data);
      setSuccess('Idea submitted successfully!');
      setShowForm(false);
      setFormData({ title: '', description: '', category: '', suggestion: '' });
      
      // Refresh the list
      await fetchIdeas();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('❌ Error submitting idea:', err);
      setError(err.response?.data?.message || 'Failed to submit idea');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'under-review': 'badge-review',
      'approved': 'badge-approved',
      'implemented': 'badge-completed',
      'rejected': 'badge-rejected',
      'forwarded': 'badge-forwarded'
    };
    return badges[status] || 'badge-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': '⏳ Pending',
      'under-review': '📋 Under Review',
      'approved': '✅ Approved',
      'implemented': '🎉 Implemented',
      'rejected': '❌ Rejected',
      'forwarded': '📤 Forwarded'
    };
    return labels[status] || status || 'Pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading ideas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-star" style={{ color: SCOUT.gold }}></i> 
            My Ideals
          </h2>
          <p>Share your suggestions and ideas with the Rwanda Scout Association</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i> {showForm ? 'Cancel' : 'New Idea'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
          <button className="alert-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {showForm && (
        <div className="card form-card">
          <h4>
            <i className="fas fa-lightbulb" style={{ color: SCOUT.gold }}></i> 
            Share Your Idea
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title <span className="required">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter idea title"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Category <span className="required">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description <span className="required">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your idea in detail"
                rows="4"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Suggestion / Additional Details</label>
              <textarea
                name="suggestion"
                value={formData.suggestion}
                onChange={handleChange}
                placeholder="Any additional suggestions..."
                rows="2"
                className="form-control"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-paper-plane"></i> Submit Idea
              </button>
            </div>
          </form>
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-star" style={{ color: SCOUT.gray }}></i>
          <h3>No Ideas Shared</h3>
          <p>Share your first idea to make a difference in the scouting community</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Share Your Idea
          </button>
        </div>
      ) : (
        <div className="ideas-grid">
          {ideas.map((idea, index) => {
            // Ensure idea is an object
            if (typeof idea !== 'object' || idea === null) {
              console.warn('Invalid idea at index', index, idea);
              return null;
            }
            
            return (
              <div key={idea.id || index} className="idea-card">
                <div className="idea-header">
                  <div className="idea-title-group">
                    <h4>{idea.title || 'Untitled'}</h4>
                    <span className={`status-badge ${getStatusBadge(idea.status)}`}>
                      {getStatusLabel(idea.status)}
                    </span>
                  </div>
                </div>
                <p className="idea-description">{idea.description || 'No description provided'}</p>
                <div className="idea-meta">
                  <span className="idea-category">
                    <i className="fas fa-tag"></i> {idea.category || 'Uncategorized'}
                  </span>
                  <span className="idea-date">
                    <i className="fas fa-calendar"></i> {formatDate(idea.created_at || idea.date)}
                  </span>
                </div>
                {idea.suggestion && (
                  <div className="idea-suggestion">
                    <strong><i className="fas fa-lightbulb"></i> Suggestion:</strong>
                    <p>{idea.suggestion}</p>
                  </div>
                )}
                {idea.response && (
                  <div className="idea-response">
                    <strong><i className="fas fa-reply"></i> Response:</strong>
                    <p>{idea.response}</p>
                  </div>
                )}
                {idea.feedback && (
                  <div className="idea-feedback">
                    <strong><i className="fas fa-comment"></i> Feedback:</strong>
                    <p>{idea.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Styles - same as before */}
      <style>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: ${SCOUT.lightBg};
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding: 20px 24px;
          background: linear-gradient(135deg, ${SCOUT.purple}, #8E24AA);
          border-radius: 12px;
          color: white;
        }

        .header-content h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 1.5rem;
          color: white;
        }

        .header-content h2 i {
          color: ${SCOUT.gold} !important;
        }

        .header-content p {
          margin: 4px 0 0 0;
          color: rgba(255,255,255,0.85);
          font-size: 0.95rem;
        }

        .btn-primary {
          background: ${SCOUT.gold};
          color: ${SCOUT.dark};
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-primary:hover {
          opacity: 0.85;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 209, 0, 0.4);
        }

        .btn-secondary {
          background: ${SCOUT.lightBg};
          color: ${SCOUT.dark};
          border: 1px solid ${SCOUT.border};
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-secondary:hover {
          background: ${SCOUT.border};
        }

        .form-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid ${SCOUT.border};
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .form-card h4 {
          margin: 0 0 16px 0;
          color: ${SCOUT.dark};
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: ${SCOUT.dark};
          margin-bottom: 4px;
        }

        .form-group .required {
          color: ${SCOUT.danger};
          font-weight: 700;
        }

        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid ${SCOUT.border};
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-control:focus {
          outline: none;
          border-color: ${SCOUT.purple};
          box-shadow: 0 0 0 3px rgba(106, 27, 154, 0.1);
        }

        textarea.form-control {
          resize: vertical;
          font-family: inherit;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .alert-error {
          background: #fde8eb;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .alert-error i {
          color: ${SCOUT.danger};
        }

        .alert-success {
          background: ${SCOUT.green}15;
          color: ${SCOUT.green};
          border: 1px solid ${SCOUT.green}30;
        }

        .alert-success i {
          color: ${SCOUT.green};
        }

        .alert-close {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.6;
          padding: 0 8px;
        }

        .alert-close:hover {
          opacity: 1;
        }

        .ideas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .idea-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${SCOUT.border};
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .idea-card:hover {
          box-shadow: 0 4px 16px rgba(106, 27, 154, 0.12);
          border-color: ${SCOUT.purple}40;
          transform: translateY(-2px);
        }

        .idea-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .idea-title-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .idea-title-group h4 {
          margin: 0;
          color: ${SCOUT.dark};
          font-size: 1.05rem;
          flex: 1;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-review {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-approved {
          background: ${SCOUT.green}20;
          color: ${SCOUT.green};
        }

        .badge-completed {
          background: ${SCOUT.green}20;
          color: ${SCOUT.green};
        }

        .badge-rejected {
          background: #fde8eb;
          color: ${SCOUT.danger};
        }

        .badge-forwarded {
          background: ${SCOUT.purple}20;
          color: ${SCOUT.purple};
        }

        .badge-default {
          background: ${SCOUT.lightBg};
          color: ${SCOUT.gray};
        }

        .idea-description {
          margin: 0 0 12px 0;
          color: ${SCOUT.gray};
          line-height: 1.6;
          font-size: 0.95rem;
          flex: 1;
        }

        .idea-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 0;
          border-top: 1px solid ${SCOUT.border};
          font-size: 0.85rem;
          color: ${SCOUT.gray};
        }

        .idea-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .idea-suggestion,
        .idea-response,
        .idea-feedback {
          margin-top: 12px;
          padding: 12px;
          background: ${SCOUT.lightBg};
          border-radius: 8px;
          border-left: 3px solid ${SCOUT.purple};
        }

        .idea-suggestion strong,
        .idea-response strong,
        .idea-feedback strong {
          display: flex;
          align-items: center;
          gap: 6px;
          color: ${SCOUT.dark};
          margin-bottom: 4px;
        }

        .idea-suggestion p,
        .idea-response p,
        .idea-feedback p {
          margin: 0;
          color: ${SCOUT.gray};
          font-size: 0.9rem;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid ${SCOUT.border};
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 16px;
          color: ${SCOUT.border};
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: ${SCOUT.dark};
        }

        .empty-state p {
          margin: 0 0 16px 0;
          color: ${SCOUT.gray};
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: ${SCOUT.gray};
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid ${SCOUT.border};
          border-top: 4px solid ${SCOUT.purple};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-spinner p {
          margin-top: 12px;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
            padding: 16px 20px;
          }

          .page-header h2 {
            font-size: 1.2rem;
          }

          .ideas-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions .btn-primary,
          .form-actions .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .idea-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default MyIdeals;