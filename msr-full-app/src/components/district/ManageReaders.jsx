import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ManageReaders = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    unit: '',
    role: 'unit-leader'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/district/leaders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Leaders response:', response.data);
      
      // ✅ Handle different response formats
      let leadersData = [];
      if (Array.isArray(response.data)) {
        leadersData = response.data;
      } else if (response.data.leaders && Array.isArray(response.data.leaders)) {
        leadersData = response.data.leaders;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        leadersData = response.data.data;
      } else {
        leadersData = [];
      }
      
      setLeaders(leadersData);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching leaders:', err);
      setError(err.response?.data?.message || 'Failed to load leaders');
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeader = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/district/leaders`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Unit Leader added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', unit: '', role: 'unit-leader' });
      fetchLeaders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add leader');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateLeader = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/leaders/${selectedLeader.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Leader updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setSelectedLeader(null);
      fetchLeaders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leader');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/leaders/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`Leader ${newStatus === 'active' ? 'activated' : 'deactivated'}!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchLeaders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openEditModal = (leader) => {
    setSelectedLeader(leader);
    setFormData({
      name: leader.name || leader.full_name || '',
      email: leader.email || '',
      phone: leader.phone || '',
      unit: leader.unit || '',
      role: leader.role || 'unit-leader'
    });
  };

  // ✅ Safe filtering - ensure leaders is an array
  const filteredLeaders = Array.isArray(leaders) ? leaders.filter(leader =>
    (leader.name?.toLowerCase() || leader.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (leader.sin?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="loading-spinner">Loading leaders...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2><i className="fas fa-user-tie" style={{ color: '#FFD100' }}></i> Leader Management</h2>
        <p>Manage all Unit Leaders in your district</p>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-user-plus"></i> Add Unit Leader
        </button>
      </div>

      {error && (
        <div className="console.log console.log-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button className="console.log-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="console.log console.log-success">
          <i className="fas fa-check-circle"></i>
          {success}
          <button className="console.log-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="search-filter-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name or SIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats-info">
          <span>Total: <strong>{filteredLeaders.length}</strong> leaders</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SIN</th>
              <th>Name</th>
              <th>Email</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Reports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No leaders found</td>
              </tr>
            ) : (
              filteredLeaders.map(leader => (
                <tr key={leader.id}>
                  <td><strong>{leader.sin || '—'}</strong></td>
                  <td>{leader.name || leader.full_name || '—'}</td>
                  <td>{leader.email || '—'}</td>
                  <td>{leader.unit || '—'}</td>
                  <td>
                    <span className={`status-badge ${leader.status === 'active' ? 'badge-approved' : 'badge-pending'}`}>
                      {leader.status || 'pending'}
                    </span>
                  </td>
                  <td>{leader.reportCount || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-edit" onClick={() => openEditModal(leader)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-sm btn-toggle" onClick={() => handleToggleStatus(leader.id, leader.status)}>
                        <i className={`fas ${leader.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || selectedLeader) && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setSelectedLeader(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-tie"></i>
                {selectedLeader ? 'Edit Unit Leader' : 'Add New Unit Leader'}
              </h3>
              <button className="modal-close" onClick={() => {
                setShowAddModal(false);
                setSelectedLeader(null);
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={selectedLeader ? handleUpdateLeader : handleAddLeader}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    placeholder="Unit name"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowAddModal(false);
                  setSelectedLeader(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> {selectedLeader ? 'Save Changes' : 'Add Leader'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReaders;