// src/components/scout/SubmitProject.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// 🎨 Scout Color Palette
const SCOUT = {
  purple: '#6A1B9A',
  gold: '#FFD100',
  darkBlue: '#002B5C',
  green: '#2E7D32',
  red: '#D32F2F',
  white: '#FFFFFF',
  dark: '#1F2937',
  light: '#F5F7FA',
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SubmitProject = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projects, setProjects] = useState([]);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    objectives: '',
    timeline: '',
    budget: ''
  });
  const [file, setFile] = useState(null);

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
  }, []);

  const fetchProjects = async () => {
    try {
      setFetchingProjects(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setFetchingProjects(false);
        return;
      }

      const response = await axios.get(`${API_URL}/scout/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let projectsData = [];
      if (response.data?.success) {
        projectsData = response.data.projects || [];
      } else if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data?.data) {
        projectsData = response.data.data;
      }

      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error('❌ Fetch projects error:', err);
    } finally {
      setFetchingProjects(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (file) {
        formDataToSend.append('document', file);
      }

      await axios.post(`${API_URL}/scout/projects`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('✅ Project submitted successfully! You will receive feedback soon.');
      setFormData({
        title: '',
        description: '',
        category: '',
        objectives: '',
        timeline: '',
        budget: ''
      });
      setFile(null);
      
      await fetchProjects();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'badge-pending',
      'reviewing': 'badge-info',
      'approved': 'badge-approved',
      'rejected': 'badge-rejected',
      'in_progress': 'badge-progress',
      'completed': 'badge-completed'
    };
    return classes[status] || 'badge-default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'reviewing': '📋',
      'approved': '✅',
      'rejected': '❌',
      'in_progress': '🔄',
      'completed': '🎉'
    };
    return icons[status] || '📌';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending Review',
      'reviewing': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    };
    return labels[status] || status || 'Unknown';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const closeProjectDetails = () => {
    setShowDetailModal(false);
    setSelectedProject(null);
  };

  // ✅ Helper function to get full document URL
  const getDocumentUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h2><i className="fas fa-project-diagram" style={{ color: SCOUT.gold }}></i> Submit Project</h2>
          <p style={{ color: SCOUT.dark }}>Submit your project for review and approval</p>
        </div>
        <button className="btn-secondary-sm" onClick={fetchProjects}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ borderLeftColor: SCOUT.red }}>
          <i className="fas fa-exclamation-circle" style={{ color: SCOUT.red }}></i>
          <p>{error}</p>
          <button className="btn-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ borderLeftColor: SCOUT.green }}>
          <i className="fas fa-check-circle" style={{ color: SCOUT.green }}></i>
          <p>{success}</p>
          <button className="btn-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="card" style={{ border: `1px solid ${SCOUT.light}` }}>
        <h3 style={{ color: SCOUT.darkBlue }}>
          <i className="fas fa-plus-circle" style={{ color: SCOUT.gold }}></i> Submit New Project
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ color: SCOUT.dark }}>Project Title <span className="required" style={{ color: SCOUT.red }}>*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter project title"
              style={{ borderColor: SCOUT.light }}
            />
          </div>

          <div className="form-group">
            <label style={{ color: SCOUT.dark }}>Category <span className="required" style={{ color: SCOUT.red }}>*</span></label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ borderColor: SCOUT.light }}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: SCOUT.dark }}>Description <span className="required" style={{ color: SCOUT.red }}>*</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your project in detail"
              rows="5"
              style={{ borderColor: SCOUT.light }}
            />
          </div>

          <div className="form-group">
            <label style={{ color: SCOUT.dark }}>Objectives</label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              placeholder="List the objectives of your project"
              rows="3"
              style={{ borderColor: SCOUT.light }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ color: SCOUT.dark }}>Timeline</label>
              <input
                type="text"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="e.g., 3 months"
                style={{ borderColor: SCOUT.light }}
              />
            </div>
            <div className="form-group">
              <label style={{ color: SCOUT.dark }}>Budget (RWF)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Estimated budget"
                style={{ borderColor: SCOUT.light }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: SCOUT.dark }}>Upload Document (PDF, Word, Image)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ borderColor: SCOUT.light }}
            />
            <small className="form-hint" style={{ color: SCOUT.dark, opacity: 0.7 }}>
              Supported formats: PDF, Word, JPG, PNG (Max 10MB)
            </small>
            {file && (
              <div className="file-info" style={{ 
                background: SCOUT.light, 
                borderColor: SCOUT.gold 
              }}>
                <i className="fas fa-file" style={{ color: SCOUT.purple }}></i>
                <span style={{ color: SCOUT.dark }}>{file.name}</span>
                <span className="file-size" style={{ color: SCOUT.dark, opacity: 0.6 }}>
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{
                backgroundColor: SCOUT.purple,
                color: SCOUT.white,
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#7B1FA2';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = SCOUT.purple;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span> Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Submit Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* My Projects Section */}
      <div className="my-projects-section">
        <div className="section-header">
          <h3 style={{ color: SCOUT.darkBlue }}>
            <i className="fas fa-list" style={{ color: SCOUT.gold }}></i>
            My Projects
            <span className="badge" style={{
              background: SCOUT.gold,
              color: SCOUT.dark,
              padding: '2px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {projects.length}
            </span>
          </h3>
        </div>

        {fetchingProjects ? (
          <div className="loading-spinner">
            <div className="spinner-small"></div>
            <p style={{ color: SCOUT.dark }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ 
            background: SCOUT.light,
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <i className="fas fa-inbox" style={{ color: SCOUT.purple, fontSize: '40px', opacity: 0.5 }}></i>
            <p style={{ color: SCOUT.dark }}>You haven't submitted any projects yet.</p>
            <p className="text-muted" style={{ color: SCOUT.dark, opacity: 0.6 }}>Submit your first project above!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="project-card"
                style={{
                  background: SCOUT.white,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: `1px solid ${SCOUT.light}`,
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div className="project-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '16px 16px 12px',
                  borderBottom: `1px solid ${SCOUT.light}`,
                  gap: '12px'
                }}>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    color: SCOUT.darkBlue,
                    flex: 1
                  }}>
                    {project.title}
                  </h4>
                  <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                    {getStatusIcon(project.status)} {getStatusLabel(project.status)}
                  </span>
                </div>
                <div className="project-body" style={{ padding: '16px' }}>
                  <p className="project-description" style={{
                    color: SCOUT.dark,
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: '0 0 12px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {project.description}
                  </p>
                  <div className="project-meta" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '13px',
                    color: SCOUT.dark
                  }}>
                    <span>
                      <i className="fas fa-tag" style={{ color: SCOUT.gold }}></i> {project.category || 'Uncategorized'}
                    </span>
                    <span>
                      <i className="fas fa-money-bill" style={{ color: SCOUT.gold }}></i> {formatCurrency(project.budget)}
                    </span>
                    <span>
                      <i className="fas fa-calendar" style={{ color: SCOUT.gold }}></i> {formatDate(project.created_at)}
                    </span>
                  </div>
                  {project.document_url && (
                    <div className="project-document" style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      background: SCOUT.light,
                      borderRadius: '6px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <i className="fas fa-paperclip" style={{ color: SCOUT.purple }}></i>
                      <a 
                        href={getDocumentUrl(project.document_url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="document-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(getDocumentUrl(project.document_url), '_blank');
                        }}
                        style={{ 
                          color: SCOUT.purple,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <i className="fas fa-file-pdf"></i> View Document
                      </a>
                    </div>
                  )}
                  <div className="project-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-sm btn-view"
                      onClick={() => openProjectDetails(project)}
                      style={{
                        background: SCOUT.purple,
                        color: SCOUT.white,
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#7B1FA2'}
                      onMouseLeave={(e) => e.target.style.background = SCOUT.purple}
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

      {/* Project Details Modal */}
      {showDetailModal && selectedProject && (
        <div className="modal-overlay" onClick={closeProjectDetails} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()} style={{
            background: SCOUT.white,
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: `1px solid ${SCOUT.light}`,
              position: 'sticky',
              top: 0,
              background: SCOUT.white,
              zIndex: 1
            }}>
              <h3 style={{ color: SCOUT.darkBlue }}>
                <i className="fas fa-project-diagram" style={{ color: SCOUT.gold }}></i>
                Project Details
              </h3>
              <button className="modal-close" onClick={closeProjectDetails} style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: SCOUT.dark,
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = SCOUT.light}
              onMouseLeave={(e) => e.target.style.background = 'none'}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="project-detail-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  color: SCOUT.darkBlue 
                }}>
                  {selectedProject.title}
                </h2>
                <span className={`status-badge ${getStatusBadgeClass(selectedProject.status)}`}>
                  {getStatusIcon(selectedProject.status)} {getStatusLabel(selectedProject.status)}
                </span>
              </div>

              <div className="project-detail-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div className="detail-item">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: SCOUT.dark,
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Category</label>
                  <p style={{ margin: 0, fontSize: '15px', color: SCOUT.dark }}>
                    {selectedProject.category || 'Uncategorized'}
                  </p>
                </div>
                <div className="detail-item">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: SCOUT.dark,
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Budget</label>
                  <p style={{ margin: 0, fontSize: '15px', color: SCOUT.dark }}>
                    {formatCurrency(selectedProject.budget)}
                  </p>
                </div>
                <div className="detail-item">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: SCOUT.dark,
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Timeline</label>
                  <p style={{ margin: 0, fontSize: '15px', color: SCOUT.dark }}>
                    {selectedProject.timeline || 'Not specified'}
                  </p>
                </div>
                <div className="detail-item">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: SCOUT.dark,
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Submitted On</label>
                  <p style={{ margin: 0, fontSize: '15px', color: SCOUT.dark }}>
                    {formatDate(selectedProject.created_at)}
                  </p>
                </div>
              </div>

              <div className="detail-section" style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: SCOUT.darkBlue,
                  display: 'block',
                  marginBottom: '6px'
                }}>Description</label>
                <p style={{ 
                  margin: 0, 
                  color: SCOUT.dark, 
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedProject.description || 'No description provided'}
                </p>
              </div>

              {selectedProject.objectives && (
                <div className="detail-section" style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: SCOUT.darkBlue,
                    display: 'block',
                    marginBottom: '6px'
                  }}>Objectives</label>
                  <p style={{ 
                    margin: 0, 
                    color: SCOUT.dark, 
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedProject.objectives}
                  </p>
                </div>
              )}

              {selectedProject.document_url && (
                <div className="detail-section" style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: SCOUT.darkBlue,
                    display: 'block',
                    marginBottom: '6px'
                  }}>Document</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a 
                      href={getDocumentUrl(selectedProject.document_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-sm btn-view"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(getDocumentUrl(selectedProject.document_url), '_blank');
                      }}
                      style={{
                        background: SCOUT.purple,
                        color: SCOUT.white,
                        padding: '8px 16px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#7B1FA2'}
                      onMouseLeave={(e) => e.target.style.background = SCOUT.purple}
                    >
                      <i className="fas fa-file-download"></i> Download Document
                    </a>
                    <a 
                      href={getDocumentUrl(selectedProject.document_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-sm btn-secondary"
                      style={{
                        background: SCOUT.light,
                        color: SCOUT.dark,
                        padding: '8px 16px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        border: `1px solid ${SCOUT.dark}`,
                        opacity: 0.7,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                    >
                      <i className="fas fa-external-link-alt"></i> Open in New Tab
                    </a>
                  </div>
                </div>
              )}

              {selectedProject.feedback && (
                <div className="detail-section feedback-section" style={{ marginBottom: '16px' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: SCOUT.darkBlue,
                    display: 'block',
                    marginBottom: '6px'
                  }}>Feedback</label>
                  <div className="feedback-content" style={{
                    background: SCOUT.light,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${SCOUT.gold}`,
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <i className="fas fa-comment" style={{ color: SCOUT.gold, marginTop: '2px' }}></i>
                    <p style={{ margin: 0, color: SCOUT.dark }}>
                      {selectedProject.feedback}
                    </p>
                  </div>
                </div>
              )}

              {selectedProject.status === 'pending' && (
                <div className="detail-section pending-notice" style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D'
                }}>
                  <i className="fas fa-clock" style={{ color: '#F59E0B' }}></i>
                  <p style={{ margin: 0, color: SCOUT.dark }}>
                    Your project is currently pending review. You will receive feedback soon.
                  </p>
                </div>
              )}

              {selectedProject.status === 'approved' && (
                <div className="detail-section approved-notice" style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#D1FAE5',
                  border: `1px solid ${SCOUT.green}`
                }}>
                  <i className="fas fa-check-circle" style={{ color: SCOUT.green }}></i>
                  <p style={{ margin: 0, color: SCOUT.dark }}>
                    🎉 Congratulations! Your project has been approved.
                  </p>
                </div>
              )}

              {selectedProject.status === 'rejected' && (
                <div className="detail-section rejected-notice" style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#FEE2E2',
                  border: `1px solid ${SCOUT.red}`
                }}>
                  <i className="fas fa-times-circle" style={{ color: SCOUT.red }}></i>
                  <p style={{ margin: 0, color: SCOUT.dark }}>
                    Your project has been rejected. Please review the feedback above and resubmit.
                  </p>
                </div>
              )}
            </div>
            <div className="form-actions" style={{
              padding: '16px 24px',
              borderTop: `1px solid ${SCOUT.light}`,
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                className="btn-secondary" 
                onClick={closeProjectDetails}
                style={{
                  background: SCOUT.light,
                  color: SCOUT.dark,
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#E5E7EB'}
                onMouseLeave={(e) => e.target.style.background = SCOUT.light}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .my-projects-section {
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
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px 16px 12px;
          border-bottom: 1px solid #f1f3f4;
          gap: 12px;
        }

        .project-header h4 {
          margin: 0;
          font-size: 16px;
          flex: 1;
        }

        .project-body {
          padding: 16px;
        }

        .project-description {
          font-size: 14px;
          line-height: 1.5;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .project-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 13px;
        }

        .project-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .project-document {
          margin-top: 8px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .project-document .document-link {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .project-document .document-link:hover {
          text-decoration: underline;
        }

        .project-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
        }

        .file-info {
          margin-top: 8px;
          padding: 8px 12px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .file-info .file-size {
          font-size: 12px;
        }

        .project-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .project-detail-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .project-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }

        .detail-item p {
          margin: 0;
          font-size: 15px;
        }

        .detail-section {
          margin-bottom: 16px;
        }

        .detail-section label {
          font-size: 14px;
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
        }

        .detail-section p {
          margin: 0;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .feedback-content {
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          gap: 10px;
        }

        .feedback-content i {
          margin-top: 2px;
        }

        .feedback-content p {
          margin: 0;
        }

        .pending-notice,
        .approved-notice,
        .rejected-notice {
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pending-notice p,
        .approved-notice p,
        .rejected-notice p {
          margin: 0;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
        }

        .text-muted {
          opacity: 0.6;
          font-size: 14px;
        }

        .required {
          font-weight: 700;
        }

        /* Status Badge Styles with Scout Colors */
        .badge-pending {
          background: #FEF3C7;
          color: #92400E;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-info {
          background: #DBEAFE;
          color: #1E40AF;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-approved {
          background: #D1FAE5;
          color: #065F46;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-rejected {
          background: #FEE2E2;
          color: #991B1B;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-progress {
          background: #FEF3C7;
          color: #92400E;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-completed {
          background: #D1FAE5;
          color: #065F46;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-default {
          background: #E5E7EB;
          color: #374151;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #6A1B9A;
          box-shadow: 0 0 0 3px rgba(106, 27, 154, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }

        .form-hint {
          display: block;
          margin-top: 4px;
          font-size: 12px;
        }

        .btn-primary {
          background-color: #6A1B9A;
          color: #FFFFFF;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #7B1FA2;
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .alert {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 4px solid;
        }

        .alert-error {
          background: #FEE2E2;
          color: #991B1B;
        }

        .alert-success {
          background: #D1FAE5;
          color: #065F46;
        }

        .alert p {
          margin: 0;
          flex: 1;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 0 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .btn-close:hover {
          opacity: 1;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-header h2 {
          margin: 0;
          color: #002B5C;
          font-size: 28px;
        }

        .page-header p {
          margin: 4px 0 0;
          color: #1F2937;
        }

        .btn-secondary-sm {
          background: #F5F7FA;
          border: 1px solid #E5E7EB;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary-sm:hover {
          background: #E5E7EB;
        }

        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }

          .project-detail-grid {
            grid-template-columns: 1fr 1fr;
          }

          .project-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .project-detail-grid {
            grid-template-columns: 1fr;
          }

          .project-meta {
            flex-direction: column;
            gap: 4px;
          }

          .project-actions {
            flex-direction: column;
          }

          .project-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SubmitProject;