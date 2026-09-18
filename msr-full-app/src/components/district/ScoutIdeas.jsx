import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// ============================================
// COMPLETE CSS - Scout Theme for Ideas Management
// ============================================

const styles = `
  /* ============================================
     SCOUT IDEAS CSS - Rwanda Scout Association
     Primary: #622599 (Purple)
     Secondary: #00843D (Green)
     Accent: #F4B400 (Gold)
     ============================================ */

  :root {
    --scout-purple: #622599;
    --scout-green: #00843D;
    --scout-gold: #F4B400;
    --scout-red: #C8102E;
    --scout-white: #FFFFFF;
    --scout-light: #F8F9FA;
    --scout-dark: #1F2937;
    --scout-gray: #6B7280;
  }

  /* ----- BASE ----- */
  .ideas-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 32px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--scout-light);
    min-height: 100vh;
    color: var(--scout-dark);
  }

  /* ----- HEADER ----- */
  .ideas-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e5e7eb;
    flex-wrap: wrap;
    gap: 16px;
  }

  .ideas-header h2 {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--scout-purple);
  }

  .ideas-header h2 i {
    color: var(--scout-gold);
    font-size: 28px;
  }

  .ideas-header p {
    color: var(--scout-gray);
    margin: 6px 0 0 0;
    font-size: 15px;
  }

  .district-info {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--scout-purple);
    color: var(--scout-white);
    padding: 5px 16px;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-top: 4px;
  }

  /* ----- STATS BADGE ----- */
  .stats-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--scout-white);
    padding: 8px 16px;
    border-radius: 50px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    font-size: 14px;
    font-weight: 500;
    color: var(--scout-dark);
  }

  .stats-badge span {
    color: var(--scout-purple);
    font-weight: 700;
  }

  /* ----- ALERTS ----- */
  .alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-radius: 8px;
    border-left: 4px solid;
    margin-bottom: 16px;
    background: var(--scout-white);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    position: relative;
  }

  .alert-error {
    border-color: var(--scout-red);
    background: #fef2f2;
  }

  .alert-success {
    border-color: var(--scout-green);
    background: #f0fdf4;
  }

  .alert i {
    font-size: 18px;
  }

  .alert-close {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--scout-gray);
    cursor: pointer;
    margin-left: auto;
    padding: 0 4px;
  }

  .alert-close:hover {
    color: var(--scout-dark);
  }

  /* ----- FILTER BAR ----- */
  .filter-bar {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 24px;
    padding: 16px 20px;
    background: var(--scout-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    align-items: center;
  }

  .filter-bar select {
    padding: 8px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    background: var(--scout-white);
    color: var(--scout-dark);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 200px;
  }

  .filter-bar select:focus {
    outline: none;
    border-color: var(--scout-purple);
    box-shadow: 0 0 0 3px rgba(98, 37, 153, 0.15);
  }

  .filter-bar .stats-info {
    margin-left: auto;
    font-size: 14px;
    color: var(--scout-gray);
  }

  /* ----- LOADING ----- */
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    font-size: 18px;
    color: var(--scout-purple);
  }

  .loading-spinner i {
    font-size: 28px;
  }

  /* ----- IDEAS GRID ----- */
  .ideas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
  }

  /* ----- IDEA CARD ----- */
  .idea-card {
    background: var(--scout-white);
    border-radius: 12px;
    padding: 20px 24px;
    border-left: 4px solid var(--scout-gold);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .idea-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  .idea-card.status-implemented {
    border-left-color: var(--scout-purple);
  }

  .idea-card.status-reviewed {
    border-left-color: #0d9488;
  }

  /* ----- IDEA HEADER ----- */
  .idea-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 12px;
  }

  .idea-header h4 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--scout-dark);
    flex: 1;
  }

  .idea-description {
    color: var(--scout-dark);
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 12px 0;
    flex: 1;
  }

  /* ----- IDEA META ----- */
  .idea-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    padding: 10px 0;
    border-top: 1px solid #f1f3f5;
    border-bottom: 1px solid #f1f3f5;
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--scout-gray);
  }

  .idea-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .idea-meta i {
    color: var(--scout-purple);
    font-size: 12px;
  }

  /* ----- STATUS BADGES ----- */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
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

  .badge-completed {
    background: #ede9fe;
    color: #5b21b6;
  }

  .badge-default {
    background: #f1f3f5;
    color: var(--scout-gray);
  }

  /* ----- REMARKS & RESPONSE ----- */
  .idea-remarks {
    margin: 6px 0;
    padding: 10px 12px;
    background: #fef3c7;
    border-radius: 6px;
    border-left: 3px solid var(--scout-gold);
    font-size: 13px;
  }

  .idea-remarks strong {
    color: var(--scout-purple);
  }

  .idea-remarks p {
    margin: 4px 0 0 0;
    color: var(--scout-dark);
  }

  .idea-response {
    margin: 6px 0;
    padding: 10px 12px;
    background: #d1fae5;
    border-radius: 6px;
    border-left: 3px solid var(--scout-green);
    font-size: 13px;
  }

  .idea-response strong {
    color: var(--scout-green);
  }

  .idea-response p {
    margin: 4px 0 0 0;
    color: var(--scout-dark);
  }

  /* ----- BUTTONS ----- */
  .btn-sm {
    padding: 6px 14px;
    font-size: 12px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-sm:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .btn-edit {
    background: var(--scout-gold);
    color: var(--scout-dark);
  }

  .btn-edit:hover {
    background: #dba300;
  }

  .btn-delete {
    background: var(--scout-red);
    color: var(--scout-white);
  }

  .btn-delete:hover {
    background: #a00d25;
  }

  .btn-secondary {
    background: var(--scout-gray);
    color: var(--scout-white);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #4b5563;
  }

  .btn-approve {
    background: #0d9488;
    color: var(--scout-white);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-approve:hover {
    background: #0f766e;
  }

  .btn-success {
    background: var(--scout-purple);
    color: var(--scout-white);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-success:hover {
    background: #4e1d7a;
  }

  .idea-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f3f5;
  }

  /* ----- EMPTY STATE ----- */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: var(--scout-white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    grid-column: 1 / -1;
  }

  .empty-state i {
    font-size: 48px;
    color: var(--scout-gold);
    margin-bottom: 16px;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    color: var(--scout-dark);
    font-size: 20px;
  }

  .empty-state p {
    color: var(--scout-gray);
    font-size: 15px;
    margin: 0;
  }

  /* ----- MODAL ----- */
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
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-content {
    background: var(--scout-white);
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 2px solid var(--scout-gold);
    position: sticky;
    top: 0;
    background: var(--scout-white);
    z-index: 1;
    border-radius: 16px 16px 0 0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--scout-purple);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .modal-header h3 i {
    color: var(--scout-gold);
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--scout-gray);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: #f1f3f5;
    color: var(--scout-dark);
  }

  .modal-body {
    padding: 24px;
  }

  .modal-body h4 {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: var(--scout-dark);
  }

  .modal-body p {
    margin: 6px 0;
    font-size: 14px;
    color: var(--scout-dark);
    line-height: 1.6;
  }

  .modal-body p strong {
    color: var(--scout-purple);
  }

  /* ----- FORM ELEMENTS ----- */
  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    font-size: 14px;
    color: var(--scout-dark);
  }

  .form-group textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    color: var(--scout-dark);
    transition: all 0.2s ease;
    background: var(--scout-white);
    box-sizing: border-box;
    font-family: inherit;
    resize: vertical;
  }

  .form-group textarea:focus {
    outline: none;
    border-color: var(--scout-purple);
    box-shadow: 0 0 0 3px rgba(98, 37, 153, 0.15);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    background: var(--scout-light);
    border-radius: 0 0 16px 16px;
    flex-wrap: wrap;
  }

  /* ----- RESPONSIVE ----- */
  @media (max-width: 768px) {
    .ideas-container {
      padding: 16px;
    }

    .ideas-header {
      flex-direction: column;
      align-items: stretch;
    }

    .ideas-header h2 {
      font-size: 22px;
    }

    .ideas-grid {
      grid-template-columns: 1fr;
    }

    .filter-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-bar select {
      width: 100%;
    }

    .filter-bar .stats-info {
      margin-left: 0;
      text-align: center;
    }

    .modal-content {
      margin: 10px;
      max-height: 95vh;
    }

    .modal-header {
      padding: 16px;
    }

    .modal-header h3 {
      font-size: 17px;
    }

    .modal-body {
      padding: 16px;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-actions button {
      width: 100%;
      justify-content: center;
    }

    .idea-actions {
      flex-direction: column;
    }

    .idea-actions .btn-sm {
      width: 100%;
      justify-content: center;
    }

    .stats-badge {
      align-self: flex-start;
    }
  }

  @media (max-width: 480px) {
    .ideas-container {
      padding: 12px;
    }

    .ideas-header h2 {
      font-size: 19px;
    }

    .idea-card {
      padding: 16px;
    }

    .idea-header {
      flex-direction: column;
    }

    .idea-meta {
      flex-direction: column;
      gap: 6px;
    }
  }

  /* ----- SCROLLBAR ----- */
  .modal-content::-webkit-scrollbar {
    width: 6px;
  }

  .modal-content::-webkit-scrollbar-track {
    background: #f1f3f5;
    border-radius: 3px;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: #c4c9d0;
    border-radius: 3px;
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: #a8adb4;
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================

const ScoutIdeas = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [remarks, setRemarks] = useState('');
  const [responseText, setResponseText] = useState('');
  const [districtInfo, setDistrictInfo] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const categories = [
    'Community Service',
    'Leadership',
    'Environmental',
    'Education',
    'Health',
    'Technology',
    'Other'
  ];

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    getUserDistrict();
    fetchIdeas();
  }, [filterCategory]);

  // ============================================
  // DISTRICT INFO
  // ============================================

  const getUserDistrict = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/district`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.district) {
        setDistrictInfo(response.data);
        console.log('📍 District Commissioner for:', response.data.district);
      }
    } catch (err) {
      console.error('❌ Error fetching user district:', err);
      if (user?.district) {
        setDistrictInfo({ district: user.district });
      }
    }
  };

  // ============================================
  // FETCH IDEAS - FIXED
  // ============================================

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/district/ideas?category=${filterCategory}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📥 Ideas API Response:', response.data);
      
      // ✅ FIX: Ensure ideas is always an array
      let ideasData = [];
      
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        ideasData = response.data;
      } 
      // Check if response.data has a data property that is an array
      else if (response.data && Array.isArray(response.data.data)) {
        ideasData = response.data.data;
      }
      // Check if response.data has an ideas property that is an array
      else if (response.data && Array.isArray(response.data.ideas)) {
        ideasData = response.data.ideas;
      }
      // If response.data is an object with data in it
      else if (response.data && typeof response.data === 'object') {
        // Try to find any array property
        const arrayProps = Object.keys(response.data).filter(key => Array.isArray(response.data[key]));
        if (arrayProps.length > 0) {
          ideasData = response.data[arrayProps[0]];
        } else {
          // If it's a single object, wrap it in an array
          ideasData = [response.data];
        }
      }
      
      // Filter by district if needed
      if (districtInfo?.district && ideasData.length > 0) {
        ideasData = ideasData.filter(idea => 
          idea.district === districtInfo.district
        );
      }
      
      console.log('✅ Processed ideas data:', ideasData);
      setIdeas(ideasData);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching ideas:', err);
      setError(err.response?.data?.message || 'Failed to load ideas');
      setIdeas([]); // ✅ Always set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REVIEW IDEA
  // ============================================

  const handleReview = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/ideas/${id}/review`, 
        { status, remarks, response: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`✅ Idea ${status === 'reviewed' ? 'marked as reviewed' : 'marked as implemented'}!`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedIdea(null);
      setRemarks('');
      setResponseText('');
      fetchIdeas();
    } catch (err) {
      console.error('❌ Error reviewing idea:', err);
      setError(err.response?.data?.message || 'Failed to update idea');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ============================================
  // DELETE IDEA
  // ============================================

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/district/ideas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Idea deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchIdeas();
    } catch (err) {
      console.error('❌ Error deleting idea:', err);
      setError(err.response?.data?.message || 'Failed to delete idea');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ============================================
  // STATUS HELPERS
  // ============================================

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'reviewed': 'badge-review',
      'implemented': 'badge-completed'
    };
    return badges[status] || 'badge-default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fa-clock',
      'reviewed': 'fa-check-circle',
      'implemented': 'fa-star'
    };
    return icons[status] || 'fa-lightbulb';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'reviewed': 'Reviewed',
      'implemented': 'Implemented'
    };
    return labels[status] || status;
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i> Loading ideas...
    </div>
  );

  // ✅ Ensure ideas is always an array for rendering
  const ideasList = Array.isArray(ideas) ? ideas : [];

  return (
    <>
      <style>{styles}</style>
      
      <div className="ideas-container">
        {/* HEADER */}
        <div className="ideas-header">
          <div>
            <h2>
              <i className="fas fa-lightbulb"></i> 
              Scout Ideas
            </h2>
            <p>
              Review ideas and suggestions from scouts in 
              <strong> {districtInfo?.district || 'your district'}</strong>
            </p>
            {districtInfo?.district && (
              <span className="district-info">
                <i className="fas fa-map-marker-alt"></i> {districtInfo.district} District
              </span>
            )}
          </div>
          <div className="stats-badge">
            <i className="fas fa-lightbulb" style={{ color: 'var(--scout-gold)' }}></i>
            Total: <span>{ideasList.length}</span> ideas
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle" style={{ color: 'var(--scout-red)' }}></i>
            {error}
            <button className="alert-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle" style={{ color: 'var(--scout-green)' }}></i>
            {success}
            <button className="alert-close" onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* FILTER BAR */}
        <div className="filter-bar">
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span className="stats-info">
            Showing {ideasList.length} idea{ideasList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* IDEAS GRID */}
        <div className="ideas-grid">
          {ideasList.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-lightbulb"></i>
              <h3>No Ideas Found</h3>
              <p>No ideas have been submitted by members in your district yet.</p>
            </div>
          ) : (
            ideasList.map(idea => (
              <div key={idea.id || idea._id} className={`idea-card status-${idea.status || 'pending'}`}>
                <div className="idea-header">
                  <h4>{idea.title || 'Untitled Idea'}</h4>
                  <span className={`status-badge ${getStatusBadge(idea.status)}`}>
                    <i className={`fas ${getStatusIcon(idea.status)}`}></i>
                    {getStatusLabel(idea.status)}
                  </span>
                </div>
                
                <p className="idea-description">{idea.description || 'No description provided'}</p>
                
                <div className="idea-meta">
                  <span>
                    <i className="fas fa-user"></i> {idea.submittedBy || idea.creator?.full_name || idea.user?.full_name || 'Unknown'}
                  </span>
                  <span>
                    <i className="fas fa-tag"></i> {idea.category || 'Uncategorized'}
                  </span>
                  <span>
                    <i className="fas fa-calendar"></i> {idea.date || (idea.created_at ? new Date(idea.created_at).toLocaleDateString() : 'N/A')}
                  </span>
                  {idea.district && (
                    <span>
                      <i className="fas fa-map-marker-alt"></i> {idea.district}
                    </span>
                  )}
                </div>

                {idea.feedback && (
                  <div className="idea-remarks">
                    <strong>Remarks:</strong>
                    <p>{idea.feedback}</p>
                  </div>
                )}

                {idea.response && (
                  <div className="idea-response">
                    <strong>Response:</strong>
                    <p>{idea.response}</p>
                  </div>
                )}

                <div className="idea-actions">
                  <button 
                    className="btn-sm btn-edit" 
                    onClick={() => {
                      setSelectedIdea(idea);
                      setRemarks(idea.feedback || '');
                      setResponseText(idea.response || '');
                    }}
                  >
                    <i className="fas fa-edit"></i> Review
                  </button>
                  
                  <button 
                    className="btn-sm btn-delete" 
                    onClick={() => handleDelete(idea.id || idea._id)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* REVIEW MODAL */}
        {selectedIdea && (
          <div className="modal-overlay" onClick={() => {
            setSelectedIdea(null);
            setRemarks('');
            setResponseText('');
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <i className="fas fa-lightbulb"></i> 
                  {selectedIdea.status === 'pending' ? 'Review Idea' : 'Idea Details'}
                </h3>
                <button className="modal-close" onClick={() => {
                  setSelectedIdea(null);
                  setRemarks('');
                  setResponseText('');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <h4>{selectedIdea.title || 'Untitled Idea'}</h4>
                
                <p>
                  <strong>Submitted by:</strong> {selectedIdea.submittedBy || selectedIdea.creator?.full_name || selectedIdea.user?.full_name || 'Unknown'}
                </p>
                <p>
                  <strong>Category:</strong> {selectedIdea.category || 'Uncategorized'}
                </p>
                <p>
                  <strong>District:</strong> {selectedIdea.district || 'N/A'}
                </p>
                <p>
                  <strong>Date:</strong> {selectedIdea.date || (selectedIdea.created_at ? new Date(selectedIdea.created_at).toLocaleDateString() : 'N/A')}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge ${getStatusBadge(selectedIdea.status)}`}>
                    <i className={`fas ${getStatusIcon(selectedIdea.status)}`}></i>
                    {getStatusLabel(selectedIdea.status)}
                  </span>
                </p>
                <p><strong>Description:</strong></p>
                <p style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                  {selectedIdea.description || 'No description provided'}
                </p>

                <div className="form-group">
                  <label>Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    rows="3"
                    placeholder="Add your remarks about this idea..."
                  />
                </div>

                <div className="form-group">
                  <label>Response to Scout</label>
                  <textarea
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    rows="2"
                    placeholder="Write a response to the scout who submitted this idea..."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => {
                  setSelectedIdea(null);
                  setRemarks('');
                  setResponseText('');
                }}>
                  Cancel
                </button>
                
                {selectedIdea.status !== 'implemented' && (
                  <>
                    <button 
                      className="btn-approve" 
                      onClick={() => handleReview(selectedIdea.id || selectedIdea._id, 'reviewed')}
                    >
                      <i className="fas fa-check"></i> Mark as Reviewed
                    </button>
                    <button 
                      className="btn-success" 
                      onClick={() => handleReview(selectedIdea.id || selectedIdea._id, 'implemented')}
                    >
                      <i className="fas fa-star"></i> Implemented
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ScoutIdeas;