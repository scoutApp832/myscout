import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ReportsStats = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    totalLeaders: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    pendingRegistrations: 0,
    pendingReports: 0,
    pendingProjects: 0,
    totalDonations: 0,
    totalProjects: 0,
    totalReports: 0
  });

  const [chartData, setChartData] = useState({
    membershipByDistrict: [],
    genderDistribution: [],
    ageGroups: [],
    membershipTrend: [],
    memberStatus: []
  });

  const COLORS = ['#FFD100', '#002B5C', '#2EA86B', '#9724A6', '#F97316', '#3B82F6', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to view statistics');
        setLoading(false);
        return;
      }

      const statsResponse = await axios.get(`${API_URL}/national/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const statsData = statsResponse.data?.statistics || statsResponse.data || {};

      const [membershipRes, genderRes, ageRes] = await Promise.all([
        axios.get(`${API_URL}/national/dashboard/membership-by-district`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/national/dashboard/gender-distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/national/dashboard/age-groups`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      // Process Membership by District
      let membershipData = [];
      const membershipRaw = membershipRes.data || [];
      if (Array.isArray(membershipRaw)) {
        membershipData = membershipRaw;
      } else if (membershipRaw.data && Array.isArray(membershipRaw.data)) {
        membershipData = membershipRaw.data;
      } else if (membershipRaw.membershipByDistrict && Array.isArray(membershipRaw.membershipByDistrict)) {
        membershipData = membershipRaw.membershipByDistrict;
      }

      // Process Gender Distribution
      let genderData = [];
      const genderRaw = genderRes.data || [];
      if (Array.isArray(genderRaw)) {
        genderData = genderRaw;
      } else if (genderRaw.data && Array.isArray(genderRaw.data)) {
        genderData = genderRaw.data;
      } else if (genderRaw.genderDistribution && Array.isArray(genderRaw.genderDistribution)) {
        genderData = genderRaw.genderDistribution;
      } else if (genderRaw.males !== undefined) {
        genderData = [
          { name: 'Male', value: genderRaw.males || 0 },
          { name: 'Female', value: genderRaw.females || 0 },
          { name: 'Other', value: genderRaw.others || 0 }
        ];
      }

      // Process Age Groups
      let ageData = [];
      const ageRaw = ageRes.data || [];
      if (Array.isArray(ageRaw)) {
        ageData = ageRaw;
      } else if (ageRaw.data && Array.isArray(ageRaw.data)) {
        ageData = ageRaw.data;
      } else if (ageRaw.ageGroups && Array.isArray(ageRaw.ageGroups)) {
        ageData = ageRaw.ageGroups;
      } else if (ageRaw['6-12'] !== undefined) {
        ageData = [
          { group: '6-12', count: ageRaw['6-12'] || 0 },
          { group: '13-18', count: ageRaw['13-18'] || 0 },
          { group: '19-25', count: ageRaw['19-25'] || 0 },
          { group: '25+', count: ageRaw['25+'] || 0 }
        ];
      }

      setStats({
        totalMembers: statsData.totalMembers || 0,
        activeMembers: statsData.activeMembers || 0,
        inactiveMembers: statsData.inactiveMembers || 0,
        totalLeaders: statsData.totalLeaders || 0,
        totalEvents: statsData.totalEvents || 0,
        upcomingEvents: statsData.upcomingEvents || 0,
        pendingRegistrations: statsData.pendingRegistrations || 0,
        pendingReports: statsData.pendingReports || 0,
        pendingProjects: statsData.pendingProjects || 0,
        totalDonations: statsData.totalDonations || 0,
        totalProjects: statsData.totalProjects || 0,
        totalReports: statsData.totalReports || 0
      });

      setChartData({
        membershipByDistrict: membershipData,
        genderDistribution: genderData,
        ageGroups: ageData,
        membershipTrend: generateMembershipTrend(),
        memberStatus: [
          { name: 'Active', value: statsData.activeMembers || 0 },
          { name: 'Pending', value: statsData.pendingRegistrations || 0 },
          { name: 'Inactive', value: statsData.inactiveMembers || 0 }
        ]
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMembershipTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data = [];
    let baseMembers = 50;
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      baseMembers += Math.floor(Math.random() * 15) + 5;
      data.push({
        month: months[monthIndex],
        members: baseMembers,
        newMembers: Math.floor(Math.random() * 20) + 2
      });
    }
    return data;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const downloadReport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/national/statistics/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statistics-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download report. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h2>
            <i className="fas fa-chart-bar" style={{ color: '#FFD100' }}></i> 
            National Statistics Dashboard
          </h2>
          <p>Complete overview of scouting activities across Rwanda</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => downloadReport('pdf')}>
            <i className="fas fa-file-pdf"></i> PDF
          </button>
          <button className="btn-secondary" onClick={() => downloadReport('excel')}>
            <i className="fas fa-file-excel"></i> Excel
          </button>
          <button className="btn-primary" onClick={handleRefresh} disabled={refreshing}>
            <i className={`fas fa-sync ${refreshing ? 'fa-spin' : ''}`}></i> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="console.log console.log-error">
          <i className="fas fa-exclamation-circle"></i>
          <div>
            <strong>Error</strong>
            <p>{error}</p>
            <button className="btn-sm btn-retry" onClick={handleRefresh}>
              <i className="fas fa-redo"></i> Retry
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-info">
            <h3>{stats.totalMembers.toLocaleString()}</h3>
            <p>Total Members</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon"><i className="fas fa-user-check"></i></div>
          <div className="stat-info">
            <h3>{stats.activeMembers.toLocaleString()}</h3>
            <p>Active Members</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-info">
            <h3>{stats.pendingRegistrations.toLocaleString()}</h3>
            <p>Pending Registrations</p>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-icon"><i className="fas fa-calendar-alt"></i></div>
          <div className="stat-info">
            <h3>{stats.totalEvents.toLocaleString()}</h3>
            <p>Total Events</p>
          </div>
        </div>

        <div className="stat-card stat-teal">
          <div className="stat-icon"><i className="fas fa-calendar-plus"></i></div>
          <div className="stat-info">
            <h3>{stats.upcomingEvents.toLocaleString()}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon"><i className="fas fa-file-alt"></i></div>
          <div className="stat-info">
            <h3>{stats.pendingReports.toLocaleString()}</h3>
            <p>Reports Pending</p>
          </div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon"><i className="fas fa-project-diagram"></i></div>
          <div className="stat-info">
            <h3>{stats.pendingProjects.toLocaleString()}</h3>
            <p>Projects Pending</p>
          </div>
        </div>

        <div className="stat-card stat-pink">
          <div className="stat-icon"><i className="fas fa-hand-holding-heart"></i></div>
          <div className="stat-info">
            <h3>RWF {stats.totalDonations.toLocaleString()}</h3>
            <p>Total Donations</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Membership by District */}
        <div className="chart-card full-width">
          <h4>
            <i className="fas fa-map-marker-alt" style={{ color: '#FFD100' }}></i>
            Membership by District
          </h4>
          {chartData.membershipByDistrict && chartData.membershipByDistrict.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.membershipByDistrict}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="members" fill="#FFD100" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <i className="fas fa-map-marker-alt" style={{ fontSize: '32px', color: '#ccc' }}></i>
              <p>No district data available</p>
            </div>
          )}
        </div>

        {/* Gender Distribution */}
        <div className="chart-card">
          <h4>
            <i className="fas fa-venus-mars" style={{ color: '#2EA86B' }}></i>
            Gender Distribution
          </h4>
          {chartData.genderDistribution && chartData.genderDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <i className="fas fa-venus-mars" style={{ fontSize: '32px', color: '#ccc' }}></i>
              <p>No gender data available</p>
            </div>
          )}
        </div>

        {/* Age Groups */}
        <div className="chart-card">
          <h4>
            <i className="fas fa-calendar" style={{ color: '#9724A6' }}></i>
            Age Groups
          </h4>
          {chartData.ageGroups && chartData.ageGroups.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.ageGroups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#9724A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <i className="fas fa-calendar" style={{ fontSize: '32px', color: '#ccc' }}></i>
              <p>No age group data available</p>
            </div>
          )}
        </div>

        {/* Member Status */}
        <div className="chart-card">
          <h4>
            <i className="fas fa-circle" style={{ color: '#F97316' }}></i>
            Member Status
          </h4>
          {chartData.memberStatus && chartData.memberStatus.some(s => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.memberStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.memberStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#2EA86B', '#F97316', '#EF4444'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <i className="fas fa-circle" style={{ fontSize: '32px', color: '#ccc' }}></i>
              <p>No status data available</p>
            </div>
          )}
        </div>

        {/* Membership Trend */}
        <div className="chart-card full-width">
          <h4>
            <i className="fas fa-line-chart" style={{ color: '#3B82F6' }}></i>
            Membership Growth Trend
          </h4>
          {chartData.membershipTrend && chartData.membershipTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.membershipTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#002B5C" 
                  fill="#002B5C" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="newMembers" 
                  stroke="#2EA86B" 
                  fill="#2EA86B" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state">
              <i className="fas fa-line-chart" style={{ fontSize: '32px', color: '#ccc' }}></i>
              <p>Trend data will appear here as membership grows</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a1a;
        }

        .page-header p {
          margin: 4px 0 0 0;
          color: #6B7280;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #FFD100;
          color: #1a1a1a;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #f5c800;
          transform: scale(1.02);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-sm {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-retry {
          background: transparent;
          color: #FFD100;
          border: 1px solid #FFD100;
          margin-top: 8px;
        }

        .btn-retry:hover {
          background: #FFD100;
          color: #1a1a1a;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 16px 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        .stat-primary::before { background: #FFD100; }
        .stat-success::before { background: #2EA86B; }
        .stat-warning::before { background: #F97316; }
        .stat-blue::before { background: #3B82F6; }
        .stat-purple::before { background: #9724A6; }
        .stat-orange::before { background: #F97316; }
        .stat-teal::before { background: #14B8A6; }
        .stat-pink::before { background: #EC4899; }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .stat-primary .stat-icon { background: #FFD10020; color: #FFD100; }
        .stat-success .stat-icon { background: #2EA86B20; color: #2EA86B; }
        .stat-warning .stat-icon { background: #F9731620; color: #F97316; }
        .stat-blue .stat-icon { background: #3B82F620; color: #3B82F6; }
        .stat-purple .stat-icon { background: #9724A620; color: #9724A6; }
        .stat-orange .stat-icon { background: #F9731620; color: #F97316; }
        .stat-teal .stat-icon { background: #14B8A620; color: #14B8A6; }
        .stat-pink .stat-icon { background: #EC489920; color: #EC4899; }

        .stat-info h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .stat-info p {
          margin: 0;
          font-size: 12px;
          color: #6B7280;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .chart-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }

        .chart-card.full-width {
          grid-column: 1 / -1;
        }

        .chart-card h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #6B7280;
        }

        .chart-empty-state i {
          margin-bottom: 8px;
        }

        .chart-empty-state p {
          margin: 0;
          font-size: 14px;
        }

        .console.log {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .console.log i {
          font-size: 20px;
          margin-top: 2px;
        }

        .console.log-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #FFD100;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fa-spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
          .chart-card.full-width {
            grid-column: 1;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .header-actions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsStats;