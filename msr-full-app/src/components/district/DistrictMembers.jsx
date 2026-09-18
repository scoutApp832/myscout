import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DistrictMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [districtInfo, setDistrictInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleAction, setRoleAction] = useState('');
  const [roleData, setRoleData] = useState({
    unit: '',
    role: 'unit_leader'
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ✅ Get district from logged-in user
  const userDistrict = user?.member?.district || user?.district || null;

  const ageGroups = [
    { id: 'all', label: 'All Ages' },
    { id: '6-12', label: '6–12 years' },
    { id: '13-18', label: '13–18 years' },
    { id: '19-25', label: '19–25 years' },
    { id: '25+', label: '25+ years' }
  ];

  const genders = [
    { id: 'all', label: 'All Genders' },
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' }
  ];

  const statuses = [
    { id: 'all', label: 'All Status' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'pending', label: 'Pending' }
  ];

  const roles = [
    { id: 'all', label: 'All Roles' },
    { id: 'scout', label: 'Scout' },
    { id: 'unit_leader', label: 'Unit Leader' }
  ];

  const paymentStatuses = [
    { id: 'all', label: 'All Payments' },
    { id: 'paid', label: '✅ Paid' },
    { id: 'pending', label: '⏳ Pending' },
    { id: 'overdue', label: '⚠️ Overdue' }
  ];

  // ✅ Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!userDistrict) {
      setError('No district assigned to your account. Please contact administrator.');
      setLoading(false);
      return;
    }
    fetchMembers();
    fetchDistrictInfo();
  }, []);

  const fetchDistrictInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/district/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let districtData = {};
      if (response.data.success) {
        districtData = response.data.district || response.data.data || {};
      } else if (response.data.district) {
        districtData = response.data.district;
      } else {
        districtData = response.data;
      }
      
      const districtName = districtData.name || 
                          districtData.district_name || 
                          userDistrict || 
                          'N/A';
      
      const commissionerName = districtData.commissioner_name || 
                              districtData.commissioner?.full_name || 
                              districtData.commissioner?.name ||
                              user?.full_name || 
                              'N/A';
      
      setDistrictInfo({
        name: districtName,
        commissioner: commissionerName,
        email: districtData.email || user?.email || '',
        phone: districtData.phone || user?.phone || '',
        totalMembers: districtData.total_members || 0,
        activeMembers: districtData.active_members || 0,
        unitLeaders: districtData.unit_leaders || 0
      });
      
    } catch (err) {
      console.error('❌ Error fetching district info:', err);
      setDistrictInfo({
        name: userDistrict || 'N/A',
        commissioner: user?.full_name || 'N/A',
        email: user?.email || '',
        phone: user?.phone || '',
        totalMembers: 0,
        activeMembers: 0,
        unitLeaders: 0
      });
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/district/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Members response:', response.data);
      
      let membersData = [];
      
      if (Array.isArray(response.data)) {
        membersData = response.data;
      } else if (response.data.members && Array.isArray(response.data.members)) {
        membersData = response.data.members;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        membersData = response.data.data;
      }
      
      // ✅ Filter members by district
      const districtMembers = membersData.filter(member => {
        const memberDistrict = member.district || member.member?.district || null;
        const match = memberDistrict && userDistrict && 
                      memberDistrict.toLowerCase() === userDistrict.toLowerCase();
        return match;
      });
      
      // ✅ Process members with complete data
      const processedMembers = districtMembers.map(member => ({
        id: member.id,
        full_name: member.full_name || 
                   (member.first_name && member.last_name ? `${member.first_name} ${member.last_name}` : null) ||
                   member.first_name ||
                   member.name ||
                   member.user?.full_name ||
                   'N/A',
        first_name: member.first_name || member.user?.first_name || '',
        last_name: member.last_name || member.user?.last_name || '',
        email: member.email || member.user?.email || 'N/A',
        phone: member.phone || member.user?.phone || 'N/A',
        sin: member.sin || 'Not Generated',
        unit: member.troop_name || member.unit || 'N/A',
        district: member.district || 'N/A',
        province: member.province || 'N/A',
        sector: member.sector || 'N/A',
        cell: member.cell || 'N/A',
        village: member.village || 'N/A',
        gender: member.gender || 'N/A',
        date_of_birth: member.date_of_birth || null,
        membership_status: member.membership_status || member.status || 'pending',
        status: member.membership_status || member.status || 'pending',
        membership_type: member.membership_type || member.role || 'scout',
        role: member.membership_type || member.role || 'scout',
        isUnitLeader: member.membership_type === 'unit_leader' || member.role === 'unit_leader',
        // ✅ FIX: Check payment_status, fee_status, and payment_approved
        payment_status: member.payment_status || 'pending',
        fee_status: member.fee_status || 'pending',
        payment_approved: member.payment_approved || false,
        payment_amount: member.payment_amount || 0,
        payment_date: member.payment_date || null,
        payment_method: member.payment_method || 'N/A',
        payment_reference: member.payment_reference || 'N/A',
        joined_date: member.joined_date || member.created_at || null,
        expiry_date: member.expiry_date || null,
        created_at: member.created_at || null,
        updated_at: member.updated_at || null,
        profile_image: member.profile_image || member.user?.profile_image || null,
        bio: member.bio || '',
        skills: member.skills || '',
        interests: member.interests || '',
        fee_paid_date: member.fee_paid_date || null,
        fee_expiry_date: member.fee_expiry_date || null
      }));
      
      console.log('📊 Processed members with payment:', processedMembers.map(m => ({
        name: m.full_name,
        payment_status: m.payment_status,
        fee_status: m.fee_status,
        payment_approved: m.payment_approved
      })));
      
      setMembers(processedMembers);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching members:', err);
      setError(err.response?.data?.message || 'Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get payment status from multiple fields
  const getMemberPaymentStatus = (member) => {
    // ✅ Check payment_status first
    if (member.payment_status === 'paid' || member.payment_status === 'Paid') {
      return 'paid';
    }
    // ✅ Check fee_status
    if (member.fee_status === 'paid' || member.fee_status === 'Paid') {
      return 'paid';
    }
    // ✅ Check payment_approved
    if (member.payment_approved === true) {
      return 'paid';
    }
    // ✅ Check if payment_status is 'overdue'
    if (member.payment_status === 'overdue' || member.payment_status === 'Overdue') {
      return 'overdue';
    }
    // ✅ Default to pending
    return 'pending';
  };

  // ✅ Get payment badge - FIXED
  const getPaymentBadge = (member) => {
    const status = getMemberPaymentStatus(member);
    
    if (status === 'paid') {
      return <span className="status-badge badge-paid">✅ Paid</span>;
    }
    if (status === 'overdue') {
      return <span className="status-badge badge-overdue">⚠️ Overdue</span>;
    }
    return <span className="status-badge badge-pending">⏳ Pending</span>;
  };

  // ✅ Get payment label for display
  const getPaymentLabel = (member) => {
    const status = getMemberPaymentStatus(member);
    if (status === 'paid') return 'Paid';
    if (status === 'overdue') return 'Overdue';
    return 'Pending';
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    try {
      const exportData = filteredMembers.map(member => ({
        'SIN': member.sin || 'Not Assigned',
        'Full Name': member.full_name || 'N/A',
        'Email': member.email || 'N/A',
        'Phone': member.phone || 'N/A',
        'Unit': member.unit || 'N/A',
        'District': member.district || 'N/A',
        'Age': calculateAge(member.date_of_birth),
        'Gender': member.gender || 'N/A',
        'Status': member.status || 'pending',
        'Role': member.isUnitLeader ? 'Unit Leader' : 'Scout',
        'Payment Status': getPaymentLabel(member),
        'Joined Date': member.joined_date ? new Date(member.joined_date).toLocaleDateString() : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'District Members');
      
      const colWidths = [
        { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 20 },
        { wch: 20 }, { wch: 20 }, { wch: 8 },  { wch: 10 },
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      const fileName = `${districtInfo?.name || 'District'}_Members_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setSuccess(`✅ Exported ${exportData.length} members to Excel`);
      setTimeout(() => setSuccess(''), 3000);
      setShowExportMenu(false);
    } catch (err) {
      console.error('❌ Export to Excel error:', err);
      setError('Failed to export to Excel');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(18);
      doc.setTextColor(107, 47, 160);
      doc.text(`${districtInfo?.name || 'District'} Members Report`, pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Commissioner: ${districtInfo?.commissioner || 'N/A'}`, pageWidth / 2, 28, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 34, { align: 'center' });
      
      const tableData = filteredMembers.map(member => [
        member.sin || 'Not Assigned',
        member.full_name || 'N/A',
        member.email || 'N/A',
        member.unit || 'N/A',
        calculateAge(member.date_of_birth),
        member.gender || 'N/A',
        member.status || 'pending',
        member.isUnitLeader ? 'Unit Leader' : 'Scout',
        getPaymentLabel(member)
      ]);

      doc.autoTable({
        startY: 40,
        head: [['SIN', 'Full Name', 'Email', 'Unit', 'Age', 'Gender', 'Status', 'Role', 'Payment']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [107, 47, 160],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 30 },
          4: { cellWidth: 12 },
          5: { cellWidth: 18 },
          6: { cellWidth: 20 },
          7: { cellWidth: 25 },
          8: { cellWidth: 20 }
        }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount} - ${districtInfo?.name || 'District'} Members Report`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      const fileName = `${districtInfo?.name || 'District'}_Members_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      setSuccess(`✅ Exported ${filteredMembers.length} members to PDF`);
      setTimeout(() => setSuccess(''), 3000);
      setShowExportMenu(false);
    } catch (err) {
      console.error('❌ Export to PDF error:', err);
      setError('Failed to export to PDF');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Promote Scout to Unit Leader
  const handlePromoteToLeader = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/district/members/${memberId}/promote`,
        { unit: roleData.unit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(response.data.message || 'Member promoted to Unit Leader successfully');
      
      setMembers(prev =>
        prev.map(m => 
          m.id === memberId 
            ? { ...m, membership_type: 'unit_leader', role: 'unit_leader', isUnitLeader: true, unit: roleData.unit || m.unit }
            : m
        )
      );
      
      setTimeout(() => setSuccess(''), 3000);
      setShowRoleModal(false);
      setRoleData({ unit: '', role: 'unit_leader' });
      setSelectedMember(null);
      fetchMembers();
      fetchDistrictInfo();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote member');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Demote Unit Leader to Scout
  const handleDemoteToScout = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/district/members/${memberId}/demote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(response.data.message || 'Unit Leader demoted to Scout successfully');
      
      setMembers(prev =>
        prev.map(m => 
          m.id === memberId 
            ? { ...m, membership_type: 'scout', role: 'scout', isUnitLeader: false }
            : m
        )
      );
      
      setTimeout(() => setSuccess(''), 3000);
      setShowRoleModal(false);
      setRoleData({ unit: '', role: 'scout' });
      setSelectedMember(null);
      fetchMembers();
      fetchDistrictInfo();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to demote member');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Open role change modal
  const openRoleModal = (member, action) => {
    setSelectedMember(member);
    setRoleAction(action);
    setRoleData({
      unit: member.unit || '',
      role: action === 'promote' ? 'unit_leader' : 'scout'
    });
    setShowRoleModal(true);
  };

  // ✅ Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const monthDiff = new Date().getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  // ✅ Get age group
  const getAgeGroup = (age) => {
    if (age === 'N/A') return 'all';
    if (age <= 12) return '6-12';
    if (age <= 18) return '13-18';
    if (age <= 25) return '19-25';
    return '25+';
  };

  // ✅ Filter members
  const filteredMembers = Array.isArray(members) ? members.filter(member => {
    const age = calculateAge(member.date_of_birth);
    const ageGroup = getAgeGroup(age);
    
    const matchesSearch = 
      (member.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.sin?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.unit?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesAge = filterAge === 'all' || ageGroup === filterAge;
    const matchesGender = filterGender === 'all' || member.gender === filterGender;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesRole = filterRole === 'all' || 
      (filterRole === 'unit_leader' && member.isUnitLeader) ||
      (filterRole === 'scout' && !member.isUnitLeader);
    
    // ✅ Use getMemberPaymentStatus for filtering
    const paymentStatus = getMemberPaymentStatus(member);
    const matchesPayment = filterPayment === 'all' || 
      (filterPayment === 'paid' && paymentStatus === 'paid') ||
      (filterPayment === 'pending' && paymentStatus === 'pending') ||
      (filterPayment === 'overdue' && paymentStatus === 'overdue');
    
    return matchesSearch && matchesAge && matchesGender && matchesStatus && matchesRole && matchesPayment;
  }) : [];

  // ✅ Get stats
  const totalMembers = filteredMembers.length;
  const activeMembers = filteredMembers.filter(m => m.status === 'active').length;
  const unitLeaders = filteredMembers.filter(m => m.isUnitLeader).length;
  const paidMembers = filteredMembers.filter(m => getMemberPaymentStatus(m) === 'paid').length;

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <span>Loading members...</span>
    </div>
  );

  if (!userDistrict) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          No district assigned to your account. Please contact the administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ✅ Purple District Header */}
      <div className="district-header">
        <div className="district-header-content">
          <div className="district-header-left">
            <h1>
              <i className="fas fa-map-marker-alt"></i>
              {districtInfo?.name || userDistrict || 'District'}
            </h1>
            <p className="district-subtitle">
              <i className="fas fa-user-tie"></i>
              Commissioner: <strong>{districtInfo?.commissioner || user?.full_name || 'N/A'}</strong>
            </p>
          </div>
          <div className="district-header-right">
            <div className="district-stats">
              <div className="stat-item">
                <span className="stat-number">{totalMembers}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{activeMembers}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{unitLeaders}</span>
                <span className="stat-label">Leaders</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{paidMembers}</span>
                <span className="stat-label">✅ Paid</span>
              </div>
            </div>
          </div>
        </div>
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

      <div className="search-filter-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, SIN, email or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={filterAge} onChange={e => setFilterAge(e.target.value)}>
            {ageGroups.map(group => (
              <option key={group.id} value={group.id}>{group.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
            {genders.map(gender => (
              <option key={gender.id} value={gender.id}>{gender.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-box">
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
            {paymentStatuses.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
        </div>
        <div className="stats-info">
          <span>Showing: <strong>{filteredMembers.length}</strong></span>
        </div>
        
        {/* Export Button */}
        <div className="export-container" ref={exportMenuRef}>
          <button 
            className="btn-export" 
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export members data"
          >
            <i className="fas fa-file-export"></i> Export
            <i className={`fas fa-chevron-${showExportMenu ? 'up' : 'down'}`} style={{ fontSize: '10px', marginLeft: '4px' }}></i>
          </button>
          {showExportMenu && (
            <div className="export-dropdown">
              <button onClick={exportToExcel} className="export-option">
                <i className="fas fa-file-excel" style={{ color: '#217346' }}></i>
                Export to Excel
              </button>
              <button onClick={exportToPDF} className="export-option">
                <i className="fas fa-file-pdf" style={{ color: '#dc3545' }}></i>
                Export to PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SIN</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Unit</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Role</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">No members found in this district</td>
              </tr>
            ) : (
              filteredMembers.map(member => {
                const age = calculateAge(member.date_of_birth);
                const paymentStatus = getMemberPaymentStatus(member);
                return (
                  <tr key={member.id}>
                    <td><strong>{member.sin || 'Not Assigned'}</strong></td>
                    <td>{member.full_name || 'N/A'}</td>
                    <td>{member.email || 'N/A'}</td>
                    <td>{member.unit || 'N/A'}</td>
                    <td>{age}</td>
                    <td>{member.gender || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${member.status === 'active' ? 'badge-approved' : member.status === 'pending' ? 'badge-pending' : 'badge-inactive'}`}>
                        {member.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${member.isUnitLeader ? 'badge-approved' : 'badge-default'}`}>
                        {member.isUnitLeader ? 'Unit Leader' : 'Scout'}
                      </span>
                    </td>
                    <td>
                      {getPaymentBadge(member)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-sm btn-view" onClick={() => setSelectedMember(member)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        
                        {!member.isUnitLeader && (
                          <button 
                            className="btn-sm btn-promote" 
                            onClick={() => openRoleModal(member, 'promote')}
                            title="Promote to Unit Leader"
                          >
                            <i className="fas fa-arrow-up"></i>
                          </button>
                        )}
                        
                        {member.isUnitLeader && (
                          <button 
                            className="btn-sm btn-demote" 
                            onClick={() => openRoleModal(member, 'demote')}
                            title="Demote to Scout"
                          >
                            <i className="fas fa-arrow-down"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Member Profile Modal */}
      {selectedMember && !showRoleModal && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-user"></i> Member Profile</h3>
              <button className="modal-close" onClick={() => setSelectedMember(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-detail">
                <strong>Full Name:</strong> {selectedMember.full_name || 'N/A'}
              </div>
              <div className="profile-detail">
                <strong>SIN:</strong> {selectedMember.sin || 'Not Generated'}
              </div>
              <div className="profile-detail">
                <strong>Email:</strong> {selectedMember.email || 'N/A'}
              </div>
              <div className="profile-detail">
                <strong>Phone:</strong> {selectedMember.phone || 'N/A'}
              </div>
              <div className="profile-detail">
                <strong>Unit:</strong> {selectedMember.unit || 'N/A'}
              </div>
              <div className="profile-detail">
                <strong>District:</strong> {selectedMember.district || 'N/A'}
              </div>
              <div className="profile-detail">
                <strong>Date of Birth:</strong> {selectedMember.date_of_birth ? new Date(selectedMember.date_of_birth).toLocaleDateString() : 'N/A'}
              </div>
              <div className="profile-detail">
                <strong>Age:</strong> {calculateAge(selectedMember.date_of_birth)}
              </div>
              <div className="profile-detail">
                <strong>Gender:</strong> {selectedMember.gender || 'N/A'}
              </div>
              <div className="profile-detail">
                <strong>Role:</strong> 
                <span className={`status-badge ${selectedMember.isUnitLeader ? 'badge-approved' : 'badge-default'}`}>
                  {selectedMember.isUnitLeader ? 'Unit Leader' : 'Scout'}
                </span>
              </div>
              <div className="profile-detail">
                <strong>Status:</strong> 
                <span className={`status-badge ${selectedMember.status === 'active' ? 'badge-approved' : selectedMember.status === 'pending' ? 'badge-pending' : 'badge-inactive'}`}>
                  {selectedMember.status || 'pending'}
                </span>
              </div>
              <div className="profile-detail">
                <strong>Payment Status:</strong> 
                {getPaymentBadge(selectedMember)}
              </div>
              <div className="profile-detail">
                <strong>Joined Date:</strong> {selectedMember.joined_date ? new Date(selectedMember.joined_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
        <div className="modal-overlay" onClick={() => {
          setShowRoleModal(false);
          setSelectedMember(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {roleAction === 'promote' ? (
                  <><i className="fas fa-arrow-up" style={{ color: '#38a169' }}></i> Promote to Unit Leader</>
                ) : (
                  <><i className="fas fa-arrow-down" style={{ color: '#e53e3e' }}></i> Demote to Scout</>
                )}
              </h3>
              <button className="modal-close" onClick={() => {
                setShowRoleModal(false);
                setSelectedMember(null);
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-detail">
                <strong>Member:</strong> {selectedMember.full_name || selectedMember.name}
              </div>
              <div className="profile-detail">
                <strong>SIN:</strong> {selectedMember.sin || 'Not Generated'}
              </div>
              <div className="profile-detail">
                <strong>Current Role:</strong> 
                <span className={`status-badge ${selectedMember.isUnitLeader ? 'badge-approved' : 'badge-default'}`}>
                  {selectedMember.isUnitLeader ? 'Unit Leader' : 'Scout'}
                </span>
              </div>
              <div className="profile-detail">
                <strong>Current Unit:</strong> {selectedMember.unit || 'Not Assigned'}
              </div>
              
              {roleAction === 'promote' ? (
                <>
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle"></i>
                    Promoting this member will make them a <strong>Unit Leader</strong>.
                  </div>
                  <div className="form-group">
                    <label>Assign to Unit <span className="required">*</span></label>
                    <input
                      type="text"
                      value={roleData.unit}
                      onChange={e => setRoleData({...roleData, unit: e.target.value})}
                      placeholder="Enter unit name"
                      required
                    />
                    <small>Enter the unit this member will lead</small>
                  </div>
                </>
              ) : (
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  Demoting this member will remove their <strong>Unit Leader</strong> status and revert them to a <strong>Scout</strong>.
                </div>
              )}
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => {
                setShowRoleModal(false);
                setSelectedMember(null);
              }}>
                Cancel
              </button>
              {roleAction === 'promote' ? (
                <button className="btn-primary" onClick={() => handlePromoteToLeader(selectedMember.id)}>
                  <i className="fas fa-arrow-up"></i> Promote
                </button>
              ) : (
                <button className="btn-danger" onClick={() => handleDemoteToScout(selectedMember.id)}>
                  <i className="fas fa-arrow-down"></i> Demote
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .district-header {
          background: linear-gradient(135deg, #6B2FA0 0%, #8B3FC9 50%, #A855F7 100%);
          border-radius: 16px;
          padding: 24px 30px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(107, 47, 160, 0.3);
          position: relative;
          overflow: hidden;
        }

        .district-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          pointer-events: none;
        }

        .district-header::after {
          content: '';
          position: absolute;
          bottom: -40%;
          left: -10%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          pointer-events: none;
        }

        .district-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .district-header-left h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .district-header-left h1 i {
          color: #FFD700;
          font-size: 28px;
        }

        .district-subtitle {
          margin: 4px 0 0 0;
          font-size: 16px;
          color: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .district-subtitle i {
          color: #FFD700;
        }

        .district-subtitle strong {
          color: #FFD700;
        }

        .district-header-right {
          display: flex;
          align-items: center;
        }

        .district-stats {
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
          justify-content: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #FFD700;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 35px;
          background: rgba(255, 255, 255, 0.2);
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #065f46;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .alert-info {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
        }

        .alert-warning {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
          margin-left: auto;
          padding: 0 4px;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #8B3FC9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .search-filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 4px 12px;
          flex: 1;
          min-width: 200px;
        }

        .search-box i {
          color: #6B7280;
          margin-right: 8px;
        }

        .search-box input {
          border: none;
          padding: 8px 0;
          width: 100%;
          outline: none;
          font-size: 14px;
        }

        .filter-box select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          min-width: 120px;
        }

        .stats-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6B7280;
          margin-left: auto;
        }

        .stats-info strong {
          color: #1a1a1a;
        }

        .export-container {
          position: relative;
        }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #8B3FC9;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-export:hover {
          background: #6B2FA0;
          transform: scale(1.02);
        }

        .export-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          min-width: 180px;
          z-index: 100;
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .export-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          width: 100%;
          border: none;
          background: none;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .export-option:hover {
          background: #f3f4f6;
        }

        .export-option i {
          width: 18px;
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
          font-size: 14px;
        }

        .data-table th {
          background: #f8fafc;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }

        .data-table td {
          padding: 10px 16px;
          border-bottom: 1px solid #f1f3f4;
          vertical-align: middle;
        }

        .data-table tr:hover {
          background: #f8fafc;
        }

        .text-center {
          text-align: center;
          padding: 30px !important;
          color: #6B7280;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: inline-block;
        }

        .badge-approved {
          background: #c6f6d5;
          color: #276749;
        }

        .badge-pending {
          background: #fef3c7;
          color: #975a16;
        }

        .badge-inactive {
          background: #fed7d7;
          color: #9b2c2c;
        }

        .badge-default {
          background: #e2e8f0;
          color: #4a5568;
        }

        .badge-paid {
          background: #c6f6d5;
          color: #276749;
          font-weight: 600;
        }

        .badge-overdue {
          background: #fee2e2;
          color: #991b1b;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
        }

        .btn-sm {
          padding: 4px 10px;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-sm:hover {
          transform: scale(1.05);
        }

        .btn-view {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-promote {
          background: #c6f6d5;
          color: #276749;
        }

        .btn-demote {
          background: #fed7d7;
          color: #9b2c2c;
        }

        .btn-primary {
          background: #38a169;
          color: white;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: #2f855a;
          transform: scale(1.02);
        }

        .btn-danger {
          background: #e53e3e;
          color: white;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-danger:hover {
          background: #c53030;
          transform: scale(1.02);
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
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6B7280;
        }

        .modal-close:hover {
          color: #374151;
        }

        .modal-body {
          padding: 24px;
        }

        .profile-detail {
          padding: 8px 0;
          border-bottom: 1px solid #f1f3f4;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-detail:last-child {
          border-bottom: none;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 14px;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #8B3FC9;
          box-shadow: 0 0 0 3px rgba(139, 63, 201, 0.2);
        }

        .required {
          color: #ef4444;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #6B7280;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
        }

        @media (max-width: 1024px) {
          .district-header {
            padding: 20px 24px;
          }

          .district-header-left h1 {
            font-size: 24px;
          }

          .district-stats {
            gap: 16px;
            padding: 10px 16px;
          }

          .stat-number {
            font-size: 20px;
          }
        }

        @media (max-width: 768px) {
          .district-header {
            padding: 16px 20px;
            border-radius: 12px;
          }

          .district-header-content {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .district-header-left h1 {
            font-size: 22px;
            justify-content: center;
          }

          .district-subtitle {
            justify-content: center;
            font-size: 14px;
          }

          .district-header-right {
            justify-content: center;
          }

          .district-stats {
            gap: 12px;
            padding: 10px 16px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .stat-item {
            min-width: 60px;
          }

          .stat-number {
            font-size: 18px;
          }

          .stat-divider {
            display: none;
          }

          .search-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .filter-box select {
            width: 100%;
          }

          .stats-info {
            margin-left: 0;
            justify-content: center;
          }

          .export-container {
            align-self: stretch;
          }

          .btn-export {
            width: 100%;
            justify-content: center;
          }

          .export-dropdown {
            right: auto;
            left: 0;
            width: 100%;
          }

          .modal-content {
            max-width: 95%;
          }

          .profile-detail {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .action-buttons {
            flex-wrap: wrap;
          }

          .data-table th,
          .data-table td {
            padding: 8px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 10px;
          }

          .district-header {
            padding: 14px 16px;
            border-radius: 10px;
          }

          .district-header-left h1 {
            font-size: 18px;
          }

          .district-header-left h1 i {
            font-size: 18px;
          }

          .district-subtitle {
            font-size: 12px;
          }

          .district-stats {
            gap: 8px;
            padding: 8px 12px;
          }

          .stat-item {
            min-width: 50px;
          }

          .stat-number {
            font-size: 16px;
          }

          .stat-label {
            font-size: 9px;
          }

          .data-table th,
          .data-table td {
            padding: 6px 8px;
            font-size: 11px;
          }

          .btn-sm {
            padding: 3px 6px;
            font-size: 11px;
          }

          .modal-content {
            max-width: 100%;
            margin: 10px;
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default DistrictMembers;