// src/components/donor/DonationDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  ResponsiveContainer, AreaChart, Area
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

const DonationDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeProjects: 0,
    donationCount: 0,
    totalProjects: 0,
    totalIdeas: 0,
    totalEvents: 0,
    totalReports: 0,
    updates: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [donationChart, setDonationChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);

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
      const userRole = user?.role;

      console.log('📊 Fetching donor dashboard data...');

      // ✅ Only fetch reports if user has permission
      const reportPromise = (userRole === 'national_commissioner' || 
                            userRole === 'national-commissioner' ||
                            userRole === 'super_admin' ||
                            userRole === 'super-admin' ||
                            userRole === 'admin')
        ? axios.get(`${API_URL}/national/reports?limit=10`, { headers })
        : Promise.resolve({ data: { success: true, reports: [] } });

      const [
        statsRes,
        donationsRes,
        projectsRes,
        ideasRes,
        eventsRes,
        reportsRes,
        updatesRes,
        chartRes
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/donation/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/donation/donations?limit=10`, { headers }),
        axios.get(`${API_URL}/donation/projects?limit=10`, { headers }),
        axios.get(`${API_URL}/donation/ideas?limit=10`, { headers }),
        axios.get(`${API_URL}/donation/events?limit=10`, { headers }),
        reportPromise,
        axios.get(`${API_URL}/donation/updates?type=all`, { headers }),
        axios.get(`${API_URL}/donation/dashboard/chart-data`, { headers })
      ]);

      console.log('📊 Stats response:', statsRes);

      // Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        const data = statsRes.value.data;
        console.log('📊 Stats data:', data);
        setStats({
          totalDonations: data.totalDonations || 0,
          activeProjects: data.activeProjects || 0,
          donationCount: data.donationCount || 0,
          totalProjects: data.totalProjects || 0,
          totalIdeas: data.totalIdeas || 0,
          totalEvents: data.totalEvents || 0,
          totalReports: data.totalReports || 0,
          updates: data.updates || 0
        });
      }

      // Process donations
      if (donationsRes.status === 'fulfilled' && donationsRes.value?.data) {
        let data = donationsRes.value.data;
        console.log('📊 Donations data:', data);
        
        // Handle different response formats
        let donations = [];
        if (Array.isArray(data)) {
          donations = data;
        } else if (data.donations && Array.isArray(data.donations)) {
          donations = data.donations;
        } else if (data.data && Array.isArray(data.data)) {
          donations = data.data;
        }
        setRecentDonations(donations);
      }

      // Process projects
      if (projectsRes.status === 'fulfilled' && projectsRes.value?.data) {
        let data = projectsRes.value.data;
        let projects = [];
        if (Array.isArray(data)) {
          projects = data;
        } else if (data.projects && Array.isArray(data.projects)) {
          projects = data.projects;
        }
        setActiveProjects(projects);
      }

      // Process ideas
      if (ideasRes.status === 'fulfilled' && ideasRes.value?.data) {
        let data = ideasRes.value.data;
        let ideasList = [];
        if (Array.isArray(data)) {
          ideasList = data;
        } else if (data.ideas && Array.isArray(data.ideas)) {
          ideasList = data.ideas;
        }
        setIdeas(ideasList);
      }

      // Process events
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
        let data = eventsRes.value.data;
        let eventsList = [];
        if (Array.isArray(data)) {
          eventsList = data;
        } else if (data.events && Array.isArray(data.events)) {
          eventsList = data.events;
        }
        setEvents(eventsList);
      }

      // Process reports
      if (reportsRes.status === 'fulfilled' && reportsRes.value?.data) {
        let data = reportsRes.value.data;
        let reportsList = [];
        if (Array.isArray(data)) {
          reportsList = data;
        } else if (data.reports && Array.isArray(data.reports)) {
          reportsList = data.reports;
        }
        setReports(reportsList);
      }

      // Process updates
      if (updatesRes.status === 'fulfilled' && updatesRes.value?.data) {
        let data = updatesRes.value.data;
        let updatesList = [];
        if (Array.isArray(data)) {
          updatesList = data;
        } else if (data.updates && Array.isArray(data.updates)) {
          updatesList = data.updates;
        }
        setUpdates(updatesList);
      }

      // Process chart data
      if (chartRes.status === 'fulfilled' && chartRes.value?.data) {
        let data = chartRes.value.data;
        if (Array.isArray(data) && data.length > 0) {
          setDonationChart(data);
        } else {
          // Generate sample data based on actual donations
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
          const total = stats.totalDonations || 0;
          const sampleData = months.map((month, index) => ({
            month,
            donations: total > 0 ? Math.round(total / 6 * (index + 1) / 2) : 0,
            projects: Math.floor(Math.random() * 3) + 1
          }));
          setDonationChart(sampleData);
        }
      } else {
        // Fallback chart data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const total = stats.totalDonations || 0;
        const sampleData = months.map((month, index) => ({
          month,
          donations: total > 0 ? Math.round(total / 6 * (index + 1) / 2) : 0,
          projects: Math.floor(Math.random() * 3) + 1
        }));
        setDonationChart(sampleData);
      }

    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: 'fa-heart', label: 'Make Donation', path: '/my-donations', color: SCOUT.yellow },
    { icon: 'fa-hands-helping', label: 'Support Project', path: '/supporting-projects', color: SCOUT.green },
    { icon: 'fa-star', label: 'My Ideals', path: '/my-ideals', color: '#8B5CF6' },
    { icon: 'fa-file-alt', label: 'National Reports', path: '/national-reports', color: SCOUT.blue },
    { icon: 'fa-bell', label: 'Updates', path: '/updates', color: SCOUT.red }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': SCOUT.green,
      'completed': SCOUT.green,
      'pending': SCOUT.yellow,
      'rejected': SCOUT.red,
      'cancelled': SCOUT.red,
      'active': SCOUT.green,
      'inactive': SCOUT.gray,
      'submitted': SCOUT.blue,
      'published': SCOUT.blue,
      'forwarded': '#8B5CF6',
      'archived': SCOUT.gray
    };
    return colors[status?.toLowerCase()] || SCOUT.gray;
  };

  const getStatusBg = (status) => {
    const colors = {
      'approved': SCOUT.greenLight,
      'completed': SCOUT.greenLight,
      'pending': `${SCOUT.yellow}30`,
      'rejected': SCOUT.redLight,
      'cancelled': SCOUT.redLight,
      'active': SCOUT.greenLight,
      'inactive': SCOUT.grayLight,
      'submitted': SCOUT.blueLight,
      'published': SCOUT.blueLight,
      'forwarded': '#8B5CF620',
      'archived': SCOUT.grayLight
    };
    return colors[status?.toLowerCase()] || SCOUT.grayLight;
  };

  const getStatusTextColor = (status) => {
    const colors = {
      'approved': SCOUT.green,
      'completed': SCOUT.green,
      'pending': '#B45309',
      'rejected': SCOUT.red,
      'cancelled': SCOUT.red,
      'active': SCOUT.green,
      'inactive': SCOUT.gray,
      'submitted': SCOUT.blue,
      'published': SCOUT.blue,
      'forwarded': '#8B5CF6',
      'archived': SCOUT.gray
    };
    return colors[status?.toLowerCase()] || SCOUT.gray;
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
        <p style={{ marginTop: '16px', color: SCOUT.gray }}>Loading dashboard...</p>
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

  const displayedDonations = showAllDonations ? recentDonations : recentDonations.slice(0, 5);
  const displayedReports = showAllReports ? reports : reports.slice(0, 5);

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
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              Welcome, {user?.full_name || user?.name || 'Donor'}!
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 52px', opacity: 0.9 }}>
            Track your donations and impact across Rwanda 🇷🇼
          </p>
        </div>
        <div className="welcome-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/updates" className="notification-bell" style={{
            color: SCOUT.white,
            position: 'relative',
            fontSize: '1.25rem'
          }}>
            <i className="fas fa-bell"></i>
            {stats.updates > 0 && (
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
                {stats.updates}
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

      {/* Stats Grid */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
            <i className="fas fa-heart"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>
              {formatCurrency(stats.totalDonations || 0)}
            </h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Total Donations</p>
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
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.activeProjects || 0}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Active Projects</p>
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
          <div className="stat-icon" style={{ background: `${SCOUT.blue}15`, color: SCOUT.blue }}>
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.donationCount || 0}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Donations Made</p>
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
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT.black }}>{stats.totalReports || 0}</h3>
            <p style={{ margin: 0, color: SCOUT.gray, fontSize: '0.875rem' }}>Reports</p>
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

      {/* Charts */}
      <div className="charts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div className="chart-card" style={{
          background: SCOUT.white,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: SCOUT.black }}>
            <i className="fas fa-chart-line" style={{ color: SCOUT.green }}></i>
            Donation Trends
          </h4>
          {donationChart && donationChart.length > 0 && donationChart.some(item => item.donations > 0 || item.projects > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={donationChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="donations" stackId="1" stroke={SCOUT.green} fill={SCOUT.green} fillOpacity={0.3} name="Donations" />
                <Area type="monotone" dataKey="projects" stackId="1" stroke={SCOUT.yellow} fill={SCOUT.yellow} fillOpacity={0.3} name="Projects" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: SCOUT.gray }}>
              <i className="fas fa-chart-line" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT.gray }}></i>
              <p>No chart data available yet</p>
            </div>
          )}
        </div>
        <div className="chart-card" style={{
          background: SCOUT.white,
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${SCOUT.grayBorder}`
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: SCOUT.black }}>
            <i className="fas fa-chart-pie" style={{ color: SCOUT.yellow }}></i>
            Donation Distribution
          </h4>
          {recentDonations.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={recentDonations.slice(0, 5).map(d => ({
                    name: d.project || 'General',
                    value: parseFloat(d.amount) || 0
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {recentDonations.slice(0, 5).map((d, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: SCOUT.gray }}>
              <i className="fas fa-chart-pie" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT.gray }}></i>
              <p>No donation data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Donations & Reports */}
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
              Recent Donations
            </h4>
            {recentDonations.length > 5 && (
              <button 
                onClick={() => setShowAllDonations(!showAllDonations)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: SCOUT.green,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {showAllDonations ? 'Show Less' : `View All (${recentDonations.length})`}
              </button>
            )}
          </div>
          {recentDonations.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '30px', color: SCOUT.gray }}>
              <i className="fas fa-heart" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT.gray }}></i>
              <p>No recent donations</p>
              <Link to="/payment" className="btn-sm" style={{
                padding: '6px 16px',
                background: SCOUT.green,
                color: SCOUT.white,
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '8px'
              }}>
                <i className="fas fa-plus"></i> Make a Donation
              </Link>
            </div>
          ) : (
            <ul className="donation-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {displayedDonations.map((donation, index) => (
                <li key={donation.id || index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderBottom: index < displayedDonations.length - 1 ? `1px solid ${SCOUT.grayBorder}` : 'none',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: SCOUT.black }}>{donation.project || 'General Donation'}</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: SCOUT.gray }}>
                      {formatDate(donation.created_at || donation.date)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: SCOUT.green,
                      fontSize: '0.95rem'
                    }}>
                      {formatCurrency(donation.amount || 0)}
                    </span>
                    <br />
                    <span className={`status-badge`} style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      background: getStatusBg(donation.status),
                      color: getStatusTextColor(donation.status),
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {donation.status || 'pending'}
                    </span>
                  </div>
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
              <i className="fas fa-file-alt" style={{ color: SCOUT.blue }}></i>
              Recent Reports
            </h4>
            {reports.length > 5 && (
              <button 
                onClick={() => setShowAllReports(!showAllReports)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: SCOUT.green,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {showAllReports ? 'Show Less' : `View All (${reports.length})`}
              </button>
            )}
          </div>
          {reports.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '30px', color: SCOUT.gray }}>
              <i className="fas fa-file-alt" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT.gray }}></i>
              <p>No reports available</p>
            </div>
          ) : (
            <ul className="report-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {displayedReports.map((report, index) => (
                <li key={report.id || index} style={{
                  padding: '10px 12px',
                  borderBottom: index < displayedReports.length - 1 ? `1px solid ${SCOUT.grayBorder}` : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: SCOUT.black }}>{report.title || 'Report'}</strong>
                      <p style={{ margin: '4px 0', fontSize: '0.8rem', color: SCOUT.gray }}>
                        {report.description?.substring(0, 80)}...
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: SCOUT.gray, marginTop: '4px' }}>
                        <span><i className="fas fa-calendar"></i> {formatDate(report.created_at || report.submitted_at)}</span>
                        {report.district && (
                          <span><i className="fas fa-map-marker-alt"></i> {report.district}</span>
                        )}
                      </div>
                    </div>
                    <span className={`status-badge`} style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      background: getStatusBg(report.status),
                      color: getStatusTextColor(report.status),
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      marginLeft: '8px',
                      whiteSpace: 'nowrap'
                    }}>
                      {report.status || 'submitted'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Latest Updates */}
      <div className="card" style={{
        background: SCOUT.white,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${SCOUT.grayBorder}`
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: SCOUT.black }}>
          <i className="fas fa-bell" style={{ color: SCOUT.red }}></i>
          Latest Updates
        </h4>
        {updates.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '30px', color: SCOUT.gray }}>
            <i className="fas fa-bell-slash" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT.gray }}></i>
            <p>No updates</p>
          </div>
        ) : (
          <ul className="update-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {updates.slice(0, 5).map((update, index) => (
              <li key={update.id || index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '10px 12px',
                borderBottom: index < updates.slice(0, 5).length - 1 ? `1px solid ${SCOUT.grayBorder}` : 'none',
                gap: '12px'
              }}>
                <div className="update-icon" style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: `${SCOUT.blue}15`,
                  color: SCOUT.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className={`fas ${update.icon || 'fa-info-circle'}`}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: SCOUT.black }}>{update.title}</strong>
                  <p style={{ margin: '4px 0', color: SCOUT.gray }}>{update.message}</p>
                  <small style={{ color: SCOUT.gray, fontSize: '0.75rem' }}>
                    {formatDate(update.date || update.created_at)}
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

export default DonationDashboard;