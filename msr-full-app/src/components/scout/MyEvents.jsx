// src/components/scout/MyEvents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Scout Color Scheme
const SCOUT_COLORS = {
  purple: '#4B2E83',
  green: '#2E7D32',
  khaki: '#C2B280',
  gold: '#FFC107',
  white: '#FFFFFF',
  darkBlue: '#0D47A1',
  red: '#D32F2F'
};

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view events');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/scout/events?filter=all&t=${Date.now()}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          } 
        }
      );

      console.log('📊 Events response:', response.data);

      let eventsData = [];
      if (response.data?.success) {
        eventsData = response.data.events || [];
      } else if (Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response.data?.data) {
        eventsData = response.data.data;
      }

      console.log('📊 Events count:', eventsData.length);
      
      const processedEvents = (Array.isArray(eventsData) ? eventsData : []).map(event => ({
        ...event,
        id: event.id,
        title: event.title || 'Untitled Event',
        description: event.description || 'No description available',
        start_date: event.start_date,
        end_date: event.end_date || event.start_date,
        location: event.location || event.venue || 'Location TBD',
        venue: event.venue || event.location || 'Location TBD',
        status: event.status || 'pending',
        isRegistered: event.isRegistered || false,
        price: event.price || 0,
        event_type: event.event_type || 'general',
        district_level: event.district_level || 'district',
        capacity: event.capacity || 0,
        registered_count: event.registered_count || 0,
        organizer: event.organizer || 'Scout Association',
        image_url: event.image_url || null,
        eventState: getEventState(event),
        color: getEventColor(event.event_type),
        icon: getEventIcon(event.event_type)
      }));

      setEvents(processedEvents);
      
    } catch (err) {
      console.error('❌ Fetch events error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view events.');
      } else {
        setError(err.response?.data?.message || 'Failed to load events');
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventState = (event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || event.start_date);

    if (event.status === 'cancelled' || event.status === 'canceled') {
      return 'cancelled';
    }
    if (event.status === 'pending' || event.status === 'draft') {
      return 'pending';
    }
    if (endDate < now) {
      return 'past';
    }
    if (startDate <= now && endDate >= now) {
      return 'ongoing';
    }
    if (startDate > now) {
      return 'upcoming';
    }
    return 'pending';
  };

  const getEventIcon = (eventType) => {
    const icons = {
      'training': 'fa-graduation-cap',
      'community': 'fa-hand-holding-heart',
      'general': 'fa-calendar-check',
      'camp': 'fa-campground',
      'workshop': 'fa-chalkboard-teacher',
      'sports': 'fa-running',
      'certification': 'fa-medal',
      'social': 'fa-users',
      'fundraising': 'fa-hand-holding-usd',
      'environmental': 'fa-leaf',
      'education': 'fa-book',
      'health': 'fa-heartbeat',
      'cultural': 'fa-music',
      'leadership': 'fa-star',
      'adventure': 'fa-mountain'
    };
    return icons[eventType?.toLowerCase()] || 'fa-calendar-check';
  };

  const getEventColor = (eventType) => {
    const colors = {
      'training': SCOUT_COLORS.purple,
      'community': SCOUT_COLORS.green,
      'general': SCOUT_COLORS.gold,
      'camp': SCOUT_COLORS.green,
      'workshop': SCOUT_COLORS.darkBlue,
      'sports': SCOUT_COLORS.red,
      'certification': SCOUT_COLORS.gold,
      'social': SCOUT_COLORS.purple,
      'fundraising': SCOUT_COLORS.gold,
      'environmental': SCOUT_COLORS.green,
      'education': SCOUT_COLORS.darkBlue,
      'health': SCOUT_COLORS.red,
      'cultural': SCOUT_COLORS.purple,
      'leadership': SCOUT_COLORS.gold,
      'adventure': SCOUT_COLORS.green
    };
    return colors[eventType?.toLowerCase()] || SCOUT_COLORS.purple;
  };

  // ✅ Register for free event
  const registerForEvent = async (eventId) => {
    try {
      setRegistering(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to register');
        return;
      }

      await axios.post(
        `${API_URL}/scout/events/${eventId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('✅ Successfully registered for the event!');
      setShowRegistrationModal(false);
      setSelectedEvent(null);
      
      await fetchEvents();
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  // ✅ Handle Pay - Redirect to payment page
  const handlePay = (event) => {
    navigate('/payment', {
      state: {
        eventId: event.id,
        eventName: event.title,
        eventPrice: event.price,
        eventLevel: event.district_level || 'District',
        eventCategory: event.event_type || 'event',
        eventLocation: event.location,
        eventStartDate: event.start_date,
        eventEndDate: event.end_date,
        isEvent: true
      }
    });
  };

  // ✅ Handle Register - Opens registration modal
  const handleRegister = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
    setError('');
  };

  // ✅ Cancel registration
  const cancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/scout/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchEvents();
      setSuccessMessage('❌ Registration cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      console.error('❌ Cancel registration error:', err);
      setError(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const getBadgeClass = (eventState, isRegistered) => {
    if (isRegistered) return 'badge-approved';
    if (eventState === 'cancelled') return 'badge-rejected';
    if (eventState === 'past') return 'badge-rejected';
    if (eventState === 'ongoing') return 'badge-progress';
    if (eventState === 'upcoming') return 'badge-pending';
    if (eventState === 'pending') return 'badge-pending';
    return 'badge-default';
  };

  const getEventLabel = (eventState, isRegistered) => {
    if (isRegistered) return '✅ Registered';
    if (eventState === 'cancelled') return '❌ Cancelled';
    if (eventState === 'past') return '📅 Ended';
    if (eventState === 'ongoing') return '🔄 Ongoing';
    if (eventState === 'upcoming') return '📅 Upcoming';
    if (eventState === 'pending') return '⏳ Pending';
    return '📋 Available';
  };

  const canRegister = (eventState, isRegistered) => {
    if (isRegistered) return false;
    if (eventState === 'cancelled') return false;
    if (eventState === 'past') return false;
    if (eventState === 'pending') return true;
    if (eventState === 'upcoming') return true;
    if (eventState === 'ongoing') return true;
    return false;
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Free';
    return `${amount.toLocaleString()} RWF`;
  };

  const getFilteredEvents = () => {
    const now = new Date();
    
    return events.filter(event => {
      const eventState = getEventState(event);
      const isRegistered = event.isRegistered || false;

      switch (filter) {
        case 'all': return true;
        case 'registered': return isRegistered;
        case 'available': return !isRegistered && eventState !== 'cancelled' && eventState !== 'past';
        case 'upcoming': return eventState === 'upcoming' && !isRegistered;
        case 'ongoing': return eventState === 'ongoing' && !isRegistered;
        case 'past': return eventState === 'past' || (new Date(event.end_date || event.start_date) < now);
        case 'cancelled': return eventState === 'cancelled';
        case 'pending': return eventState === 'pending';
        case 'paid': return event.price > 0;
        case 'free': return event.price === 0 || !event.price;
        default: return true;
      }
    });
  };

  const filteredEvents = getFilteredEvents();

  const eventCounts = {
    all: events.length,
    registered: events.filter(e => e.isRegistered).length,
    available: events.filter(e => !e.isRegistered && getEventState(e) !== 'cancelled' && getEventState(e) !== 'past').length,
    upcoming: events.filter(e => getEventState(e) === 'upcoming' && !e.isRegistered).length,
    ongoing: events.filter(e => getEventState(e) === 'ongoing' && !e.isRegistered).length,
    past: events.filter(e => getEventState(e) === 'past' || new Date(e.end_date || e.start_date) < new Date()).length,
    cancelled: events.filter(e => getEventState(e) === 'cancelled').length,
    pending: events.filter(e => getEventState(e) === 'pending').length,
    paid: events.filter(e => e.price > 0).length,
    free: events.filter(e => e.price === 0 || !e.price).length
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button className="btn-retry-sm" onClick={fetchEvents}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="page-header" style={{ borderBottom: `4px solid ${SCOUT_COLORS.gold}` }}>
        <div>
          <h2 style={{ color: SCOUT_COLORS.purple }}>
            <i className="fas fa-calendar-alt" style={{ color: SCOUT_COLORS.gold }}></i> My Events
          </h2>
          <p style={{ color: SCOUT_COLORS.darkBlue }}>Browse and register for upcoming events</p>
        </div>
        <div className="header-actions">
          <span className="badge badge-approved" style={{ backgroundColor: SCOUT_COLORS.green }}>
            <i className="fas fa-check-circle"></i> 
            {eventCounts.registered} Registered
          </span>
          <span className="badge badge-pending" style={{ backgroundColor: SCOUT_COLORS.gold, color: '#333' }}>
            <i className="fas fa-clock"></i> 
            {eventCounts.upcoming} Upcoming
          </span>
          <span className="badge badge-progress" style={{ backgroundColor: SCOUT_COLORS.purple }}>
            <i className="fas fa-play"></i> 
            {eventCounts.ongoing} Ongoing
          </span>
          <span className="badge badge-info" style={{ backgroundColor: SCOUT_COLORS.darkBlue }}>
            <i className="fas fa-coins"></i> 
            {eventCounts.paid} Paid
          </span>
          <button className="btn-secondary-sm" onClick={fetchEvents} style={{ borderColor: SCOUT_COLORS.gold, color: SCOUT_COLORS.purple }}>
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ backgroundColor: '#d4edda', borderColor: SCOUT_COLORS.green, color: '#155724' }}>
          <i className="fas fa-check-circle"></i>
          <p>{successMessage}</p>
          <button className="btn-close" onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      <div className="filter-bar" style={{ backgroundColor: SCOUT_COLORS.white, borderBottom: `2px solid ${SCOUT_COLORS.khaki}` }}>
        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={filter === 'all' ? { backgroundColor: SCOUT_COLORS.purple, color: SCOUT_COLORS.white } : {}}
          >
            All ({eventCounts.all})
          </button>
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
            style={filter === 'available' ? { backgroundColor: SCOUT_COLORS.purple, color: SCOUT_COLORS.white } : {}}
          >
            Available ({eventCounts.available})
          </button>
          <button 
            className={`filter-btn ${filter === 'registered' ? 'active' : ''}`}
            onClick={() => setFilter('registered')}
            style={filter === 'registered' ? { backgroundColor: SCOUT_COLORS.purple, color: SCOUT_COLORS.white } : {}}
          >
            Registered ({eventCounts.registered})
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
            style={filter === 'upcoming' ? { backgroundColor: SCOUT_COLORS.purple, color: SCOUT_COLORS.white } : {}}
          >
            Upcoming ({eventCounts.upcoming})
          </button>
          <button 
            className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setFilter('ongoing')}
            style={filter === 'ongoing' ? { backgroundColor: SCOUT_COLORS.purple, color: SCOUT_COLORS.white } : {}}
          >
            Ongoing ({eventCounts.ongoing})
          </button>
          <button 
            className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
            onClick={() => setFilter('paid')}
            style={filter === 'paid' ? { backgroundColor: SCOUT_COLORS.gold, color: '#333' } : {}}
          >
            <i className="fas fa-coins"></i> Paid ({eventCounts.paid})
          </button>
          <button 
            className={`filter-btn ${filter === 'free' ? 'active' : ''}`}
            onClick={() => setFilter('free')}
            style={filter === 'free' ? { backgroundColor: SCOUT_COLORS.green, color: SCOUT_COLORS.white } : {}}
          >
            <i className="fas fa-gift"></i> Free ({eventCounts.free})
          </button>
          <button 
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
            style={filter === 'past' ? { backgroundColor: SCOUT_COLORS.darkBlue, color: SCOUT_COLORS.white } : {}}
          >
            Past ({eventCounts.past})
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
            style={filter === 'cancelled' ? { backgroundColor: SCOUT_COLORS.red, color: SCOUT_COLORS.white } : {}}
          >
            Cancelled ({eventCounts.cancelled})
          </button>
        </div>
        <span className="filter-count" style={{ color: SCOUT_COLORS.purple }}>
          {filteredEvents.length} events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-plus" style={{ fontSize: '48px', color: SCOUT_COLORS.khaki }}></i>
          <h3 style={{ color: SCOUT_COLORS.darkBlue }}>No Events Available</h3>
          <p style={{ color: SCOUT_COLORS.purple }}>Check back later for upcoming events.</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-filter" style={{ fontSize: '48px', color: SCOUT_COLORS.khaki }}></i>
          <h3 style={{ color: SCOUT_COLORS.darkBlue }}>No Events Found</h3>
          <p style={{ color: SCOUT_COLORS.purple }}>Try changing your filter settings.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => {
            const isRegistered = event?.isRegistered || false;
            const eventState = getEventState(event);
            const badgeClass = getBadgeClass(eventState, isRegistered);
            const eventLabel = getEventLabel(eventState, isRegistered);
            const canRegisterNow = canRegister(eventState, isRegistered);
            const hasPrice = event.price > 0;
            const eventColor = event.color || SCOUT_COLORS.purple;
            const isPast = eventState === 'past' || new Date(event.end_date || event.start_date) < new Date();

            return (
              <div 
                key={event?.id || Math.random()} 
                className={`event-card ${eventState}`}
                style={{ 
                  borderTop: `4px solid ${eventColor}`,
                  boxShadow: `0 2px 8px rgba(75, 46, 131, 0.1)`,
                  opacity: isPast ? 0.7 : 1
                }}
              >
                <div className="event-header">
                  <h4 style={{ color: SCOUT_COLORS.darkBlue }}>
                    <i className={`fas ${event.icon || 'fa-calendar-check'}`} style={{ color: eventColor, marginRight: '8px' }}></i>
                    {event?.title || 'Untitled Event'}
                  </h4>
                  <span className={`status-badge ${badgeClass}`}>
                    {eventLabel}
                  </span>
                </div>
                <div className="event-body">
                  <p className="event-description" style={{ color: '#555' }}>
                    {event?.description || 'No description available'}
                  </p>
                  
                  {/* ✅ Price Display */}
                  <div className="event-price" style={{ 
                    backgroundColor: hasPrice ? '#FFF8E1' : '#E8F5E9',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <span className={`price-tag ${hasPrice ? 'paid' : 'free'}`} style={{
                      fontWeight: 'bold',
                      color: hasPrice ? SCOUT_COLORS.gold : SCOUT_COLORS.green,
                      fontSize: '16px'
                    }}>
                      <i className={`fas ${hasPrice ? 'fa-coins' : 'fa-gift'}`}></i>
                      {hasPrice ? formatCurrency(event.price) : 'FREE'}
                    </span>
                    {isPast && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: SCOUT_COLORS.red,
                        marginLeft: '8px',
                        fontWeight: 'bold'
                      }}>
                        (Event Ended)
                      </span>
                    )}
                  </div>

                  {eventState === 'ongoing' && (
                    <div className="event-status-indicators">
                      <span className="live-indicator" style={{ color: SCOUT_COLORS.red, fontWeight: 'bold' }}>🔴 LIVE</span>
                    </div>
                  )}
                  {eventState === 'upcoming' && (
                    <div className="event-status-indicators">
                      <span className="upcoming-indicator" style={{ color: SCOUT_COLORS.gold, fontWeight: 'bold' }}>📅 Coming Soon</span>
                    </div>
                  )}
                  {isRegistered && (
                    <div className="event-status-indicators">
                      <span className="registered-indicator" style={{ color: SCOUT_COLORS.green, fontWeight: 'bold' }}>✅ You're registered</span>
                    </div>
                  )}
                  {isPast && (
                    <div className="event-status-indicators">
                      <span className="past-indicator" style={{ color: SCOUT_COLORS.red, fontWeight: 'bold' }}>📅 Event Ended</span>
                    </div>
                  )}

                  <div className="event-details" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '6px 12px',
                    fontSize: '14px',
                    color: '#555',
                    marginTop: '8px'
                  }}>
                    <p><i className="fas fa-calendar-day" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i> {event?.start_date ? new Date(event.start_date).toLocaleDateString() : 'Date TBD'}</p>
                    <p><i className="fas fa-clock" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i> {event?.start_date ? new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}</p>
                    <p><i className="fas fa-map-marker-alt" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i> {event?.location || event?.venue || 'Location TBD'}</p>
                    <p><i className="fas fa-tag" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i> {event?.event_type || 'General'}</p>
                    {event?.district_level && (
                      <p><i className="fas fa-flag" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i> {event.district_level === 'national' ? '🇷🇼 National' : '📍 District'}</p>
                    )}
                    {event?.capacity > 0 && (
                      <p><i className="fas fa-users" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i> {event?.registered_count || 0} / {event.capacity} spots</p>
                    )}
                  </div>

                  <div className="event-actions" style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {/* ✅ View Details - Always visible and enabled */}
                    <button 
                      className="btn-sm btn-view"
                      onClick={() => navigate(`/events/${event.id}`)}
                      style={{
                        backgroundColor: SCOUT_COLORS.khaki,
                        color: '#333',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        flex: '1',
                        minWidth: '80px'
                      }}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>

                    {/* ✅ For Past Events - All buttons disabled except View */}
                    {isPast ? (
                      <>
                        <button 
                          className="btn-sm btn-secondary"
                          disabled
                          style={{
                            backgroundColor: '#e0e0e0',
                            color: '#999',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            flex: '1',
                            minWidth: '80px',
                            cursor: 'not-allowed'
                          }}
                        >
                          <i className="fas fa-ban"></i> Ended
                        </button>
                        {hasPrice && (
                          <button 
                            className="btn-sm btn-secondary"
                            disabled
                            style={{
                              backgroundColor: '#e0e0e0',
                              color: '#999',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              flex: '1',
                              minWidth: '80px',
                              cursor: 'not-allowed'
                            }}
                          >
                            <i className="fas fa-credit-card"></i> Pay
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {/* ✅ For Paid Events - Show TWO separate buttons: Pay and Register */}
                        {canRegisterNow && !isRegistered && hasPrice && (
                          <>
                            <button 
                              className="btn-sm btn-pay"
                              onClick={() => handlePay(event)}
                              style={{
                                backgroundColor: SCOUT_COLORS.gold,
                                color: '#333',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                flex: '1',
                                minWidth: '100px',
                                fontWeight: 'bold'
                              }}
                            >
                              <i className="fas fa-credit-card"></i> Pay
                            </button>
                            <button 
                              className="btn-sm btn-enroll"
                              onClick={() => handleRegister(event)}
                              style={{
                                backgroundColor: SCOUT_COLORS.purple,
                                color: SCOUT_COLORS.white,
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                flex: '1',
                                minWidth: '100px',
                                fontWeight: 'bold'
                              }}
                            >
                              <i className="fas fa-plus"></i> Register
                            </button>
                          </>
                        )}

                        {/* ✅ For Free Events - Show Register Free button */}
                        {canRegisterNow && !isRegistered && !hasPrice && (
                          <button 
                            className="btn-sm btn-enroll"
                            onClick={() => handleRegister(event)}
                            style={{
                              backgroundColor: SCOUT_COLORS.green,
                              color: SCOUT_COLORS.white,
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              flex: '1',
                              minWidth: '120px',
                              fontWeight: 'bold'
                            }}
                          >
                            <i className="fas fa-plus"></i> Register Free
                          </button>
                        )}

                        {/* ✅ Cancel button */}
                        {isRegistered && (
                          <button 
                            className="btn-sm btn-delete"
                            onClick={() => cancelRegistration(event.id)}
                            style={{
                              backgroundColor: SCOUT_COLORS.red,
                              color: SCOUT_COLORS.white,
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              flex: '1',
                              minWidth: '80px'
                            }}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        )}

                        {/* ✅ Registration closed */}
                        {!canRegisterNow && !isRegistered && eventState !== 'cancelled' && eventState !== 'past' && (
                          <button 
                            className="btn-sm btn-secondary"
                            disabled
                            style={{
                              backgroundColor: '#e0e0e0',
                              color: '#999',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              flex: '1',
                              minWidth: '80px',
                              cursor: 'not-allowed'
                            }}
                          >
                            <i className="fas fa-lock"></i> Closed
                          </button>
                        )}

                        {/* ✅ Cancelled */}
                        {eventState === 'cancelled' && (
                          <button 
                            className="btn-sm btn-secondary"
                            disabled
                            style={{
                              backgroundColor: '#e0e0e0',
                              color: '#999',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              flex: '1',
                              minWidth: '80px',
                              cursor: 'not-allowed'
                            }}
                          >
                            <i className="fas fa-ban"></i> Cancelled
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => {
          setShowRegistrationModal(false);
          setSelectedEvent(null);
          setError('');
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: SCOUT_COLORS.white,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: `0 4px 20px rgba(75, 46, 131, 0.2)`
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `2px solid ${SCOUT_COLORS.khaki}`,
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: SCOUT_COLORS.purple }}>
                <i className="fas fa-calendar-plus" style={{ color: SCOUT_COLORS.gold }}></i> 
                Register for Event
              </h3>
              <button className="modal-close" onClick={() => {
                setShowRegistrationModal(false);
                setSelectedEvent(null);
                setError('');
              }} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: SCOUT_COLORS.purple
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <h4 style={{ color: SCOUT_COLORS.darkBlue }}>{selectedEvent.title}</h4>
              <p className="event-description" style={{ color: '#666', marginTop: '8px' }}>
                {selectedEvent.description || 'No description available'}
              </p>
              
              <div className="event-price-modal" style={{
                backgroundColor: selectedEvent.price > 0 ? '#FFF8E1' : '#E8F5E9',
                padding: '16px',
                borderRadius: '8px',
                margin: '16px 0',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Registration Fee</span>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  color: selectedEvent.price > 0 ? SCOUT_COLORS.gold : SCOUT_COLORS.green
                }}>
                  {selectedEvent.price > 0 ? formatCurrency(selectedEvent.price) : 'FREE'}
                </div>
                {selectedEvent.price > 0 && (
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Payment required. Click "Pay" button first, then register.
                  </p>
                )}
              </div>
              
              <div className="event-info-modal" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 16px',
                fontSize: '14px',
                color: '#555'
              }}>
                <div className="info-row">
                  <i className="fas fa-calendar-day" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i>
                  <span>{selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleDateString() : 'Date TBD'}</span>
                </div>
                <div className="info-row">
                  <i className="fas fa-clock" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i>
                  <span>{selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}</span>
                </div>
                <div className="info-row" style={{ gridColumn: 'span 2' }}>
                  <i className="fas fa-map-marker-alt" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i>
                  <span>{selectedEvent.location || selectedEvent.venue || 'Location TBD'}</span>
                </div>
                {selectedEvent.capacity > 0 && (
                  <div className="info-row" style={{ gridColumn: 'span 2' }}>
                    <i className="fas fa-users" style={{ color: SCOUT_COLORS.purple, width: '18px' }}></i>
                    <span>{selectedEvent.registeredCount || 0} / {selectedEvent.capacity} spots available</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="alert alert-error" style={{ 
                  marginTop: '12px',
                  backgroundColor: '#ffebee',
                  color: SCOUT_COLORS.red,
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}>
                  <i className="fas fa-exclamation-circle"></i>
                  <p style={{ margin: 0 }}>{error}</p>
                </div>
              )}
            </div>
            <div className="form-actions" style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${SCOUT_COLORS.khaki}`
            }}>
              <button className="btn-secondary" onClick={() => {
                setShowRegistrationModal(false);
                setSelectedEvent(null);
                setError('');
              }} style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#f5f5f5',
                border: `1px solid ${SCOUT_COLORS.khaki}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#333'
              }}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={() => registerForEvent(selectedEvent.id)}
                disabled={registering}
                style={{
                  flex: 2,
                  padding: '10px',
                  backgroundColor: selectedEvent.price > 0 ? SCOUT_COLORS.gold : SCOUT_COLORS.green,
                  color: selectedEvent.price > 0 ? '#333' : SCOUT_COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: registering ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: registering ? 0.7 : 1
                }}
              >
                {registering ? (
                  <><span className="spinner-small"></span> Processing...</>
                ) : (
                  <><i className="fas fa-check"></i> Confirm Registration</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;