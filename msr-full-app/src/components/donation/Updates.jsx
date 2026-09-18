// src/components/donation/Updates.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Scout Color System
const SCOUT = {
  purple: '#6A1B9A',
  gold: '#FFD100',
  green: '#2E7D32',
  blue: '#2196F3',
  red: '#D32F2F',
  white: '#FFFFFF',
  dark: '#263238',
  lightBg: '#F5F7FA',
  gray: '#6B7280',
  border: '#E5E7EB',
  success: '#2E7D32',
  warning: '#FF9800',
  danger: '#D32F2F',
  info: '#2196F3',
};

const Updates = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [reports, setReports] = useState([]);
  const [nationalAnnouncements, setNationalAnnouncements] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Check if user is National Commissioner or Super Admin
  const isNationalOrSuperAdmin = user?.role === 'national_commissioner' || 
                                  user?.role === 'national-commissioner' ||
                                  user?.role === 'super_admin' ||
                                  user?.role === 'super-admin' ||
                                  user?.role === 'admin';

  // ✅ Check if user is a donor
  const isDonor = user?.role === 'donor';

  // ✅ Check if user can submit reports
  const canSubmitReports = isNationalOrSuperAdmin || 
                           user?.role === 'district_commissioner' ||
                           user?.role === 'district-commissioner' ||
                           user?.role === 'unit_leader' ||
                           user?.role === 'scout';

  useEffect(() => {
    fetchAllUpdates();
  }, [filterType]);

  const fetchAllUpdates = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log('🔄 Loading Updates...');
      console.log('🌐 API:', API_URL);
      console.log('👤 User role:', user?.role);
      console.log('📌 Is Donor:', isDonor);

      // --------------------------------------------
      // 1. DONATION UPDATES (Projects, Events, etc.)
      // --------------------------------------------
      const updatesPromise = axios.get(
        `${API_URL}/donation/updates?type=${filterType === 'all' ? 'all' : filterType}`,
        config
      );

      // --------------------------------------------
      // 2. NATIONAL REPORTS
      // - National users: get ALL reports
      // - Donors: get ONLY forwarded reports (status = 'forwarded')
      // --------------------------------------------
      let reportsPromise;
      if (isNationalOrSuperAdmin) {
        // National users get all reports
        reportsPromise = axios.get(
          `${API_URL}/national/reports?status=all`,
          config
        );
      } else if (isDonor) {
        // ✅ Donors get ONLY forwarded reports (status = 'forwarded')
        reportsPromise = axios.get(
          `${API_URL}/national/reports?status=forwarded`,
          config
        );
        console.log('ℹ️ Donor - fetching only forwarded reports');
      } else {
        // Other users (district_commissioner, etc.)
        reportsPromise = axios.get(
          `${API_URL}/national/reports?status=all`,
          config
        );
      }

      // --------------------------------------------
      // 3. NATIONAL ANNOUNCEMENTS
      // - National users: get ALL announcements
      // - Donors: get ONLY published announcements
      // --------------------------------------------
      let announcementsPromise;
      if (isNationalOrSuperAdmin) {
        // National users get all announcements
        announcementsPromise = axios.get(
          `${API_URL}/national/announcements`,
          config
        );
      } else if (isDonor) {
        // ✅ Donors get ONLY published announcements
        announcementsPromise = axios.get(
          `${API_URL}/national/announcements?status=published`,
          config
        );
        console.log('ℹ️ Donor - fetching only published announcements');
      } else {
        announcementsPromise = Promise.resolve({
          data: {
            success: true,
            announcements: [],
          },
        });
      }

      // ✅ Use allSettled to handle individual failures
      const results = await Promise.allSettled([
        updatesPromise,
        reportsPromise,
        announcementsPromise,
      ]);

      console.log('📊 API results:', results.map(r => r.status));

      // --------------------------------------------
      // PROCESS UPDATES
      // --------------------------------------------
      let updatesData = [];

      if (results[0].status === 'fulfilled') {
        const data = results[0].value.data;

        console.log('📥 Donation updates:', data);

        if (Array.isArray(data)) {
          updatesData = data;
        } else if (Array.isArray(data?.updates)) {
          updatesData = data.updates;
        }
      } else {
        console.error('❌ Donation updates failed:', results[0].reason);
      }

      // --------------------------------------------
      // PROCESS REPORTS
      // --------------------------------------------
      let reportsData = [];

      if (results[1].status === 'fulfilled') {
        const data = results[1].value.data;

        // ✅ Check if it's a 403 Forbidden response
        if (data?.status === 403 || data?.error === 'Forbidden') {
          console.log('ℹ️ National reports access denied - skipping');
        } else {
          console.log('📄 National reports:', data);

          let rawReports = [];
          if (Array.isArray(data)) {
            rawReports = data;
          } else if (Array.isArray(data?.reports)) {
            rawReports = data.reports;
          }

          // ✅ For donors, the API already filters to forwarded reports
          // ✅ For national users, keep all reports
          reportsData = rawReports;
          console.log('✅ Found reports:', reportsData.length);
        }
      } else {
        // ✅ Check if it's a 403 error
        if (results[1].reason?.response?.status === 403) {
          console.log('ℹ️ National reports 403 - skipping');
        } else {
          console.error('❌ National reports failed:', results[1].reason);
        }
      }

      // --------------------------------------------
      // FORMAT REPORTS
      // --------------------------------------------
      const formattedReports = reportsData.map((report) => ({
        id: `report-${report.id}`,
        title: report.title || 'National Report',
        message: report.description || report.content || '',
        type: 'report',
        status: report.status || 'submitted',
        date: report.created_at || report.submitted_at || new Date().toISOString(),
        link: `/national-reports/${report.id}`,
        icon: 'fa-file-alt',
        author: report.submitter?.full_name || report.creator?.full_name || 'National Commissioner',
        report_type: report.type || 'general',
        district: 'National',
        is_report: true,
        source: 'national',
        is_national: true,
        is_forwarded: report.status === 'forwarded',
        published_to_donors: report.published_to_donors || false
      }));

      // --------------------------------------------
      // PROCESS ANNOUNCEMENTS
      // --------------------------------------------
      let announcementsData = [];

      if (results[2].status === 'fulfilled') {
        const data = results[2].value.data;

        console.log('📢 National announcements:', data);

        if (Array.isArray(data)) {
          announcementsData = data;
        } else if (Array.isArray(data?.announcements)) {
          announcementsData = data.announcements;
        } else if (data?.success && Array.isArray(data?.announcements)) {
          announcementsData = data.announcements;
        }
      } else {
        // ✅ Check if it's a 403 error
        if (results[2].reason?.response?.status === 403) {
          console.log('ℹ️ Announcements 403 - skipping');
        } else {
          console.error('❌ Announcements failed:', results[2].reason);
        }
      }

      // ✅ For donors, filter to only published announcements (already filtered by API)
      // ✅ For national users, keep all announcements
      const filteredAnnouncements = isDonor 
        ? announcementsData.filter(a => a.status === 'published' || a.status === 'active')
        : announcementsData;

      // --------------------------------------------
      // FORMAT ANNOUNCEMENTS
      // --------------------------------------------
      const formattedAnnouncements = filteredAnnouncements.map((announcement) => ({
        id: `national-announcement-${announcement.id}`,
        title: announcement.title || 'National Announcement',
        message: announcement.content || announcement.message || '',
        type: 'announcement',
        status: announcement.status || 'published',
        date: announcement.created_at || announcement.published_date || new Date().toISOString(),
        link: `/announcements/${announcement.id}`,
        icon: 'fa-flag',
        author: announcement.author?.full_name || 'National Commissioner',
        announcement_type: announcement.announcement_type || 'general',
        district: 'National',
        is_announcement: true,
        source: 'national',
        is_national: true
      }));

      // --------------------------------------------
      // COMBINE EVERYTHING
      // --------------------------------------------
      const combined = [
        ...updatesData,
        ...formattedReports,
        ...formattedAnnouncements,
      ];

      // --------------------------------------------
      // SORT NEWEST FIRST
      // --------------------------------------------
      combined.sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || 0);
        const dateB = new Date(b.date || b.created_at || 0);
        return dateB - dateA;
      });

      console.log(`✅ FINAL UPDATES: ${combined.length} total updates`);
      console.log(`   📄 Reports: ${formattedReports.length}`);
      console.log(`   📢 Announcements: ${formattedAnnouncements.length}`);
      console.log(`   📦 Others: ${updatesData.length}`);

      setUpdates(updatesData);
      setReports(formattedReports);
      setNationalAnnouncements(formattedAnnouncements);
      setAllItems(combined);

      // ✅ Only show error if ALL sources failed
      const failedCount = results.filter((r) => r.status === 'rejected').length;
      if (failedCount === results.length) {
        setError('Unable to load updates. Please try again.');
      }

    } catch (err) {
      console.error('❌ Unexpected Updates error:', err);
      setError(err.response?.data?.message || 'Failed to load updates');
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'project': 'fa-project-diagram',
      'event': 'fa-calendar-alt',
      'report': 'fa-file-alt',
      'thankyou': 'fa-heart',
      'milestone': 'fa-flag-checkered',
      'sponsorship': 'fa-hand-holding-heart',
      'donation': 'fa-hand-holding-usd',
      'announcement': 'fa-bullhorn',
      'general': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
  };

  const getTypeColor = (type) => {
    const colors = {
      'project': SCOUT.green,
      'event': SCOUT.gold,
      'report': SCOUT.blue,
      'thankyou': SCOUT.red,
      'milestone': '#8B5CF6',
      'sponsorship': SCOUT.purple,
      'donation': SCOUT.green,
      'announcement': SCOUT.gold,
      'general': SCOUT.gray
    };
    return colors[type] || SCOUT.gray;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'project': 'Project Update',
      'event': 'Event Update',
      'report': '📄 National Report',
      'thankyou': 'Thank You',
      'milestone': 'Milestone',
      'sponsorship': 'Sponsorship',
      'donation': 'Donation',
      'announcement': '🇷🇼 National Announcement',
      'general': 'General'
    };
    return labels[type] || 'Update';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'approved': 'badge-approved',
      'pending': 'badge-pending',
      'rejected': 'badge-rejected',
      'submitted': 'badge-submitted',
      'published': 'badge-published',
      'completed': 'badge-completed',
      'forwarded': 'badge-forwarded',
      'archived': 'badge-archived'
    };
    return badges[status] || 'badge-default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'approved': '✅ Approved',
      'pending': '⏳ Pending',
      'rejected': '❌ Rejected',
      'submitted': '📤 Submitted',
      'published': '📢 Published',
      'completed': '✅ Completed',
      'forwarded': '📤 Forwarded from National',
      'archived': '📁 Archived'
    };
    return labels[status] || status || 'Pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': SCOUT.green,
      'pending': SCOUT.warning,
      'rejected': SCOUT.danger,
      'submitted': SCOUT.blue,
      'published': SCOUT.purple,
      'completed': SCOUT.green,
      'forwarded': SCOUT.purple,
      'archived': SCOUT.gray
    };
    return colors[status] || SCOUT.gray;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // ✅ Get empty state message based on filter and user role
  const getEmptyStateMessage = () => {
    const messages = {
      'all': {
        title: 'No Updates',
        description: isDonor 
          ? 'Check back later for new forwarded reports and announcements'
          : 'Check back later for new updates from national reports, projects, and events'
      },
      'report': {
        title: 'No Forwarded Reports',
        description: isDonor 
          ? 'No reports have been forwarded to you yet'
          : 'No national reports available'
      },
      'announcement': {
        title: 'No Announcements',
        description: 'No national announcements available at the moment'
      },
      'project': {
        title: 'No Projects',
        description: 'No projects have been submitted yet'
      },
      'event': {
        title: 'No Events',
        description: 'No events are currently available'
      },
      'sponsorship': {
        title: 'No Sponsorships',
        description: 'No sponsorship opportunities are currently available'
      }
    };
    return messages[filterType] || messages['all'];
  };

  // Filter items based on selected filter
  const getFilteredItems = () => {
    if (filterType === 'all') return allItems;
    if (filterType === 'report') {
      return allItems.filter(item => item.is_report === true);
    }
    if (filterType === 'announcement') {
      return allItems.filter(item => item.is_national === true && item.is_announcement === true);
    }
    return allItems.filter(item => item.type === filterType);
  };

  const filteredItems = getFilteredItems();
  const emptyState = getEmptyStateMessage();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading updates...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h2>
              <i className="fas fa-bell" style={{ color: SCOUT.gold }}></i> 
              Updates & Announcements
            </h2>
            <p>
              {isDonor 
                ? 'Stay informed about forwarded reports, announcements, and projects'
                : 'Stay informed about national reports, projects, events, and announcements'}
            </p>
          </div>
          {canSubmitReports && (
            <Link to="/submit-report" className="btn-submit-report">
              <i className="fas fa-file-alt"></i> Submit Report
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filterType === 'report' ? 'active' : ''}`}
          onClick={() => setFilterType('report')}
        >
          📄 {isDonor ? 'Forwarded Reports' : 'National Reports'}
        </button>
        <button 
          className={`filter-btn ${filterType === 'announcement' ? 'active' : ''}`}
          onClick={() => setFilterType('announcement')}
        >
          🇷🇼 Announcements
        </button>
        <button 
          className={`filter-btn ${filterType === 'project' ? 'active' : ''}`}
          onClick={() => setFilterType('project')}
        >
          Projects
        </button>
        <button 
          className={`filter-btn ${filterType === 'event' ? 'active' : ''}`}
          onClick={() => setFilterType('event')}
        >
          Events
        </button>
        <button 
          className={`filter-btn ${filterType === 'sponsorship' ? 'active' : ''}`}
          onClick={() => setFilterType('sponsorship')}
        >
          Sponsorships
        </button>
        <span className="stats-info">
          <i className="fas fa-list"></i> {filteredItems.length} updates
        </span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-bell-slash" style={{ color: SCOUT.gray }}></i>
          <h3>{emptyState.title}</h3>
          <p>{emptyState.description}</p>
          <Link to="/supporting-projects" className="btn-primary">
            <i className="fas fa-hands-helping"></i> Support a Project
          </Link>
        </div>
      ) : (
        <div className="updates-list">
          {filteredItems.map((item, index) => {
            const isReport = item.is_report === true;
            const isNationalAnnouncement = item.is_national === true && item.is_announcement === true;
            const isForwardedReport = isReport && (item.is_forwarded === true || item.status === 'forwarded');
            const type = isReport ? 'report' : (isNationalAnnouncement ? 'announcement' : (item.type || 'general'));
            const typeColor = isReport ? SCOUT.blue : (isNationalAnnouncement ? SCOUT.gold : getTypeColor(type));
            const typeIcon = isReport ? 'fa-file-alt' : (isNationalAnnouncement ? 'fa-flag' : getTypeIcon(type));
            const typeLabel = isReport ? '📄 National Report' : (isNationalAnnouncement ? '🇷🇼 National Announcement' : getTypeLabel(type));
            
            return (
              <div key={item.id || index} className={`update-card ${isReport ? 'report-card' : ''} ${isNationalAnnouncement ? 'national-card' : ''}`}>
                <div className="update-icon" style={{ 
                  background: typeColor + '20',
                  borderColor: typeColor + '40'
                }}>
                  <i className={`fas ${typeIcon}`} style={{ color: typeColor }}></i>
                </div>
                <div className="update-content">
                  <div className="update-header">
                    <div className="update-title-group">
                      <h4>{item.title || 'Update'}</h4>
                      <span className="update-type" style={{ 
                        background: typeColor + '20',
                        color: typeColor
                      }}>
                        {typeLabel}
                      </span>
                      {isReport && item.status && (
                        <span className={`status-badge ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      )}
                      {isForwardedReport && isDonor && (
                        <span className="status-badge badge-forwarded" style={{ backgroundColor: '#6A1B9A', color: '#FFD100' }}>
                          <i className="fas fa-share"></i> Forwarded to You
                        </span>
                      )}
                      {isNationalAnnouncement && (
                        <span className="update-district national" style={{
                          background: SCOUT.gold + '30',
                          color: '#8D6E00'
                        }}>
                          <i className="fas fa-flag"></i> National
                        </span>
                      )}
                    </div>
                    <span className="update-date">
                      <i className="fas fa-clock"></i> {formatDate(item.date || item.created_at)}
                    </span>
                  </div>
                  <p className="update-message">{item.message || item.content}</p>
                  {isReport && item.report_type && (
                    <div className="report-type-badge">
                      <span className={`report-type ${item.report_type}`}>
                        {item.report_type}
                      </span>
                    </div>
                  )}
                  {item.author && (
                    <div className="update-author">
                      <i className="fas fa-user"></i> {item.author}
                    </div>
                  )}
                  {item.link && (
                    <Link to={item.link} className="update-link">
                      Learn More <i className="fas fa-arrow-right"></i>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Styles */}
      <style>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: ${SCOUT.lightBg};
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
          padding: 20px 24px;
          background: linear-gradient(135deg, ${SCOUT.purple}, #8E24AA);
          border-radius: 12px;
          color: white;
        }

        .page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-header-text {
          flex: 1;
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
          color: ${SCOUT.gold} !important;
        }

        .page-header p {
          margin: 4px 0 0 0;
          color: rgba(255,255,255,0.85);
        }

        .btn-submit-report {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: ${SCOUT.gold};
          color: ${SCOUT.purple};
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-submit-report:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 209, 0, 0.4);
          color: ${SCOUT.purple};
        }

        .btn-submit-report i {
          font-size: 1rem;
        }

        .filter-bar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid ${SCOUT.border};
          align-items: center;
        }

        .filter-btn {
          padding: 6px 16px;
          border: 1px solid ${SCOUT.border};
          border-radius: 20px;
          background: white;
          color: ${SCOUT.dark};
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: ${SCOUT.lightBg};
          border-color: ${SCOUT.purple};
        }

        .filter-btn.active {
          background: ${SCOUT.purple};
          color: white;
          border-color: ${SCOUT.purple};
        }

        .stats-info {
          margin-left: auto;
          color: ${SCOUT.gray};
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .updates-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .update-card {
          display: flex;
          gap: 16px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${SCOUT.border};
          transition: all 0.3s ease;
        }

        .update-card:hover {
          box-shadow: 0 4px 16px rgba(106, 27, 154, 0.12);
          border-color: ${SCOUT.purple}40;
          transform: translateX(4px);
        }

        .report-card {
          border-left: 4px solid ${SCOUT.blue};
          background: ${SCOUT.blue}05;
        }

        .report-card:hover {
          border-left-color: ${SCOUT.purple};
        }

        .national-card {
          border-left: 4px solid ${SCOUT.gold};
          background: ${SCOUT.gold}05;
        }

        .national-card:hover {
          border-left-color: ${SCOUT.purple};
        }

        .update-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          border: 2px solid transparent;
        }

        .update-content {
          flex: 1;
          min-width: 0;
        }

        .update-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 4px;
        }

        .update-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .update-title-group h4 {
          margin: 0;
          font-size: 1rem;
          color: ${SCOUT.dark};
        }

        .update-type {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .update-district {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .update-district.national {
          background: ${SCOUT.gold}30;
          color: #8D6E00;
        }

        .update-date {
          font-size: 0.8rem;
          color: ${SCOUT.gray};
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .update-message {
          margin: 8px 0 0 0;
          color: ${SCOUT.gray};
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .update-author {
          margin-top: 8px;
          font-size: 0.85rem;
          color: ${SCOUT.gray};
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .badge-approved {
          background: ${SCOUT.green}20;
          color: ${SCOUT.green};
        }

        .badge-pending {
          background: ${SCOUT.warning}20;
          color: ${SCOUT.warning};
        }

        .badge-rejected {
          background: ${SCOUT.danger}20;
          color: ${SCOUT.danger};
        }

        .badge-submitted {
          background: ${SCOUT.blue}20;
          color: ${SCOUT.blue};
        }

        .badge-published {
          background: ${SCOUT.purple}20;
          color: ${SCOUT.purple};
        }

        .badge-completed {
          background: ${SCOUT.green}20;
          color: ${SCOUT.green};
        }

        .badge-forwarded {
          background: ${SCOUT.purple}20;
          color: ${SCOUT.purple};
        }

        .badge-archived {
          background: ${SCOUT.lightBg};
          color: ${SCOUT.gray};
        }

        .badge-default {
          background: ${SCOUT.lightBg};
          color: ${SCOUT.gray};
        }

        .report-type-badge {
          margin-top: 8px;
        }

        .report-type {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .report-type.general {
          background: ${SCOUT.lightBg};
          color: ${SCOUT.gray};
        }

        .report-type.activity {
          background: ${SCOUT.green}20;
          color: ${SCOUT.green};
        }

        .report-type.financial {
          background: ${SCOUT.gold}30;
          color: #8D6E00;
        }

        .report-type.annual {
          background: ${SCOUT.purple}20;
          color: ${SCOUT.purple};
        }

        .report-type.national {
          background: ${SCOUT.blue}20;
          color: ${SCOUT.blue};
        }

        .update-link {
          display: inline-block;
          margin-top: 8px;
          color: ${SCOUT.purple};
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .update-link:hover {
          color: #8E24AA;
          transform: translateX(4px);
        }

        .update-link i {
          margin-left: 4px;
          transition: transform 0.2s ease;
        }

        .update-link:hover i {
          transform: translateX(4px);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid ${SCOUT.border};
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 16px;
          color: ${SCOUT.border};
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: ${SCOUT.dark};
        }

        .empty-state p {
          margin: 0 0 16px 0;
          color: ${SCOUT.gray};
        }

        .btn-primary {
          background: ${SCOUT.purple};
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-primary:hover {
          opacity: 0.85;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(106, 27, 154, 0.35);
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

        .alert-error i {
          color: ${SCOUT.danger};
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
          padding: 0 8px;
        }

        .alert-close:hover {
          opacity: 1;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: ${SCOUT.gray};
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid ${SCOUT.border};
          border-top: 4px solid ${SCOUT.purple};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-spinner p {
          margin-top: 12px;
        }

        @media (max-width: 768px) {
          .update-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .update-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .update-date {
            white-space: normal;
          }

          .filter-bar {
            flex-wrap: wrap;
          }

          .stats-info {
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }

          .page-header {
            padding: 16px 20px;
          }

          .page-header h2 {
            font-size: 1.2rem;
          }

          .page-header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-submit-report {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Updates;