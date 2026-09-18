// src/components/scout/ScoutDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Scout Color System
const SCOUT_COLORS = {
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

const ScoutDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    stats: {
      upcomingEvents: 0,
      enrolledCourses: 0,
      unreadNotifications: 0,
      totalIdeas: 0,
      totalProjects: 0,
      totalReports: 0
    },
    activities: [],
    events: [],
    courses: [],
    attendanceHistory: [],
    recentAttendance: [],
    upcomingEvents: []
  });
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view dashboard');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching dashboard data for user:', user?.id);

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      };

      // Fetch all data in parallel
      const [
        statsRes,
        activitiesRes,
        upcomingEventsRes,
        coursesRes,
        attendanceHistoryRes,
        recentAttendanceRes,
        notificationsRes,
        ideasRes
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/scout/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/scout/dashboard/recent-activities`, { headers }),
        axios.get(`${API_URL}/scout/events/upcoming`, { headers }),
        axios.get(`${API_URL}/scout/courses`, { headers }),
        axios.get(`${API_URL}/scout/attendance/history`, { headers }),
        axios.get(`${API_URL}/scout/attendance/recent`, { headers }),
        axios.get(`${API_URL}/scout/notifications`, { headers }),
        axios.get(`${API_URL}/scout/ideas`, { headers })
      ]);

      // Process Stats
      let statsData = {
        upcomingEvents: 0,
        enrolledCourses: 0,
        unreadNotifications: 0,
        totalIdeas: 0,
        totalProjects: 0,
        totalReports: 0
      };

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        const responseData = statsRes.value.data;
        console.log('📊 Stats Response:', responseData);
        
        if (responseData.stats) {
          statsData = { ...statsData, ...responseData.stats };
        } else if (responseData.data?.stats) {
          statsData = { ...statsData, ...responseData.data.stats };
        } else {
          statsData.upcomingEvents = responseData.upcomingEvents || responseData.upcoming_events || 0;
          statsData.enrolledCourses = responseData.enrolledCourses || responseData.enrolled_courses || 0;
          statsData.unreadNotifications = responseData.unreadNotifications || responseData.unread_notifications || 0;
          statsData.totalIdeas = responseData.totalIdeas || responseData.total_ideas || 0;
          statsData.totalProjects = responseData.totalProjects || responseData.total_projects || 0;
          statsData.totalReports = responseData.totalReports || responseData.total_reports || 0;
        }
      }

      // Process Notifications
      let notificationsData = [];
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value?.data) {
        notificationsData = notificationsRes.value.data.notifications || 
                           notificationsRes.value.data || [];
        if (!Array.isArray(notificationsData)) notificationsData = [];
        
        // Count unread notifications
        const unreadCount = notificationsData.filter(n => 
          n.status === 'unread' || n.read === false || n.is_read === false
        ).length;
        
        statsData.unreadNotifications = Math.max(statsData.unreadNotifications, unreadCount, notificationsData.length);
        console.log('🔔 Notifications:', notificationsData.length, 'Unread:', unreadCount);
      }

      // Process Ideas
      let ideasData = [];
      if (ideasRes.status === 'fulfilled' && ideasRes.value?.data) {
        ideasData = ideasRes.value.data.ideas || 
                   ideasRes.value.data || [];
        if (!Array.isArray(ideasData)) ideasData = [];
        
        statsData.totalIdeas = Math.max(statsData.totalIdeas, ideasData.length);
        console.log('💡 Ideas:', ideasData.length);
      }

      // Process Activities
      let activitiesData = [];
      if (activitiesRes.status === 'fulfilled' && activitiesRes.value?.data) {
        activitiesData = activitiesRes.value.data.activities || 
                         activitiesRes.value.data || [];
        if (!Array.isArray(activitiesData)) activitiesData = [];
      }

      // Process Upcoming Events
      let upcomingEventsData = [];
      if (upcomingEventsRes.status === 'fulfilled' && upcomingEventsRes.value?.data) {
        upcomingEventsData = upcomingEventsRes.value.data.events || 
                             upcomingEventsRes.value.data || [];
        if (!Array.isArray(upcomingEventsData)) upcomingEventsData = [];
        console.log('📅 Upcoming events:', upcomingEventsData.length);
      }

      // Process Courses
      let coursesData = [];
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
        coursesData = coursesRes.value.data.courses || 
                      coursesRes.value.data || [];
        if (!Array.isArray(coursesData)) coursesData = [];
      }

      // Process Attendance History
      let attendanceHistoryData = [];
      if (attendanceHistoryRes.status === 'fulfilled' && attendanceHistoryRes.value?.data) {
        attendanceHistoryData = attendanceHistoryRes.value.data.attendance || 
                                attendanceHistoryRes.value.data || [];
        if (!Array.isArray(attendanceHistoryData)) attendanceHistoryData = [];
      }

      // Process Recent Attendance
      let recentAttendanceData = [];
      if (recentAttendanceRes.status === 'fulfilled' && recentAttendanceRes.value?.data) {
        recentAttendanceData = recentAttendanceRes.value.data.attendance || 
                               recentAttendanceRes.value.data || [];
        if (!Array.isArray(recentAttendanceData)) recentAttendanceData = [];
      }

      // Update stats with actual counts
      statsData.upcomingEvents = Math.max(statsData.upcomingEvents || 0, upcomingEventsData.length);
      statsData.enrolledCourses = Math.max(statsData.enrolledCourses || 0, coursesData.length);

      setData({
        stats: statsData,
        activities: activitiesData,
        events: upcomingEventsData,
        courses: coursesData,
        attendanceHistory: attendanceHistoryData,
        recentAttendance: recentAttendanceData,
        upcomingEvents: upcomingEventsData,
        notifications: notificationsData,
        ideas: ideasData
      });

      console.log('✅ Dashboard loaded:', {
        stats: statsData,
        activities: activitiesData.length,
        upcomingEvents: upcomingEventsData.length,
        courses: coursesData.length,
        attendance: attendanceHistoryData.length,
        notifications: notificationsData.length,
        ideas: ideasData.length
      });

    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getAttendanceStatus = (event) => {
    const attendanceRecord = data.attendanceHistory.find(a => 
      a.eventId === event.id || a.event_id === event.id || a.event_id === event.id
    );
    
    if (attendanceRecord) {
      return {
        status: attendanceRecord.status || 'attended',
        attendedAt: attendanceRecord.attendedAt || attendanceRecord.attendance_time,
        label: '✅ Attended'
      };
    }

    const now = new Date();
    const eventDate = new Date(event.start_date || event.startDate || event.date);
    const eventEnd = new Date(event.end_date || event.endDate || event.start_date || event.startDate || event.date);

    if (eventDate > now) {
      return {
        status: 'upcoming',
        label: '📅 Upcoming'
      };
    }

    if (eventEnd < now) {
      return {
        status: 'absent',
        label: '❌ Absent'
      };
    }

    return {
      status: 'pending',
      label: '⏳ Pending'
    };
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'attended': SCOUT_COLORS.green,
      'present': SCOUT_COLORS.green,
      'upcoming': SCOUT_COLORS.blue,
      'pending': SCOUT_COLORS.yellow,
      'absent': SCOUT_COLORS.red,
      'excused': '#8B5CF6',
      'approved': SCOUT_COLORS.green,
      'cancelled': SCOUT_COLORS.red,
      'completed': SCOUT_COLORS.green
    };
    return classes[status] || SCOUT_COLORS.gray;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'attended': '✅',
      'present': '✅',
      'upcoming': '📅',
      'pending': '⏳',
      'absent': '❌',
      'excused': '📝',
      'approved': '✅',
      'cancelled': '❌',
      'completed': '✅'
    };
    return icons[status] || '📋';
  };

  const getFilteredAttendance = () => {
    if (filterStatus === 'all') return data.attendanceHistory;
    return data.attendanceHistory.filter(a => a.status === filterStatus);
  };

  const renderAttendanceStats = () => {
    const total = data.attendanceHistory.length;
    const attended = data.attendanceHistory.filter(a => 
      a.status === 'attended' || a.status === 'present' || a.status === 'approved'
    ).length;
    const pending = data.attendanceHistory.filter(a => 
      a.status === 'pending' || a.status === 'registered'
    ).length;
    const absent = data.attendanceHistory.filter(a => 
      a.status === 'absent' || a.status === 'cancelled'
    ).length;
    const upcoming = data.upcomingEvents.length;

    return (
      <div className="attendance-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        <div className="stat-card attendance-stat" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.blue}15`,
            color: SCOUT_COLORS.blue,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: SCOUT_COLORS.black }}>{total}</h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.75rem' }}>Total Events</p>
          </div>
        </div>
        <div className="stat-card attendance-stat" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`,
          borderLeft: `4px solid ${SCOUT_COLORS.green}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.green}15`,
            color: SCOUT_COLORS.green,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: SCOUT_COLORS.black }}>{attended}</h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.75rem' }}>✅ Attended</p>
          </div>
        </div>
        <div className="stat-card attendance-stat" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`,
          borderLeft: `4px solid ${SCOUT_COLORS.yellow}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.yellow}25`,
            color: '#B45309',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: SCOUT_COLORS.black }}>{pending}</h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.75rem' }}>⏳ Pending</p>
          </div>
        </div>
        <div className="stat-card attendance-stat" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`,
          borderLeft: `4px solid ${SCOUT_COLORS.red}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.red}15`,
            color: SCOUT_COLORS.red,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: SCOUT_COLORS.black }}>{absent}</h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.75rem' }}>❌ Absent</p>
          </div>
        </div>
        <div className="stat-card attendance-stat" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`,
          borderLeft: `4px solid ${SCOUT_COLORS.blue}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.blue}15`,
            color: SCOUT_COLORS.blue,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: SCOUT_COLORS.black }}>{upcoming}</h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.75rem' }}>📅 Upcoming</p>
          </div>
        </div>
        <div className="stat-card attendance-stat" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`,
          borderLeft: `4px solid ${SCOUT_COLORS.yellow}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.yellow}25`,
            color: '#B45309',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}>
            <i className="fas fa-percent"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: SCOUT_COLORS.black }}>
              {total > 0 ? Math.round((attended / total) * 100) : 0}%
            </h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.75rem' }}>Attendance Rate</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        background: SCOUT_COLORS.white
      }}>
        <div className="spinner-large" style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${SCOUT_COLORS.grayBorder}`,
          borderTop: `4px solid ${SCOUT_COLORS.green}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: SCOUT_COLORS.gray }}>Loading dashboard...</p>
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
          background: SCOUT_COLORS.redLight,
          borderLeft: `4px solid ${SCOUT_COLORS.red}`,
          padding: '16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <i className="fas fa-exclamation-circle" style={{ color: SCOUT_COLORS.red, fontSize: '1.25rem' }}></i>
            <p style={{ margin: 0, flex: 1, color: '#991B1B' }}>{error}</p>
          </div>
          <button 
            className="btn-retry-sm" 
            onClick={fetchDashboardData}
            style={{
              background: SCOUT_COLORS.red,
              color: SCOUT_COLORS.white,
              border: 'none',
              padding: '6px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: SCOUT_COLORS.grayLight,
      minHeight: '100vh'
    }}>
      {/* Welcome Section - Scout Branded */}
      <div className="dashboard-welcome" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        background: `linear-gradient(135deg, ${SCOUT_COLORS.green}, ${SCOUT_COLORS.greenDark})`,
        borderRadius: '16px',
        color: SCOUT_COLORS.white,
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0,107,63,0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              background: SCOUT_COLORS.yellow,
              color: SCOUT_COLORS.green,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              ⚜
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
              Welcome, {user?.full_name || 'Scout'}!
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 36px', opacity: 0.9, fontSize: '0.95rem' }}>
            Track your scouting journey and attendance
          </p>
        </div>
        <div className="welcome-badge" style={{
          background: SCOUT_COLORS.yellow,
          color: SCOUT_COLORS.green,
          padding: '8px 20px',
          borderRadius: '24px',
          fontSize: '0.875rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-user-check"></i>
          <span>
            Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}
          </span>
        </div>
      </div>

      {/* Stats Grid - Scout Colors */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="stat-card" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.yellow}30`,
            color: SCOUT_COLORS.green,
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT_COLORS.black }}>
              {data.stats?.upcomingEvents || 0}
            </h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.875rem' }}>Upcoming Events</p>
          </div>
        </div>
        <div className="stat-card" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.green}15`,
            color: SCOUT_COLORS.green,
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT_COLORS.black }}>
              {data.stats?.enrolledCourses || 0}
            </h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.875rem' }}>Enrolled Courses</p>
          </div>
        </div>
        <div className="stat-card" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.red}15`,
            color: SCOUT_COLORS.red,
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            <i className="fas fa-bell"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT_COLORS.black }}>
              {data.stats?.unreadNotifications || 0}
            </h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.875rem' }}>Notifications</p>
          </div>
        </div>
        <div className="stat-card" style={{
          background: SCOUT_COLORS.white,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `1px solid ${SCOUT_COLORS.grayBorder}`
        }}>
          <div className="stat-icon" style={{
            background: `${SCOUT_COLORS.blue}15`,
            color: SCOUT_COLORS.blue,
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            <i className="fas fa-lightbulb"></i>
          </div>
          <div className="stat-info">
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: SCOUT_COLORS.black }}>
              {data.stats?.totalIdeas || 0}
            </h3>
            <p style={{ margin: 0, color: SCOUT_COLORS.gray, fontSize: '0.875rem' }}>My Ideas</p>
          </div>
        </div>
      </div>

      {/* Refresh Section */}
      <div className="refresh-section" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '12px 16px',
        background: SCOUT_COLORS.white,
        borderRadius: '12px',
        border: `1px solid ${SCOUT_COLORS.grayBorder}`,
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <button 
          className="btn-primary" 
          onClick={forceRefresh}
          style={{
            background: SCOUT_COLORS.green,
            color: SCOUT_COLORS.white,
            border: 'none',
            padding: '8px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = SCOUT_COLORS.greenDark}
          onMouseLeave={(e) => e.target.style.background = SCOUT_COLORS.green}
        >
          <i className="fas fa-sync"></i> Refresh Dashboard
        </button>
        <span className="last-updated" style={{ color: SCOUT_COLORS.gray, fontSize: '0.875rem' }}>
          <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
          Last updated: {new Date().toLocaleString()}
        </span>
      </div>

      {/* Attendance Section - Scout Branded */}
      <div className="dashboard-section attendance-section" style={{
        background: SCOUT_COLORS.white,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: `1px solid ${SCOUT_COLORS.grayBorder}`
      }}>
        <div className="section-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: SCOUT_COLORS.black,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1.2rem'
          }}>
            <span style={{
              background: SCOUT_COLORS.yellow,
              color: SCOUT_COLORS.green,
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem'
            }}>
              <i className="fas fa-user-check"></i>
            </span>
            My Attendance Overview
          </h3>
          <div className="section-actions" style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-secondary-sm"
              onClick={() => setShowAttendanceHistory(!showAttendanceHistory)}
              style={{
                background: SCOUT_COLORS.grayLight,
                border: `1px solid ${SCOUT_COLORS.grayBorder}`,
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: SCOUT_COLORS.black,
                fontWeight: '500',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = SCOUT_COLORS.grayBorder}
              onMouseLeave={(e) => e.target.style.background = SCOUT_COLORS.grayLight}
            >
              <i className={`fas ${showAttendanceHistory ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              {showAttendanceHistory ? 'Hide History' : 'View Full History'}
            </button>
            <button 
              className="btn-secondary-sm"
              onClick={forceRefresh}
              style={{
                background: SCOUT_COLORS.grayLight,
                border: `1px solid ${SCOUT_COLORS.grayBorder}`,
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: SCOUT_COLORS.black,
                fontWeight: '500',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = SCOUT_COLORS.grayBorder}
              onMouseLeave={(e) => e.target.style.background = SCOUT_COLORS.grayLight}
            >
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>
        </div>

        {renderAttendanceStats()}

        {/* Recent Attended Events */}
        <div className="recent-attendance" style={{ marginTop: '24px' }}>
          <h4 style={{ 
            color: SCOUT_COLORS.black, 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem'
          }}>
            <i className="fas fa-clock" style={{ color: SCOUT_COLORS.green }}></i>
            Recent Attended Events
          </h4>
          {data.recentAttendance.length === 0 ? (
            <div className="empty-state small" style={{
              textAlign: 'center',
              padding: '32px',
              color: SCOUT_COLORS.gray,
              background: SCOUT_COLORS.grayLight,
              borderRadius: '12px'
            }}>
              <i className="fas fa-calendar-alt" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT_COLORS.gray }}></i>
              <p style={{ margin: 0 }}>No attendance records yet. Start attending events!</p>
            </div>
          ) : (
            <div className="attendance-list">
              {data.recentAttendance.slice(0, 5).map((attendance, index) => (
                <div key={index} className="attendance-item" style={{
                  display: 'flex',
                  padding: '14px',
                  border: `1px solid ${SCOUT_COLORS.grayBorder}`,
                  borderRadius: '10px',
                  marginBottom: '8px',
                  gap: '12px',
                  alignItems: 'flex-start',
                  background: SCOUT_COLORS.white
                }}>
                  <div className="attendance-item-icon">
                    <span className="attendance-check" style={{ 
                      fontSize: '1.25rem',
                      background: SCOUT_COLORS.greenLight,
                      padding: '6px',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}>✅</span>
                  </div>
                  <div className="attendance-item-content" style={{ flex: 1 }}>
                    <div className="attendance-item-header" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      <strong style={{ color: SCOUT_COLORS.black }}>{attendance.eventName || attendance.title || 'Event'}</strong>
                      <span className={`status-badge badge-approved`} style={{
                        padding: '2px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        background: SCOUT_COLORS.greenLight,
                        color: SCOUT_COLORS.green,
                        fontWeight: '600'
                      }}>
                        ✅ Attended
                      </span>
                    </div>
                    <div className="attendance-item-details" style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '0.8rem',
                      color: SCOUT_COLORS.gray,
                      flexWrap: 'wrap',
                      marginTop: '4px'
                    }}>
                      <span>
                        <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i>
                        {new Date(attendance.eventDate || attendance.start_date || Date.now()).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="fas fa-clock" style={{ marginRight: '4px' }}></i>
                        {new Date(attendance.attendedAt || attendance.attendance_time || Date.now()).toLocaleString()}
                      </span>
                      {attendance.location && (
                        <span>
                          <i className="fas fa-map-marker-alt" style={{ marginRight: '4px' }}></i>
                          {attendance.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="upcoming-attendance" style={{ marginTop: '24px' }}>
          <h4 style={{ 
            color: SCOUT_COLORS.black, 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem'
          }}>
            <i className="fas fa-calendar-alt" style={{ color: SCOUT_COLORS.yellow }}></i>
            Upcoming Events
          </h4>
          {data.upcomingEvents.length === 0 ? (
            <div className="empty-state small" style={{
              textAlign: 'center',
              padding: '32px',
              color: SCOUT_COLORS.gray,
              background: SCOUT_COLORS.grayLight,
              borderRadius: '12px'
            }}>
              <i className="fas fa-calendar-check" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT_COLORS.gray }}></i>
              <p style={{ margin: 0 }}>No upcoming events scheduled</p>
            </div>
          ) : (
            <div className="attendance-list">
              {data.upcomingEvents.slice(0, 5).map((event, index) => {
                const status = getAttendanceStatus(event);
                const isUpcoming = status.status === 'upcoming';
                const isPending = status.status === 'pending';
                
                return (
                  <div key={index} className="attendance-item upcoming" style={{
                    display: 'flex',
                    padding: '14px',
                    border: `1px solid ${SCOUT_COLORS.grayBorder}`,
                    borderRadius: '10px',
                    marginBottom: '8px',
                    gap: '12px',
                    alignItems: 'flex-start',
                    background: isUpcoming ? `${SCOUT_COLORS.blue}08` : SCOUT_COLORS.white,
                    borderLeft: isUpcoming ? `4px solid ${SCOUT_COLORS.blue}` : 
                               isPending ? `4px solid ${SCOUT_COLORS.yellow}` : 
                               `4px solid ${SCOUT_COLORS.grayBorder}`
                  }}>
                    <div className="attendance-item-icon">
                      <span className="attendance-status-icon" style={{ fontSize: '1.25rem' }}>
                        {getStatusIcon(status.status)}
                      </span>
                    </div>
                    <div className="attendance-item-content" style={{ flex: 1 }}>
                      <div className="attendance-item-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        <strong style={{ color: SCOUT_COLORS.black }}>{event.title}</strong>
                        <span className={`status-badge`} style={{
                          padding: '2px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          background: isUpcoming ? `${SCOUT_COLORS.blue}15` :
                                     isPending ? `${SCOUT_COLORS.yellow}30` :
                                     `${SCOUT_COLORS.red}15`,
                          color: isUpcoming ? SCOUT_COLORS.blue :
                                 isPending ? '#B45309' :
                                 SCOUT_COLORS.red,
                          fontWeight: '600'
                        }}>
                          {status.label}
                        </span>
                      </div>
                      <div className="attendance-item-details" style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '0.8rem',
                        color: SCOUT_COLORS.gray,
                        flexWrap: 'wrap',
                        marginTop: '4px'
                      }}>
                        <span>
                          <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i>
                          {new Date(event.start_date).toLocaleDateString()}
                        </span>
                        <span>
                          <i className="fas fa-clock" style={{ marginRight: '4px' }}></i>
                          {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {event.location && (
                          <span>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '4px' }}></i>
                            {event.location}
                          </span>
                        )}
                      </div>
                      {isPending && (
                        <div className="attendance-pending-notice" style={{
                          marginTop: '8px',
                          fontSize: '0.8rem',
                          color: '#B45309',
                          background: `${SCOUT_COLORS.yellow}25`,
                          padding: '6px 12px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <i className="fas fa-info-circle"></i>
                          Attendance period is open. Remember to check in!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attendance History */}
        {showAttendanceHistory && (
          <div className="attendance-history" style={{ marginTop: '24px' }}>
            <h4 style={{ 
              color: SCOUT_COLORS.black, 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem'
            }}>
              <i className="fas fa-history" style={{ color: SCOUT_COLORS.blue }}></i>
              Full Attendance History
            </h4>
            
            <div className="history-filters" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${SCOUT_COLORS.grayBorder}`,
                  fontSize: '0.875rem',
                  background: SCOUT_COLORS.white,
                  color: SCOUT_COLORS.black,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Events</option>
                <option value="attended">✅ Attended</option>
                <option value="present">✅ Present</option>
                <option value="pending">⏳ Pending</option>
                <option value="absent">❌ Absent</option>
                <option value="excused">📝 Excused</option>
                <option value="approved">✅ Approved</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
              <span className="history-count" style={{ color: SCOUT_COLORS.gray, fontSize: '0.875rem' }}>
                {getFilteredAttendance().length} events
              </span>
            </div>

            {getFilteredAttendance().length === 0 ? (
              <div className="empty-state small" style={{
                textAlign: 'center',
                padding: '32px',
                color: SCOUT_COLORS.gray,
                background: SCOUT_COLORS.grayLight,
                borderRadius: '12px'
              }}>
                <i className="fas fa-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT_COLORS.gray }}></i>
                <p style={{ margin: 0 }}>No attendance records found</p>
              </div>
            ) : (
              <div className="attendance-history-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="attendance-history-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ 
                      background: SCOUT_COLORS.grayLight, 
                      borderBottom: `2px solid ${SCOUT_COLORS.green}`
                    }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: SCOUT_COLORS.black, fontWeight: '600' }}>Event Name</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: SCOUT_COLORS.black, fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: SCOUT_COLORS.black, fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: SCOUT_COLORS.black, fontWeight: '600' }}>Attended At</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: SCOUT_COLORS.black, fontWeight: '600' }}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAttendance().map((record, index) => {
                      const statusColor = getStatusBadgeClass(record.status);
                      return (
                        <tr key={index} style={{ 
                          borderBottom: `1px solid ${SCOUT_COLORS.grayBorder}`,
                          background: index % 2 === 0 ? SCOUT_COLORS.white : SCOUT_COLORS.grayLight
                        }}>
                          <td style={{ padding: '10px 14px', fontWeight: '500', color: SCOUT_COLORS.black }}>
                            {record.eventName || record.title || 'Event'}
                          </td>
                          <td style={{ padding: '10px 14px', color: SCOUT_COLORS.black }}>
                            {new Date(record.eventDate || record.start_date || Date.now()).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span className={`status-badge`} style={{
                              padding: '2px 12px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              background: `${statusColor}15`,
                              color: statusColor,
                              fontWeight: '600'
                            }}>
                              {getStatusIcon(record.status)} {record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || 'Unknown'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: SCOUT_COLORS.gray }}>
                            {record.attendedAt || record.attendance_time ? 
                              new Date(record.attendedAt || record.attendance_time).toLocaleString() : 
                              '—'}
                          </td>
                          <td style={{ padding: '10px 14px', color: SCOUT_COLORS.gray }}>{record.location || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activities - Scout Branded */}
      <div className="dashboard-card" style={{
        background: SCOUT_COLORS.white,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: `1px solid ${SCOUT_COLORS.grayBorder}`
      }}>
        <h3 style={{ 
          color: SCOUT_COLORS.black, 
          marginTop: 0, 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '1.2rem'
        }}>
          <span style={{
            background: SCOUT_COLORS.green,
            color: SCOUT_COLORS.white,
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem'
          }}>
            <i className="fas fa-bolt"></i>
          </span>
          Recent Activities
        </h3>
        {data.activities.length === 0 ? (
          <div className="empty-state small" style={{
            textAlign: 'center',
            padding: '32px',
            color: SCOUT_COLORS.gray,
            background: SCOUT_COLORS.grayLight,
            borderRadius: '12px'
          }}>
            <i className="fas fa-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: SCOUT_COLORS.gray }}></i>
            <p style={{ margin: 0 }}>No recent activities</p>
          </div>
        ) : (
          <ul className="activity-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.activities.slice(0, 5).map((activity, index) => {
              const statusColor = activity.status === 'approved' ? SCOUT_COLORS.green :
                                 activity.status === 'pending' ? SCOUT_COLORS.yellow :
                                 activity.status === 'cancelled' ? SCOUT_COLORS.red : SCOUT_COLORS.gray;
              const statusBg = activity.status === 'approved' ? SCOUT_COLORS.greenLight :
                               activity.status === 'pending' ? `${SCOUT_COLORS.yellow}25` :
                               activity.status === 'cancelled' ? SCOUT_COLORS.redLight : SCOUT_COLORS.grayLight;
              const statusText = activity.status === 'approved' ? SCOUT_COLORS.green :
                                 activity.status === 'pending' ? '#B45309' :
                                 activity.status === 'cancelled' ? SCOUT_COLORS.red : SCOUT_COLORS.gray;
              
              return (
                <li key={index} className="activity-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom: `1px solid ${SCOUT_COLORS.grayBorder}`,
                  gap: '12px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = SCOUT_COLORS.grayLight}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className={`activity-dot`} style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: statusColor,
                    flexShrink: 0
                  }}></span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: SCOUT_COLORS.black }}>{activity.title || activity.message || 'Activity'}</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: SCOUT_COLORS.gray }}>
                      <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i>
                      {new Date(activity.date || activity.created_at || Date.now()).toLocaleDateString()}
                      {activity.time && ` • ${activity.time}`}
                    </p>
                  </div>
                  <span className={`status-badge`} style={{
                    padding: '2px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    background: statusBg,
                    color: statusText,
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {activity.status || 'Pending'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ScoutDashboard;