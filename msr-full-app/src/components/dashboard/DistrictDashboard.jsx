// src/components/district/DistrictDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';

// Scout Color System
const SCOUT = {
  green: '#006B3F',
  greenLight: '#E8F5EE',
  greenDark: '#004D2D',
  red: '#CE1126',
  redLight: '#FDE8EB',
  yellow: '#FCD116',
  yellowLight: '#FFFBE6',
  blue: '#003DA5',
  blueLight: '#E6EEF9',
  white: '#FFFFFF',
  black: '#1F2937',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  grayBorder: '#E5E7EB',
};

const DistrictDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScouts: 0,
    totalLeaders: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    pendingRegistrations: 0,
    pendingFeeApprovals: 0,
    reportsAwaiting: 0,
    projectSubmissions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const COLORS = [SCOUT.yellow, SCOUT.green, SCOUT.blue, SCOUT.red, '#8B5CF6', '#F97316'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view dashboard');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [
        statsRes,
        activitiesRes,
        eventsRes,
        announcementsRes,
        notificationsRes,
        statusRes,
        genderRes
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/district/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/district/dashboard/recent-activities`, { headers }),
        axios.get(`${API_URL}/district/dashboard/upcoming-events`, { headers }),
        axios.get(`${API_URL}/district/dashboard/announcements`, { headers }),
        axios.get(`${API_URL}/district/dashboard/notifications`, { headers }),
        axios.get(`${API_URL}/district/dashboard/status-data`, { headers }),
        axios.get(`${API_URL}/district/dashboard/gender-distribution`, { headers })
      ]);

      // Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        const data = statsRes.value.data;
        setStats({
          totalScouts: data.totalScouts || 0,
          totalLeaders: data.totalLeaders || 0,
          activeMembers: data.activeMembers || 0,
          inactiveMembers: data.inactiveMembers || 0,
          upcomingEvents: data.upcomingEvents || 0,
          ongoingEvents: data.ongoingEvents || 0,
          pendingRegistrations: data.pendingRegistrations || 0,
          pendingFeeApprovals: data.pendingFeeApprovals || 0,
          reportsAwaiting: data.reportsAwaiting || 0,
          projectSubmissions: data.projectSubmissions || 0
        });
      }

      // Process activities
      if (activitiesRes.status === 'fulfilled' && activitiesRes.value?.data) {
        const data = activitiesRes.value.data;
        setRecentActivities(Array.isArray(data) ? data : []);
      }

      // Process events
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
        const data = eventsRes.value.data;
        const events = Array.isArray(data) ? data : [];
        const validEvents = events
          .map(event => ({
            ...event,
            date: event.date || event.start_date || new Date().toISOString(),
            start_date: event.start_date || event.date || new Date().toISOString()
          }))
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        setUpcomingEvents(validEvents);
      }

      // Process announcements
      if (announcementsRes.status === 'fulfilled' && announcementsRes.value?.data) {
        const data = announcementsRes.value.data;
        let announcements = [];
        if (data.announcements) {
          announcements = data.announcements;
        } else if (Array.isArray(data)) {
          announcements = data;
        }
        setRecentAnnouncements(announcements);
      }

      // Process notifications
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value?.data) {
        const data = notificationsRes.value.data;
        let notifications = [];
        if (data.notifications) {
          notifications = data.notifications;
        } else if (Array.isArray(data)) {
          notifications = data;
        }
        setNotifications(notifications);
      }

      // Process status data
      if (statusRes.status === 'fulfilled' && statusRes.value?.data) {
        let data = statusRes.value.data;
        let statusDataArray = [];
        if (Array.isArray(data)) {
          statusDataArray = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          statusDataArray = data.data;
        }

        if (statusDataArray.length > 0) {
          const formatted = statusDataArray.map(item => ({
            name: item.name || 'Unknown',
            value: item.value || item.count || 0
          }));
          setStatusData(formatted);
        } else {
          const active = stats.activeMembers || 0;
          const pending = stats.pendingRegistrations || 0;
          const inactive = stats.inactiveMembers || 0;
          
          const generated = [];
          if (active > 0) generated.push({ name: 'Active', value: active });
          if (pending > 0) generated.push({ name: 'Pending', value: pending });
          if (inactive > 0) generated.push({ name: 'Inactive', value: inactive });
          
          setStatusData(generated);
        }
      }

      // Process gender data
      if (genderRes.status === 'fulfilled' && genderRes.value?.data) {
        let data = genderRes.value.data;
        let genderDataArray = [];
        if (Array.isArray(data)) {
          genderDataArray = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          genderDataArray = data.data;
        }

        if (genderDataArray.length > 0) {
          const formatted = genderDataArray.map(item => ({
            name: item.name || item.gender || 'Unknown',
            value: item.value || item.count || 0
          }));
          setGenderData(formatted);
        }
      }

    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: 'fa-user-plus', label: 'Add Leader', path: '/manage-readers', color: SCOUT.yellow },
    { icon: 'fa-bullhorn', label: 'Announcement', path: '/announcements', color: SCOUT.blue },
    { icon: 'fa-calendar-plus', label: 'Create Event', path: '/district-events', color: SCOUT.green },
    { icon: 'fa-file-alt', label: 'Review Reports', path: '/unit-reports', color: '#8B5CF6' },
    { icon: 'fa-lightbulb', label: 'Scout Ideas', path: '/scout-ideas', color: '#F97316' },
    { icon: 'fa-users', label: 'Members', path: '/district-members', color: SCOUT.blue }
  ];

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

  const getStatusColor = (status) => {
    const colors = {
      'approved': SCOUT.green,
      'pending': SCOUT.yellow,
      'published': SCOUT.blue,
      'cancelled': SCOUT.red,
      'rejected': SCOUT.red,
      'completed': SCOUT.green,
      'active': SCOUT.green,
      'inactive': SCOUT.gray,
    };
    return colors[status?.toLowerCase()] || SCOUT.gray;
  };

  const getStatusBg = (status) => {
    const colors = {
      'approved': SCOUT.greenLight,
      'pending': `${SCOUT.yellow}30`,
      'published': SCOUT.blueLight,
      'cancelled': SCOUT.redLight,
      'rejected': SCOUT.redLight,
      'completed': SCOUT.greenLight,
      'active': SCOUT.greenLight,
      'inactive': SCOUT.grayLight,
    };
    return colors[status?.toLowerCase()] || SCOUT.grayLight;
  };

  const getStatusTextColor = (status) => {
    const colors = {
      'approved': SCOUT.green,
      'pending': '#B45309',
      'published': SCOUT.blue,
      'cancelled': SCOUT.red,
      'rejected': SCOUT.red,
      'completed': SCOUT.green,
      'active': SCOUT.green,
      'inactive': SCOUT.gray,
    };
    return colors[status?.toLowerCase()] || SCOUT.gray;
  };

  if (loading) {
    return (
      <div className="dashboard-loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        background: SCOUT.white
      }}>
        <div className="spinner-large" style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${SCOUT.grayBorder}`,
          borderTop: `4px solid ${SCOUT.green}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: SCOUT.gray }}>Loading district dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="alert alert-error" style={{
          background: SCOUT.redLight,
          borderLeft: `4px solid ${SCOUT.red}`,
          padding: '16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fas fa-exclamation-circle" style={{ color: SCOUT.red, fontSize: '1.25rem' }}></i>
            <p style={{ margin: 0, color: '#991B1B' }}>{error}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            style={{
              background: SCOUT.red,
              color: SCOUT.white,
              border: 'none',
              padding: '6px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  const displayedActivities = showAllActivities ? recentActivities : recentActivities.slice(0, 5);
  const displayedEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 5);

  return (
    <div className="dashboard-container" style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: SCOUT.grayLight,
      minHeight: '100vh'
    }}>
      {/* Welcome Section */}
      <div className="dashboard-welcome" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        background: `linear-gradient(135deg, ${SCOUT.green}, ${SCOUT.greenDark})`,
        borderRadius: '16px',
        color: SCOUT.white,
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,107,63,0.3)'
      }}>
        <div className="welcome-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              background: SCOUT.yellow,
              color: SCOUT.green,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              ⚜
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              <i className="fas fa-user-tie" style={{ marginRight: '8px' }}></i>
              District Commissioner Dashboard
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 52px', opacity: 0.9 }}>
            Welcome back, {user?.name || user?.full_name || 'District Commissioner'}! Manage your district activities here.
          </p>
        </div>
        <div className="welcome-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/notifications" className="notification-bell" style={{
            color: SCOUT.white,
            position: 'relative',
            fontSize: '1.25rem'
          }}>
            <i className="fas fa-bell"></i>
            {stats.pendingRegistrations > 0 && (
              <span className="badge" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: SCOUT.red,
                color: SCOUT.white,
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {stats.pendingRegistrations}
              </span>
            )}
          </Link>
          <button 
            onClick={fetchDashboardData}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: SCOUT.white,
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid - 5 Cards */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="stat-card" style={{
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <div className="stat-icon" style={{ background: `${SCOUT.yellow}30`, color: SCOUT.green }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.totalScouts}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Total Scouts</p>
          </div>
        </div>
        <div className="stat-card" style={{
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <div className="stat-icon" style={{ background: `${SCOUT.green}15`, color: SCOUT.green }}>
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.totalLeaders}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Unit Leaders</p>
          </div>
        </div>
        <div className="stat-card" style={{
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <div className="stat-icon" style={{ background: `${SCOUT.yellow}30`, color: '#B45309' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.pendingRegistrations}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Pending Registrations</p>
          </div>
        </div>
        <div className="stat-card" style={{
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <div className="stat-icon" style={{ background: '#8B5CF620', color: '#8B5CF6' }}>
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.reportsAwaiting}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Reports Awaiting Review</p>
          </div>
        </div>
        <div className="stat-card" style={{
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <div className="stat-icon" style={{ background: `${SCOUT.red}15`, color: SCOUT.red }}>
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.projectSubmissions}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Project Submissions</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section" style={{
        background: SCOUT.white,
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        border: `1px solid ${SCOUT.grayBorder}`
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          color: SCOUT.black,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-bolt" style={{ color: SCOUT.yellow }}></i>
          Quick Actions
        </h3>
        <div className="quick-actions-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px'
        }}>
          {quickActions.map((action, index) => (
            <Link to={action.path} key={index} className="quick-action-card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px',
              background: SCOUT.grayLight,
              borderRadius: '12px',
              textDecoration: 'none',
              color: SCOUT.black,
              transition: 'all 0.2s',
              border: `1px solid transparent`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = SCOUT.white;
              e.currentTarget.style.borderColor = action.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = SCOUT.grayLight;
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div className="action-icon" style={{
                background: action.color + '20',
                color: action.color,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: '8px'
              }}>
                <i className={`fas ${action.icon}`}></i>
              </div>
              <span style={{ fontSize: '0.875rem', textAlign: 'center' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts - 2 Charts */}
      <div className="charts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Chart 1: Membership by Status */}
        <div className="chart-card" style={{
          background: SCOUT.white,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: SCOUT.black }}>
            <i className="fas fa-chart-pie" style={{ color: SCOUT.blue }}></i>
            Membership by Status
          </h4>
          {statusData && statusData.length > 0 && statusData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: SCOUT.gray }}>
              <i className="fas fa-chart-pie" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}></i>
              <p>No status data available</p>
            </div>
          )}
        </div>

        {/* Chart 2: Gender Distribution */}
        <div className="chart-card" style={{
          background: SCOUT.white,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: SCOUT.black }}>
            <i className="fas fa-venus-mars" style={{ color: SCOUT.yellow }}></i>
            Gender Distribution
          </h4>
          {genderData && genderData.length > 0 && genderData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: SCOUT.gray }}>
              <i className="fas fa-venus-mars" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}></i>
              <p>No gender data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities & Upcoming Events */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div className="card" style={{
          background: SCOUT.white,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: SCOUT.black }}>
              <i className="fas fa-clock" style={{ color: SCOUT.yellow }}></i>
              Recent Activities
            </h4>
            {recentActivities.length > 5 && (
              <button 
                onClick={() => setShowAllActivities(!showAllActivities)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: SCOUT.green,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {showAllActivities ? 'Show Less' : `View All (${recentActivities.length})`}
              </button>
            )}
          </div>
          {recentActivities.length === 0 ? (
            <p className="empty-state" style={{ color: SCOUT.gray, textAlign: 'center', padding: '20px' }}>No recent activities</p>
          ) : (
            <ul className="activity-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {displayedActivities.map((activity, index) => (
                <li key={activity.id || index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderBottom: index < displayedActivities.length - 1 ? `1px solid ${SCOUT.grayBorder}` : 'none',
                  gap: '12px'
                }}>
                  <span className={`activity-dot`} style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: getStatusColor(activity.status),
                    flexShrink: 0
                  }}></span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: SCOUT.black }}>{activity.title || activity.message || 'Activity'}</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: SCOUT.gray }}>
                      {formatDate(activity.date || activity.created_at)}
                    </p>
                  </div>
                  <span className={`status-badge`} style={{
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    background: getStatusBg(activity.status),
                    color: getStatusTextColor(activity.status),
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {activity.status || 'Pending'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{
          background: SCOUT.white,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: SCOUT.black }}>
              <i className="fas fa-calendar-alt" style={{ color: SCOUT.green }}></i>
              Upcoming Events
            </h4>
            {upcomingEvents.length > 5 && (
              <button 
                onClick={() => setShowAllEvents(!showAllEvents)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: SCOUT.green,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {showAllEvents ? 'Show Less' : `View All (${upcomingEvents.length})`}
              </button>
            )}
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="empty-state" style={{ color: SCOUT.gray, textAlign: 'center', padding: '20px' }}>No upcoming events</p>
          ) : (
            <ul className="event-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {displayedEvents.map((event, index) => {
                const eventDate = new Date(event.start_date || event.date);
                const isValidDate = !isNaN(eventDate.getTime());
                return (
                  <li key={event.id || index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderBottom: index < displayedEvents.length - 1 ? `1px solid ${SCOUT.grayBorder}` : 'none',
                    gap: '12px'
                  }}>
                    <div className="event-date" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: '50px'
                    }}>
                      <span className="day" style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: SCOUT.green
                      }}>
                        {isValidDate ? eventDate.getDate() : '--'}
                      </span>
                      <span className="month" style={{
                        fontSize: '0.7rem',
                        color: SCOUT.gray,
                        textTransform: 'uppercase'
                      }}>
                        {isValidDate ? eventDate.toLocaleString('en', { month: 'short' }) : '---'}
                      </span>
                    </div>
                    <div className="event-info" style={{ flex: 1 }}>
                      <strong style={{ color: SCOUT.black }}>{event.title || 'Event'}</strong>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: SCOUT.gray }}>
                        <i className="fas fa-map-marker-alt" style={{ marginRight: '4px' }}></i>
                        {event.location || event.venue || 'TBD'}
                      </p>
                    </div>
                    <Link 
                      to={`/events/${event.id}`}
                      className="btn-sm" 
                      style={{
                        padding: '4px 12px',
                        background: SCOUT.green,
                        color: SCOUT.white,
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}
                    >
                      View
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card" style={{
        background: SCOUT.white,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${SCOUT.grayBorder}`
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: SCOUT.black }}>
          <i className="fas fa-bullhorn" style={{ color: SCOUT.blue }}></i>
          Recent Announcements
        </h4>
        {recentAnnouncements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: SCOUT.gray }}>
            <i className="fas fa-bullhorn" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}></i>
            <p>No announcements yet</p>
            <Link 
              to="/announcements" 
              style={{
                color: SCOUT.green,
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-block',
                marginTop: '8px',
                padding: '8px 20px',
                background: `${SCOUT.green}15`,
                borderRadius: '8px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = SCOUT.green;
                e.currentTarget.style.color = SCOUT.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${SCOUT.green}15`;
                e.currentTarget.style.color = SCOUT.green;
              }}
            >
              <i className="fas fa-plus-circle"></i> Create your first announcement →
            </Link>
          </div>
        ) : (
          <ul className="announcement-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentAnnouncements.slice(0, 5).map((announcement, index) => (
              <li key={announcement.id || index} style={{
                padding: '10px 12px',
                borderBottom: index < recentAnnouncements.slice(0, 5).length - 1 ? `1px solid ${SCOUT.grayBorder}` : 'none',
                background: SCOUT.white
              }}>
                <div>
                  <strong style={{ color: SCOUT.black }}>{announcement.title || 'Announcement'}</strong>
                  <p style={{ margin: '4px 0', color: SCOUT.gray }}>{announcement.content || announcement.message}</p>
                  <small style={{ color: SCOUT.gray, fontSize: '0.75rem' }}>
                    {formatDate(announcement.date || announcement.created_at || announcement.published_date)}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DistrictDashboard;