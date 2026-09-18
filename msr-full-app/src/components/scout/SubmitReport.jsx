import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

// ============================================
// ✅ HELPER FUNCTIONS
// ============================================

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word', 'docx': 'fa-file-word',
    'jpg': 'fa-file-image', 'jpeg': 'fa-file-image', 'png': 'fa-file-image', 'gif': 'fa-file-image',
    'xls': 'fa-file-excel', 'xlsx': 'fa-file-excel',
    'txt': 'fa-file-alt'
  };
  return map[ext] || 'fa-file';
};

const getFileColor = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    'pdf': '#e53e3e',
    'doc': '#3182ce', 'docx': '#3182ce',
    'jpg': '#d69e2e', 'jpeg': '#d69e2e', 'png': '#d69e2e',
    'xls': '#38a169', 'xlsx': '#38a169'
  };
  return map[ext] || '#718096';
};

const getFileUrl = (filePath) => {
  if (!filePath || filePath.startsWith('http')) return filePath || '#';
  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return filePath.startsWith('/uploads/') ? `${baseUrl}${filePath}` : filePath;
};

// ============================================
// STYLE HELPERS
// ============================================

const btnStyle = (bg, color = 'white') => ({
  background: bg,
  color: color,
  border: 'none',
  padding: '6px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.2s ease'
});

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ced4da',
  borderRadius: '6px',
  fontSize: '14px',
  marginBottom: '10px',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};

const cardStyle = {
  background: 'white',
  borderRadius: '10px',
  padding: '16px 20px',
  marginBottom: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  transition: 'all 0.2s ease'
};

const ReportManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('submit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Submit form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: '',
    activity_date: '',
    location: '',
    participants_count: '',
    achievements: '',
    challenges: '',
    recommendations: '',
    unit_id: ''
  });
  const [files, setFiles] = useState([]);

  // Reports list state
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    activity_type: '',
    activity_date: '',
    location: '',
    participants_count: '',
    achievements: '',
    challenges: '',
    recommendations: ''
  });
  const [editFiles, setEditFiles] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const activityTypes = ['Community Service', 'Training', 'Camp', 'Meeting', 'Ceremony', 'Fundraising', 'Environmental', 'Other'];

  useEffect(() => {
    if (activeTab === 'my-reports') fetchReports();
  }, [activeTab, filterStatus]);

  // ============================================
  // FILE HANDLERS
  // ============================================

  const handleFileView = (filePath) => {
    const url = getFileUrl(filePath);
    if (url && url !== '#') window.open(url, '_blank');
  };

  const handleFileDownload = async (filePath) => {
    try {
      const token = localStorage.getItem('token');
      const url = getFileUrl(filePath);
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch {
      window.open(getFileUrl(filePath), '_blank');
    }
  };

  // ============================================
  // SUBMISSION FUNCTIONS
  // ============================================

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files exceed the 10MB limit.');
      setTimeout(() => setError(''), 5000);
    }
    setFiles(validFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Report Title is required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (!formData.activity_date) {
      setError('Activity Date is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const userDistrict = user?.district || user?.member?.district;
      if (!userDistrict) {
        setError('Your district is not set. Please contact your administrator.');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('district', userDistrict);
      files.forEach(file => formDataToSend.append('attachments', file));
      if (user) {
        formDataToSend.append('created_by', user.id);
        formDataToSend.append('submitted_by', user.id);
      }

      await axios.post(`${API_URL}/reports`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(`✅ Report submitted successfully to ${userDistrict} District Commissioner!`);
      setFormData({
        title: '', description: '', activity_type: '', activity_date: '',
        location: '', participants_count: '', achievements: '',
        challenges: '', recommendations: '', unit_id: ''
      });
      setFiles([]);
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      let errorMessage = 'Failed to submit report. ';
      if (err.response) {
        if (err.response.status === 401) errorMessage += 'Session expired. Please login again.';
        else if (err.response.status === 403) errorMessage += 'You do not have permission to submit reports.';
        else if (err.response.status === 404) errorMessage += 'Report submission endpoint not found.';
        else if (err.response.status === 500) errorMessage += 'Server error. Please try again later.';
        else if (err.response.data?.message) errorMessage += err.response.data.message;
        else errorMessage += 'Please try again or contact support.';
      } else if (err.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
      setTimeout(() => setError(''), 8000);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REPORT MANAGEMENT FUNCTIONS
  // ============================================

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/reports?status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let reportsData = [];
      if (Array.isArray(response.data)) reportsData = response.data;
      else if (response.data.reports && Array.isArray(response.data.reports)) reportsData = response.data.reports;
      else if (response.data.data && Array.isArray(response.data.data)) reportsData = response.data.data;
      
      setReports(reportsData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setEditFormData({
      title: report.title || '',
      description: report.description || '',
      activity_type: report.activity_type || '',
      activity_date: report.activity_date || '',
      location: report.location || '',
      participants_count: report.participants_count || '',
      achievements: report.achievements || '',
      challenges: report.challenges || '',
      recommendations: report.recommendations || ''
    });
    setEditFiles([]);
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key]) formDataToSend.append(key, editFormData[key]);
      });

      if (selectedReport?.district) formDataToSend.append('district', selectedReport.district);
      else if (user?.district) formDataToSend.append('district', user.district);

      editFiles.forEach(file => formDataToSend.append('attachments', file));

      await axios.put(`${API_URL}/reports/${selectedReport.id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('✅ Report updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/reports/${selectedReport.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Report deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/reports/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Report archived successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive report');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files exceed the 10MB limit.');
      setTimeout(() => setError(''), 5000);
    }
    setEditFiles(validFiles);
  };

  const removeEditFile = (index) => {
    setEditFiles(editFiles.filter((_, i) => i !== index));
  };

  // ============================================
  // STATUS HELPERS
  // ============================================

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'revision': 'badge-review',
      'rejected': 'badge-rejected',
      'archived': 'badge-default'
    };
    return badges[status] || 'badge-default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fa-clock',
      'approved': 'fa-check-circle',
      'revision': 'fa-edit',
      'rejected': 'fa-times-circle',
      'archived': 'fa-archive'
    };
    return icons[status] || 'fa-file';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'revision': 'Needs Revision',
      'rejected': 'Rejected',
      'archived': 'Archived'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      'pending': '#FFD100',
      'approved': '#006B3F',
      'revision': '#0056B3',
      'rejected': '#D32F2F',
      'archived': '#6c757d'
    };
    return map[status] || '#6c757d';
  };

  const canEdit = (status) => status === 'pending' || status === 'revision';
  const canDelete = (status) => status === 'pending' || status === 'revision';

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderSubmitForm = () => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <form onSubmit={handleSubmit}>
        {/* Required Information */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#006B3F', fontSize: '16px', marginBottom: '16px' }}>
            <i className="fas fa-asterisk" style={{ color: '#dc3545', fontSize: '12px' }}></i> Required Information
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>
              Report Title <span style={{ color: '#D32F2F' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a descriptive title for your report"
              style={inputStyle}
              maxLength="200"
            />
            <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>{formData.title.length}/200 characters</small>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>
              Activity Date <span style={{ color: '#D32F2F' }}>*</span>
            </label>
            <input
              type="date"
              name="activity_date"
              value={formData.activity_date}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the activity"
              rows="4"
              style={inputStyle}
              maxLength="5000"
            />
            <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>{formData.description.length}/5000 characters</small>
          </div>
        </div>

        {/* Activity Details */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#006B3F', fontSize: '16px', marginBottom: '16px' }}>
            <i className="fas fa-calendar-alt"></i> Activity Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Activity Type</label>
              <select
                name="activity_type"
                value={formData.activity_type}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select activity type</option>
                {activityTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter the activity location"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Number of Participants</label>
            <input
              type="number"
              name="participants_count"
              value={formData.participants_count}
              onChange={handleChange}
              placeholder="Enter number of participants"
              style={inputStyle}
              min="0"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#006B3F', fontSize: '16px', marginBottom: '16px' }}>
            <i className="fas fa-info-circle"></i> Additional Information
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Achievements</label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              placeholder="List the key achievements and successes"
              rows="3"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Challenges Faced</label>
            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              placeholder="Describe any challenges or difficulties encountered"
              rows="3"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Recommendations</label>
            <textarea
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              placeholder="Provide recommendations for future activities"
              rows="3"
              style={inputStyle}
            />
          </div>
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#006B3F', fontSize: '16px', marginBottom: '16px' }}>
            <i className="fas fa-paperclip"></i> Supporting Documents
          </h3>

          <div>
            <label style={{ fontWeight: '500', color: '#212529', display: 'block', marginBottom: '4px' }}>Upload Supporting Documents</label>
            <div style={{
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '32px', color: '#006B3F', display: 'block', marginBottom: '8px' }}></i>
                <span style={{ color: '#212529' }}>Click to upload or drag and drop</span>
                <small style={{ display: 'block', color: '#6c757d', marginTop: '4px' }}>Supported: PDF, Word, JPG, PNG (Max 10MB each)</small>
              </label>
            </div>
            
            {files.length > 0 && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#006B3F' }}>Selected Files ({files.length})</h4>
                {Array.from(files).map((file, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                    <i className={`fas ${getFileIcon(file.name)}`} style={{ color: '#0056B3' }}></i>
                    <span style={{ color: '#212529' }}>{file.name}</span>
                    <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{ background: '#D32F2F', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e9ecef', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all fields?')) {
                setFormData({
                  title: '', description: '', activity_type: '', activity_date: '',
                  location: '', participants_count: '', achievements: '',
                  challenges: '', recommendations: '', unit_id: ''
                });
                setFiles([]);
              }
            }}
            style={btnStyle('#6c757d')}
          >
            <i className="fas fa-undo"></i> Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...btnStyle('#006B3F'), opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <><span className="spinner"></span> Submitting...</>
            ) : (
              <><i className="fas fa-paper-plane"></i> Submit to District Commissioner</>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderMyReports = () => (
    <>
      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {['all', 'pending', 'approved', 'revision', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              background: filterStatus === s ? (s === 'pending' ? '#FFD100' : s === 'rejected' ? '#D32F2F' : s === 'revision' ? '#0056B3' : '#006B3F') : 'transparent',
              color: filterStatus === s ? (s === 'pending' ? '#212529' : 'white') : '#212529',
              fontSize: '13px'
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({s === 'all' ? reports.length : reports.filter(r => r.status === s).length})
          </button>
        ))}
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '8px' }}>
          <i className="fas fa-file-alt" style={{ fontSize: '48px', color: '#FFD100' }}></i>
          <h3 style={{ color: '#212529' }}>No Reports Found</h3>
          <p style={{ color: '#6c757d' }}>You haven't submitted any reports yet.</p>
          <button onClick={() => setActiveTab('submit')} style={btnStyle('#006B3F')}>
            <i className="fas fa-plus"></i> Submit a Report
          </button>
        </div>
      ) : (
        reports.map(report => {
          const statusColor = getStatusColor(report.status);
          return (
            <div key={report.id} style={{ ...cardStyle, borderLeft: `4px solid ${statusColor}` }}>
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#212529' }}>{report.title}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#6c757d', marginTop: '4px' }}>
                    <span><i className="fas fa-calendar" style={{ color: '#0056B3' }}></i> {report.activity_date ? new Date(report.activity_date).toLocaleDateString() : 'N/A'}</span>
                    <span><i className="fas fa-map-marker-alt" style={{ color: '#006B3F' }}></i> {report.location || 'No location'}</span>
                    {report.district && <span><i className="fas fa-building" style={{ color: '#006B3F' }}></i> {report.district}</span>}
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: statusColor === '#FFD100' ? '#fff3cd' : statusColor === '#006B3F' ? '#d4edda' : statusColor === '#0056B3' ? '#d1ecf1' : statusColor === '#D32F2F' ? '#f8d7da' : '#e9ecef',
                  color: statusColor === '#FFD100' ? '#856404' : statusColor === '#006B3F' ? '#155724' : statusColor === '#0056B3' ? '#0c5460' : statusColor === '#D32F2F' ? '#721c24' : '#495057'
                }}>
                  <i className={`fas ${getStatusIcon(report.status)}`}></i> {getStatusLabel(report.status)}
                </span>
              </div>

              {/* Report Body */}
              <div style={{ margin: '8px 0' }}>
                <p style={{ margin: 0, color: '#212529', lineHeight: '1.6' }}>{report.description || 'No description provided'}</p>
                {report.achievements && (
                  <div style={{ marginTop: '8px' }}>
                    <strong style={{ color: '#006B3F' }}><i className="fas fa-trophy"></i> Achievements:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#212529' }}>{report.achievements}</p>
                  </div>
                )}
                {report.challenges && (
                  <div style={{ marginTop: '8px' }}>
                    <strong style={{ color: '#D32F2F' }}><i className="fas fa-exclamation-triangle"></i> Challenges:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#212529' }}>{report.challenges}</p>
                  </div>
                )}
                {report.feedback && (
                  <div style={{ background: '#FFF8E1', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #FFD100', marginTop: '8px' }}>
                    <strong style={{ color: '#006B3F' }}><i className="fas fa-comment"></i> Feedback:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#212529' }}>{report.feedback}</p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {report.file_urls?.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong style={{ color: '#0056B3', fontSize: '13px' }}><i className="fas fa-paperclip"></i> Attachments ({report.file_urls.length})</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {report.file_urls.map((file, idx) => {
                      const fileName = file.split('/').pop() || 'File';
                      const icon = getFileIcon(file);
                      const color = getFileColor(file);
                      return (
                        <div key={idx} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f7fafc',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          fontSize: '13px'
                        }}>
                          <i className={`fas ${icon}`} style={{ color, fontSize: '18px' }}></i>
                          <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
                          <button
                            onClick={() => handleFileView(file)}
                            style={{ background: '#0056B3', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => handleFileDownload(file)}
                            style={{ background: '#006B3F', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                            title="Download"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e9ecef' }}>
                <button onClick={() => setSelectedReport(report)} style={btnStyle('#0056B3')}>
                  <i className="fas fa-eye"></i> View
                </button>
                {canEdit(report.status) && (
                  <button onClick={() => handleEdit(report)} style={btnStyle('#FFD100', '#212529')}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                )}
                {canDelete(report.status) && (
                  <button onClick={() => { setSelectedReport(report); setShowDeleteModal(true); }} style={btnStyle('#D32F2F')}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                )}
                {report.status === 'approved' && (
                  <button onClick={() => handleArchive(report.id)} style={btnStyle('#6c757d')}>
                    <i className="fas fa-archive"></i> Archive
                  </button>
                )}
                {report.status === 'revision' && (
                  <button onClick={() => handleEdit(report)} style={btnStyle('#0056B3')}>
                    <i className="fas fa-undo"></i> Resubmit
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* View Modal */}
      {selectedReport && !isEditing && !showDeleteModal && (
        <div style={modalOverlayStyle} onClick={() => setSelectedReport(null)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#006B3F' }}><i className="fas fa-file-alt"></i> Report Details</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setSelectedReport(null)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                <div><strong style={{ color: '#006B3F' }}>Title:</strong> {selectedReport.title}</div>
                <div><strong style={{ color: '#006B3F' }}>Status:</strong> {getStatusLabel(selectedReport.status)}</div>
                <div><strong style={{ color: '#006B3F' }}>District:</strong> {selectedReport.district || 'N/A'}</div>
                <div><strong style={{ color: '#006B3F' }}>Activity Date:</strong> {selectedReport.activity_date ? new Date(selectedReport.activity_date).toLocaleDateString() : 'N/A'}</div>
                <div><strong style={{ color: '#006B3F' }}>Activity Type:</strong> {selectedReport.activity_type || 'N/A'}</div>
                <div><strong style={{ color: '#006B3F' }}>Location:</strong> {selectedReport.location || 'N/A'}</div>
                <div><strong style={{ color: '#006B3F' }}>Participants:</strong> {selectedReport.participants_count || 0}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#006B3F' }}>Description:</strong> {selectedReport.description || 'No description'}</div>
                {selectedReport.achievements && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#006B3F' }}>Achievements:</strong> {selectedReport.achievements}</div>}
                {selectedReport.challenges && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#D32F2F' }}>Challenges:</strong> {selectedReport.challenges}</div>}
                {selectedReport.recommendations && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#0056B3' }}>Recommendations:</strong> {selectedReport.recommendations}</div>}
                {selectedReport.feedback && <div style={{ gridColumn: '1 / -1', background: '#FFF8E1', padding: '10px', borderRadius: '6px' }}><strong style={{ color: '#006B3F' }}>Feedback:</strong> {selectedReport.feedback}</div>}
                {selectedReport.file_urls?.length > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong style={{ color: '#0056B3' }}>Attachments:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {selectedReport.file_urls.map((file, idx) => {
                        const fileName = file.split('/').pop() || 'File';
                        const icon = getFileIcon(file);
                        const color = getFileColor(file);
                        return (
                          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f7fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                            <i className={`fas ${icon}`} style={{ color, fontSize: '16px' }}></i>
                            <span>{fileName}</span>
                            <button onClick={() => handleFileView(file)} style={{ background: '#0056B3', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}><i className="fas fa-eye"></i></button>
                            <button onClick={() => handleFileDownload(file)} style={{ background: '#006B3F', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}><i className="fas fa-download"></i></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#006B3F' }}>Submitted:</strong> {new Date(selectedReport.created_at).toLocaleString()}</div>
                {selectedReport.updated_at && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#006B3F' }}>Last Updated:</strong> {new Date(selectedReport.updated_at).toLocaleString()}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid #e9ecef' }}>
              <button onClick={() => setSelectedReport(null)} style={btnStyle('#6c757d')}>Close</button>
              {canEdit(selectedReport.status) && (
                <button onClick={() => handleEdit(selectedReport)} style={btnStyle('#FFD100', '#212529')}>
                  <i className="fas fa-edit"></i> Edit Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && selectedReport && (
        <div style={modalOverlayStyle} onClick={() => setIsEditing(false)}>
          <div style={{ ...modalContentStyle, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: '#006B3F' }}>
                <i className="fas fa-edit"></i> {selectedReport.status === 'revision' ? 'Resubmit Report' : 'Edit Report'}
              </h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setIsEditing(false)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={handleUpdate}>
                <input type="text" placeholder="Title *" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} style={inputStyle} required />
                <input type="date" value={editFormData.activity_date} onChange={e => setEditFormData({ ...editFormData, activity_date: e.target.value })} style={inputStyle} required />
                <textarea placeholder="Description" value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} rows="4" style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <select value={editFormData.activity_type} onChange={e => setEditFormData({ ...editFormData, activity_type: e.target.value })} style={inputStyle}>
                    <option value="">Activity Type</option>
                    {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="text" placeholder="Location" value={editFormData.location} onChange={e => setEditFormData({ ...editFormData, location: e.target.value })} style={inputStyle} />
                </div>
                <input type="number" placeholder="Participants" value={editFormData.participants_count} onChange={e => setEditFormData({ ...editFormData, participants_count: e.target.value })} style={inputStyle} min="0" />
                <textarea placeholder="Achievements" value={editFormData.achievements} onChange={e => setEditFormData({ ...editFormData, achievements: e.target.value })} rows="3" style={inputStyle} />
                <textarea placeholder="Challenges" value={editFormData.challenges} onChange={e => setEditFormData({ ...editFormData, challenges: e.target.value })} rows="3" style={inputStyle} />
                <textarea placeholder="Recommendations" value={editFormData.recommendations} onChange={e => setEditFormData({ ...editFormData, recommendations: e.target.value })} rows="3" style={inputStyle} />
                <input type="file" multiple onChange={handleEditFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={inputStyle} />
                {editFiles.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#006B3F' }}>New Files ({editFiles.length})</h4>
                    {editFiles.map((file, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                        <i className={`fas ${getFileIcon(file.name)}`} style={{ color: '#0056B3' }}></i>
                        <span style={{ color: '#212529' }}>{file.name}</span>
                        <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                        <button onClick={() => removeEditFile(index)} style={{ background: '#D32F2F', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e9ecef', paddingTop: '16px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={btnStyle('#6c757d')}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ ...btnStyle('#006B3F'), opacity: loading ? 0.6 : 1 }}>
                    {loading ? <><span className="spinner"></span> Saving...</> : <><i className="fas fa-save"></i> {selectedReport.status === 'revision' ? 'Resubmit' : 'Update'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedReport && (
        <div style={modalOverlayStyle} onClick={() => setShowDeleteModal(false)}>
          <div style={{ ...modalContentStyle, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ ...modalHeaderStyle, borderBottom: '2px solid #D32F2F' }}>
              <h3 style={{ color: '#D32F2F' }}><i className="fas fa-exclamation-triangle"></i> Confirm Delete</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ color: '#212529' }}>Are you sure you want to delete the report: <strong>"{selectedReport.title}"</strong>?</p>
              <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid #e9ecef' }}>
              <button onClick={() => setShowDeleteModal(false)} style={btnStyle('#6c757d')}>Cancel</button>
              <button onClick={handleDelete} disabled={loading} style={{ ...btnStyle('#D32F2F'), opacity: loading ? 0.6 : 1 }}>
                {loading ? <><span className="spinner"></span> Deleting...</> : <><i className="fas fa-trash"></i> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#006B3F', margin: 0, fontSize: '24px' }}>
            <i className="fas fa-file-alt" style={{ color: '#FFD100' }}></i> Report Management
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6c757d' }}>
            Submit and manage your unit activity reports to <strong style={{ color: '#006B3F' }}>{user?.district || 'your'} District</strong> Commissioner
          </p>
          {user?.district && (
            <span style={{ backgroundColor: '#006B3F', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', display: 'inline-block', marginTop: '4px' }}>
              <i className="fas fa-map-marker-alt"></i> {user.district} District
            </span>
          )}
        </div>
        <span style={{ backgroundColor: '#006B3F', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px' }}>
          <i className="fas fa-user-tie"></i> Unit Leader
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', background: '#f8d7da', borderLeft: '4px solid #D32F2F', color: '#721c24', display: 'flex', justifyContent: 'space-between' }}>
          <span><i className="fas fa-exclamation-circle" style={{ color: '#D32F2F' }}></i> {error}</span>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => setError('')}>×</button>
        </div>
      )}
      {success && (
        <div style={{ padding: '10px 16px', borderRadius: '6px', marginBottom: '16px', background: '#d4edda', borderLeft: '4px solid #006B3F', color: '#155724', display: 'flex', justifyContent: 'space-between' }}>
          <span><i className="fas fa-check-circle" style={{ color: '#006B3F' }}></i> {success}</span>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e9ecef', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('submit')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'submit' ? '#006B3F' : 'transparent',
            color: activeTab === 'submit' ? 'white' : '#212529',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          <i className="fas fa-plus-circle"></i> Submit Report
        </button>
        <button
          onClick={() => setActiveTab('my-reports')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'my-reports' ? '#006B3F' : 'transparent',
            color: activeTab === 'my-reports' ? 'white' : '#212529',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          <i className="fas fa-list"></i> My Reports
          {reports.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#FFD100',
              color: '#212529',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {reports.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'submit' ? renderSubmitForm() : renderMyReports()}

      {/* Info Box */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#FFF8E1',
        borderRadius: '8px',
        borderLeft: '4px solid #FFD100',
        display: 'flex',
        gap: '12px'
      }}>
        <i className="fas fa-info-circle" style={{ color: '#0056B3', fontSize: '24px' }}></i>
        <div>
          <strong style={{ color: '#006B3F' }}>Report Management Guide:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#212529' }}>
            <li>Submit new reports for District Commissioner review</li>
            <li>Track report status: Pending → Approved/Revision/Rejected</li>
            <li>Edit or delete reports while they are in Pending or Revision status</li>
            <li>Address feedback and resubmit reports that need revision</li>
            <li>Archive approved reports when no longer needed</li>
          </ul>
        </div>
      </div>

      {/* Spinner Animation */}
      <style>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ============================================
// MODAL STYLES
// ============================================

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: 'white',
  borderRadius: '12px',
  maxWidth: '800px',
  width: '95%',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  borderBottom: '2px solid #FFD100',
  position: 'sticky',
  top: 0,
  background: 'white',
  zIndex: 10,
  borderRadius: '12px 12px 0 0'
};

export default ReportManagement;