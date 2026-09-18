import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 🎨 MSR Scout Color Palette
const COLORS = {
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
};

const ReceivedProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [districts, setDistricts] = useState([]);
  const [comment, setComment] = useState('');
  const [publishToPublic, setPublishToPublic] = useState(false);

  // ✅ Check if user is Super Admin
  const isSuperAdmin = user?.role === 'super_admin' || 
                       user?.role === 'super-admin' || 
                       user?.role === 'admin';

  const categories = [
    'Community Service',
    'Environmental',
    'Education',
    'Health',
    'Leadership',
    'Innovation',
    'Other'
  ];

  useEffect(() => {
    fetchProjects();
    fetchDistricts();
  }, [filterDistrict, filterCategory]);

  // ✅ Helper function to get submitter name from various data sources
  const getSubmitterName = (project) => {
    if (project.submitter?.user?.full_name) {
      return project.submitter.user.full_name;
    }
    if (project.submitter?.first_name && project.submitter?.last_name) {
      return `${project.submitter.first_name} ${project.submitter.last_name}`;
    }
    if (project.submitter?.name) {
      return project.submitter.name;
    }
    if (project.submitter?.fullName) {
      return project.submitter.fullName;
    }
    if (project.submitterName) {
      return project.submitterName;
    }
    if (project.submittedBy && project.submittedBy !== '7') {
      return project.submittedBy;
    }
    if (project.submitted_by && project.submitted_by !== '7') {
      return project.submitted_by;
    }
    if (project.user?.full_name) {
      return project.user.full_name;
    }
    if (project.creator?.full_name) {
      return project.creator.full_name;
    }
    if (project.user_id || project.submitted_by_id) {
      const userId = project.user_id || project.submitted_by_id;
      if (window.userMap && window.userMap[userId]) {
        return window.userMap[userId];
      }
    }
    if (project.submittedBy && !isNaN(project.submittedBy)) {
      return `User ${project.submittedBy}`;
    }
    return 'Unknown Submitter';
  };

  const getSubmitterEmail = (project) => {
    if (project.submitter?.user?.email) return project.submitter.user.email;
    if (project.submitter?.email) return project.submitter.email;
    if (project.submitted_by_email) return project.submitted_by_email;
    if (project.user?.email) return project.user.email;
    return null;
  };

  const getProjectDistrict = (project) => {
    if (project.district) return project.district;
    if (project.submitter?.district) return project.submitter.district;
    if (project.submitter?.user?.member?.district) return project.submitter.user.member.district;
    return 'N/A';
  };

  const getProjectCategory = (project) => {
    if (project.category) return project.category;
    if (project.project_category) return project.project_category;
    return 'N/A';
  };

  const getProjectBudget = (project) => {
    if (project.budget) return project.budget;
    if (project.project_budget) return project.project_budget;
    return null;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/national/projects?district=${filterDistrict}&category=${filterCategory}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let projectsData = response.data?.projects || response.data || [];
      if (!Array.isArray(projectsData)) {
        projectsData = [];
      }
      
      console.log('📊 Projects data:', projectsData);
      if (projectsData.length > 0) {
        console.log('📝 First project structure:', projectsData[0]);
      }
      
      setProjects(projectsData);
    } catch (err) {
      console.error('Fetch projects error:', err);
      setError(err.response?.data?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/national/districts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const districtsData = response.data?.districts || response.data || [];
      setDistricts(Array.isArray(districtsData) ? districtsData : []);
    } catch (err) {
      console.error('Failed to load districts:', err);
      setDistricts([]);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/national/projects/${id}/approve`, 
        { comment, publishToPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(publishToPublic ? '✅ Project approved and published to public page!' : '✅ Project approved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedProject(null);
      setComment('');
      setPublishToPublic(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve project');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/national/projects/${id}/reject`, 
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Project rejected with feedback!');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedProject(null);
      setComment('');
      setPublishToPublic(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject project');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePublish = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/national/projects/${id}/publish`, 
        { publishToPublic: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('✅ Project published to public page successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish project');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleArchive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/national/projects/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Project archived successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive project');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!isSuperAdmin) {
      setError('❌ Only Super Admin can delete projects');
      return;
    }
    if (!window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone!')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/national/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Project deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete project');
      setTimeout(() => setError(''), 3000);
    }
  };

  const downloadFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/national/projects/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'project-file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download file');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'published': 'badge-published',
      'rejected': 'badge-rejected',
      'archived': 'badge-archived'
    };
    return badges[status] || 'badge-default';
  };

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeDistricts = Array.isArray(districts) ? districts : [];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading projects...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <h2 style={styles.pageTitle}>
            <span style={styles.titleIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFD100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#FFD100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#FFD100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Project Management
          </h2>
          <p style={styles.pageSubtitle}>Manage projects submitted by scouts</p>
          {isSuperAdmin && (
            <span style={styles.superAdminBadge}>
              <span style={styles.crownIcon}>👑</span> Super Admin - Full Access
            </span>
          )}
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBadge}>
            <span style={styles.statNumber}>{safeProjects.length}</span>
            <span style={styles.statLabel}>Total Projects</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={styles.alertError}>
          <span style={styles.alertIcon}>❌</span>
          <div>
            <strong>Error</strong>
            <p style={styles.alertMessage}>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div style={styles.alertSuccess}>
          <span style={styles.alertIcon}>✅</span>
          <div>
            <strong>Success</strong>
            <p style={styles.alertMessage}>{success}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>
            <span style={styles.filterIcon}>📍</span>
            <select 
              value={filterDistrict} 
              onChange={e => setFilterDistrict(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Districts</option>
              {safeDistricts.map(district => (
                <option key={district.id || district.name} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
          </label>
          
          <label style={styles.filterLabel}>
            <span style={styles.filterIcon}>🏷️</span>
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={styles.filterStats}>
          <span style={styles.statsInfo}>
            <span style={styles.statsDot}></span>
            {safeProjects.length} projects found
          </span>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={styles.projectsGrid}>
        {safeProjects.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={styles.emptyTitle}>No Projects</h3>
            <p style={styles.emptyText}>No projects submitted yet</p>
          </div>
        ) : (
          safeProjects.map(project => {
            const projectTitle = project.title || 'Untitled Project';
            const projectStatus = project.status || 'pending';
            const submittedBy = getSubmitterName(project);
            const submitterEmail = getSubmitterEmail(project);
            const projectDistrict = getProjectDistrict(project);
            const projectCategory = getProjectCategory(project);
            const projectDate = project.date || project.createdAt || project.created_at || 'N/A';
            const projectBudget = getProjectBudget(project);
            const budgetDisplay = projectBudget ? `RWF ${parseFloat(projectBudget).toLocaleString()}` : 'N/A';
            const isPublished = projectStatus === 'published';
            const isApproved = projectStatus === 'approved';
            
            return (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleGroup}>
                    <h4 style={styles.cardTitle}>{projectTitle}</h4>
                    <span style={{...styles.statusBadge, ...styles[getStatusBadge(projectStatus)]}}>
                      {projectStatus || 'pending'}
                    </span>
                  </div>
                  {isPublished && (
                    <span style={styles.publishedBadge}>
                      🌍 Public
                    </span>
                  )}
                </div>
                
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>
                    {project.description || 'No description provided'}
                  </p>
                  
                  <div style={styles.cardMeta}>
                    <span style={styles.metaItem}>
                      <span style={styles.metaIcon}>👤</span> {submittedBy}
                    </span>
                    {submitterEmail && (
                      <span style={styles.metaItem}>
                        <span style={styles.metaIcon}>✉️</span> {submitterEmail}
                      </span>
                    )}
                    <span style={styles.metaItem}>
                      <span style={styles.metaIcon}>📍</span> {projectDistrict}
                    </span>
                    <span style={styles.metaItem}>
                      <span style={styles.metaIcon}>🏷️</span> {projectCategory}
                    </span>
                    <span style={styles.metaItem}>
                      <span style={styles.metaIcon}>💰</span> {budgetDisplay}
                    </span>
                    <span style={styles.metaItem}>
                      <span style={styles.metaIcon}>📅</span> {projectDate}
                    </span>
                  </div>

                  {project.files && project.files.length > 0 && (
                    <div style={styles.attachments}>
                      <strong style={styles.attachmentsLabel}>📎 Files:</strong>
                      {project.files.map((file, index) => (
                        <button 
                          key={index} 
                          style={styles.attachmentLink}
                          onClick={() => downloadFile(file.id)}
                        >
                          ⬇️ {file.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {project.feedback && (
                    <div style={styles.feedbackBox}>
                      <strong>💬 Feedback:</strong>
                      <p style={styles.feedbackText}>{project.feedback}</p>
                    </div>
                  )}
                </div>

                <div style={styles.cardActions}>
                  {projectStatus === 'pending' && (
                    <button 
                      style={{...styles.actionButton, ...styles.actionApprove}}
                      onClick={() => setSelectedProject(project)}
                    >
                      ✅ Review
                    </button>
                  )}
                  {isApproved && !isPublished && (
                    <button 
                      style={{...styles.actionButton, ...styles.actionPublish}}
                      onClick={() => handlePublish(project.id)}
                    >
                      🌍 Publish
                    </button>
                  )}
                  {projectStatus === 'approved' && (
                    <button 
                      style={{...styles.actionButton, ...styles.actionArchive}}
                      onClick={() => handleArchive(project.id)}
                    >
                      📦 Archive
                    </button>
                  )}
                  <button 
                    style={{...styles.actionButton, ...styles.actionView}}
                  >
                    👁️ Details
                  </button>
                  {isSuperAdmin && (
                    <button 
                      style={{...styles.actionButton, ...styles.actionDelete}}
                      onClick={() => handleDelete(project.id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {selectedProject && (
        <div style={styles.modalOverlay} onClick={() => setSelectedProject(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <span style={styles.modalTitleIcon}>✅</span> Review Project
              </h3>
              <button style={styles.modalClose} onClick={() => setSelectedProject(null)}>
                ✕
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <h4 style={styles.modalProjectTitle}>
                {selectedProject.title || 'Untitled Project'}
              </h4>
              
              <div style={styles.modalInfoGrid}>
                <div style={styles.modalInfoItem}>
                  <span style={styles.modalInfoLabel}>👤 Submitted by</span>
                  <span style={styles.modalInfoValue}>{getSubmitterName(selectedProject)}</span>
                </div>
                {getSubmitterEmail(selectedProject) && (
                  <div style={styles.modalInfoItem}>
                    <span style={styles.modalInfoLabel}>✉️ Email</span>
                    <span style={styles.modalInfoValue}>{getSubmitterEmail(selectedProject)}</span>
                  </div>
                )}
                <div style={styles.modalInfoItem}>
                  <span style={styles.modalInfoLabel}>📍 District</span>
                  <span style={styles.modalInfoValue}>{getProjectDistrict(selectedProject)}</span>
                </div>
                <div style={styles.modalInfoItem}>
                  <span style={styles.modalInfoLabel}>🏷️ Category</span>
                  <span style={styles.modalInfoValue}>{getProjectCategory(selectedProject)}</span>
                </div>
                <div style={styles.modalInfoItem}>
                  <span style={styles.modalInfoLabel}>💰 Budget</span>
                  <span style={styles.modalInfoValue}>
                    {selectedProject.budget ? `RWF ${parseFloat(selectedProject.budget).toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div style={styles.modalInfoItem}>
                  <span style={styles.modalInfoLabel}>📅 Date</span>
                  <span style={styles.modalInfoValue}>
                    {selectedProject.date || selectedProject.createdAt || selectedProject.created_at || 'N/A'}
                  </span>
                </div>
              </div>

              <div style={styles.modalDescription}>
                <strong style={styles.modalLabel}>📝 Description</strong>
                <p style={styles.modalText}>{selectedProject.description || 'No description provided'}</p>
              </div>

              {selectedProject.files && selectedProject.files.length > 0 && (
                <div style={styles.modalAttachments}>
                  <strong style={styles.modalLabel}>📎 Files</strong>
                  {selectedProject.files.map((file, index) => (
                    <button 
                      key={index} 
                      style={styles.modalAttachmentLink}
                      onClick={() => downloadFile(file.id)}
                    >
                      ⬇️ {file.name}
                    </button>
                  ))}
                </div>
              )}

              <div style={styles.publishOption}>
                <label style={styles.publishCheckbox}>
                  <input
                    type="checkbox"
                    checked={publishToPublic}
                    onChange={e => setPublishToPublic(e.target.checked)}
                    style={styles.publishInput}
                  />
                  <span style={styles.publishLabel}>
                    🌍 Publish to Public Page (Landing Page)
                  </span>
                </label>
                <small style={styles.publishHint}>
                  ℹ️ When published, this project will be visible on the public landing page for all visitors.
                </small>
              </div>

              <div style={styles.commentGroup}>
                <label style={styles.commentLabel}>💬 Comment / Feedback</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows="3"
                  placeholder="Add your feedback..."
                  style={styles.commentTextarea}
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button 
                style={{...styles.modalButton, ...styles.modalButtonCancel}}
                onClick={() => {
                  setSelectedProject(null);
                  setPublishToPublic(false);
                }}
              >
                Cancel
              </button>
              <button 
                style={{...styles.modalButton, ...styles.modalButtonReject}}
                onClick={() => handleReject(selectedProject.id)}
              >
                ❌ Reject
              </button>
              <button 
                style={{...styles.modalButton, ...styles.modalButtonApprove}}
                onClick={() => handleApprove(selectedProject.id)}
              >
                ✅ {publishToPublic ? 'Approve & Publish' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 Styles
const styles = {
  // Container
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#F5F7FA',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: '#F5F7FA',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `4px solid #E5E7EB`,
    borderTop: `4px solid #6A1B9A`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6B7280',
    fontSize: '16px',
  },

  // Page Header
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    padding: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '28px',
    fontWeight: '700',
    color: '#263238',
    margin: '0 0 4px 0',
  },
  titleIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: '12px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  superAdminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#6A1B9A',
    color: '#FFD100',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  crownIcon: {
    fontSize: '14px',
  },
  headerStats: {
    display: 'flex',
    alignItems: 'center',
  },
  statBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 20px',
    background: '#6A1B9A',
    borderRadius: '12px',
    color: '#FFFFFF',
    minWidth: '80px',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '11px',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Alerts
  alertError: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 18px',
    marginBottom: '20px',
    backgroundColor: '#FEF2F2',
    borderLeft: `4px solid #D32F2F`,
    borderRadius: '8px',
    color: '#991B1B',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 18px',
    marginBottom: '20px',
    backgroundColor: '#F0FDF4',
    borderLeft: `4px solid #2E7D32`,
    borderRadius: '8px',
    color: '#166534',
  },
  alertIcon: {
    fontSize: '20px',
    marginTop: '2px',
  },
  alertMessage: {
    margin: '2px 0 0 0',
    fontSize: '14px',
  },

  // Filter Bar
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '24px',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
  },
  filterGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F9FAFB',
    padding: '4px 12px 4px 8px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s',
  },
  filterIcon: {
    fontSize: '16px',
  },
  filterSelect: {
    padding: '6px 8px',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#263238',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '140px',
    fontFamily: 'inherit',
  },
  filterStats: {
    display: 'flex',
    alignItems: 'center',
  },
  statsInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6B7280',
  },
  statsDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#6A1B9A',
  },

  // Projects Grid
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
  },

  // Empty State
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '2px dashed #E5E7EB',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '20px',
    color: '#263238',
    margin: '0 0 4px 0',
  },
  emptyText: {
    fontSize: '15px',
    color: '#6B7280',
    margin: '0',
  },

  // Project Card
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
    transition: 'all 0.25s ease',
    ':hover': {
      boxShadow: '0 8px 25px rgba(106, 27, 154, 0.12)',
      transform: 'translateY(-2px)',
      borderColor: '#6A1B9A',
    },
  },

  // Card Header
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 20px 12px 20px',
    borderBottom: '1px solid #F3F4F6',
    backgroundColor: '#FAFAFC',
  },
  cardTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#263238',
    margin: '0',
    flex: '1',
  },
  statusBadge: {
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
  'badge-pending': {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  'badge-approved': {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  'badge-published': {
    backgroundColor: '#6A1B9A',
    color: '#FFD100',
  },
  'badge-rejected': {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  'badge-archived': {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  'badge-default': {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  publishedBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#065F46',
    backgroundColor: '#D1FAE5',
    padding: '2px 10px',
    borderRadius: '12px',
  },

  // Card Body
  cardBody: {
    padding: '16px 20px',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: '1.6',
    margin: '0 0 14px 0',
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    padding: '12px 0',
    borderTop: '1px solid #F3F4F6',
    borderBottom: '1px solid #F3F4F6',
  },
  metaItem: {
    fontSize: '13px',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  metaIcon: {
    fontSize: '14px',
  },

  // Attachments
  attachments: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  attachmentsLabel: {
    fontSize: '13px',
    color: '#374151',
    marginRight: '4px',
  },
  attachmentLink: {
    background: 'none',
    border: 'none',
    color: '#6A1B9A',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '2px 8px',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: '#F3E8FF',
    },
  },

  // Feedback Box
  feedbackBox: {
    marginTop: '12px',
    padding: '12px 14px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    borderLeft: `3px solid #6A1B9A`,
  },
  feedbackText: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#4B5563',
  },

  // Card Actions
  cardActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '12px 20px 16px 20px',
    borderTop: '1px solid #F3F4F6',
    backgroundColor: '#FAFAFC',
  },
  actionButton: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    ':hover': {
      transform: 'scale(1.02)',
    },
  },
  actionApprove: {
    backgroundColor: '#6A1B9A',
    color: '#FFD100',
  },
  actionPublish: {
    backgroundColor: '#2E7D32',
    color: '#FFFFFF',
  },
  actionArchive: {
    backgroundColor: '#6B7280',
    color: '#FFFFFF',
  },
  actionView: {
    backgroundColor: '#E5E7EB',
    color: '#374151',
  },
  actionDelete: {
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
  },

  // Modal Overlay
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
  },

  // Modal Header
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFC',
    borderRadius: '20px 20px 0 0',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#263238',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modalTitleIcon: {
    fontSize: '24px',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6B7280',
    padding: '4px 8px',
    borderRadius: '8px',
    ':hover': {
      backgroundColor: '#F3F4F6',
    },
  },

  // Modal Body
  modalBody: {
    padding: '24px',
  },
  modalProjectTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#263238',
    margin: '0 0 18px 0',
  },
  modalInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '18px',
  },
  modalInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 14px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #F3F4F6',
  },
  modalInfoLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  modalInfoValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#263238',
    marginTop: '2px',
  },
  modalDescription: {
    marginBottom: '18px',
  },
  modalLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    display: 'block',
    marginBottom: '4px',
  },
  modalText: {
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: '1.6',
    margin: '4px 0 0 0',
  },
  modalAttachments: {
    marginBottom: '18px',
  },
  modalAttachmentLink: {
    display: 'inline-block',
    margin: '4px 8px 4px 0',
    padding: '4px 14px',
    background: '#F3E8FF',
    color: '#6A1B9A',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    ':hover': {
      backgroundColor: '#E8D5F5',
    },
  },

  // Publish Option
  publishOption: {
    padding: '16px',
    backgroundColor: '#F0FDF4',
    borderRadius: '10px',
    border: '1px solid #D1FAE5',
    marginBottom: '18px',
  },
  publishCheckbox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
  },
  publishInput: {
    marginTop: '2px',
    width: '18px',
    height: '18px',
    accentColor: '#6A1B9A',
    cursor: 'pointer',
  },
  publishLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#065F46',
  },
  publishHint: {
    display: 'block',
    marginTop: '6px',
    marginLeft: '28px',
    fontSize: '13px',
    color: '#6B7280',
  },

  // Comment
  commentGroup: {
    marginTop: '4px',
  },
  commentLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    display: 'block',
    marginBottom: '6px',
  },
  commentTextarea: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px',
    transition: 'border-color 0.2s',
    ':focus': {
      outline: 'none',
      borderColor: '#6A1B9A',
      boxShadow: '0 0 0 3px rgba(106, 27, 154, 0.1)',
    },
  },

  // Modal Actions
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '16px 24px 20px 24px',
    borderTop: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFC',
    borderRadius: '0 0 20px 20px',
  },
  modalButton: {
    padding: '10px 24px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    ':hover': {
      transform: 'scale(1.02)',
    },
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  },
  modalButtonReject: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  modalButtonApprove: {
    backgroundColor: '#6A1B9A',
    color: '#FFD100',
  },
};

export default ReceivedProjects;