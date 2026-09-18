import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentManagementDashboard = () => {
  const { user } = useAuth();
  
  // ============================================
  // STATE
  // ============================================
  const [activeTab, setActiveTab] = useState('national');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dashboard Data
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    pending: 0,
    approved: 0,
    membersPaid: 0,
    activities: 0
  });
  
  const [revenueSources, setRevenueSources] = useState([]);
  const [payments, setPayments] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  
  // ✅ Real-time notification state
  const [newPayments, setNewPayments] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('');
  
  // ✅ Payment Method Modal State
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [methodType, setMethodType] = useState('bank');
  const [methodFormData, setMethodFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    bank_name: '',
    account_holder: '',
    account_number: '',
    swift_code: '',
    branch: '',
    provider: '',
    phone_number: '',
    ussd_code: '',
    is_active: true,
    sort_order: 0,
    district: ''
  });
  const [methodLoading, setMethodLoading] = useState(false);
  const [methodList, setMethodList] = useState([]);

  // ============================================
  // ROLE CHECKS
  // ============================================
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'super-admin' || userRole === 'admin';
  const isNational = userRole === 'national_commissioner' || userRole === 'national-commissioner';
  const isDistrict = userRole === 'district_commissioner' || userRole === 'district-commissioner';
  
  const canViewNational = isNational || isSuperAdmin;
  const canViewDistrict = isDistrict;
  const canManagePaymentMethods = isSuperAdmin || isNational || isDistrict;

  // ============================================
  // ROLE-BASED ACCESS
  // ============================================
  useEffect(() => {
    if (user) {
      const role = user.role || 'scout';
      setUserRole(role);
      
      const district = user.member?.district || user.district || 'N/A';
      setUserDistrict(district);
      
      console.log(`👤 User Role: ${role}`);
      console.log(`📍 User District: ${district}`);
      console.log(`🏛️ Is District Commissioner: ${isDistrict}`);
      
      if (isNational || isSuperAdmin) {
        setActiveTab('national');
      } else if (isDistrict) {
        setActiveTab('district');
      } else {
        setActiveTab('national');
      }
    }
  }, [user]);

  // ============================================
  // FETCH DATA
  // ============================================
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchNewPayments();
      fetchPaymentMethods();
    }
  }, [user, activeTab]);

  // ✅ Fetch Payment Methods - FILTERED BY ROLE
  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/methods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        let methods = response.data.methods || [];
        
        // ✅ NATIONAL: Only show national methods (district = 'all' or null)
        if (isNational || isSuperAdmin) {
          methods = methods.filter(m => 
            m.district === 'all' || m.district === null || m.district === ''
          );
        } 
        // ✅ DISTRICT: Only show their district methods
        else if (isDistrict) {
          methods = methods.filter(m => 
            m.district === userDistrict
          );
        }
        
        setMethodList(methods);
        console.log(`✅ ${methods.length} payment methods loaded for ${activeTab}`);
      }
    } catch (err) {
      console.error('❌ Error fetching payment methods:', err);
    }
  };
// ✅ Fetch new payments (for notifications) - FILTERED BY ROLE
const fetchNewPayments = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No token found, skipping new payments fetch');
      return;
    }

    let url = `${API_URL}/payments/new`;
    const params = new URLSearchParams();
    
    // ✅ If District Commissioner, add district parameter
    if (isDistrict) {
      params.append('district', userDistrict);
      url += `?${params.toString()}`;
      console.log(`🏛️ Fetching new payments for district: ${userDistrict}`);
    } else {
      // For National, add type parameter
      params.append('type', 'national');
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data?.success && response.data.payments?.length > 0) {
      const newPaymentsData = response.data.payments;
      setNewPayments(newPaymentsData);
      
      newPaymentsData.forEach(payment => {
        showPaymentNotification(payment);
      });
    }
  } catch (err) {
    if (err.response?.status === 400) {
      console.info('ℹ️ No new payments to display');
      setNewPayments([]);
    } else {
      console.error('❌ Error fetching new payments:', err);
    }
  }
};


  // ✅ Show notification for new payment
  const showPaymentNotification = (payment) => {
    const message = `💰 New Payment: ${payment.memberName || 'Someone'} paid ${payment.amount.toLocaleString()} RWF for ${payment.service}`;
    setNotificationMessage(message);
    setNotificationType('new-payment');
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 10000);
  };
