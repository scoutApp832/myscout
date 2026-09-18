import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NationalEvents = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [districts, setDistricts] = useState([]);

  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Registration Modal State
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);
  const [registrationFilter, setRegistrationFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    venue: '',
    capacity: '',
    price: '0',
    registration_deadline: '',
    status: 'draft',
    event_type: 'general',
    category: 'general',
    audiences: [],
    resources: []
  });

  const audienceOptions = [
    {
      id: 'district-commissioners',
      label: 'District Commissioners'
    },
    {
      id: 'unit-leaders',
      label: 'Unit Leaders'
    },
    {
      id: 'all-scouts',
      label: 'All Scouts'
    },
    {
      id: 'public-website',
      label: 'Public Website'
    },
    {
      id: 'donors',
      label: 'Donors'
    }
  ];

  const eventTypes = [
    { value: 'general', label: 'General' },
    { value: 'training', label: 'Training' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'camp', label: 'Camp' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'competition', label: 'Competition' }
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'community', label: 'Community Service' },
    { value: 'training', label: 'Training' },
    { value: 'recreation', label: 'Recreation' }
  ];

  const registrationStatusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'approved', label: '✅ Approved' },
    { value: 'rejected', label: '❌ Rejected' },
    { value: 'cancelled', label: '🚫 Cancelled' }
  ];

  useEffect(() => {
    fetchEvents();
    fetchDistricts();
  }, []);

  // ============================================
  // FETCH NATIONAL EVENTS
  // ============================================
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
        `${API_URL}/national/events`,
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
      } else if (response.data?.events) {
        eventsData = response.data.events;
      }

      // Only show NATIONAL events
      if (Array.isArray(eventsData)) {
        eventsData = eventsData.filter(
          event =>
            event.scope === 'national' ||
            event.is_national === true
        );

        console.log(
          `📊 Filtered to ${eventsData.length} national events`
        );
      }

      setEvents(
        Array.isArray(eventsData)
          ? eventsData
          : []
      );
    } catch (err) {
      console.error('❌ Fetch events error:', err);

      if (err.response) {
        const status = err.response.status;

        if (status === 401) {
          setError('Session expired. Please login again.');
        } else if (status === 403) {
          setError(
            'You do not have permission to view events.'
          );
        } else if (status === 500) {
          setError(
            'Server error. Please try again later.'
          );
        } else {
          setError(
            err.response.data?.message ||
            'Failed to load events'
          );
        }
      } else if (err.request) {
        setError(
          'Unable to connect to server. Please check your network.'
        );
      } else {
        setError(
          'An unexpected error occurred.'
        );
      }

      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH DISTRICTS
  // ============================================
  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/national/districts`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const districtsData =
        response.data?.districts ||
        response.data ||
        [];

      setDistricts(
        Array.isArray(districtsData)
          ? districtsData
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load districts:',
        err
      );

      setDistricts([]);
    }
  };

  // ============================================
  // FETCH REGISTRATIONS
  // ============================================
  const fetchRegistrations = async (eventId) => {
    try {
      setRegistrationsLoading(true);

      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/national/events/${eventId}/registrations`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        '📊 Registrations response:',
        response.data
      );

      let registrationsData = [];

      if (response.data?.success) {
        registrationsData =
          response.data.registrations || [];
      } else if (response.data?.registrations) {
        registrationsData =
          response.data.registrations;
      } else if (Array.isArray(response.data)) {
        registrationsData =
          response.data;
      }

      setRegistrations(
        Array.isArray(registrationsData)
          ? registrationsData
          : []
      );
    } catch (err) {
      console.error(
        '❌ Fetch registrations error:',
        err
      );

      setRegistrations([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  // ============================================
  // OPEN REGISTRATIONS MODAL
  // ============================================
  const handleViewRegistrations = async (event) => {
    setSelectedEventForRegistrations(event);
    setShowRegistrationsModal(true);

    await fetchRegistrations(event.id);
  };

  // ============================================
  // UPDATE REGISTRATION STATUS
  // ============================================
  const handleUpdateRegistrationStatus = async (
    registrationId,
    status
  ) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/national/registrations/${registrationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess(
        `✅ Registration ${status} successfully!`
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);

      if (selectedEventForRegistrations) {
        await fetchRegistrations(
          selectedEventForRegistrations.id
        );
      }
    } catch (err) {
      console.error(
        '❌ Update registration error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to update registration'
      );

      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  // ============================================
  // CREATE NATIONAL EVENT
  // ============================================
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');

      if (
        !formData.title ||
        !formData.start_date ||
        !formData.location
      ) {
        setError(
          'Please fill in all required fields (Title, Date, Location)'
        );
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description || '',
        start_date: formData.start_date,
        end_date:
          formData.end_date ||
          formData.start_date,
        location: formData.location,
        venue:
          formData.venue ||
          formData.location,
        capacity:
          formData.capacity || null,
        price:
          parseFloat(formData.price) || 0,
        registration_deadline:
          formData.registration_deadline ||
          null,
        status:
          formData.status || 'draft',
        event_type:
          formData.event_type || 'general',
        category:
          formData.category || 'general',
        audiences:
          formData.audiences || [],
        resources:
          formData.resources || [],

        // National event
        scope: 'national',
        is_national: true
      };

      console.log(
        '📤 Creating national event:',
        eventData
      );

      const response = await axios.post(
        `${API_URL}/national/events`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.success) {
        setSuccess(
          '✅ National event created successfully!'
        );

        setShowCreateModal(false);

        resetForm();

        fetchEvents();

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(
          response.data?.message ||
          'Failed to create event'
        );
      }
    } catch (err) {
      console.error(
        '❌ Create event error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to create event'
      );
    }
  };

  // ============================================
  // UPDATE EVENT
  // ============================================
  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');

      const eventData = {
        title: formData.title,
        description:
          formData.description || '',
        start_date:
          formData.start_date,
        end_date:
          formData.end_date ||
          formData.start_date,
        location:
          formData.location,
        venue:
          formData.venue ||
          formData.location,
        capacity:
          formData.capacity || null,
        price:
          parseFloat(formData.price) || 0,
        registration_deadline:
          formData.registration_deadline ||
          null,
        status:
          formData.status || 'draft',
        event_type:
          formData.event_type || 'general',
        category:
          formData.category || 'general',
        audiences:
          formData.audiences || [],
        resources:
          formData.resources || []
      };

      const response = await axios.put(
        `${API_URL}/national/events/${selectedEvent.id}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.success) {
        setSuccess(
          '✅ Event updated successfully!'
        );

        setSelectedEvent(null);

        resetForm();

        fetchEvents();

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(
          response.data?.message ||
          'Failed to update event'
        );
      }
    } catch (err) {
      console.error(
        '❌ Update event error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to update event'
      );
    }
  };

  // ============================================
  // DELETE / CANCEL EVENT
  // ============================================
  const handleDeleteEvent = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this event?'
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');

      const token =
        localStorage.getItem('token');

      const response = await axios.delete(
        `${API_URL}/national/events/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.success) {
        setSuccess(
          '✅ Event cancelled successfully!'
        );

        fetchEvents();

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(
          response.data?.message ||
          'Failed to cancel event'
        );
      }
    } catch (err) {
      console.error(
        '❌ Delete event error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Failed to cancel event'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // AUDIENCE TOGGLE
  // ============================================
  const handleAudienceToggle = (
    audienceId
  ) => {
    setFormData(prev => {
      const audiences =
        prev.audiences.includes(
          audienceId
        )
          ? prev.audiences.filter(
              a => a !== audienceId
            )
          : [
              ...prev.audiences,
              audienceId
            ];

      return {
        ...prev,
        audiences
      };
    });
  };

  // ============================================
  // OPEN EDIT MODAL
  // ============================================
  const openEditModal = (event) => {
    setSelectedEvent(event);

    setFormData({
      title: event.title || '',
      description:
        event.description || '',
      start_date:
        event.start_date || '',
      end_date:
        event.end_date ||
        event.start_date ||
        '',
      location:
        event.location || '',
      venue:
        event.venue || '',
      capacity:
        event.capacity || '',
      price:
        event.price || '0',
      registration_deadline:
        event.registration_deadline ||
        '',
      status:
        event.status || 'draft',
      event_type:
        event.event_type ||
        'general',
      category:
        event.category ||
        'general',
      audiences:
        event.audiences || [],
      resources:
        event.resources || []
    });
  };

  // ============================================
  // RESET FORM
  // ============================================
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      venue: '',
      capacity: '',
      price: '0',
      registration_deadline: '',
      status: 'draft',
      event_type: 'general',
      category: 'general',
      audiences: [],
      resources: []
    });
  };

  // ============================================
  // STATUS BADGE
  // ============================================
  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'badge-progress',
      ongoing: 'badge-registered',
      published: 'badge-approved',
      completed: 'badge-completed',
      cancelled: 'badge-rejected',
      draft: 'badge-pending'
    };

    return (
      badges[status] ||
      'badge-default'
    );
  };

  const getStatusText = (status) => {
    const map = {
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      published: 'Published',
      completed: 'Completed',
      cancelled: 'Cancelled',
      draft: 'Draft'
    };

    return (
      map[status] ||
      status ||
      'Unknown'
    );
  };

  // ============================================
  // RETRY
  // ============================================
  const handleRetry = () => {
    fetchEvents();
  };

  // ============================================
  // FILTER REGISTRATIONS
  // ============================================
  const getFilteredRegistrations = () => {
    if (
      registrationFilter === 'all'
    ) {
      return registrations;
    }

    return registrations.filter(
      r =>
        r.status ===
        registrationFilter
    );
  };

  // ============================================
  // REGISTRATION STATS
  // ============================================
  const getRegistrationStats = () => {
    const total =
      registrations.length;

    const pending =
      registrations.filter(
        r => r.status === 'pending'
      ).length;

    const approved =
      registrations.filter(
        r => r.status === 'approved'
      ).length;

    const rejected =
      registrations.filter(
        r => r.status === 'rejected'
      ).length;

    const cancelled =
      registrations.filter(
        r => r.status === 'cancelled'
      ).length;

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled
    };
  };

  const safeEvents =
    Array.isArray(events)
      ? events
      : [];

  const filteredRegistrations =
    getFilteredRegistrations();

  const stats =
    getRegistrationStats();

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>
          Loading national events...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* ============================================
          PAGE HEADER
          ============================================ */}
      <div className="page-header">
        <div>
          <h2>
            <i
              className="fas fa-calendar-alt"
              style={{
                color: '#622599'
              }}
            ></i>{' '}
            National Event Management
          </h2>

          <p>
            Create and manage national
            events across Rwanda
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          <i className="fas fa-plus"></i>{' '}
          Create National Event
        </button>
      </div>

      {/* ============================================
          ALERTS
          ============================================ */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>

          <div>
            <strong>Error</strong>

            <p>{error}</p>

            <button
              onClick={handleRetry}
              className="btn-retry-sm"
            >
              <i className="fas fa-redo"></i>{' '}
              Retry
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>

          <div>
            <strong>Success</strong>

            <p>{success}</p>
          </div>
        </div>
      )}

      {/* ============================================
          EVENTS GRID
          ============================================ */}
      <div className="events-grid">
        {safeEvents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-plus"></i>

            <h3>
              No National Events
            </h3>

            <p>
              Create your first national
              event
            </p>

            <button
              className="btn-primary"
              onClick={() =>
                setShowCreateModal(true)
              }
            >
              <i className="fas fa-plus"></i>{' '}
              Create National Event
            </button>
          </div>
        ) : (
          safeEvents.map(event => {
            const eventTitle =
              event.title ||
              'Untitled Event';

            const eventDate =
              event.start_date ||
              event.date ||
              'Date TBD';

            const eventLocation =
              event.location ||
              event.venue ||
              'Location TBD';

            const eventCapacity =
              event.capacity ||
              'Unlimited';

            const eventPrice =
              event.price || '0';

            const eventStatus =
              event.status ||
              'upcoming';

            return (
              <div
                key={event.id}
                className="event-card national-event-card"
              >
                <div className="event-header">
                  <div className="event-title">
                    <h4>
                      🌍 {eventTitle}
                    </h4>

                    <span className="scope-badge national">
                      National
                    </span>
                  </div>

                  <span
                    className={`status-badge ${getStatusBadge(
                      eventStatus
                    )}`}
                  >
                    {getStatusText(
                      eventStatus
                    )}
                  </span>
                </div>

                <div className="event-details">
                  <p>
                    <i className="fas fa-calendar-day"></i>{' '}
                    {new Date(
                      eventDate
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <i className="fas fa-map-marker-alt"></i>{' '}
                    {eventLocation}
                  </p>

                  <p>
                    <i className="fas fa-users"></i>{' '}
                    Capacity:{' '}
                    {eventCapacity}
                  </p>

                  <p>
                    <i className="fas fa-money-bill"></i>{' '}
                    {eventPrice > 0
                      ? `${eventPrice} RWF`
                      : 'Free'}
                  </p>

                  {event.event_type && (
                    <p>
                      <i className="fas fa-tag"></i>{' '}
                      Type:{' '}
                      {event.event_type}
                    </p>
                  )}

                  {event.audiences &&
                    event.audiences.length >
                      0 && (
                      <div className="audience-tags">
                        <strong>
                          Audiences:
                        </strong>

                        {event.audiences.map(
                          a => (
                            <span
                              key={a}
                              className="audience-tag"
                            >
                              {a}
                            </span>
                          )
                        )}
                      </div>
                    )}
                </div>

                <div className="event-actions">
                  <button
                    className="btn-sm btn-edit"
                    onClick={() =>
                      openEditModal(
                        event
                      )
                    }
                  >
                    <i className="fas fa-edit"></i>{' '}
                    Edit
                  </button>

                  <button
                    className="btn-sm btn-delete"
                    onClick={() =>
                      handleDeleteEvent(
                        event.id
                      )
                    }
                    disabled={
                      deletingId ===
                      event.id
                    }
                  >
                    {deletingId ===
                    event.id ? (
                      '...'
                    ) : (
                      <>
                        <i className="fas fa-trash"></i>{' '}
                        Delete
                      </>
                    )}
                  </button>

                  <button
                    className="btn-sm btn-registrations"
                    onClick={() =>
                      handleViewRegistrations(
                        event
                      )
                    }
                  >
                    <i className="fas fa-users"></i>{' '}
                    Registrations
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================
          REGISTRATIONS MODAL
          ============================================ */}
      {showRegistrationsModal &&
        selectedEventForRegistrations && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowRegistrationsModal(
                false
              );
              setSelectedEventForRegistrations(
                null
              );
              setRegistrations([]);
            }}
          >
            <div
              className="modal-content modal-large"
              onClick={e =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <h3>
                  <i
                    className="fas fa-users"
                    style={{
                      color: '#622599'
                    }}
                  ></i>{' '}
                  Registrations -{' '}
                  {
                    selectedEventForRegistrations.title
                  }
                </h3>

                <button
                  className="modal-close"
                  onClick={() => {
                    setShowRegistrationsModal(
                      false
                    );
                    setSelectedEventForRegistrations(
                      null
                    );
                    setRegistrations(
                      []
                    );
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">

                {/* Registration Stats */}
                <div className="registration-stats">
                  <div className="stat-item">
                    <span className="stat-label">
                      Total
                    </span>

                    <span className="stat-value">
                      {stats.total}
                    </span>
                  </div>

                  <div className="stat-item pending">
                    <span className="stat-label">
                      ⏳ Pending
                    </span>

                    <span className="stat-value">
                      {stats.pending}
                    </span>
                  </div>

                  <div className="stat-item approved">
                    <span className="stat-label">
                      ✅ Approved
                    </span>

                    <span className="stat-value">
                      {stats.approved}
                    </span>
                  </div>

                  <div className="stat-item rejected">
                    <span className="stat-label">
                      ❌ Rejected
                    </span>

                    <span className="stat-value">
                      {stats.rejected}
                    </span>
                  </div>

                  <div className="stat-item cancelled">
                    <span className="stat-label">
                      🚫 Cancelled
                    </span>

                    <span className="stat-value">
                      {stats.cancelled}
                    </span>
                  </div>
                </div>

                {/* Filter */}
                <div className="registration-filter">
                  <select
                    value={
                      registrationFilter
                    }
                    onChange={e =>
                      setRegistrationFilter(
                        e.target.value
                      )
                    }
                    className="filter-select"
                  >
                    {registrationStatusOptions.map(
                      opt => (
                        <option
                          key={
                            opt.value
                          }
                          value={
                            opt.value
                          }
                        >
                          {opt.label}
                        </option>
                      )
                    )}
                  </select>

                  <span className="filter-count">
                    Showing:{' '}
                    <strong>
                      {
                        filteredRegistrations.length
                      }
                    </strong>{' '}
                    registrations
                  </span>
                </div>

                {/* Registrations Table */}
                {registrationsLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner-small"></div>

                    <span>
                      Loading
                      registrations...
                    </span>
                  </div>
                ) : filteredRegistrations.length ===
                  0 ? (
                  <div className="empty-registrations">
                    <i className="fas fa-user-slash"></i>

                    <p>
                      No registrations
                      found
                    </p>

                    <small>
                      No one has
                      registered for
                      this event yet
                    </small>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="registrations-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>SIN</th>
                          <th>Email</th>
                          <th>District</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRegistrations.map(
                          (
                            reg,
                            index
                          ) => (
                            <tr
                              key={
                                reg.id ||
                                index
                              }
                            >
                              <td>
                                {index +
                                  1}
                              </td>

                              <td>
                                <strong>
                                  {reg.memberName ||
                                    reg
                                      .member
                                      ?.full_name ||
                                    reg.fullName ||
                                    reg.name ||
                                    'N/A'}
                                </strong>
                              </td>

                              <td>
                                {reg.sin ||
                                  reg
                                    .member
                                    ?.sin ||
                                  'N/A'}
                              </td>

                              <td>
                                {reg.email ||
                                  reg
                                    .member
                                    ?.user
                                    ?.email ||
                                  'N/A'}
                              </td>

                              <td>
                                {reg.district ||
                                  reg
                                    .member
                                    ?.district ||
                                  'N/A'}
                              </td>

                              <td>
                                <span
                                  className={`status-badge ${getStatusBadge(
                                    reg.status
                                  )}`}
                                >
                                  {reg.status ||
                                    'pending'}
                                </span>
                              </td>

                              <td>
                                <div className="action-buttons">

                                  {reg.status ===
                                    'pending' && (
                                    <>
                                      <button
                                        className="btn-sm btn-approve"
                                        onClick={() =>
                                          handleUpdateRegistrationStatus(
                                            reg.id,
                                            'approved'
                                          )
                                        }
                                        title="Approve"
                                      >
                                        ✅
                                      </button>

                                      <button
                                        className="btn-sm btn-reject"
                                        onClick={() =>
                                          handleUpdateRegistrationStatus(
                                            reg.id,
                                            'rejected'
                                          )
                                        }
                                        title="Reject"
                                      >
                                        ❌
                                      </button>
                                    </>
                                  )}

                                  {reg.status ===
                                    'approved' && (
                                    <button
                                      className="btn-sm btn-cancel"
                                      onClick={() =>
                                        handleUpdateRegistrationStatus(
                                          reg.id,
                                          'cancelled'
                                        )
                                      }
                                      title="Cancel"
                                    >
                                      🚫
                                    </button>
                                  )}

                                  <button
                                    className="btn-sm btn-view"
                                    onClick={() => {
                                      console.log(
                                        'View member:',
                                        reg
                                      );
                                    }}
                                    title="View Details"
                                  >
                                    👁️
                                  </button>

                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowRegistrationsModal(
                      false
                    );
                    setSelectedEventForRegistrations(
                      null
                    );
                    setRegistrations(
                      []
                    );
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ============================================
          CREATE / EDIT NATIONAL EVENT MODAL
          ============================================ */}
      {(showCreateModal ||
        selectedEvent) && (
        <div
          className="modal-overlay event-form-overlay"
          onClick={() => {
            setShowCreateModal(false);
            setSelectedEvent(null);
            resetForm();
          }}
        >
          <div
            className="modal-content modal-large event-form-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}
            <div className="modal-header">
              <h3>
                <i className="fas fa-calendar-plus"></i>{' '}
                {selectedEvent
                  ? '✏️ Edit National Event'
                  : '📅 Create National Event'}
              </h3>

              <button
                className="modal-close"
                onClick={() => {
                  setShowCreateModal(
                    false
                  );
                  setSelectedEvent(
                    null
                  );
                  resetForm();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Event Form */}
            <form
              onSubmit={
                selectedEvent
                  ? handleUpdateEvent
                  : handleCreateEvent
              }
            >

              {/* Event Title */}
              <div className="form-group">
                <label>
                  Event Title{' '}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    formData.title
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      title:
                        e.target
                          .value
                    })
                  }
                  placeholder="Enter national event title"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>
                  Description
                </label>

                <textarea
                  value={
                    formData.description
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      description:
                        e.target
                          .value
                    })
                  }
                  placeholder="Describe the event"
                  rows="3"
                />
              </div>

              {/* Event Type and Category */}
              <div className="form-row">

                <div className="form-group">
                  <label>
                    Event Type
                  </label>

                  <select
                    value={
                      formData.event_type
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        event_type:
                          e.target
                            .value
                      })
                    }
                  >
                    {eventTypes.map(
                      type => (
                        <option
                          key={
                            type.value
                          }
                          value={
                            type.value
                          }
                        >
                          {
                            type.label
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Category
                  </label>

                  <select
                    value={
                      formData.category
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        category:
                          e.target
                            .value
                      })
                    }
                  >
                    {categories.map(
                      cat => (
                        <option
                          key={
                            cat.value
                          }
                          value={
                            cat.value
                          }
                        >
                          {
                            cat.label
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              {/* Start and End Dates */}
              <div className="form-row">

                <div className="form-group">
                  <label>
                    Start Date/Time{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      formData.start_date
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        start_date:
                          e.target
                            .value
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date/Time
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      formData.end_date
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        end_date:
                          e.target
                            .value
                      })
                    }
                  />

                  <small>
                    Leave empty if
                    same as start
                    date
                  </small>
                </div>

              </div>

              {/* Location and Venue */}
              <div className="form-row">

                <div className="form-group">
                  <label>
                    Location{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      formData.location
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        location:
                          e.target
                            .value
                      })
                    }
                    placeholder="City, District"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Venue
                  </label>

                  <input
                    type="text"
                    value={
                      formData.venue
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        venue:
                          e.target
                            .value
                      })
                    }
                    placeholder="Specific venue"
                  />
                </div>

              </div>

              {/* Capacity and Price */}
              <div className="form-row">

                <div className="form-group">
                  <label>
                    Capacity
                  </label>

                  <input
                    type="number"
                    value={
                      formData.capacity
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        capacity:
                          e.target
                            .value
                      })
                    }
                    placeholder="Unlimited"
                    min="1"
                  />

                  <small>
                    Leave empty for
                    unlimited
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    Price (RWF)
                  </label>

                  <input
                    type="number"
                    value={
                      formData.price
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        price:
                          e.target
                            .value
                      })
                    }
                    placeholder="0 for free"
                    min="0"
                    step="100"
                  />
                </div>

              </div>

              {/* Registration Deadline and Status */}
              <div className="form-row">

                <div className="form-group">
                  <label>
                    Registration
                    Deadline
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      formData.registration_deadline
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        registration_deadline:
                          e.target
                            .value
                      })
                    }
                  />

                  <small>
                    Leave empty for
                    no deadline
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    Status
                  </label>

                  <select
                    value={
                      formData.status
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        status:
                          e.target
                            .value
                      })
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>

                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="ongoing">
                      Ongoing
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>

              </div>

              {/* Audiences */}
              <div className="form-group">
                <label>
                  Publish to Audiences
                </label>

                <div className="audiences-grid">
                  {audienceOptions.map(
                    audience => (
                      <label
                        key={
                          audience.id
                        }
                        className="audience-checkbox"
                      >
                        <input
                          type="checkbox"
                          checked={formData.audiences.includes(
                            audience.id
                          )}
                          onChange={() =>
                            handleAudienceToggle(
                              audience.id
                            )
                          }
                        />

                        <span>
                          {
                            audience.label
                          }
                        </span>
                      </label>
                    )
                  )}
                </div>

                <small>
                  Select which groups
                  can see this event
                </small>
              </div>

              {/* Form Actions */}
              <div className="form-actions">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateModal(
                      false
                    );
                    setSelectedEvent(
                      null
                    );
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  <i className="fas fa-save"></i>{' '}
                  {selectedEvent
                    ? 'Update National Event'
                    : 'Create National Event'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================
          COMPLETE CSS
          ============================================ */}
      <style jsx>{`

        /* ============================================
           NATIONAL EVENT CARD
           ============================================ */

        .national-event-card {
          border-left: 4px solid #622599;
        }

        .national-event-card
        .event-title h4 {
          color: #622599;
        }

        .scope-badge.national {
          background: #E1BEE7;
          color: #622599;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          display: inline-block;
          margin-left: 8px;
        }

        /* ============================================
           PRIMARY BUTTON
           ============================================ */

        .btn-primary {
          background: #622599;
          color: #FFFFFF;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #4A1B73;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============================================
           DELETE BUTTON
           ============================================ */

        .btn-delete {
          background: #fff5f5;
          color: #c53030;
        }

        .btn-delete:hover:not(:disabled) {
          background: #fed7d7;
        }

        /* ============================================
           AUDIENCE TAGS
           ============================================ */

        .audience-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 6px;
        }

        .audience-tag {
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          color: #4a5568;
        }

        /* ============================================
           AUDIENCES GRID
           ============================================ */

        .audiences-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(180px, 1fr)
            );
          gap: 8px;
          margin-top: 4px;
        }

        .audience-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: #f7fafc;
          border: 1px solid #edf2f7;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .audience-checkbox:hover {
          background: #e2e8f0;
        }

        .audience-checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          min-height: 16px;
          cursor: pointer;
          accent-color: #622599;
          flex-shrink: 0;
        }

        /* ============================================
           REGISTRATIONS BUTTON
           ============================================ */

        .btn-registrations {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .btn-registrations:hover {
          background: #C8E6C9;
        }

        /* ============================================
           REGISTRATION STATS
           ============================================ */

        .registration-stats {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(80px, 1fr)
            );
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item .stat-label {
          display: block;
          font-size: 12px;
          color: #718096;
        }

        .stat-item .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
        }

        .stat-item.pending
        .stat-value {
          color: #F97316;
        }

        .stat-item.approved
        .stat-value {
          color: #2E7D32;
        }

        .stat-item.rejected
        .stat-value {
          color: #DC3545;
        }

        .stat-item.cancelled
        .stat-value {
          color: #6B7280;
        }

        /* ============================================
           REGISTRATION FILTER
           ============================================ */

        .registration-filter {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 7px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          background: #ffffff;
          min-height: 38px;
        }

        .filter-count {
          font-size: 14px;
          color: #4a5568;
        }

        /* ============================================
           EMPTY REGISTRATIONS
           ============================================ */

        .empty-registrations {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }

        .empty-registrations i {
          font-size: 48px;
          margin-bottom: 12px;
          display: block;
        }

        .empty-registrations p {
          margin: 0;
          font-size: 16px;
        }

        .empty-registrations small {
          color: #a0aec0;
        }

        /* ============================================
           REGISTRATION TABLE
           ============================================ */

        .registrations-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
          font-size: 14px;
        }

        .registrations-table th {
          text-align: left;
          padding: 8px 12px;
          background: #f7fafc;
          font-weight: 600;
          color: #2d3748;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
        }

        .registrations-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .registrations-table tr:hover {
          background: #f7fafc;
        }

        .table-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          margin-top: 8px;
          -webkit-overflow-scrolling: touch;
        }

        /* ============================================
           ACTION BUTTONS
           ============================================ */

        .action-buttons {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn-sm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-edit {
          background: #ebf8ff;
          color: #2b6cb0;
        }

        .btn-edit:hover:not(:disabled) {
          background: #bee3f8;
        }

        .btn-view {
          background: #e2e8f0;
          color: #2d3748;
        }

        .btn-view:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .btn-approve {
          background: #c6f6d5;
          color: #276749;
        }

        .btn-approve:hover:not(:disabled) {
          background: #9ae6b4;
        }

        .btn-reject {
          background: #fed7d7;
          color: #9b2c2c;
        }

        .btn-reject:hover:not(:disabled) {
          background: #feb2b2;
        }

        .btn-cancel {
          background: #fef3c7;
          color: #92400e;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f6e05e;
        }

        /* ============================================
           STATUS BADGES
           ============================================ */

        .status-badge {
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge-progress {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-registered {
          background: #c6f6d5;
          color: #276749;
        }

        .badge-approved {
          background: #bee3f8;
          color: #2b6cb0;
        }

        .badge-completed {
          background: #e2e8f0;
          color: #4a5568;
        }

        .badge-rejected {
          background: #fed7d7;
          color: #9b2c2c;
        }

        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-default {
          background: #e2e8f0;
          color: #4a5568;
        }

        /* ============================================
           EMPTY EVENTS
           ============================================ */

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #2d3748;
        }

        .empty-state p {
          margin: 0 0 16px;
        }

        /* ============================================
           LOADING
           ============================================ */

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
          color: #6B7280;
        }

        .spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #622599;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .dashboard-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          gap: 12px;
        }

        .spinner-large {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #622599;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        /* ============================================
           FORM HELP TEXT
           ============================================ */

        .form-group small {
          display: block;
          color: #718096;
          font-size: 12px;
          margin-top: 5px;
        }

        .required {
          color: #e53e3e;
        }

        /* ============================================
           IMPORTANT MODAL FIX
           
           The modal is deliberately given a very high
           z-index so it appears ABOVE the sidebar,
           header, dashboard and other fixed elements.
           ============================================ */

        .modal-overlay {
          position: fixed;
          inset: 0;

          width: 100%;
          height: 100%;

          background: rgba(
            0,
            0,
            0,
            0.55
          );

          display: flex;
          align-items: center;
          justify-content: center;

          /*
           * IMPORTANT:
           * This must be higher than the sidebar.
           */
          z-index: 99999;

          padding: 20px;

          box-sizing: border-box;

          overflow-y: auto;

          isolation: isolate;
        }

        /*
         * Extra class for the Create/Edit event
         * modal. This ensures it remains above all
         * dashboard elements.
         */
        .event-form-overlay {
          z-index: 999999;
        }

        /* ============================================
           MODAL CONTENT
           ============================================ */

        .modal-content {
          position: relative;

          background: #ffffff;

          width: 100%;
          max-width: 700px;

          max-height: calc(100vh - 40px);

          margin: auto;

          border-radius: 12px;

          box-shadow:
            0 20px 50px
              rgba(0, 0, 0, 0.25),
            0 5px 15px
              rgba(0, 0, 0, 0.12);

          overflow-y: auto;
          overflow-x: hidden;

          box-sizing: border-box;

          z-index: 100000;
        }

        .event-form-modal {
          z-index: 1000000;

          /*
           * Prevent the form from becoming wider
           * than the available screen.
           */
          width: min(
            900px,
            100%
          );

          max-width: 900px;
        }

        .modal-large {
          max-width: 900px;
        }

        /* ============================================
           MODAL HEADER
           ============================================ */

        .modal-header {
          position: sticky;

          top: 0;

          z-index: 20;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding: 18px 24px;

          background: #ffffff;

          border-bottom: 1px solid #e2e8f0;

          border-radius:
            12px 12px 0 0;

          box-sizing: border-box;
        }

        .modal-header h3 {
          margin: 0;

          flex: 1;

          font-size: 20px;

          font-weight: 700;

          color: #1a202c;

          line-height: 1.4;
        }

        .modal-close {
          flex: 0 0 auto;

          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #f7fafc;

          border: none;

          border-radius: 50%;

          color: #718096;

          font-size: 18px;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .modal-close:hover {
          background: #edf2f7;

          color: #2d3748;

          transform: scale(1.05);
        }

        /* ============================================
           EVENT FORM
           ============================================ */

        .event-form-modal form {
          width: 100%;

          box-sizing: border-box;

          padding-top: 4px;
        }

        .event-form-modal
        .form-group {
          margin: 0 24px 18px;
        }

        .event-form-modal
        .form-group:first-child {
          margin-top: 20px;
        }

        .event-form-modal
        .form-group label {
          display: block;

          margin-bottom: 7px;

          font-size: 14px;

          font-weight: 600;

          color: #2d3748;
        }

        /* ============================================
           FORM INPUTS
           ============================================ */

        .event-form-modal
        .form-group input,
        .event-form-modal
        .form-group select,
        .event-form-modal
        .form-group textarea {
          display: block;

          width: 100%;

          max-width: 100%;

          min-height: 42px;

          padding: 10px 12px;

          box-sizing: border-box;

          background: #ffffff;

          border: 1px solid #cbd5e0;

          border-radius: 7px;

          color: #2d3748;

          font-family: inherit;

          font-size: 14px;

          outline: none;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .event-form-modal
        .form-group textarea {
          min-height: 90px;

          resize: vertical;
        }

        .event-form-modal
        .form-group input:focus,
        .event-form-modal
        .form-group select:focus,
        .event-form-modal
        .form-group textarea:focus {
          border-color: #622599;

          box-shadow:
            0 0 0 3px
              rgba(
                98,
                37,
                153,
                0.12
              );
        }

        .event-form-modal
        .form-group
        input::placeholder,
        .event-form-modal
        .form-group
        textarea::placeholder {
          color: #a0aec0;
        }

        /* ============================================
           FORM ROW
           ============================================ */

        .event-form-modal
        .form-row {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          gap: 18px;

          width: 100%;

          box-sizing: border-box;
        }

        .event-form-modal
        .form-row
        .form-group {
          min-width: 0;
        }

        /* ============================================
           FORM ACTIONS
           ============================================ */

        .event-form-modal
        .form-actions {
          position: sticky;

          bottom: 0;

          z-index: 30;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 12px;

          padding: 16px 24px;

          margin-top: 8px;

          background: #ffffff;

          border-top: 1px solid #e2e8f0;

          border-radius:
            0 0 12px 12px;

          box-sizing: border-box;
        }

        .event-form-modal
        .form-actions button {
          min-height: 42px;

          padding: 10px 18px;

          border-radius: 7px;

          font-size: 14px;

          font-weight: 600;

          cursor: pointer;
        }

        /* ============================================
           SECONDARY BUTTON
           ============================================ */

        .btn-secondary {
          background: #e2e8f0;

          color: #2d3748;

          border: none;

          padding: 10px 20px;

          border-radius: 8px;

          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s ease;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
        }

        /* ============================================
           ALERTS
           ============================================ */

        .alert {
          padding: 12px 16px;

          border-radius: 8px;

          margin-bottom: 16px;

          display: flex;

          align-items: flex-start;

          gap: 12px;
        }

        .alert-error {
          background: #fff5f5;

          border: 1px solid #feb2b2;

          color: #9b2c2c;
        }

        .alert-success {
          background: #f0fff4;

          border: 1px solid #9ae6b4;

          color: #276749;
        }

        .alert i {
          margin-top: 2px;

          font-size: 18px;
        }

        .alert div {
          flex: 1;
        }

        .alert strong {
          display: block;
        }

        .alert p {
          margin: 4px 0 0;
        }

        .btn-retry-sm {
          background: none;

          border: 1px solid
            currentColor;

          padding: 2px 10px;

          border-radius: 4px;

          cursor: pointer;

          font-size: 12px;

          margin-top: 4px;

          color: inherit;
        }

        .btn-retry-sm:hover {
          background:
            rgba(
              0,
              0,
              0,
              0.05
            );
        }

        /* ============================================
           EVENTS GRID
           ============================================ */

        .events-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fill,
              minmax(
                320px,
                1fr
              )
            );

          gap: 20px;
        }

        .event-card {
          background: white;

          border-radius: 12px;

          box-shadow:
            0 1px 3px
              rgba(
                0,
                0,
                0,
                0.1
              );

          padding: 16px;

          transition:
            box-shadow 0.2s ease;
        }

        .event-card:hover {
          box-shadow:
            0 4px 6px
              rgba(
                0,
                0,
                0,
                0.1
              );
        }

        .event-header {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          margin-bottom: 12px;

          gap: 10px;
        }

        .event-title {
          flex: 1;

          min-width: 0;
        }

        .event-title h4 {
          margin: 0;

          font-size: 16px;

          color: #1a202c;

          word-break: break-word;
        }

        .event-details {
          font-size: 14px;

          color: #4a5568;
        }

        .event-details p {
          margin: 4px 0;
        }

        .event-actions {
          display: flex;

          flex-wrap: wrap;

          gap: 6px;

          margin-top: 12px;

          padding-top: 12px;

          border-top:
            1px solid
            #e2e8f0;
        }

        /* ============================================
           DASHBOARD
           ============================================ */

        .dashboard-container {
          padding: 20px;

          max-width: 1400px;

          margin: 0 auto;

          width: 100%;

          box-sizing: border-box;
        }

        .page-header {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          margin-bottom: 24px;

          flex-wrap: wrap;

          gap: 16px;
        }

        .page-header h2 {
          margin: 0;

          color: #1a202c;
        }

        .page-header p {
          margin: 4px 0 0;

          color: #718096;
        }

        /* ============================================
           TABLET
           ============================================ */

        @media (max-width: 900px) {

          .event-form-modal {
            max-width: calc(
              100vw - 30px
            );
          }

          .event-form-modal
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .event-form-modal
          .audiences-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        /* ============================================
           MOBILE / TABLET
           ============================================ */

        @media (max-width: 768px) {

          .dashboard-container {
            padding: 15px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;

            align-items: stretch;
          }

          .page-header
          .btn-primary {
            width: 100%;
          }

          .modal-overlay {
            align-items: flex-start;

            padding: 15px;

            overflow-y: auto;
          }

          .modal-content {
            max-width: 100%;

            max-height:
              calc(
                100vh - 30px
              );

            margin: auto;

            border-radius: 10px;
          }

          .event-form-modal {
            width: 100%;

            max-width: 100%;

            max-height:
              calc(
                100vh - 30px
              );
          }

          .modal-header {
            padding: 15px 18px;
          }

          .modal-header h3 {
            font-size: 18px;
          }

          .modal-body {
            padding: 18px;
          }

          .event-form-modal
          .form-group {
            margin-left: 18px;

            margin-right: 18px;

            margin-bottom: 16px;
          }

          .event-form-modal
          .form-group:first-child {
            margin-top: 18px;
          }

          .event-form-modal
          .form-row {
            grid-template-columns: 1fr;

            gap: 0;
          }

          .event-form-modal
          .audiences-grid {
            grid-template-columns: 1fr;
          }

          .event-form-modal
          .form-actions {
            padding: 14px 18px;
          }

          .registration-stats {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }

          .registrations-table {
            font-size: 12px;
          }

          .registrations-table th,
          .registrations-table td {
            padding: 6px 8px;
          }
        }

        /* ============================================
           SMALL MOBILE
           ============================================ */

        @media (max-width: 480px) {

          .dashboard-container {
            padding: 10px;
          }

          .modal-overlay {
            padding: 8px;
          }

          .modal-content {
            width: 100%;

            max-width: 100%;

            max-height:
              calc(
                100vh - 16px
              );

            border-radius: 9px;
          }

          .event-form-modal {
            width: 100%;

            max-width: 100%;

            max-height:
              calc(
                100vh - 16px
              );
          }

          .modal-header {
            padding: 13px 15px;
          }

          .modal-header h3 {
            font-size: 16px;

            line-height: 1.3;
          }

          .modal-close {
            width: 34px;

            height: 34px;

            font-size: 16px;
          }

          .modal-body {
            padding: 15px;
          }

          .event-form-modal
          .form-group {
            margin-left: 15px;

            margin-right: 15px;

            margin-bottom: 15px;
          }

          .event-form-modal
          .form-group:first-child {
            margin-top: 15px;
          }

          .event-form-modal
          .form-group
          input,
          .event-form-modal
          .form-group
          select,
          .event-form-modal
          .form-group
          textarea {
            font-size: 14px;

            min-height: 42px;
          }

          .event-form-modal
          .form-actions {
            flex-direction:
              column-reverse;

            align-items:
              stretch;

            padding:
              13px 15px;

            gap: 8px;
          }

          .event-form-modal
          .form-actions
          button {
            width: 100%;
          }

          .registration-stats {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .registration-filter {
            flex-direction: column;

            align-items:
              stretch;

            gap: 8px;
          }

          .filter-select {
            width: 100%;
          }

          .event-actions {
            flex-direction: column;
          }

          .event-actions button {
            width: 100%;
          }

          .audiences-grid {
            grid-template-columns: 1fr;
          }

          .page-header h2 {
            font-size: 20px;
          }
        }

        /* ============================================
           VERY SMALL PHONES
           ============================================ */

        @media (max-width: 360px) {

          .modal-overlay {
            padding: 4px;
          }

          .modal-content,
          .event-form-modal {
            max-height:
              calc(
                100vh - 8px
              );
          }

          .modal-header {
            padding:
              11px 12px;
          }

          .modal-header h3 {
            font-size: 15px;
          }

          .event-form-modal
          .form-group {
            margin-left: 12px;

            margin-right: 12px;
          }

          .event-form-modal
          .form-actions {
            padding:
              12px;
          }
        }

      `}</style>
    </div>
  );
};

export default NationalEvents;