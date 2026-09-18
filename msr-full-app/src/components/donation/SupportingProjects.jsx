import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

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

const SupportingProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [projectsRes, eventsRes] = await Promise.all([
        axios.get(`${API_URL}/donation/projects/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/donation/events`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const projectsData = projectsRes.data;
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects || []);
      
      const eventsData = eventsRes.data;
      setEvents(Array.isArray(eventsData) ? eventsData : eventsData.events || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading projects...</div>;

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="page-header">
        <h2>
          <i className="fas fa-hands-helping" style={{ color: SCOUT.purple }}></i> 
          Support Projects & Events
        </h2>
        <p>Browse and support scouting initiatives</p>
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

      {/* Projects Section */}
      <h3 className="section-title">
        <span className="title-icon" style={{ background: SCOUT.purple }}>
          <i className="fas fa-project-diagram"></i>
        </span>
        Projects Seeking Support
      </h3>
      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-project-diagram" style={{ color: SCOUT.gray }}></i>
            <h3>No Projects Available</h3>
            <p>Check back later for new projects</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h4>{project.title}</h4>
                <span className="project-status status-active">Active</span>
              </div>
              <div className="project-body">
                <p>{project.description || 'No description available'}</p>
                <div className="project-meta">
                  <span><i className="fas fa-map-marker-alt"></i> {project.location || 'TBD'}</span>
                  <span><i className="fas fa-calendar"></i> {project.deadline || 'Ongoing'}</span>
                </div>
                <div className="progress-seats">
                  <div className="label">
                    RWF {project.raised?.toLocaleString() || 0} / RWF {project.goal?.toLocaleString() || 0} Funded
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ 
                      width: `${Math.min((project.raised / project.goal) * 100, 100)}%`,
                      background: SCOUT.green
                    }}></div>
                  </div>
                </div>
              </div>
              <div className="project-actions">
                <Link 
                  to="/payment" 
                  className="btn-primary"
                  style={{ background: SCOUT.purple }}
                  state={{ 
                    projectId: project.id, 
                    projectTitle: project.title,
                    amount: project.goal
                  }}
                >
                  <i className="fas fa-hand-holding-heart"></i> Support This Project
                </Link>
                <Link to={`/projects/${project.id}`} className="btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Events Section - Sponsorship */}
      <h3 className="section-title">
        <span className="title-icon" style={{ background: SCOUT.gold, color: SCOUT.dark }}>
          <i className="fas fa-calendar-alt"></i>
        </span>
        Events Seeking Sponsorship
      </h3>
      <div className="events-grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-alt" style={{ color: SCOUT.gray }}></i>
            <h3>No Events Available</h3>
            <p>Check back later for new sponsorship opportunities</p>
          </div>
        ) : (
          events.filter(event => event.accept_sponsorship !== false).map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h4>{event.title}</h4>
                <span className="event-status status-sponsorship">
                  <i className="fas fa-hand-holding-heart"></i> Sponsorship Open
                </span>
              </div>
              <div className="event-details">
                <p><i className="fas fa-calendar-day"></i> {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD'}</p>
                <p><i className="fas fa-map-marker-alt"></i> {event.location || 'TBD'}</p>
                <p><i className="fas fa-users"></i> {event.participants || 0} Participants</p>
                <p><i className="fas fa-money-bill"></i> Sponsorship Goal: RWF {event.sponsorship_goal?.toLocaleString() || 0}</p>
                {event.sponsorship_message && (
                  <p className="sponsorship-message">
                    <i className="fas fa-quote-left"></i> {event.sponsorship_message}
                  </p>
                )}
                <div className="progress-seats">
                  <div className="label">
                    RWF {event.sponsorship_raised?.toLocaleString() || 0} / RWF {event.sponsorship_goal?.toLocaleString() || 0} Raised
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ 
                      width: `${Math.min((event.sponsorship_raised / event.sponsorship_goal) * 100, 100)}%`,
                      background: SCOUT.gold
                    }}></div>
                  </div>
                </div>
              </div>
              <div className="event-actions">
                <Link 
                  to="/payment" 
                  className="btn-primary"
                  style={{ background: SCOUT.purple }}
                  state={{ 
                    eventId: event.id, 
                    eventTitle: event.title,
                    sponsorshipGoal: event.sponsorship_goal,
                    isSponsorship: true
                  }}
                >
                  <i className="fas fa-hand-holding-heart"></i> Sponsor This Event
                </Link>
                <Link to={`/events/${event.id}`} className="btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

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
          margin: 0;
          color: rgba(255,255,255,0.85);
        }

        .section-title {
          margin: 24px 0 16px 0;
          color: ${SCOUT.dark};
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          font-size: 0.9rem;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: ${SCOUT.border};
        }

        .projects-grid,
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .project-card,
        .event-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid ${SCOUT.border};
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .project-card:hover,
        .event-card:hover {
          box-shadow: 0 4px 16px rgba(106, 27, 154, 0.15);
          transform: translateY(-3px);
          border-color: ${SCOUT.purple}40;
        }

        .project-header,
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .project-header h4,
        .event-header h4 {
          margin: 0;
          color: ${SCOUT.dark};
          font-size: 1.1rem;
          flex: 1;
        }

        .project-status,
        .event-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
          margin-left: 8px;
        }

        .status-active {
          background: ${SCOUT.green}20;
          color: ${SCOUT.green};
        }

        .status-inactive {
          background: #f3f4f6;
          color: ${SCOUT.gray};
        }

        .status-sponsorship {
          background: ${SCOUT.gold}30;
          color: #8D6E00;
        }

        .project-body p,
        .event-details p {
          margin: 4px 0;
          color: ${SCOUT.gray};
          font-size: 0.9rem;
        }

        .sponsorship-message {
          font-style: italic;
          background: ${SCOUT.gold}15;
          padding: 10px 14px;
          border-radius: 8px;
          margin: 8px 0 !important;
          color: ${SCOUT.dark} !important;
          border-left: 3px solid ${SCOUT.gold};
        }

        .project-meta {
          display: flex;
          gap: 12px;
          font-size: 0.85rem;
          color: ${SCOUT.gray};
          margin: 8px 0;
        }

        .project-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .progress-seats {
          margin: 12px 0;
        }

        .progress-seats .label {
          font-size: 0.85rem;
          color: ${SCOUT.gray};
          margin-bottom: 4px;
        }

        .progress-seats .bar {
          width: 100%;
          height: 8px;
          background: ${SCOUT.border};
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-seats .fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .project-actions,
        .event-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid ${SCOUT.border};
        }

        .project-actions .btn-primary,
        .event-actions .btn-primary {
          flex: 1;
        }

        .btn-primary {
          background: ${SCOUT.purple};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-primary:hover {
          opacity: 0.85;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(106, 27, 154, 0.35);
        }

        .btn-secondary {
          background: ${SCOUT.lightBg};
          color: ${SCOUT.dark};
          border: 1px solid ${SCOUT.border};
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-secondary:hover {
          background: ${SCOUT.border};
          border-color: ${SCOUT.gray};
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: ${SCOUT.gray};
          background: white;
          border-radius: 12px;
          border: 1px solid ${SCOUT.border};
        }

        .empty-state i {
          font-size: 2.5rem;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 4px 0;
          color: ${SCOUT.dark};
        }

        .empty-state p {
          margin: 0;
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

        .alert-success {
          background: ${SCOUT.green}15;
          color: ${SCOUT.green};
          border: 1px solid ${SCOUT.green}30;
        }

        .alert-success i {
          color: ${SCOUT.green};
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
          justify-content: center;
          align-items: center;
          min-height: 200px;
          color: ${SCOUT.gray};
          font-size: 1.1rem;
        }

        .loading-spinner::before {
          content: '';
          width: 32px;
          height: 32px;
          border: 4px solid ${SCOUT.border};
          border-top: 4px solid ${SCOUT.purple};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .projects-grid,
          .events-grid {
            grid-template-columns: 1fr;
          }

          .project-actions,
          .event-actions {
            flex-direction: column;
          }

          .project-actions .btn-primary,
          .event-actions .btn-primary {
            flex: none;
          }

          .page-header {
            padding: 16px 20px;
          }

          .page-header h2 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SupportingProjects;