// ============================================
// ROLE-BASED ACCESS
// ============================================
useEffect(() => {
  if (user) {
    const role = user.role || 'scout';
    setUserRole(role);
    
    const district = user.member?.district || user.district || 'N/A';
    setUserDistrict(district);
    
    console.log(`👤 User Role: ${role}`);
    console.log(`📍 User District: ${district}`);
    
    // ✅ Force correct tab based on role
    if (role === 'district_commissioner' || role === 'district-commissioner') {
      setActiveTab('district');
      console.log('🏛️ District Commissioner - Setting active tab to DISTRICT');
    } else if (role === 'national_commissioner' || role === 'national-commissioner' || role === 'super_admin' || role === 'admin') {
      setActiveTab('national');
      console.log('👑 National/Super Admin - Setting active tab to NATIONAL');
    } else {
      setActiveTab('national');
    }
  }
}, [user]);
// ============================================
// FETCH DASHBOARD DATA - FIXED FOR DISTRICT
// ============================================
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // ✅ FORCE district for District Commissioners regardless of activeTab
    let dashboardType;
    if (isDistrict) {
      dashboardType = 'district';
      console.log('🏛️ District Commissioner - FORCING district dashboard');
    } else {
      dashboardType = activeTab === 'national' ? 'national' : 'district';
    }
    
    console.log(`📊 Fetching ${dashboardType} dashboard data...`);
    console.log(`👤 User role: ${userRole}`);
    console.log(`📍 User district: ${userDistrict}`);
    
    // ✅ Build URLs with district parameter for District Commissioner
    let statsUrl = `${API_URL}/payments/dashboard/${dashboardType}/stats`;
    let revenueUrl = `${API_URL}/payments/dashboard/${dashboardType}/revenue`;
    let paymentsUrl = `${API_URL}/payments/dashboard/${dashboardType}/payments`;
    
    // ✅ If District Commissioner, add district parameter
    if (isDistrict) {
      const districtParam = `?district=${encodeURIComponent(userDistrict)}`;
      statsUrl += districtParam;
      revenueUrl += districtParam;
      paymentsUrl += districtParam;
      console.log(`🏛️ Adding district parameter: ${districtParam}`);
    }
    
    // ✅ Fetch Stats
    const statsResponse = await axios.get(statsUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // ✅ Fetch Revenue Sources
    const revenueResponse = await axios.get(revenueUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // ✅ Fetch Payments
    const paymentsResponse = await axios.get(paymentsUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Stats Response:', statsResponse.data);
    console.log('📊 Revenue Response:', revenueResponse.data);
    console.log('📊 Payments Response:', paymentsResponse.data);
    
    // ✅ Set Stats
    if (statsResponse.data?.success) {
      setStats({
        totalPayments: statsResponse.data.stats?.totalPayments || 0,
        totalRevenue: statsResponse.data.stats?.totalRevenue || 0,
        pending: statsResponse.data.stats?.pending || 0,
        approved: statsResponse.data.stats?.approved || 0,
        membersPaid: statsResponse.data.stats?.membersPaid || 0,
        activities: statsResponse.data.stats?.activities || 0
      });
    }
    
    // ✅ Set Revenue Sources
    if (revenueResponse.data?.success) {
      setRevenueSources(revenueResponse.data.sources || []);
    }
    
    // ✅ Set Payments
    if (paymentsResponse.data?.success) {
      let paymentsData = paymentsResponse.data.payments || [];
      
      // ✅ Double-check filtering on frontend
      if (dashboardType === 'national' && (isNational || isSuperAdmin)) {
        paymentsData = paymentsData.filter(p => 
          p.service_level === 'National' || p.district === null || p.district === 'all'
        );
      } else if (dashboardType === 'district' && isDistrict) {
        paymentsData = paymentsData.filter(p => 
          p.district === userDistrict
        );
        console.log(`🏛️ Filtered to ${paymentsData.length} district payments`);
      }
      
      setPayments(paymentsData);
    }
    
  } catch (err) {
    console.error('❌ Fetch dashboard data error:', err);
    console.error('❌ Error response:', err.response?.data);
    setError(err.response?.data?.message || 'Failed to load dashboard data');
    setFallbackData();
  } finally {
    setLoading(false);
  }
};


  // ============================================
  // FALLBACK DATA
  // ============================================
  const setFallbackData = () => {
    setStats({
      totalPayments: 0,
      totalRevenue: 0,
      pending: 0,
      approved: 0,
      membersPaid: 0,
      activities: 0
    });
    setRevenueSources([]);
    setPayments([]);
  };

  // ============================================
  // PAYMENT METHOD HANDLERS
  // ============================================
  const handleMethodInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMethodFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openAddMethodModal = (type) => {
    setMethodType(type);
    setIsEditing(false);
    setEditingMethodId(null);
    
    const defaultDistrict = isDistrict ? userDistrict : '';
    
    setMethodFormData({
      name: '',
      display_name: '',
      description: '',
      bank_name: '',
      account_holder: '',
      account_number: '',
      swift_code: '',
      branch: '',
      provider: '',
      phone_number: '',
      ussd_code: '',
      is_active: true,
      sort_order: 0,
      district: defaultDistrict
    });
    setShowMethodModal(true);
    setError('');
  };

  const openEditMethodModal = (method) => {
    setIsEditing(true);
    setEditingMethodId(method.id);
    setMethodType(method.bank_name ? 'bank' : 'mobile');
    setMethodFormData({
      name: method.name || '',
      display_name: method.display_name || '',
      description: method.description || '',
      bank_name: method.bank_name || '',
      account_holder: method.account_holder || '',
      account_number: method.account_number || '',
      swift_code: method.swift_code || '',
      branch: method.branch || '',
      provider: method.provider || '',
      phone_number: method.phone_number || '',
      ussd_code: method.ussd_code || '',
      is_active: method.is_active !== undefined ? method.is_active : true,
      sort_order: method.sort_order || 0,
      district: method.district || ''
    });
    setShowMethodModal(true);
    setError('');
  };

  const handleSubmitMethod = async (e) => {
    e.preventDefault();
    
    if (!methodFormData.name) {
      setError('Payment method name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (methodType === 'bank' && !methodFormData.bank_name) {
      setError('Bank name is required for bank transfers');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (methodType === 'mobile' && !methodFormData.provider) {
      setError('Provider name is required for mobile money');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setMethodLoading(true);
      const token = localStorage.getItem('token');
      
      let payload = { ...methodFormData };
      
      if (isDistrict) {
        payload.district = userDistrict;
      }
      
      const url = isEditing 
        ? `${API_URL}/payments/methods/${editingMethodId}`
        : `${API_URL}/payments/methods`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await axios({
        method: method,
        url: url,
        data: payload,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setSuccess(isEditing ? '✅ Payment method updated successfully!' : '✅ Payment method added successfully!');
        setShowMethodModal(false);
        resetForm();
        fetchPaymentMethods();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data?.message || 'Failed to save payment method');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('❌ Save payment method error:', err);
      setError(err.response?.data?.message || 'Failed to save payment method');
      setTimeout(() => setError(''), 3000);
    } finally {
      setMethodLoading(false);
    }
  };

  const handleDeleteMethod = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/payments/methods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('✅ Payment method deleted successfully!');
      fetchPaymentMethods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Delete payment method error:', err);
      setError(err.response?.data?.message || 'Failed to delete payment method');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleMethod = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/payments/methods/${id}/toggle`, 
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.success) {
        setSuccess(`✅ Payment method ${response.data.method.is_active ? 'activated' : 'deactivated'}!`);
        fetchPaymentMethods();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('❌ Toggle payment method error:', err);
      setError(err.response?.data?.message || 'Failed to toggle payment method');
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetForm = () => {
    setMethodFormData({
      name: '',
      display_name: '',
      description: '',
      bank_name: '',
      account_holder: '',
      account_number: '',
      swift_code: '',
      branch: '',
      provider: '',
      phone_number: '',
      ussd_code: '',
      is_active: true,
      sort_order: 0,
      district: ''
    });
    setEditingMethodId(null);
    setIsEditing(false);
    setError('');
  };

  const handleCloseModal = () => {
    setShowMethodModal(false);
    resetForm();
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleTabChange = (tab) => {
    if (tab === 'national' && !isNational && !isSuperAdmin) {
      setError('❌ Access Denied: Only National Commissioners and Super Admins can view the National Dashboard');
      setTimeout(() => setError(''), 5000);
      return;
    }
    if (tab === 'district' && !isDistrict) {
      setError('❌ Access Denied: Only District Commissioners can view the District Dashboard');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setActiveTab(tab);
    fetchDashboardData();
    fetchPaymentMethods();
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/payments/${paymentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Payment approved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve payment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/payments/${paymentId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('❌ Payment rejected');
      setTimeout(() => setSuccess(''), 3000);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject payment');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ Dismiss notification
  const dismissNotification = () => {
    setShowNotification(false);
  };

  // ============================================
  // FORMAT HELPERS
  // ============================================
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { className: 'status pending', label: '⏳ Pending', bg: '#fff3cd', color: '#92400e' };
      case 'approved':
        return { className: 'status approved', label: '✅ Approved', bg: '#d1fae5', color: '#065f46' };
      case 'rejected':
        return { className: 'status rejected', label: '❌ Rejected', bg: '#fee2e2', color: '#991b1b' };
      case 'completed':
        return { className: 'status completed', label: '✅ Completed', bg: '#d1fae5', color: '#065f46' };
      default:
        return { className: 'status default', label: '📋 Unknown', bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getRoleDisplay = () => {
    if (isSuperAdmin) return '👑 Super Admin';
    if (isNational) return '👑 National Commissioner';
    if (isDistrict) return `🏛️ District Commissioner - ${userDistrict}`;
    return userRole?.replace('_', ' ').toUpperCase() || 'User';
  };

  // ✅ Helper function to calculate total amount
  const calculateTotalAmount = (payments) => {
    return payments.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return sum + amount;
    }, 0);
  };

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="dashboard-loading" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner-large"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      {/* ✅ NEW PAYMENT NOTIFICATION */}
      {showNotification && notificationType === 'new-payment' && (
        <div className="payment-notification" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0b5d1e',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 9999,
          maxWidth: '380px',
          animation: 'slideIn 0.5s ease',
          borderLeft: '4px solid #FFD100'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>💰</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>New Payment Alert</div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>{notificationMessage}</div>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Refresh to view
              </button>
            </div>
            <button 
              onClick={dismissNotification}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                opacity: 0.7
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="header" style={{
        background: '#0b5d1e',
        color: 'white',
        padding: '25px',
        textAlign: 'center',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h1 style={{ margin: 0 }}>MyScout Rwanda</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Payment Management Dashboard</p>
        {user && (
          <div style={{ marginTop: '8px', fontSize: '14px', opacity: 0.8 }}>
            👤 {user.full_name} • {getRoleDisplay()}
            {isDistrict && <span style={{ marginLeft: '8px' }}>📍 {userDistrict}</span>}
          </div>
        )}
      </div>

      {/* ALERTS */}
      {error && (
        <div className="alert alert-error" style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span><i className="fas fa-exclamation-circle"></i> {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#16a34a',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span><i className="fas fa-check-circle"></i> {success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* TABS + ADD PAYMENT METHOD BUTTONS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '25px'
      }}>
        <div className="tabs" style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          {canViewNational && (
            <div
              className={`tab ${activeTab === 'national' ? 'active' : ''}`}
              onClick={() => handleTabChange('national')}
              style={{
                padding: '15px 25px',
                background: activeTab === 'national' ? '#0b5d1e' : 'white',
                color: activeTab === 'national' ? 'white' : '#1f2937',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-flag"></i> National Dashboard
            </div>
          )}
          
          {canViewDistrict && (
            <div
              className={`tab ${activeTab === 'district' ? 'active' : ''}`}
              onClick={() => handleTabChange('district')}
              style={{
                padding: '15px 25px',
                background: activeTab === 'district' ? '#0b5d1e' : 'white',
                color: activeTab === 'district' ? 'white' : '#1f2937',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="fas fa-map-marker-alt"></i> District Dashboard - {userDistrict}
            </div>
          )}
        </div>

        {/* ✅ ADD PAYMENT METHOD BUTTONS */}
        {canManagePaymentMethods && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => openAddMethodModal('bank')}
              style={{
                background: '#0b5d1e',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(11, 93, 30, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#094a18';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#0b5d1e';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-university"></i> Add Bank
            </button>
            <button
              onClick={() => openAddMethodModal('mobile')}
              style={{
                background: '#FFD100',
                color: '#1A1A2E',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(255, 209, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5c800';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#FFD100';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-mobile-alt"></i> Add Mobile Money
            </button>
          </div>
        )}
      </div>

      {/* Payment Methods List - FILTERED BY ROLE */}
      {canManagePaymentMethods && methodList.length > 0 && (
        <div className="section" style={{
          marginBottom: '25px',
          background: 'white',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ color: '#0b5d1e', marginTop: 0 }}>
            <i className="fas fa-credit-card"></i> Payment Methods
            {isDistrict && (
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 'normal', 
                color: '#6b7280', 
                marginLeft: '10px' 
              }}>
                ({userDistrict} District Only)
              </span>
            )}
            {(isNational || isSuperAdmin) && (
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 'normal', 
                color: '#6b7280', 
                marginLeft: '10px' 
              }}>
                (National Methods Only)
              </span>
            )}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr>
                  <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', textAlign: 'left' }}>Method</th>
                  <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', textAlign: 'left' }}>Type</th>
                  <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', textAlign: 'left' }}>Details</th>
                  <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', textAlign: 'center' }}>Status</th>
                  <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {methodList.map((method) => {
                  const isBank = !!method.bank_name;
                  return (
                    <tr key={method.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}>
                        <strong>{method.display_name || method.name}</strong>
                        {method.district && method.district !== 'all' && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            📍 {method.district}
                          </div>
                        )}
                        {(!method.district || method.district === 'all') && (
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            🌍 National
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: isBank ? '#d1fae5' : '#fef3c7',
                          color: isBank ? '#065f46' : '#92400e',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {isBank ? '🏦 Bank' : '📱 Mobile Money'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: '13px', color: '#4b5563' }}>
                        {isBank ? (
                          <div>
                            <div><strong>Bank:</strong> {method.bank_name}</div>
                            <div><strong>Account:</strong> {method.account_number}</div>
                          </div>
                        ) : (
                          <div>
                            <div><strong>Provider:</strong> {method.provider}</div>
                            <div><strong>Number:</strong> {method.phone_number}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          background: method.is_active ? '#d1fae5' : '#fee2e2',
                          color: method.is_active ? '#065f46' : '#991b1b',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {method.is_active ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openEditMethodModal(method)}
                            style={{
                              background: '#ebf8ff',
                              color: '#2b6cb0',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleMethod(method.id, method.is_active)}
                            style={{
                              background: method.is_active ? '#fef3c7' : '#d1fae5',
                              color: method.is_active ? '#92400e' : '#065f46',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {method.is_active ? '🔴 Deactivate' : '🟢 Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteMethod(method.id)}
                            style={{
                              background: '#fff5f5',
                              color: '#c53030',
                              border: 'none',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NATIONAL DASHBOARD */}
      {activeTab === 'national' && canViewNational && (
        <div className="dashboard show">
          <div className="dashboard-title" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '25px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ margin: 0, color: '#0b5d1e' }}>
              <i className="fas fa-flag"></i> National Payment Management Dashboard
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>RSA National Headquarters Finance</p>
          </div>

          {/* Stats Cards */}
          <div className="cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Total Payments</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0b5d1e' }}>
                {stats.totalPayments.toLocaleString()}
              </div>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Total Revenue</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0b5d1e' }}>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p style={{ margin: 0, color: '#6b7280' }}>RWF</p>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Pending</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats.pending.toLocaleString()}
              </div>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Approved</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
                {stats.approved.toLocaleString()}
              </div>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Members Paid</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0b5d1e' }}>
                {stats.membersPaid.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Revenue Sources */}
          <div className="section" style={{
            marginTop: '25px',
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ color: '#0b5d1e' }}>National Revenue Sources</h2>
            
            {revenueSources.map((source, index) => (
              <div key={index}>
                <p style={{ marginBottom: '4px' }}>
                  {source.name} 
                  <span style={{ float: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(source.amount)} RWF ({source.percentage}%)
                  </span>
                </p>
                <div className="progress" style={{
                  height: '15px',
                  background: '#ddd',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    display: 'block',
                    height: '100%',
                    background: '#0b5d1e',
                    width: `${source.percentage}%`
                  }}></span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Verification Table */}
          <div className="section" style={{
            marginTop: '25px',
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ color: '#0b5d1e' }}>
              <i className="fas fa-check-circle"></i> National Payment Verification
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '15px',
                fontSize: '14px'
              }}>
                <thead>
                  <tr>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>SIN</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Member</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Service</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Amount</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Method</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Status</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusInfo = getStatusBadge(payment.status);
                    return (
                      <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          <strong>{payment.sin}</strong>
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          <strong>{payment.memberName}</strong>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {payment.district && `📍 ${payment.district}`}
                          </div>
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          {payment.service}
                          {payment.service_level && (
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {payment.service_level === 'National' ? '🌍 National' : '📌 District'}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: '#0b5d1e' }}>
                          {payment.amount.toLocaleString()} RWF
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          {payment.method}
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {payment.payment_date}
                          </div>
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          <span style={{
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            {statusInfo.label}
                          </span>
                          {payment.verified_by && (
                            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                              Verified by: {payment.verified_by_name || 'Admin'}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          {payment.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                style={{
                                  background: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment.id)}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                          {payment.status === 'approved' && (
                            <button
                              style={{
                                background: '#0b5d1e',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#094a18'}
                              onMouseLeave={(e) => e.target.style.background = '#0b5d1e'}
                            >
                              👁️ View
                            </button>
                          )}
                          {payment.status === 'rejected' && (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>No action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {payments.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f1f8f3' }}>
                      <td colSpan="7" style={{ padding: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                        Total: {payments.length} payments | 
                        Total Amount: {calculateTotalAmount(payments).toLocaleString()} RWF
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DISTRICT DASHBOARD */}
      {activeTab === 'district' && canViewDistrict && (
        <div className="dashboard show">
          <div className="dashboard-title" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '25px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ margin: 0, color: '#0b5d1e' }}>
              <i className="fas fa-map-marker-alt"></i> District Payment Management Dashboard
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280' }}>
              {userDistrict} District
            </p>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
              📊 {stats.totalPayments || 0} payments processed · Revenue: {(stats.totalRevenue || 0).toLocaleString()} RWF
            </p>
          </div>

          {/* Stats Cards */}
          <div className="cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>District Payments</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0b5d1e' }}>
                {stats.totalPayments.toLocaleString()}
              </div>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>District Revenue</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0b5d1e' }}>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p style={{ margin: 0, color: '#6b7280' }}>RWF</p>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Pending</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats.pending.toLocaleString()}
              </div>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Approved</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
                {stats.approved.toLocaleString()}
              </div>
            </div>
            
            <div className="card" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: 0, color: '#555' }}>Members Paid</h4>
              <div className="number" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0b5d1e' }}>
                {stats.membersPaid.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Revenue Sources */}
          <div className="section" style={{
            marginTop: '25px',
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ color: '#0b5d1e' }}>District Revenue Sources</h2>
            
            {revenueSources.map((source, index) => (
              <div key={index}>
                <p style={{ marginBottom: '4px' }}>
                  {source.name}
                  <span style={{ float: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(source.amount)} RWF ({source.percentage}%)
                  </span>
                </p>
                <div className="progress" style={{
                  height: '15px',
                  background: '#ddd',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    display: 'block',
                    height: '100%',
                    background: '#0b5d1e',
                    width: `${source.percentage}%`
                  }}></span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Verification Table */}
          <div className="section" style={{
            marginTop: '25px',
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ color: '#0b5d1e' }}>
              <i className="fas fa-check-circle"></i> District Payment Verification
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '15px',
                fontSize: '14px'
              }}>
                <thead>
                  <tr>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>SIN</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Member</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Activity</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Amount</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Method</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Status</th>
                    <th style={{ background: '#0b5d1e', color: 'white', padding: '10px', border: '1px solid #0b5d1e' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusInfo = getStatusBadge(payment.status);
                    return (
                      <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          <strong>{payment.sin}</strong>
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          <strong>{payment.memberName}</strong>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            📍 {payment.district || userDistrict}
                          </div>
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          {payment.service}
                          {payment.service_level && (
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                              {payment.service_level === 'National' ? '🌍 National' : '📌 District'}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: '#0b5d1e' }}>
                          {payment.amount.toLocaleString()} RWF
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          {payment.method}
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {payment.payment_date}
                          </div>
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          <span style={{
                            background: statusInfo.bg,
                            color: statusInfo.color,
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            {statusInfo.label}
                          </span>
                          {payment.verified_by && (
                            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                              Verified by: {payment.verified_by_name || 'Admin'}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                          {payment.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                style={{
                                  background: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment.id)}
                                style={{
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                          {payment.status === 'approved' && (
                            <button
                              style={{
                                background: '#0b5d1e',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#094a18'}
                              onMouseLeave={(e) => e.target.style.background = '#0b5d1e'}
                            >
                              👁️ View
                            </button>
                          )}
                          {payment.status === 'rejected' && (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>No action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {payments.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f1f8f3' }}>
                      <td colSpan="7" style={{ padding: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                        Total: {payments.length} payments | 
                        Total Amount: {calculateTotalAmount(payments).toLocaleString()} RWF
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NO ACCESS MESSAGE */}
      {!canViewNational && !canViewDistrict && (
        <div className="no-access" style={{
          textAlign: 'center',
          padding: '50px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
        }}>
          <i className="fas fa-lock" style={{ fontSize: '48px', color: '#dc2626', display: 'block', marginBottom: '16px' }}></i>
          <h2 style={{ color: '#1f2937' }}>Access Restricted</h2>
          <p style={{ color: '#6b7280' }}>
            You do not have permission to view payment dashboards.
            <br />
            This page is only accessible to:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}>
            <li style={{ padding: '8px 0' }}>👑 National Commissioners</li>
            <li style={{ padding: '8px 0' }}>🏛️ District Commissioners</li>
            <li style={{ padding: '8px 0' }}>⭐ Super Admins</li>
          </ul>
          <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Your role: <strong>{userRole || 'Unknown'}</strong>
            </p>
          </div>
        </div>
      )}

      {/* ============================================
          ADD/EDIT PAYMENT METHOD MODAL
          ============================================ */}
      {showMethodModal && (
        <div className="modal-overlay" onClick={handleCloseModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '15px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '25px'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>
                <i className={`fas ${methodType === 'bank' ? 'fa-university' : 'fa-mobile-alt'}`} style={{ color: methodType === 'bank' ? '#0b5d1e' : '#FFD100' }}></i> 
                {isEditing ? 'Edit' : 'Add'} {methodType === 'bank' ? 'Bank Account' : 'Mobile Money'}
                {isDistrict && !isEditing && (
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280', marginLeft: '8px' }}>
                    for {userDistrict} District
                  </span>
                )}
              </h3>
              <button onClick={handleCloseModal} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitMethod}>
              {/* Hidden district field for District Commissioners */}
              {isDistrict && (
                <input type="hidden" name="district" value={userDistrict} />
              )}

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                  Method Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={methodFormData.name}
                  onChange={handleMethodInputChange}
                  placeholder={methodType === 'bank' ? 'e.g., Bank Transfer - BK' : 'e.g., MTN MoMo Pay'}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={methodFormData.display_name}
                  onChange={handleMethodInputChange}
                  placeholder={methodType === 'bank' ? 'e.g., Bank Transfer - Bank of Kigali' : 'e.g., MTN MoMo Pay'}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={methodFormData.description}
                  onChange={handleMethodInputChange}
                  placeholder="Brief description of this payment method"
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {methodType === 'bank' ? (
                // BANK FIELDS
                <>
                  <h4 style={{ marginBottom: '12px', color: '#0b5d1e', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                    <i className="fas fa-university"></i> Bank Details
                  </h4>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                      Bank Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={methodFormData.bank_name}
                      onChange={handleMethodInputChange}
                      placeholder="e.g., Bank of Kigali"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                      Account Holder <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="account_holder"
                      value={methodFormData.account_holder}
                      onChange={handleMethodInputChange}
                      placeholder="e.g., Rwanda Scouts Association"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                        Account Number <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="account_number"
                        value={methodFormData.account_number}
                        onChange={handleMethodInputChange}
                        placeholder="e.g., 1234567890"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                        Swift Code
                      </label>
                      <input
                        type="text"
                        name="swift_code"
                        value={methodFormData.swift_code}
                        onChange={handleMethodInputChange}
                        placeholder="e.g., BKIGRWRW"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                      Branch
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={methodFormData.branch}
                      onChange={handleMethodInputChange}
                      placeholder="e.g., Kigali City"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </>
              ) : (
                // MOBILE MONEY FIELDS
                <>
                  <h4 style={{ marginBottom: '12px', color: '#FFD100', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                    <i className="fas fa-mobile-alt"></i> Mobile Money Details
                  </h4>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                      Provider <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="provider"
                      value={methodFormData.provider}
                      onChange={handleMethodInputChange}
                      placeholder="e.g., MTN Rwanda"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                      Account Holder <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="account_holder"
                      value={methodFormData.account_holder}
                      onChange={handleMethodInputChange}
                      placeholder="e.g., Rwanda Scouts Association"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                      Phone Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={methodFormData.phone_number}
                      onChange={handleMethodInputChange}
                      placeholder="e.g., 0791970956"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                      USSD Code
                    </label>
                    <input
                      type="text"
                      name="ussd_code"
                      value={methodFormData.ussd_code}
                      onChange={handleMethodInputChange}
                      placeholder="e.g., *182*7#"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </>
              )}

              {!isDistrict && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                    District (Leave blank for National)
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={methodFormData.district}
                    onChange={handleMethodInputChange}
                    placeholder="e.g., Nyarugenge or leave blank for National"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                    Leave empty for national methods, or enter a district name
                  </small>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={methodFormData.is_active}
                    onChange={handleMethodInputChange}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#1f2937' }}>Active</span>
                </label>
              </div>

              <div className="form-actions" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
                marginTop: '16px'
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 20px',
                    background: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={methodLoading}
                  style={{
                    padding: '10px 20px',
                    background: '#0b5d1e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: methodLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: methodLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {methodLoading ? (
                    <><span className="spinner-small"></span> {isEditing ? 'Updating...' : 'Adding...'}</>
                  ) : (
                    <><i className="fas fa-save"></i> {isEditing ? 'Update' : 'Add'} {methodType === 'bank' ? 'Bank Account' : 'Mobile Money'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .spinner-large {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #0b5d1e;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        
        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        
        .alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }
        
        .cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .card {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .number {
          font-size: 28px;
          font-weight: bold;
          color: #0b5d1e;
        }
        
        .section {
          margin-top: 25px;
          background: white;
          padding: 25px;
          borderRadius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .progress {
          height: 15px;
          background: #ddd;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .progress span {
          display: block;
          height: 100%;
          background: #0b5d1e;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        th {
          background: #0b5d1e;
          color: white;
          padding: 12px;
          border: 1px solid #0b5d1e;
        }
        
        td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: center;
        }
        
        .status {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .status.pending {
          background: #fff3cd;
          color: #92400e;
        }
        
        .status.approved {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status.rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .tabs {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .tab {
          padding: 15px 25px;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .tab.active {
          background: #0b5d1e;
          color: white;
        }
        
        .tab:hover:not(.active) {
          background: #f0fdf4;
        }
        
        .dashboard-title {
          background: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .no-access {
          text-align: center;
          padding: 50px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
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
          border-radius: 15px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .cards {
            grid-template-columns: 1fr 1fr !important;
          }
          
          .tabs {
            flex-direction: column;
          }
          
          .tab {
            text-align: center;
          }
          
          table {
            font-size: 12px;
          }
          
          th, td {
            padding: 6px 8px !important;
          }
          
          .form-row {
            grid-template-columns: 1fr !important;
          }
          
          .modal-content {
            margin: 10px;
            padding: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentManagementDashboard;