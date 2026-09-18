// src/components/donor/MyDonations.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const MyDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [projects, setProjects] = useState([]);
  const [showAllDonations, setShowAllDonations] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDonations();
    fetchProjects();
  }, [filterDate, filterProject]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('📥 Fetching donations with filter:', filterDate, filterProject);
      
      const response = await axios.get(`${API_URL}/donation/donations?date=${filterDate}&project=${filterProject}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Donations response:', response.data);
      
      // ✅ Handle different response formats
      let donationsData = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        // Direct array response
        donationsData = data;
        console.log('✅ Response is array:', donationsData.length);
      } else if (data && typeof data === 'object') {
        // Object response - check for nested arrays
        if (data.donations && Array.isArray(data.donations)) {
          donationsData = data.donations;
          console.log('✅ Found in data.donations:', donationsData.length);
        } else if (data.data && Array.isArray(data.data)) {
          donationsData = data.data;
          console.log('✅ Found in data.data:', donationsData.length);
        } else {
          // Try to find any array in the response
          for (const key in data) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
              donationsData = data[key];
              console.log(`✅ Found array in data.${key}:`, donationsData.length);
              break;
            }
          }
        }
      }
      
      console.log('✅ Final donations:', donationsData);
      setDonations(donationsData);
      setError('');
      
    } catch (err) {
      console.error('❌ Error fetching donations:', err);
      setError(err.response?.data?.message || 'Failed to load donations');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/donation/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Projects response:', response.data);
      
      let projectsData = [];
      const data = response.data;
      
      if (Array.isArray(data)) {
        projectsData = data;
      } else if (data.projects && Array.isArray(data.projects)) {
        projectsData = data.projects;
      } else if (data.data && Array.isArray(data.data)) {
        projectsData = data.data;
      }
      
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    }
  };

  const downloadReceipt = async (donationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/donation/receipt/${donationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${donationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download receipt');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'badge-pending',
      'approved': 'badge-approved',
      'completed': 'badge-approved',
      'rejected': 'badge-rejected',
      'cancelled': 'badge-rejected',
      'failed': 'badge-rejected',
      'refunded': 'badge-refunded'
    };
    return badges[status?.toLowerCase()] || 'badge-pending';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': '⏳ Pending',
      'approved': '✅ Approved',
      'completed': '✅ Completed',
      'rejected': '❌ Rejected',
      'cancelled': '❌ Cancelled',
      'failed': '❌ Failed',
      'refunded': '🔄 Refunded'
    };
    return labels[status?.toLowerCase()] || status || 'Pending';
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

  const totalAmount = Array.isArray(donations) 
    ? donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
    : 0;

  const activeProjects = Array.isArray(projects) ? projects : [];
  const displayedDonations = showAllDonations ? donations : donations.slice(0, 5);

  if (loading) return <div className="loading-spinner">Loading donations...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2><i className="fas fa-heart" style={{ color: '#FFD100' }}></i> My Donations</h2>
        <p>Track and manage your donation history</p>
        <div className="header-actions">
          <span className="total-amount">
            Total: <strong>RWF {totalAmount.toLocaleString()}</strong>
          </span>
          <Link to="/payment" className="btn-primary">
            <i className="fas fa-heart"></i> Make Donation
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i> {success}
          <button className="alert-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="filter-bar">
        <select value={filterDate} onChange={e => setFilterDate(e.target.value)}>
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="all">All Projects</option>
          {activeProjects.map(project => (
            <option key={project.id} value={project.id}>
              {project.title || project.name}
            </option>
          ))}
        </select>
        <span className="stats-info">
          {donations.length} donation{donations.length !== 1 ? 's' : ''}
        </span>
        <button className="btn-refresh" onClick={fetchDonations}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(donations) || donations.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <div className="empty-state">
                    <i className="fas fa-heart" style={{ fontSize: '2rem', color: '#d1d5db', marginBottom: '8px' }}></i>
                    <p>No donations found</p>
                    <Link to="/payment" className="btn-primary btn-sm" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                      <i className="fas fa-plus"></i> Make Your First Donation
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              displayedDonations.map((donation, index) => (
                <tr key={donation.id || index}>
                  <td>{formatDate(donation.created_at || donation.date)}</td>
                  <td>{donation.project || donation.message || 'General Donation'}</td>
                  <td><strong>RWF {parseFloat(donation.amount || 0).toLocaleString()}</strong></td>
                  <td>{donation.payment_method || donation.paymentMethod || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(donation.status)}`}>
                      {getStatusLabel(donation.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {(donation.status === 'completed' || donation.status === 'approved') && (
                        <button className="btn-sm btn-download" onClick={() => downloadReceipt(donation.id)}>
                          <i className="fas fa-download"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {donations.length > 5 && (
            <tfoot>
              <tr>
                <td colSpan="6" className="text-center">
                  <button 
                    className="btn-show-all"
                    onClick={() => setShowAllDonations(!showAllDonations)}
                  >
                    {showAllDonations ? 'Show Less' : `View All (${donations.length})`}
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <style>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #006B3F, #004D2D);
          border-radius: 12px;
          color: white;
        }

        .page-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 1.5rem;
          color: white;
        }

        .page-header h2 i {
          color: #FCD116 !important;
        }

        .page-header p {
          margin: 0;
          color: rgba(255,255,255,0.85);
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
        }

        .total-amount {
          font-size: 1rem;
          color: rgba(255,255,255,0.9);
        }

        .total-amount strong {
          color: #FCD116;
          font-size: 1.2rem;
        }

        .btn-primary {
          background: #FCD116;
          color: #1f2937;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-primary:hover {
          background: #e6bc00;
          transform: translateY(-1px);
        }

        .btn-sm {
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-download {
          background: #3B82F6;
          color: white;
        }

        .btn-download:hover {
          background: #2563EB;
        }

        .btn-refresh {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-refresh:hover {
          background: #e5e7eb;
        }

        .btn-show-all {
          background: none;
          border: none;
          color: #006B3F;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 8px 16px;
          transition: all 0.2s;
        }

        .btn-show-all:hover {
          color: #004D2D;
          text-decoration: underline;
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

        .alert-success {
          background: #e8f5ee;
          color: #006b3f;
          border: 1px solid #b8e5d0;
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
        }

        .alert-close:hover {
          opacity: 1;
        }

        .filter-bar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          align-items: center;
        }

        .filter-bar select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          background: white;
        }

        .stats-info {
          margin-left: auto;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .table-container {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        .data-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
        }

        .data-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }

        .data-table tr:hover {
          background: #f9fafb;
        }

        .text-center {
          text-align: center;
          padding: 24px !important;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #6b7280;
        }

        .empty-state p {
          margin: 4px 0 12px 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .badge-approved {
          background: #e8f5ee;
          color: #006b3f;
        }

        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-rejected {
          background: #fde8eb;
          color: #991b1b;
        }

        .badge-refunded {
          background: #dbeafe;
          color: #1e40af;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          color: #6b7280;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .header-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-bar {
            flex-direction: column;
          }

          .filter-bar select {
            width: 100%;
          }

          .stats-info {
            margin-left: 0;
          }

          .data-table {
            font-size: 0.85rem;
          }

          .data-table th,
          .data-table td {
            padding: 8px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default MyDonations;