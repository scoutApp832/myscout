import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ✅ ALL DISTRICTS IN RWANDA
const ALL_DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge',
  'Musanze', 'Rubavu', 'Rulindo', 'Gakenke', 'Burera',
  'Huye', 'Nyanza', 'Muhanga', 'Ruhango', 'Gisagara',
  'Nyagatare', 'Gatsibo', 'Kayonza', 'Rwamagana', 'Ngoma',
  'Rusizi', 'Nyamasheke', 'Karongi', 'Ngororero'
];

const activityTypes = [
  'Community Service',
  'Training',
  'Camp',
  'Meeting',
  'Ceremony',
  'Fundraising',
  'Environmental',
  'Other'
];

const ReceivedReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [districts, setDistricts] = useState(ALL_DISTRICTS);
  const [remarks, setRemarks] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishDestination, setPublishDestination] = useState('public-website');
  
  // ✅ Edit state
  const [showEditModal, setShowEditModal] = useState(false);
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
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // ✅ Resend state
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendDestination, setResendDestination] = useState('donor-portal');

  // ✅ Forward to Donors state
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMessage, setForwardMessage] = useState('');
  const [forwardingReport, setForwardingReport] = useState(null);
  const [forwarding, setForwarding] = useState(false);

  // ✅ Check if user is Super Admin
  const isSuperAdmin = user?.role === 'super_admin' || 
                       user?.role === 'super-admin' || 
                       user?.role === 'admin';

  useEffect(() => {
    fetchReports();
    fetchDistricts();
  }, [filterDistrict, filterStatus]);

  // ✅ Helper function to get submitter name
  const getSubmitterName = (report) => {
    if (report.submitter?.full_name) {
      return report.submitter.full_name;
    }
    if (report.submitter?.first_name && report.submitter?.last_name) {
      return `${report.submitter.first_name} ${report.submitter.last_name}`;
    }
    if (report.submitter?.name) {
      return report.submitter.name;
    }
    if (report.submittedBy && !isNaN(report.submittedBy)) {
      return `User ${report.submittedBy}`;
    }
    if (report.submitted_by && !isNaN(report.submitted_by)) {
      return `User ${report.submitted_by}`;
    }
    if (report.submittedBy) {
      return report.submittedBy;
    }
    if (report.submitted_by) {
      return report.submitted_by;
    }
    if (report.user?.full_name) {
      return report.user.full_name;
    }
    if (report.creator?.full_name) {
      return report.creator.full_name;
    }
    return 'Unknown';
  };

  // ✅ Helper function to get submitter email
  const getSubmitterEmail = (report) => {
    if (report.submitter?.email) {
      return report.submitter.email;
    }
    if (report.submitter?.user?.email) {
      return report.submitter.user.email;
    }
    if (report.user?.email) {
      return report.user.email;
    }
    if (report.creator?.email) {
      return report.creator.email;
    }
    return null;
  };

  // ✅ Helper function to get file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http')) return filePath;
    if (filePath.startsWith('/uploads/')) {
      const baseUrl = API_URL.replace('/api', '');
      return `${baseUrl}${filePath}`;
    }
    return filePath;
  };

  // ✅ Fetch reports from National Commissioner endpoint
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view reports');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filterDistrict && filterDistrict !== 'all') {
        params.append('district', filterDistrict);
      }
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const url = `${API_URL}/national/reports${params.toString() ? '?' + params.toString() : ''}`;
      console.log('📊 Fetching reports from:', url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Reports response:', response.data);

      let reportsData = [];
      if (response.data?.success) {
        reportsData = response.data.reports || [];
      } else if (Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response.data?.data) {
        reportsData = response.data.data;
      }

      setReports(Array.isArray(reportsData) ? reportsData : []);
      
    } catch (err) {
      console.error('❌ Fetch reports error:', err);
      
      if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view reports.');
      } else {
        setError(err.response?.data?.message || 'Failed to load reports');
      }
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setDistricts(ALL_DISTRICTS);
        return;
      }

      const response = await axios.get(`${API_URL}/national/districts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Districts response:', response.data);

      let districtsData = [];
      if (response.data?.success && Array.isArray(response.data.districts)) {
        districtsData = response.data.districts;
      } else if (Array.isArray(response.data)) {
        districtsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        districtsData = response.data.data;
      }

      const districtNames = districtsData.map(d => {
        if (typeof d === 'string') return d;
        if (d && typeof d === 'object') return d.name || d.district || d.label || null;
        return null;
      }).filter(d => d !== null && d !== '');

      if (districtNames.length > 0) {
        setDistricts(districtNames);
      } else {
        setDistricts(ALL_DISTRICTS);
      }
      
    } catch (err) {
      console.error('❌ Failed to load districts:', err);
      setDistricts(ALL_DISTRICTS);
    }
  };

  // ✅ Approve report
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/national/reports/${id}/approve`, 
        { feedback: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('✅ Report approved successfully!');
      setSelectedReport(null);
      setRemarks('');
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve report');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Reject report
  const handleReject = async (id) => {
    try {
      if (!remarks || !remarks.trim()) {
        setError('Please provide feedback for rejection');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/national/reports/${id}/reject`, 
        { feedback: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('✅ Report rejected with feedback!');
      setSelectedReport(null);
      setRemarks('');
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject report');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Publish report
  const handlePublish = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/national/reports/${id}/publish`, 
        { destination: publishDestination },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`✅ Report published to ${publishDestination}!`);
      setShowPublishModal(false);
      setPublishDestination('public-website');
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish report');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Archive report
  const handleArchive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/national/reports/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Report archived!');
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive report');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Delete report - Only Super Admin
  const handleDelete = async () => {
    if (!isSuperAdmin) {
      setError('❌ Only Super Admin can delete reports');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/national/reports/${reportToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Report deleted successfully!');
      setShowDeleteModal(false);
      setReportToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete report');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Edit report - Open edit modal
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
    setShowEditModal(true);
  };

  // ✅ Update report
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    setUploadingFiles(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key]) {
          formData.append(key, editFormData[key]);
        }
      });

      if (selectedReport?.district) {
        formData.append('district', selectedReport.district);
      }

      editFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.put(`${API_URL}/national/reports/${selectedReport.id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Update response:', response.data);

      if (response.data && response.data.report) {
        const updatedReport = response.data.report;
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === updatedReport.id ? updatedReport : report
          )
        );
        if (selectedReport && selectedReport.id === updatedReport.id) {
          setSelectedReport(updatedReport);
        }
      }

      setSuccess('✅ Report updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowEditModal(false);
      setSelectedReport(null);
      setEditFiles([]);
      await fetchReports();
      
    } catch (err) {
      console.error('❌ Error updating report:', err);
      setError(err.response?.data?.message || 'Failed to update report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploadingFiles(false);
    }
  };

  // ✅ Resend to donor/public
  const handleResend = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/national/reports/${id}/resend`, 
        { destination: resendDestination },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.report) {
        const updatedReport = response.data.report;
        setReports(prevReports => 
          prevReports.map(report => 
            report.id === updatedReport.id ? updatedReport : report
          )
        );
      }
      
      setSuccess(`✅ Report resent to ${resendDestination}!`);
      setShowResendModal(false);
      setResendDestination('donor-portal');
      await fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend report');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Forward report to donors
  const handleForwardToDonors = async () => {
    if (!forwardingReport) return;
    
    setForwarding(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/national/reports/${forwardingReport.id}/forward-to-donors`,
        { message: forwardMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Forward response:', response.data);

      if (response.data && response.data.report) {
        const updatedReport = response.data.report;
        setReports(prevReports =>
          prevReports.map(report =>
            report.id === updatedReport.id ? updatedReport : report
          )
        );
      }

      setSuccess(`✅ Report forwarded to ${response.data.donors_notified || 0} donors successfully!`);
      setShowForwardModal(false);
      setForwardMessage('');
      setForwardingReport(null);
      await fetchReports();
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error('❌ Error forwarding report:', err);
      setError(err.response?.data?.message || 'Failed to forward report to donors');
      setTimeout(() => setError(''), 5000);
    } finally {
      setForwarding(false);
    }
  };

  // ✅ Handle edit file change
  const handleEditFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024);
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files exceed the 10MB limit.');
      setTimeout(() => setError(''), 5000);
    }
    setEditFiles(validFiles);
  };

  const removeEditFile = (index) => {
    setEditFiles(editFiles.filter((_, i) => i !== index));
  };

  // ✅ Get status badge - with forwarded
  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'rejected': 'badge-rejected',
      'published': 'badge-completed',
      'archived': 'badge-default',
      'revision': 'badge-warning',
      'forwarded': 'badge-forwarded'
    };
    return badges[status] || 'badge-default';
  };

  const getStatusText = (status) => {
    const map = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'published': 'Published',
      'archived': 'Archived',
      'revision': 'Needs Revision',
      'forwarded': 'Forwarded to Donors'
    };
    return map[status] || status || 'Unknown';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fa-clock',
      'approved': 'fa-check-circle',
      'rejected': 'fa-times-circle',
      'published': 'fa-globe',
      'archived': 'fa-archive',
      'revision': 'fa-edit',
      'forwarded': 'fa-share'
    };
    return icons[status] || 'fa-file';
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const iconMap = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'jpg': 'file-image',
      'jpeg': 'file-image',
      'png': 'file-image',
      'gif': 'file-image',
      'xls': 'file-excel',
      'xlsx': 'file-excel'
    };
    return iconMap[extension] || 'file';
  };

  // ✅ Filter reports by selected district
  const filteredReports = reports.filter(report => {
    if (filterDistrict === 'all') return true;
    return report.district === filterDistrict;
  });

  // ✅ Get statistics
  const getStats = () => {
    const total = filteredReports.length;
    const pending = filteredReports.filter(r => r.status === 'pending').length;
    const approved = filteredReports.filter(r => r.status === 'approved').length;
    const rejected = filteredReports.filter(r => r.status === 'rejected').length;
    const published = filteredReports.filter(r => r.status === 'published').length;
    const archived = filteredReports.filter(r => r.status === 'archived').length;
    const revision = filteredReports.filter(r => r.status === 'revision').length;
    const forwarded = filteredReports.filter(r => r.status === 'forwarded').length;
    
    return { total, pending, approved, rejected, published, archived, revision, forwarded };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="page-header">
          <div>
            <h2 style={{ color: '#006B3F' }}>
              <i className="fas fa-file-alt" style={{ color: '#FFD100' }}></i> 
              Reports Management
            </h2>
            <p>Receive, review, edit, and manage reports from District Commissioners</p>
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
          <button className="btn-refresh" onClick={fetchReports} style={{ backgroundColor: '#006B3F', color: 'white' }}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card" style={{ borderLeftColor: '#006B3F' }}>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Reports</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#FFD100' }}>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#28a745' }}>
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#dc3545' }}>
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#17a2b8' }}>
            <div className="stat-number">{stats.published}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#6A1B9A' }}>
            <div className="stat-number">{stats.forwarded}</div>
            <div className="stat-label">Forwarded to Donors</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ borderColor: '#D32F2F' }}>
            <i className="fas fa-exclamation-circle" style={{ color: '#D32F2F' }}></i>
            {error}
            <button className="alert-close" onClick={() => setError('')}>×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ borderColor: '#006B3F' }}>
            <i className="fas fa-check-circle" style={{ color: '#006B3F' }}></i>
            {success}
            <button className="alert-close" onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="districtFilter">District:</label>
            <select 
              id="districtFilter"
              value={filterDistrict} 
              onChange={e => setFilterDistrict(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="statusFilter">Status:</label>
            <select 
              id="statusFilter"
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="revision">Needs Revision</option>
              <option value="forwarded">Forwarded to Donors</option>
            </select>
          </div>

          <div className="stats-info">
            <span>Total: <strong>{filteredReports.length}</strong> reports</span>
            {filterDistrict !== 'all' && (
              <button className="btn-clear-filter" onClick={() => setFilterDistrict('all')}>
                <i className="fas fa-times"></i> Clear
              </button>
            )}
          </div>
        </div>

        <div className="reports-list">
          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-file-alt" style={{ fontSize: '48px', color: '#ccc' }}></i>
              <h3>No Reports Found</h3>
              <p>
                {filterDistrict !== 'all' 
                  ? `No reports found for ${filterDistrict} district` 
                  : 'No reports submitted yet'}
              </p>
              {filterDistrict !== 'all' && (
                <button className="btn-secondary" onClick={() => setFilterDistrict('all')}>
                  <i className="fas fa-times"></i> Clear District Filter
                </button>
              )}
            </div>
          ) : (
            filteredReports.map((report) => {
              const reportTitle = report.title || 'Untitled Report';
              const reportStatus = report.status || 'pending';
              const submittedBy = getSubmitterName(report);
              const submitterEmail = getSubmitterEmail(report);
              const reportDistrict = report.district || 'N/A';
              const reportDate = report.created_at || report.createdAt || report.date || new Date().toISOString();
              const description = report.description || report.content || 'No description provided';
              const isForwarded = reportStatus === 'forwarded' || report.forwarded_to_donors === true;
              
              return (
                <div key={report.id} className={`report-card status-${reportStatus}`} style={{ 
                  borderLeftColor: reportStatus === 'pending' ? '#FFD100' : 
                                  reportStatus === 'approved' ? '#006B3F' : 
                                  reportStatus === 'rejected' ? '#D32F2F' : 
                                  reportStatus === 'published' ? '#17a2b8' : 
                                  reportStatus === 'archived' ? '#6c757d' : 
                                  reportStatus === 'forwarded' ? '#6A1B9A' : '#0056B3'
                }}>
                  <div className="report-header">
                    <div className="report-title">
                      <h4 style={{ color: '#212529' }}>{reportTitle}</h4>
                      <span className={`status-badge ${getStatusBadge(reportStatus)}`}>
                        <i className={`fas ${getStatusIcon(reportStatus)}`}></i>
                        {getStatusText(reportStatus)}
                      </span>
                      {isForwarded && (
                        <span className="status-badge badge-forwarded" style={{ backgroundColor: '#6A1B9A', color: '#FFD100' }}>
                          <i className="fas fa-share"></i> Shared with Donors
                        </span>
                      )}
                    </div>
                    <div className="report-meta" style={{ color: '#6c757d' }}>
                      <span>
                        <i className="fas fa-user" style={{ color: '#0056B3' }}></i> {submittedBy}
                      </span>
                      {submitterEmail && (
                        <span>
                          <i className="fas fa-envelope" style={{ color: '#0056B3' }}></i> {submitterEmail}
                        </span>
                      )}
                      <span>
                        <i className="fas fa-map-marker-alt" style={{ color: '#006B3F' }}></i> {reportDistrict}
                      </span>
                      <span>
                        <i className="fas fa-calendar" style={{ color: '#0056B3' }}></i> {new Date(reportDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="report-body">
                    <p style={{ color: '#212529' }}>{description}</p>
                    {report.feedback && (
                      <div className="report-feedback" style={{ backgroundColor: '#FFF8E1', borderLeftColor: '#FFD100' }}>
                        <strong style={{ color: '#006B3F' }}>Feedback:</strong> 
                        <p style={{ color: '#212529' }}>{report.feedback}</p>
                      </div>
                    )}
                    {report.file_urls && report.file_urls.length > 0 && (
                      <div className="attachments">
                        <strong style={{ color: '#0056B3' }}>Attachments:</strong>
                        {report.file_urls.map((file, index) => (
                          <a 
                            key={index} 
                            href={getFileUrl(file)} 
                            className="attachment-link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#0056B3' }}
                          >
                            <i className="fas fa-file"></i> {file.split('/').pop() || `Attachment ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="report-actions">
                    {reportStatus === 'pending' && (
                      <>
                        <button 
                          className="btn-sm btn-primary" 
                          style={{ backgroundColor: '#006B3F', color: 'white' }}
                          onClick={() => setSelectedReport(report)}
                        >
                          <i className="fas fa-check-circle"></i> Review
                        </button>
                        <button 
                          className="btn-sm btn-edit" 
                          style={{ backgroundColor: '#FFD100', color: '#212529' }}
                          onClick={() => handleEdit(report)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      </>
                    )}

                    {reportStatus === 'approved' && (
                      <>
                        <button 
                          className="btn-sm btn-success" 
                          style={{ backgroundColor: '#28a745', color: 'white' }}
                          onClick={() => {
                            setSelectedReport(report);
                            setShowPublishModal(true);
                          }}
                        >
                          <i className="fas fa-globe"></i> Publish
                        </button>
                        <button 
                          className="btn-sm btn-forward" 
                          style={{ backgroundColor: '#6A1B9A', color: 'white' }}
                          onClick={() => {
                            setForwardingReport(report);
                            setForwardMessage('');
                            setShowForwardModal(true);
                          }}
                        >
                          <i className="fas fa-share"></i> Forward to Donors
                        </button>
                        <button 
                          className="btn-sm btn-edit" 
                          style={{ backgroundColor: '#FFD100', color: '#212529' }}
                          onClick={() => handleEdit(report)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="btn-sm btn-archive" 
                          style={{ backgroundColor: '#6c757d', color: 'white' }}
                          onClick={() => handleArchive(report.id)}
                        >
                          <i className="fas fa-archive"></i> Archive
                        </button>
                      </>
                    )}

                    {reportStatus === 'published' && (
                      <>
                        <button 
                          className="btn-sm btn-warning" 
                          style={{ backgroundColor: '#17a2b8', color: 'white' }}
                          onClick={() => {
                            setSelectedReport(report);
                            setShowResendModal(true);
                          }}
                        >
                          <i className="fas fa-paper-plane"></i> Resend
                        </button>
                        {!report.forwarded_to_donors && reportStatus !== 'forwarded' && (
                          <button 
                            className="btn-sm btn-forward" 
                            style={{ backgroundColor: '#6A1B9A', color: 'white' }}
                            onClick={() => {
                              setForwardingReport(report);
                              setForwardMessage('');
                              setShowForwardModal(true);
                            }}
                          >
                            <i className="fas fa-share"></i> Forward to Donors
                          </button>
                        )}
                        {report.forwarded_to_donors && (
                          <span className="status-badge badge-forwarded" style={{ backgroundColor: '#6A1B9A', color: '#FFD100' }}>
                            <i className="fas fa-check-circle"></i> Forwarded to Donors
                          </span>
                        )}
                        <button 
                          className="btn-sm btn-edit" 
                          style={{ backgroundColor: '#FFD100', color: '#212529' }}
                          onClick={() => handleEdit(report)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      </>
                    )}

                    {reportStatus === 'forwarded' && (
                      <>
                        <span className="status-badge badge-forwarded" style={{ backgroundColor: '#6A1B9A', color: '#FFD100' }}>
                          <i className="fas fa-check-circle"></i> Forwarded to Donors
                        </span>
                        <button 
                          className="btn-sm btn-warning" 
                          style={{ backgroundColor: '#17a2b8', color: 'white' }}
                          onClick={() => {
                            setSelectedReport(report);
                            setShowResendModal(true);
                          }}
                        >
                          <i className="fas fa-paper-plane"></i> Resend
                        </button>
                        <button 
                          className="btn-sm btn-edit" 
                          style={{ backgroundColor: '#FFD100', color: '#212529' }}
                          onClick={() => handleEdit(report)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      </>
                    )}

                    {reportStatus === 'revision' && (
                      <>
                        <button 
                          className="btn-sm btn-edit" 
                          style={{ backgroundColor: '#FFD100', color: '#212529' }}
                          onClick={() => handleEdit(report)}
                        >
                          <i className="fas fa-edit"></i> Edit & Resubmit
                        </button>
                        <button 
                          className="btn-sm btn-primary" 
                          style={{ backgroundColor: '#006B3F', color: 'white' }}
                          onClick={() => setSelectedReport(report)}
                        >
                          <i className="fas fa-check-circle"></i> Review
                        </button>
                      </>
                    )}

                    <button 
                      className="btn-sm btn-view" 
                      style={{ backgroundColor: '#0056B3', color: 'white' }}
                      onClick={() => setSelectedReport(report)}
                    >
                      <i className="fas fa-info-circle"></i> Details
                    </button>

                    {isSuperAdmin && (
                      <button 
                        className="btn-sm btn-delete" 
                        style={{ backgroundColor: '#D32F2F', color: 'white' }}
                        onClick={() => {
                          setReportToDelete(report.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Review/Details Modal */}
        {selectedReport && !showPublishModal && !showDeleteModal && !showEditModal && !showResendModal && !showForwardModal && (
          <div className="modal-overlay" onClick={() => {
            setSelectedReport(null);
            setRemarks('');
          }}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ borderBottom: '2px solid #FFD100' }}>
                <h3 style={{ color: '#006B3F' }}>
                  <i className="fas fa-check-circle" style={{ color: '#FFD100' }}></i> 
                  {selectedReport.status === 'pending' ? 'Review Report' : 'Report Details'}
                </h3>
                <button className="modal-close" onClick={() => {
                  setSelectedReport(null);
                  setRemarks('');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="modal-body">
                <div className="report-detail-view">
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Title:</strong>
                    <span style={{ color: '#212529' }}>{selectedReport.title || 'Untitled Report'}</span>
                  </div>
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Status:</strong>
                    <span className={`status-badge ${getStatusBadge(selectedReport.status)}`}>
                      <i className={`fas ${getStatusIcon(selectedReport.status)}`}></i>
                      {getStatusText(selectedReport.status)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Submitted by:</strong>
                    <span style={{ color: '#212529' }}>{getSubmitterName(selectedReport)}</span>
                  </div>
                  {getSubmitterEmail(selectedReport) && (
                    <div className="detail-row">
                      <strong style={{ color: '#006B3F' }}>Email:</strong>
                      <span style={{ color: '#212529' }}>{getSubmitterEmail(selectedReport)}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>District:</strong>
                    <span style={{ color: '#212529' }}>{selectedReport.district || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Activity Date:</strong>
                    <span style={{ color: '#212529' }}>{selectedReport.activity_date ? new Date(selectedReport.activity_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Activity Type:</strong>
                    <span style={{ color: '#212529' }}>{selectedReport.activity_type || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Location:</strong>
                    <span style={{ color: '#212529' }}>{selectedReport.location || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Participants:</strong>
                    <span style={{ color: '#212529' }}>{selectedReport.participants_count || 0}</span>
                  </div>
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Description:</strong>
                    <p style={{ color: '#212529' }}>{selectedReport.description || selectedReport.content || 'No description provided'}</p>
                  </div>
                  {selectedReport.achievements && (
                    <div className="detail-row">
                      <strong style={{ color: '#006B3F' }}>Achievements:</strong>
                      <p style={{ color: '#212529' }}>{selectedReport.achievements}</p>
                    </div>
                  )}
                  {selectedReport.challenges && (
                    <div className="detail-row">
                      <strong style={{ color: '#D32F2F' }}>Challenges:</strong>
                      <p style={{ color: '#212529' }}>{selectedReport.challenges}</p>
                    </div>
                  )}
                  {selectedReport.recommendations && (
                    <div className="detail-row">
                      <strong style={{ color: '#0056B3' }}>Recommendations:</strong>
                      <p style={{ color: '#212529' }}>{selectedReport.recommendations}</p>
                    </div>
                  )}
                  {selectedReport.file_urls && selectedReport.file_urls.length > 0 && (
                    <div className="detail-row">
                      <strong style={{ color: '#0056B3' }}>Attachments:</strong>
                      <div className="attachment-list">
                        {selectedReport.file_urls.map((file, index) => (
                          <a 
                            key={index} 
                            href={getFileUrl(file)} 
                            className="attachment-link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#0056B3' }}
                          >
                            <i className="fas fa-file"></i> {file.split('/').pop() || `Attachment ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedReport.feedback && (
                    <div className="detail-row feedback" style={{ backgroundColor: '#FFF8E1', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #FFD100' }}>
                      <strong style={{ color: '#006B3F' }}><i className="fas fa-comment"></i> Feedback:</strong>
                      <p style={{ color: '#212529' }}>{selectedReport.feedback}</p>
                    </div>
                  )}
                  <div className="detail-row">
                    <strong style={{ color: '#006B3F' }}>Submitted:</strong>
                    <span style={{ color: '#212529' }}>{new Date(selectedReport.created_at).toLocaleString()}</span>
                  </div>
                  {selectedReport.updated_at && (
                    <div className="detail-row">
                      <strong style={{ color: '#006B3F' }}>Last Updated:</strong>
                      <span style={{ color: '#212529' }}>{new Date(selectedReport.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedReport.forwarded_to_donors_at && (
                    <div className="detail-row">
                      <strong style={{ color: '#6A1B9A' }}>Forwarded to Donors:</strong>
                      <span style={{ color: '#212529' }}>{new Date(selectedReport.forwarded_to_donors_at).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Review Actions - Only for pending reports */}
                  {selectedReport.status === 'pending' && (
                    <div className="review-section" style={{ borderTop: '2px solid #FFD100', marginTop: '16px', paddingTop: '16px' }}>
                      <h4 style={{ color: '#006B3F' }}><i className="fas fa-check-circle"></i> Review Actions</h4>
                      <div className="form-group">
                        <label style={{ color: '#212529' }}>Feedback / Remarks</label>
                        <textarea
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                          rows="4"
                          placeholder="Provide your feedback, revision requests, or approval notes..."
                          className="form-control"
                          style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                        />
                      </div>
                      <div className="review-actions" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button 
                          className="btn-danger"
                          style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleReject(selectedReport.id)}
                        >
                          <i className="fas fa-times-circle"></i> Reject
                        </button>
                        <button 
                          className="btn-success"
                          style={{ backgroundColor: '#006B3F', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleApprove(selectedReport.id)}
                        >
                          <i className="fas fa-check-circle"></i> Approve
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Forward action for approved/published reports */}
                  {(selectedReport.status === 'approved' || selectedReport.status === 'published') && !selectedReport.forwarded_to_donors && (
                    <div className="review-section" style={{ borderTop: '2px solid #6A1B9A', marginTop: '16px', paddingTop: '16px' }}>
                      <h4 style={{ color: '#6A1B9A' }}><i className="fas fa-share"></i> Forward to Donors</h4>
                      <button 
                        className="btn-forward" 
                        style={{ backgroundColor: '#6A1B9A', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => {
                          setForwardingReport(selectedReport);
                          setForwardMessage('');
                          setShowForwardModal(true);
                          setSelectedReport(null);
                        }}
                      >
                        <i className="fas fa-share"></i> Forward Report to Donors
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions" style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-secondary" style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => {
                  setSelectedReport(null);
                  setRemarks('');
                }}>
                  <i className="fas fa-times"></i> Close
                </button>
                <button className="btn-edit" style={{ backgroundColor: '#FFD100', color: '#212529', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleEdit(selectedReport)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                {selectedReport.status === 'pending' && (
                  <>
                    <button className="btn-danger" style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleReject(selectedReport.id)}>
                      <i className="fas fa-times-circle"></i> Reject
                    </button>
                    <button className="btn-primary" style={{ backgroundColor: '#006B3F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleApprove(selectedReport.id)}>
                      <i className="fas fa-check-circle"></i> Approve
                    </button>
                  </>
                )}
                {(selectedReport.status === 'approved' || selectedReport.status === 'published') && !selectedReport.forwarded_to_donors && (
                  <button className="btn-forward" style={{ backgroundColor: '#6A1B9A', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => {
                    setForwardingReport(selectedReport);
                    setForwardMessage('');
                    setShowForwardModal(true);
                    setSelectedReport(null);
                  }}>
                    <i className="fas fa-share"></i> Forward to Donors
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedReport && (
          <div className="modal-overlay" onClick={() => {
            setShowEditModal(false);
            setSelectedReport(null);
          }}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ borderBottom: '2px solid #FFD100' }}>
                <h3 style={{ color: '#006B3F' }}>
                  <i className="fas fa-edit"></i> 
                  {selectedReport.status === 'revision' ? 'Edit & Resubmit Report' : 'Edit Report'}
                </h3>
                <button className="modal-close" onClick={() => {
                  setShowEditModal(false);
                  setSelectedReport(null);
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateReport}>
                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Report Title <span className="required" style={{ color: '#D32F2F' }}>*</span></label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      required
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Activity Date <span className="required" style={{ color: '#D32F2F' }}>*</span></label>
                    <input
                      type="date"
                      value={editFormData.activity_date}
                      onChange={(e) => setEditFormData({...editFormData, activity_date: e.target.value})}
                      required
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Description</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      rows="4"
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                    />
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ color: '#212529' }}>Activity Type</label>
                      <select
                        value={editFormData.activity_type}
                        onChange={(e) => setEditFormData({...editFormData, activity_type: e.target.value})}
                        className="form-control"
                        style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                      >
                        <option value="">Select activity type</option>
                        {activityTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#212529' }}>Location</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                        className="form-control"
                        style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Number of Participants</label>
                    <input
                      type="number"
                      value={editFormData.participants_count}
                      onChange={(e) => setEditFormData({...editFormData, participants_count: e.target.value})}
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Achievements</label>
                    <textarea
                      value={editFormData.achievements}
                      onChange={(e) => setEditFormData({...editFormData, achievements: e.target.value})}
                      rows="3"
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Challenges</label>
                    <textarea
                      value={editFormData.challenges}
                      onChange={(e) => setEditFormData({...editFormData, challenges: e.target.value})}
                      rows="3"
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Recommendations</label>
                    <textarea
                      value={editFormData.recommendations}
                      onChange={(e) => setEditFormData({...editFormData, recommendations: e.target.value})}
                      rows="3"
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#212529' }}>Add New Attachments</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleEditFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="form-control"
                      style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                    />
                    <small className="help-text" style={{ color: '#6c757d', fontSize: '0.85rem' }}>Add additional files to support this report</small>
                  </div>

                  {editFiles.length > 0 && (
                    <div className="file-list">
                      <h4 style={{ color: '#006B3F' }}>New Files ({editFiles.length})</h4>
                      {editFiles.map((file, index) => (
                        <div key={index} className="file-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                          <i className={`fas fa-${getFileIcon(file.name)}`} style={{ color: '#0056B3' }}></i>
                          <span className="file-name" style={{ color: '#212529' }}>{file.name}</span>
                          <span className="file-size" style={{ color: '#6c757d' }}>({(file.size / 1024).toFixed(1)} KB)</span>
                          <button 
                            type="button"
                            className="btn-remove"
                            style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                            onClick={() => removeEditFile(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-actions" style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-secondary" style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => {
                      setShowEditModal(false);
                      setSelectedReport(null);
                    }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ backgroundColor: '#006B3F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} disabled={uploadingFiles}>
                      {uploadingFiles ? (
                        <>
                          <span className="spinner"></span> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i> 
                          {selectedReport.status === 'revision' ? 'Resubmit Report' : 'Update Report'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Publish Modal */}
        {showPublishModal && selectedReport && (
          <div className="modal-overlay" onClick={() => {
            setShowPublishModal(false);
            setPublishDestination('public-website');
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ borderBottom: '2px solid #FFD100' }}>
                <h3 style={{ color: '#006B3F' }}>
                  <i className="fas fa-globe" style={{ color: '#FFD100' }}></i> 
                  Publish Report
                </h3>
                <button className="modal-close" onClick={() => {
                  setShowPublishModal(false);
                  setPublishDestination('public-website');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#212529' }}>Select where to publish this report:</p>
                <div className="form-group">
                  <label style={{ color: '#212529' }}>Destination</label>
                  <select
                    value={publishDestination}
                    onChange={e => setPublishDestination(e.target.value)}
                    className="form-control"
                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                  >
                    <option value="public-website">Public Website</option>
                    <option value="donor-portal">Donor Portal</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
              <div className="form-actions" style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-secondary" style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => {
                  setShowPublishModal(false);
                  setPublishDestination('public-website');
                }}>
                  Cancel
                </button>
                <button className="btn-primary" style={{ backgroundColor: '#006B3F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handlePublish(selectedReport.id)}>
                  <i className="fas fa-globe"></i> Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resend Modal */}
        {showResendModal && selectedReport && (
          <div className="modal-overlay" onClick={() => {
            setShowResendModal(false);
            setResendDestination('donor-portal');
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ borderBottom: '2px solid #FFD100' }}>
                <h3 style={{ color: '#006B3F' }}>
                  <i className="fas fa-paper-plane" style={{ color: '#FFD100' }}></i> 
                  Resend Report
                </h3>
                <button className="modal-close" onClick={() => {
                  setShowResendModal(false);
                  setResendDestination('donor-portal');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#212529' }}>Select where to resend this report:</p>
                <div className="form-group">
                  <label style={{ color: '#212529' }}>Destination</label>
                  <select
                    value={resendDestination}
                    onChange={e => setResendDestination(e.target.value)}
                    className="form-control"
                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%' }}
                  >
                    <option value="donor-portal">Donor Portal</option>
                    <option value="public-website">Public Website</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <p style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '8px' }}>
                  <i className="fas fa-info-circle"></i> This will resend the report to the selected destination(s).
                </p>
              </div>
              <div className="form-actions" style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-secondary" style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => {
                  setShowResendModal(false);
                  setResendDestination('donor-portal');
                }}>
                  Cancel
                </button>
                <button className="btn-primary" style={{ backgroundColor: '#006B3F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleResend(selectedReport.id)}>
                  <i className="fas fa-paper-plane"></i> Resend
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forward to Donors Modal */}
        {showForwardModal && forwardingReport && (
          <div className="modal-overlay" onClick={() => {
            setShowForwardModal(false);
            setForwardingReport(null);
            setForwardMessage('');
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ borderBottom: '2px solid #6A1B9A' }}>
                <h3 style={{ color: '#6A1B9A' }}>
                  <i className="fas fa-share" style={{ color: '#FFD100' }}></i> 
                  Forward Report to Donors
                </h3>
                <button className="modal-close" onClick={() => {
                  setShowForwardModal(false);
                  setForwardingReport(null);
                  setForwardMessage('');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="report-summary" style={{ 
                  background: '#f8f9fa', 
                  padding: '12px 16px', 
                  borderRadius: '6px',
                  marginBottom: '16px',
                  borderLeft: '4px solid #6A1B9A'
                }}>
                  <p style={{ margin: 0, color: '#212529' }}>
                    <strong>Report:</strong> {forwardingReport.title || 'Untitled Report'}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                    <strong>District:</strong> {forwardingReport.district || 'N/A'} | 
                    <strong> Status:</strong> {getStatusText(forwardingReport.status)}
                  </p>
                </div>

                <p style={{ color: '#212529', marginBottom: '12px' }}>
                  This will forward the report to <strong>ALL active donors</strong>. They will receive a notification and see it in their updates feed.
                </p>

                <div className="form-group">
                  <label style={{ color: '#212529' }}>Message to Donors (Optional)</label>
                  <textarea
                    value={forwardMessage}
                    onChange={e => setForwardMessage(e.target.value)}
                    rows="4"
                    placeholder="Add a personal message for donors..."
                    className="form-control"
                    style={{ 
                      border: '1px solid #ced4da', 
                      borderRadius: '4px', 
                      padding: '8px 12px', 
                      width: '100%',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                  <small className="help-text" style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    <i className="fas fa-info-circle"></i> This message will be included in the notification sent to donors.
                  </small>
                </div>

                <div className="forward-info" style={{ 
                  background: '#FFF8E1', 
                  padding: '12px 16px', 
                  borderRadius: '6px',
                  borderLeft: '4px solid #FFD100',
                  marginTop: '12px'
                }}>
                  <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
                    <i className="fas fa-info-circle"></i> 
                    <strong> Note:</strong> The report will be marked as <span style={{ fontWeight: 'bold', color: '#6A1B9A' }}>"Forwarded to Donors"</span> and will appear in the donor portal.
                  </p>
                </div>
              </div>
              <div className="form-actions" style={{ 
                borderTop: '1px solid #e9ecef', 
                paddingTop: '16px', 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '10px' 
              }}>
                <button 
                  className="btn-secondary" 
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} 
                  onClick={() => {
                    setShowForwardModal(false);
                    setForwardingReport(null);
                    setForwardMessage('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-forward" 
                  style={{ backgroundColor: '#6A1B9A', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} 
                  onClick={handleForwardToDonors}
                  disabled={forwarding}
                >
                  {forwarding ? (
                    <>
                      <span className="spinner" style={{ 
                        display: 'inline-block', 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #fff', 
                        borderTopColor: 'transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 0.8s linear infinite',
                        marginRight: '8px'
                      }}></span> 
                      Forwarding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-share"></i> Forward to Donors
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => {
            setShowDeleteModal(false);
            setReportToDelete(null);
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ borderBottom: '2px solid #D32F2F' }}>
                <h3 style={{ color: '#D32F2F' }}>
                  <i className="fas fa-exclamation-triangle"></i> 
                  Confirm Delete
                </h3>
                <button className="modal-close" onClick={() => {
                  setShowDeleteModal(false);
                  setReportToDelete(null);
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#212529' }}>Are you sure you want to permanently delete this report?</p>
                <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>This action cannot be undone.</p>
              </div>
              <div className="form-actions" style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-secondary" style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => {
                  setShowDeleteModal(false);
                  setReportToDelete(null);
                }}>
                  Cancel
                </button>
                <button className="btn-danger" style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }} onClick={handleDelete}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS STYLES */}
      <style>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .page-header p {
          margin: 4px 0 0 0;
          color: #6c757d;
        }

        .btn-refresh {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-refresh:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn-edit {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-edit:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Stats Cards */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 16px 20px;
          border-radius: 8px;
          border-left: 4px solid #006B3F;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-card .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #212529;
        }

        .stat-card .stat-label {
          font-size: 12px;
          color: #6c757d;
          margin-top: 4px;
        }

        /* Alerts */
        .alert {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-left: 4px solid;
        }

        .alert-error {
          background: #f8d7da;
          border-color: #D32F2F;
          color: #721c24;
        }

        .alert-success {
          background: #d4edda;
          border-color: #006B3F;
          color: #155724;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
          padding: 0 4px;
        }

        /* Filter Bar */
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          background: white;
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          font-size: 14px;
          font-weight: 500;
          color: #212529;
        }

        .filter-select {
          padding: 6px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          min-width: 150px;
        }

        .stats-info {
          margin-left: auto;
          font-size: 14px;
          color: #6c757d;
        }

        .stats-info strong {
          color: #212529;
        }

        .btn-clear-filter {
          background: none;
          border: none;
          color: #D32F2F;
          cursor: pointer;
          font-size: 14px;
          padding: 4px 8px;
        }

        .btn-clear-filter:hover {
          text-decoration: underline;
        }

        /* Reports List */
        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Report Card */
        .report-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-left: 4px solid #6c757d;
          transition: all 0.2s ease;
        }

        .report-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }

        .report-title {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .report-title h4 {
          margin: 0;
          font-size: 16px;
          color: #212529;
        }

        .report-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #6c757d;
        }

        .report-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .report-body {
          margin: 12px 0;
        }

        .report-body p {
          margin: 0;
          color: #212529;
          line-height: 1.6;
        }

        .report-feedback {
          background: #FFF8E1;
          padding: 10px 14px;
          border-radius: 6px;
          border-left: 3px solid #FFD100;
          margin-top: 8px;
        }

        .report-feedback p {
          margin: 4px 0 0 0;
          color: #212529;
        }

        .attachments {
          margin-top: 8px;
        }

        .attachments strong {
          color: #0056B3;
        }

        .attachment-link {
          display: inline-block;
          margin: 4px 8px 4px 0;
          padding: 4px 12px;
          background: #f0f4f8;
          border-radius: 4px;
          color: #0056B3;
          text-decoration: none;
          font-size: 13px;
          border: 1px solid #e2e8f0;
        }

        .attachment-link:hover {
          background: #e2e8f0;
          text-decoration: none;
        }

        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-pending {
          background: #fff3cd;
          color: #856404;
        }

        .badge-approved {
          background: #d4edda;
          color: #155724;
        }

        .badge-rejected {
          background: #f8d7da;
          color: #721c24;
        }

        .badge-completed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .badge-default {
          background: #e9ecef;
          color: #495057;
        }

        .badge-warning {
          background: #fff3cd;
          color: #856404;
        }

        .badge-forwarded {
          background: #6A1B9A;
          color: #FFD100;
        }

        /* Report Actions */
        .report-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
        }

        .btn-sm {
          padding: 6px 14px;
          border: none;
          border-radius: 4px;
          font-size: 13px;
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

        .btn-sm:active {
          transform: translateY(0);
        }

        .btn-sm.btn-primary {
          background: #006B3F;
          color: white;
        }

        .btn-sm.btn-primary:hover {
          background: #005a34;
        }

        .btn-sm.btn-success {
          background: #28a745;
          color: white;
        }

        .btn-sm.btn-success:hover {
          background: #218838;
        }

        .btn-sm.btn-danger {
          background: #D32F2F;
          color: white;
        }

        .btn-sm.btn-danger:hover {
          background: #b71c1c;
        }

        .btn-sm.btn-view {
          background: #0056B3;
          color: white;
        }

        .btn-sm.btn-view:hover {
          background: #004494;
        }

        .btn-sm.btn-archive {
          background: #6c757d;
          color: white;
        }

        .btn-sm.btn-archive:hover {
          background: #5a6268;
        }

        .btn-sm.btn-delete {
          background: #D32F2F;
          color: white;
        }

        .btn-sm.btn-delete:hover {
          background: #b71c1c;
        }

        .btn-sm.btn-edit {
          background: #FFD100;
          color: #212529;
        }

        .btn-sm.btn-edit:hover {
          background: #e6be00;
        }

        .btn-sm.btn-warning {
          background: #17a2b8;
          color: white;
        }

        .btn-sm.btn-warning:hover {
          background: #138496;
        }

        .btn-sm.btn-forward {
          background: #6A1B9A;
          color: white;
        }

        .btn-sm.btn-forward:hover {
          background: #5a1580;
          box-shadow: 0 2px 8px rgba(106, 27, 154, 0.3);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
        }

        .empty-state h3 {
          margin: 16px 0 8px 0;
          color: #212529;
        }

        .empty-state p {
          color: #6c757d;
          margin-bottom: 16px;
        }

        /* Modal */
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
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 800px;
          width: 95%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        .modal-large {
          max-width: 900px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e9ecef;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #212529;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #6c757d;
          cursor: pointer;
          padding: 0 8px;
        }

        .modal-close:hover {
          color: #212529;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-row {
          margin-bottom: 12px;
        }

        .detail-row strong {
          display: inline-block;
          min-width: 140px;
          color: #006B3F;
        }

        .detail-row p {
          margin: 4px 0 0 0;
          color: #212529;
        }

        .detail-row.feedback {
          background: #FFF8E1;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid #FFD100;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #212529;
        }

        .form-group textarea,
        .form-group select,
        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .required {
          color: #D32F2F;
        }

        .review-section {
          border-top: 2px solid #FFD100;
          margin-top: 16px;
          padding-top: 16px;
        }

        .review-section h4 {
          color: #006B3F;
          margin: 0 0 12px 0;
        }

        .review-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
          position: sticky;
          bottom: 0;
          background: white;
          border-radius: 0 0 12px 12px;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-danger {
          background: #D32F2F;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-danger:hover {
          background: #b71c1c;
        }

        .btn-success {
          background: #006B3F;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-success:hover {
          background: #005a34;
        }

        .btn-forward {
          background: #6A1B9A;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-forward:hover {
          background: #5a1580;
          box-shadow: 0 2px 8px rgba(106, 27, 154, 0.3);
        }

        .btn-forward:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Loading */
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner-large {
          width: 50px;
          height: 50px;
          border: 4px solid #e9ecef;
          border-top-color: #006B3F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* File List */
        .file-list {
          margin-top: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .file-list h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #006B3F;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }

        .btn-remove {
          background: #D32F2F;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-remove:hover {
          background: #b71c1c;
        }

        .help-text {
          display: block;
          color: #6c757d;
          font-size: 0.85rem;
          margin-top: 4px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-info {
            margin-left: 0;
            text-align: center;
          }

          .report-header {
            flex-direction: column;
          }

          .report-meta {
            flex-direction: column;
            gap: 4px;
          }

          .modal-content {
            width: 98%;
            max-height: 95vh;
          }

          .form-actions {
            flex-wrap: wrap;
            justify-content: center;
          }

          .review-actions {
            flex-direction: column;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-cards {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .stat-card {
            padding: 12px;
          }

          .stat-card .stat-number {
            font-size: 20px;
          }

          .report-actions {
            flex-direction: column;
          }

          .btn-sm {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default ReceivedReports;