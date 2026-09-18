// src/components/scout/SubmitIdea.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SubmitIdea = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [fetchingIdeas, setFetchingIdeas] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    recipient: 'district_commissioner',
    suggestion: ''
  });

  const categories = [
    'Community Service',
    'Leadership',
    'Environmental',
    'Education',
    'Health',
    'Technology',
    'Other'
  ];

  const recipientOptions = [
    { value: 'district_commissioner', label: '📌 District Commissioner' },
    { value: 'national_commissioner', label: '🏛️ National Commissioner' },
    { value: 'both', label: '📌 + 🏛️ Both' }
  ];

  useEffect(() => {
    fetchIdeas();
  }, []);

  // ✅ FETCH IDEAS - WORKS WITH YOUR BACKEND
  const fetchIdeas = async () => {
    try {
      setFetchingIdeas(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setFetchingIdeas(false);
        return;
      }

      console.log('📊 Fetching ideas...');
      const response = await axios.get(`${API_URL}/ideas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Full Response:', response);
      console.log('📊 Response Data:', response.data);

      // ✅ Handle response format: { success: true, total: 5, ideas: [...] }
      let ideasData = [];
      
      if (response.data?.success && Array.isArray(response.data.ideas)) {
        ideasData = response.data.ideas;
        console.log(`✅ Found ${ideasData.length} ideas in response.data.ideas`);
      } else if (Array.isArray(response.data)) {
        ideasData = response.data;
        console.log(`✅ Found ${ideasData.length} ideas in response.data array`);
      } else if (response.data?.ideas && Array.isArray(response.data.ideas)) {
        ideasData = response.data.ideas;
        console.log(`✅ Found ${ideasData.length} ideas in response.data.ideas`);
      } else {
        console.warn('⚠️ No ideas array found in response:', response.data);
      }

      // ✅ Map ideas to frontend format
      const processedIdeas = ideasData.map(idea => ({
        id: idea.id,
        title: idea.title || 'Untitled',
        description: idea.description || '',
        category: idea.category || 'Uncategorized',
        recipient: idea.recipient || 'district_commissioner',
        suggestion: idea.suggestion || '',
        status: idea.status || 'pending',
        feedback: idea.feedback || '',
        response: idea.response || '',
        district: idea.district || user?.district || 'N/A',
        user_id: idea.user_id,
        created_at: idea.created_at,
        updated_at: idea.updated_at
      }));

      console.log('✅ Processed ideas:', processedIdeas);
      setIdeas(processedIdeas);

    } catch (err) {
      console.error('❌ Fetch ideas error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError('Failed to load your ideas. Please try again.');
      setIdeas([]);
    } finally {
      setFetchingIdeas(false);
    }
  };

  // ✅ HANDLE SUBMIT - SAVES IDEA TO DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to submit an idea');
        setLoading(false);
        return;
      }

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        recipient: formData.recipient,
        suggestion: formData.suggestion ? formData.suggestion.trim() : ''
      };

      console.log('📤 Submitting idea:', submitData);

      const response = await axios.post(`${API_URL}/ideas`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Response:', response.data);

      if (response.data?.success && response.data?.idea?.id) {
        console.log(`✅ Idea saved with ID: ${response.data.idea.id}`);
        setSuccess('✅ Idea submitted successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          recipient: 'district_commissioner',
          suggestion: ''
        });

        // Refresh ideas list
        await fetchIdeas();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('❌ Unexpected response format:', response.data);
        setError('Idea was not saved properly. Please try again.');
      }

    } catch (err) {
      console.error('❌ Error submitting idea:', err);
      console.error('❌ Response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'badge-pending',
      'reviewed': 'badge-review',
      'implemented': 'badge-implemented',
      'forwarded': 'badge-forwarded',
      'rejected': 'badge-rejected'
    };
    return classes[status] || 'badge-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'reviewed': 'Reviewed',
      'implemented': 'Implemented',
      'forwarded': 'Forwarded',
      'rejected': 'Rejected'
    };
    return labels[status] || status || 'Unknown';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'reviewed': '📋',
      'implemented': '✅',
      'forwarded': '📤',
      'rejected': '❌'
    };
    return icons[status] || '📌';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h2><i className="fas fa-lightbulb" style={{ color: '#F4B400' }}></i> My Ideas</h2>
          <p>Submit and track your innovative ideas</p>
          {user?.district && (
            <span className="district-badge">
              <i className="fas fa-map-marker-alt"></i> {user.district} District
            </span>
          )}
          {user?.role && (
            <span className="role-badge">
              <i className="fas fa-user-tag"></i> {user.role}
            </span>
          )}
        </div>
        <button className="btn-secondary-sm" onClick={fetchIdeas}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button className="btn-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          <p>{success}</p>
          <button className="btn-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Submit Idea Form */}
      <div className="card">
        <h3><i className="fas fa-plus-circle" style={{ color: '#F4B400' }}></i> Submit New Idea</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Idea Title <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a clear, concise title for your idea"
              maxLength="100"
            />
            <small className="form-hint">{formData.title.length}/100 characters</small>
          </div>

          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
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
              placeholder="Describe your idea in detail..."
              rows="5"
              maxLength="500"
            />
            <small className="form-hint">{formData.description.length}/500 characters</small>
          </div>

          <div className="form-group">
            <label>Send To <span className="required">*</span></label>
            <select
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              required
            >
              {recipientOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="form-hint">
              {formData.recipient === 'district_commissioner' && '📌 Sent to your District Commissioner'}
              {formData.recipient === 'national_commissioner' && '🏛️ Sent to National Commissioner'}
              {formData.recipient === 'both' && '📌 + 🏛️ Sent to both Commissioners'}
            </small>
          </div>

          <div className="form-group">
            <label>Additional Suggestions (Optional)</label>
            <textarea
              name="suggestion"
              value={formData.suggestion}
              onChange={handleChange}
              placeholder="Any additional suggestions..."
              rows="3"
              maxLength="300"
            />
            <small className="form-hint">{formData.suggestion.length}/300 characters</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span> Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Submit Idea
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* My Ideas List */}
      <div className="my-ideas-section">
        <div className="section-header">
          <h3>
            <i className="fas fa-list" style={{ color: '#F4B400' }}></i>
            My Ideas
            <span className="badge">{ideas.length}</span>
          </h3>
        </div>

        {fetchingIdeas ? (
          <div className="loading-spinner">
            <div className="spinner-small"></div>
            <p>Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-lightbulb" style={{ color: '#F4B400', fontSize: '48px' }}></i>
            <p>You haven't submitted any ideas yet.</p>
            <p className="text-muted">Submit your first idea above!</p>
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map((idea) => (
              <div key={idea.id} className="idea-card">
                <div className="idea-header">
                  <h4>{idea.title}</h4>
                  <span className={`status-badge ${getStatusBadgeClass(idea.status)}`}>
                    {getStatusIcon(idea.status)} {getStatusLabel(idea.status)}
                  </span>
                </div>
                <div className="idea-body">
                  <p className="idea-description">{idea.description}</p>
                  <div className="idea-meta">
                    <span><i className="fas fa-tag"></i> {idea.category || 'Uncategorized'}</span>
                    <span><i className="fas fa-envelope"></i> {idea.recipient || 'N/A'}</span>
                    <span><i className="fas fa-calendar"></i> {formatDate(idea.created_at)}</span>
                    {idea.district && (
                      <span><i className="fas fa-map-marker-alt"></i> {idea.district}</span>
                    )}
                  </div>
                  {idea.feedback && (
                    <div className="idea-feedback-preview">
                      <i className="fas fa-comment"></i> {idea.feedback}
                    </div>
                  )}
                  <div className="idea-actions">
                    <button 
                      className="btn-sm btn-view"
                      onClick={() => {
                        setSelectedIdea(idea);
                        setShowDetailModal(true);
                      }}
                    >
                      <i className="fas fa-eye"></i> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedIdea && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-lightbulb" style={{ color: '#F4B400' }}></i> Idea Details</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="idea-detail-header">
                <h2>{selectedIdea.title}</h2>
                <span className={`status-badge ${getStatusBadgeClass(selectedIdea.status)}`}>
                  {getStatusIcon(selectedIdea.status)} {getStatusLabel(selectedIdea.status)}
                </span>
              </div>

              <div className="idea-detail-grid">
                <div className="detail-item">
                  <label>Category</label>
                  <p>{selectedIdea.category || 'Uncategorized'}</p>
                </div>
                <div className="detail-item">
                  <label>Recipient</label>
                  <p>{selectedIdea.recipient || 'N/A'}</p>
                </div>
                <div className="detail-item">
                  <label>Submitted</label>
                  <p>{formatDate(selectedIdea.created_at)}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p>
                    <span className={`status-badge ${getStatusBadgeClass(selectedIdea.status)}`}>
                      {getStatusIcon(selectedIdea.status)} {getStatusLabel(selectedIdea.status)}
                    </span>
                  </p>
                </div>
                {selectedIdea.district && (
                  <div className="detail-item">
                    <label>District</label>
                    <p>{selectedIdea.district}</p>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <label>Description</label>
                <p>{selectedIdea.description || 'No description provided'}</p>
              </div>

              {selectedIdea.suggestion && (
                <div className="detail-section">
                  <label>Additional Suggestions</label>
                  <p>{selectedIdea.suggestion}</p>
                </div>
              )}

              {selectedIdea.feedback && (
                <div className="detail-section feedback-section">
                  <label>Feedback</label>
                  <div className="feedback-content">
                    <i className="fas fa-comment" style={{ color: '#F4B400' }}></i>
                    <p>{selectedIdea.feedback}</p>
                  </div>
                </div>
              )}

              {selectedIdea.response && (
                <div className="detail-section response-section">
                  <label>Response</label>
                  <div className="response-content">
                    <i className="fas fa-reply" style={{ color: '#3B82F6' }}></i>
                    <p>{selectedIdea.response}</p>
                  </div>
                </div>
              )}

              {selectedIdea.status === 'pending' && (
                <div className="notice pending-notice">
                  <i className="fas fa-clock"></i>
                  <p>Your idea is pending review. You will receive feedback soon.</p>
                </div>
              )}

              {selectedIdea.status === 'reviewed' && (
                <div className="notice reviewed-notice">
                  <i className="fas fa-check-circle"></i>
                  <p>Your idea has been reviewed. Check the feedback above.</p>
                </div>
              )}

              {selectedIdea.status === 'implemented' && (
                <div className="notice implemented-notice">
                  <i className="fas fa-check-circle"></i>
                  <p>🎉 Congratulations! Your idea has been implemented.</p>
                </div>
              )}

              {selectedIdea.status === 'rejected' && (
                <div className="notice rejected-notice">
                  <i className="fas fa-times-circle"></i>
                  <p>Your idea was not approved. Please review the feedback above.</p>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h2 {
          margin: 0;
          font-size: 28px;
          color: #1a1a2e;
        }

        .page-header p {
          margin: 4px 0 0 0;
          color: #6B7280;
        }

        .district-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #622599;
          color: #ffffff;
          padding: 4px 14px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 4px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #3B82F6;
          color: #ffffff;
          padding: 4px 14px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 500;
          margin-top: 4px;
          margin-left: 8px;
        }

        .btn-secondary-sm {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-secondary-sm:hover {
          background: #e5e7eb;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .alert-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .alert-success {
          background: #d1fae5;
          border: 1px solid #86efac;
          color: #065f46;
        }

        .alert .btn-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          margin-left: auto;
          color: inherit;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          margin-bottom: 30px;
        }

        .card h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #1a1a2e;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #1a1a2e;
        }

        .form-group .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #F4B400;
          box-shadow: 0 0 0 3px rgba(244, 180, 0, 0.1);
        }

        .form-hint {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #6B7280;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-primary {
          background: #F4B400;
          color: #1a1a2e;
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #e0a500;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 180, 0, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6B7280;
          color: white;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #4B5563;
        }

        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #F4B400;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .my-ideas-section {
          margin-top: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          color: #1a1a2e;
        }

        .section-header .badge {
          background: #F4B400;
          color: #1a1a2e;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .ideas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .idea-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #f1f3f4;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .idea-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .idea-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px 16px 12px;
          border-bottom: 1px solid #f1f3f4;
          gap: 12px;
        }

        .idea-header h4 {
          margin: 0;
          font-size: 16px;
          color: #1a1a2e;
          flex: 1;
        }

        .idea-body {
          padding: 16px;
        }

        .idea-description {
          color: #6B7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .idea-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 13px;
          color: #6B7280;
        }

        .idea-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .idea-meta i {
          color: #F4B400;
        }

        .idea-feedback-preview {
          margin-top: 8px;
          padding: 8px 12px;
          background: #fef3c7;
          border-radius: 6px;
          font-size: 13px;
          color: #92400e;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .idea-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
        }

        .btn-sm {
          padding: 6px 14px;
          font-size: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-sm:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .btn-view {
          background: #3B82F6;
          color: white;
        }

        .btn-view:hover {
          background: #2563EB;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-review { background: #dbeafe; color: #1e40af; }
        .badge-implemented { background: #d1fae5; color: #065f46; }
        .badge-forwarded { background: #c7d2fe; color: #3730a3; }
        .badge-rejected { background: #fee2e2; color: #991b1b; }
        .badge-default { background: #f1f3f5; color: #6B7280; }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 16px;
          color: #F4B400;
        }

        .empty-state p {
          margin: 8px 0;
          color: #6B7280;
          font-size: 16px;
        }

        .text-muted {
          color: #9CA3AF;
          font-size: 14px;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          color: #6B7280;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-large {
          max-width: 800px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f3f4;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          color: #1a1a2e;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6B7280;
          padding: 4px;
        }

        .modal-close:hover {
          color: #1a1a2e;
        }

        .modal-body {
          padding: 24px;
        }

        .idea-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .idea-detail-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a2e;
        }

        .idea-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }

        .detail-item p {
          margin: 0;
          font-size: 15px;
          color: #1a1a2e;
        }

        .detail-section {
          margin-bottom: 16px;
        }

        .detail-section label {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          display: block;
          margin-bottom: 6px;
        }

        .detail-section p {
          margin: 0;
          color: #374151;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .feedback-content,
        .response-content {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          gap: 10px;
        }

        .feedback-content {
          border-left: 4px solid #F4B400;
        }

        .response-content {
          border-left: 4px solid #3B82F6;
        }

        .feedback-content p,
        .response-content p {
          margin: 0;
          color: #374151;
        }

        .notice {
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pending-notice {
          background: #fef3c7;
          border: 1px solid #fcd34d;
        }

        .reviewed-notice {
          background: #dbeafe;
          border: 1px solid #93c5fd;
        }

        .implemented-notice {
          background: #d1fae5;
          border: 1px solid #86efac;
        }

        .rejected-notice {
          background: #fee2e2;
          border: 1px solid #fca5a5;
        }

        .notice p {
          margin: 0;
          color: #1a1a2e;
        }

        @media (max-width: 768px) {
          .ideas-grid {
            grid-template-columns: 1fr;
          }

          .idea-detail-grid {
            grid-template-columns: 1fr 1fr;
          }

          .idea-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .idea-detail-grid {
            grid-template-columns: 1fr;
          }

          .idea-meta {
            flex-direction: column;
            gap: 4px;
          }

          .idea-actions {
            flex-direction: column;
          }

          .idea-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SubmitIdea;