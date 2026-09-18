// src/components/scout/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log(`📅 Fetching event ${id}...`);

      const response = await axios.get(`${API_URL}/scout/events/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      console.log('📊 Event response:', response.data);

      if (response.data?.success) {
        setEvent(response.data.event);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('❌ Fetch event error:', err);
      if (err.response?.status === 404) {
        setError('Event not found');
      } else if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load event');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_URL}/scout/events/${id}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchEvent();
      alert('✅ Successfully registered for the event!');
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      alert(err.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    
    try {
      setCancelling(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/scout/events/${id}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchEvent();
      alert('❌ Registration cancelled successfully');
      
    } catch (err) {
      console.error('❌ Cancel error:', err);
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error || 'Event not found'}</p>
          <button className="btn-secondary-sm" onClick={() => navigate('/my-events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="event-detail-page">
        <button className="btn-secondary-sm" onClick={() => navigate('/my-events')}>
          <i className="fas fa-arrow-left"></i> Back to Events
        </button>

        <div className="event-detail-card">
          <div className="event-detail-header">
            <h2>{event.title}</h2>
            <span className={`status-badge ${event.isRegistered ? 'badge-approved' : 'badge-pending'}`}>
              {event.isRegistered ? '✅ Registered' : 'Available'}
            </span>
          </div>

          <div className="event-detail-body">
            <div className="event-detail-info">
              <p className="event-detail-description">{event.description || 'No description available'}</p>
              
              <div className="event-detail-meta">
                <div className="meta-item">
                  <i className="fas fa-calendar-day"></i>
                  <span>Date: {new Date(event.start_date).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Time: {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Location: {event.location || event.venue || 'TBD'}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-info-circle"></i>
                  <span>Status: {event.status || 'Upcoming'}</span>
                </div>
                {event.capacity > 0 && (
                  <div className="meta-item">
                    <i className="fas fa-users"></i>
                    <span>Capacity: {event.registeredCount || 0} / {event.capacity}</span>
                  </div>
                )}
                {event.registration_deadline && (
                  <div className="meta-item">
                    <i className="fas fa-clock"></i>
                    <span>Registration Deadline: {new Date(event.registration_deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {event.registrationDetails && (
                <div className="event-detail-registration">
                  <h4>Registration Details</h4>
                  <p><strong>Status:</strong> {event.registrationDetails.status}</p>
                  <p><strong>Registered on:</strong> {new Date(event.registrationDetails.registration_date).toLocaleString()}</p>
                  {event.registrationDetails.payment_status && (
                    <p><strong>Payment:</strong> {event.registrationDetails.payment_status}</p>
                  )}
                </div>
              )}
            </div>

            <div className="event-detail-actions">
              {event.isRegistered ? (
                <button 
                  className="btn-delete"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              ) : (
                <button 
                  className="btn-primary"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register for Event'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;