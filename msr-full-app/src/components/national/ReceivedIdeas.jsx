import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ReceivedIdeas = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [remarks, setRemarks] = useState('');
  const [forwardOffice, setForwardOffice] = useState('');
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardIdeaId, setForwardIdeaId] = useState(null);

  // ✅ Check if user is Super Admin
  const isSuperAdmin = user?.role === 'super_admin' || 
                       user?.role === 'super-admin' || 
                       user?.role === 'admin';

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'implemented', label: 'Implemented' },
    { value: 'forwarded', label: 'Forwarded' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const officeOptions = [
    { value: 'district-office', label: 'District Office' },
    { value: 'provincial-office', label: 'Provincial Office' },
    { value: 'national-office', label: 'National Office' },
    { value: 'commissioner', label: 'Commissioner' },
    { value: 'president', label: 'President' }
  ];

  useEffect(() => {
    fetchIdeas();
  }, [filterStatus]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view ideas');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/national/ideas?status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Ideas response:', response.data);
      
      const ideasData = response.data?.ideas || response.data || [];
      setIdeas(Array.isArray(ideasData) ? ideasData : []);
      
    } catch (err) {
      console.error('Fetch ideas error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Failed to load ideas');
      }
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to perform this action');
        return;
      }

      const ideaExists = ideas.find(idea => idea.id === id);
      if (!ideaExists) {
        setError('Idea not found. Please refresh the page.');
        return;
      }

      console.log(`📤 Updating idea ${id} to status: ${status}`);
      
      const response = await axios.put(
        `${API_URL}/national/ideas/${id}`,
        { status, remarks },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ Update response:', response.data);
      
      setSuccess(`✅ Idea marked as ${status}!`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedIdea(null);
      setRemarks('');
      
      await fetchIdeas();
      
    } catch (err) {
      console.error('❌ Update status error:', err);
      
      if (err.response?.status === 404) {
        setError('Idea not found. It may have been deleted.');
        await fetchIdeas();
      } else if (err.response?.status === 403) {
        setError('You do not have permission to update this idea.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to update idea status');
      }
      
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleForward = async (id, office) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to perform this action');
        return;
      }

      if (!office || office.trim() === '') {
        setError('Please select an office to forward to');
        return;
      }

      console.log(`📤 Forwarding idea ${id} to: ${office}`);
      
      const response = await axios.post(
        `${API_URL}/national/ideas/${id}/forward`,
        { office: office.trim() },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ Forward response:', response.data);
      
      setSuccess(`✅ Idea forwarded to ${office}!`);
      setTimeout(() => setSuccess(''), 3000);
      setShowForwardModal(false);
      setForwardOffice('');
      setForwardIdeaId(null);
      
      await fetchIdeas();
      
    } catch (err) {
      console.error('❌ Forward error:', err);
      
      if (err.response?.status === 404) {
        setError('Idea not found. It may have been deleted.');
        await fetchIdeas();
      } else if (err.response?.status === 403) {
        setError('You do not have permission to forward this idea.');
      } else {
        setError(err.response?.data?.message || 'Failed to forward idea');
      }
      
      setTimeout(() => setError(''), 5000);
    }
  };

  // ✅ NEW: Delete idea function - Only Super Admin can delete
  const handleDelete = async (id) => {
    if (!isSuperAdmin) {
      setError('❌ Only Super Admin can delete ideas');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this idea? This action cannot be undone!')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/national/ideas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Idea deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchIdeas();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete idea');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openForwardModal = (id) => {
    setForwardIdeaId(id);
    setShowForwardModal(true);
    setForwardOffice('');
  };

  const handleForwardSubmit = () => {
    if (forwardIdeaId && forwardOffice) {
      handleForward(forwardIdeaId, forwardOffice);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'under-review': 'badge-review',
      'reviewed': 'badge-review',
      'implemented': 'badge-completed',
      'forwarded': 'badge-registered',
      'rejected': 'badge-rejected'
    };
    return badges[status] || 'badge-default';
  };

  const getSubmitterName = (idea) => {
    if (idea.creator?.full_name) {
      return idea.creator.full_name.trim();
    }
    if (idea.submitted_by) {
      return idea.submitted_by;
    }
    if (idea.submittedBy) {
      return idea.submittedBy;
    }
    if (idea.user?.full_name) {
      return idea.user.full_name;
    }
    return 'Anonymous';
  };

  const getSubmitterEmail = (idea) => {
    if (idea.creator?.email) {
      return idea.creator.email;
    }
    if (idea.submitted_by_email) {
      return idea.submitted_by_email;
    }
    if (idea.user?.email) {
      return idea.user.email;
    }
    return null;
  };

  const getInitials = (name) => {
    if (name === 'Anonymous' || !name) return '?';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const safeIdeas = Array.isArray(ideas) ? ideas : [];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading ideas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h2><i className="fas fa-lightbulb" style={{ color: '#FFD100' }}></i> Ideas Management</h2>
          <p>Receive and review suggestions from scouts and leaders</p>
          {isSuperAdmin && (
            <span className="super-admin-badge" style={{ 
              marginTop: '8px', 
              display: 'inline-block',
              background: '#FFD100', 
              padding: '2px 12px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: '#1a1a1a'
            }}>
              <i className="fas fa-crown"></i> Super Admin - Full Access
            </span>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchIdeas}>
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
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

      <div className="filter-bar">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="stats-info">Total: <strong>{safeIdeas.length}</strong> ideas</span>
      </div>

      <div className="ideas-grid">
        {safeIdeas.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-lightbulb"></i>
            <h3>No Ideas</h3>
            <p>No ideas submitted yet</p>
          </div>
        ) : (
          safeIdeas.map(idea => {
            const submittedBy = getSubmitterName(idea);
            const submitterEmail = getSubmitterEmail(idea);
            const initials = getInitials(submittedBy);
            const category = idea.category || 'Uncategorized';
            const date = idea.date || idea.createdAt || idea.created_at || 'N/A';
            const isAnonymous = submittedBy === 'Anonymous';
            
            return (
              <div key={idea.id} className="idea-card">
                <div className="idea-header">
                  <div className="idea-submitter-info">
                    <div className="submitter-avatar" style={{
                      background: isAnonymous ? '#e5e7eb' : '#FFD100',
                      color: isAnonymous ? '#6B7280' : '#1a1a1a'
                    }}>
                      {initials}
                    </div>
                    <div className="submitter-details">
                      <span className="submitter-name">
                        {submittedBy}
                        {isAnonymous && (
                          <span className="anonymous-badge">Anonymous</span>
                        )}
                      </span>
                      {submitterEmail && (
                        <span className="submitter-email">{submitterEmail}</span>
                      )}
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusBadge(idea.status)}`}>
                    {idea.status || 'pending'}
                  </span>
                </div>
                
                <h4 className="idea-title">{idea.title || 'Untitled Idea'}</h4>
                <p className="idea-description">{idea.description || 'No description'}</p>
                
                <div className="idea-meta">
                  <span><i className="fas fa-tag"></i> {category}</span>
                  <span><i className="fas fa-user-tag"></i> {idea.recipient || 'N/A'}</span>
                  <span><i className="fas fa-calendar"></i> {new Date(date).toLocaleDateString()}</span>
                </div>
                
                {idea.feedback && (
                  <div className="idea-remarks">
                    <strong>Feedback:</strong>
                    <p>{idea.feedback}</p>
                  </div>
                )}
                
                <div className="idea-actions">
                  <button className="btn-sm btn-edit" onClick={() => setSelectedIdea(idea)}>
                    <i className="fas fa-edit"></i> Review
                  </button>
                  {idea.status !== 'forwarded' && idea.status !== 'implemented' && (
                    <button className="btn-sm btn-forward" onClick={() => openForwardModal(idea.id)}>
                      <i className="fas fa-share"></i> Forward
                    </button>
                  )}
                  {/* ✅ Delete Button - Only visible to Super Admin */}
                  {isSuperAdmin && (
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(idea.id)}>
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {selectedIdea && (
        <div className="modal-overlay" onClick={() => setSelectedIdea(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-lightbulb"></i> Review Idea</h3>
              <button className="modal-close" onClick={() => setSelectedIdea(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <h4>{selectedIdea.title || 'Untitled Idea'}</h4>
              
              <div className="detail-row">
                <strong>Submitted by:</strong>
                <span>{getSubmitterName(selectedIdea)}</span>
              </div>
              
              <div className="detail-row">
                <strong>Category:</strong>
                <span>{selectedIdea.category || 'Uncategorized'}</span>
              </div>
              
              <div className="detail-row">
                <strong>Recipient:</strong>
                <span>{selectedIdea.recipient || 'N/A'}</span>
              </div>
              
              <div className="detail-row">
                <strong>Date:</strong>
                <span>{new Date(selectedIdea.created_at || selectedIdea.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge ${getStatusBadge(selectedIdea.status)}`}>
                  {selectedIdea.status || 'pending'}
                </span>
              </div>
              
              <div className="detail-row full-width">
                <strong>Description:</strong>
                <p>{selectedIdea.description || 'No description'}</p>
              </div>
              
              <div className="form-group">
                <label>Remarks / Feedback</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows="3"
                  placeholder="Add your remarks or feedback..."
                />
              </div>
              
              <div className="form-group">
                <label>Update Status</label>
                <select 
                  value=""
                  onChange={e => {
                    if (e.target.value) {
                      handleUpdateStatus(selectedIdea.id, e.target.value);
                    }
                  }}
                >
                  <option value="">Select status...</option>
                  {statusOptions.filter(opt => opt.value !== 'all').map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setSelectedIdea(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="modal-overlay" onClick={() => setShowForwardModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-share"></i> Forward Idea</h3>
              <button className="modal-close" onClick={() => setShowForwardModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Select the office or person to forward this idea to:</p>
              
              <div className="form-group">
                <label>Forward to:</label>
                <select 
                  value={forwardOffice}
                  onChange={e => setForwardOffice(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select office...</option>
                  {officeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowForwardModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleForwardSubmit}
                disabled={!forwardOffice}
              >
                <i className="fas fa-share"></i> Forward
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .page-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a1a;
        }

        .page-header p {
          margin: 4px 0 0 0;
          color: #6B7280;
        }

        .super-admin-badge {
          margin-top: 8px;
          display: inline-block;
          background: #FFD100;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          color: #1a1a1a;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-bar select {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background-color: white;
          min-width: 160px;
        }

        .stats-info {
          color: #6B7280;
          font-size: 14px;
        }

        .ideas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .idea-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .idea-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .idea-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .idea-submitter-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .submitter-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .submitter-details {
          display: flex;
          flex-direction: column;
        }

        .submitter-name {
          font-weight: 500;
          font-size: 14px;
        }

        .anonymous-badge {
          font-size: 10px;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 6px;
          color: #6B7280;
        }

        .submitter-email {
          font-size: 12px;
          color: #6B7280;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-review { background: #dbeafe; color: #1e40af; }
        .badge-completed { background: #d1fae5; color: #065f46; }
        .badge-registered { background: #ede9fe; color: #5b21b6; }
        .badge-rejected { background: #fee2e2; color: #991b1b; }
        .badge-default { background: #f3f4f6; color: #374151; }

        .idea-title {
          margin: 8px 0;
          font-size: 16px;
          color: #1a1a1a;
        }

        .idea-description {
          color: #4B5563;
          font-size: 14px;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .idea-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .idea-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .idea-remarks {
          background: #f9fafb;
          padding: 10px;
          border-radius: 6px;
          margin: 8px 0 12px 0;
          font-size: 13px;
        }

        .idea-remarks strong {
          display: block;
          margin-bottom: 4px;
          color: #374151;
        }

        .idea-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-sm {
          padding: 6px 14px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-sm:hover {
          transform: scale(1.02);
        }

        .btn-edit {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-edit:hover {
          background: #e5e7eb;
        }

        .btn-forward {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-forward:hover {
          background: #bfdbfe;
        }

        /* ✅ Delete Button */
        .btn-delete {
          background: #dc2626;
          color: #fff;
        }

        .btn-delete:hover {
          background: #b91c1c;
        }

        .btn-primary {
          background: #FFD100;
          color: #1a1a1a;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #f5c800;
          transform: scale(1.02);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
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
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6B7280;
        }

        .modal-close:hover {
          color: #374151;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-body h4 {
          margin-top: 0;
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row.full-width {
          flex-direction: column;
          gap: 8px;
        }

        .detail-row.full-width p {
          margin: 0;
        }

        .form-group {
          margin-top: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 14px;
        }

        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
          border: 1px dashed #d1d5db;
        }

        .empty-state i {
          font-size: 48px;
          color: #d1d5db;
        }

        .empty-state h3 {
          margin: 16px 0 8px 0;
        }

        .console.log {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .console.log i {
          font-size: 20px;
          margin-top: 2px;
        }

        .console.log-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .console.log-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #065f46;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #FFD100;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .ideas-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 12px;
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceivedIdeas;