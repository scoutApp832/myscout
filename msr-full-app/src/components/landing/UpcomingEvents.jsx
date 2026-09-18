// src/components/landing/UpcomingEvents.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { useLanguage } from '../../contexts/LanguageContext';

// ============================================================
// 🎨 SCOUT COLOR PALETTE
// ============================================================

const SCOUT = {
  purple: '#6A1B9A',
  gold: '#FFD100',
  darkBlue: '#002B5C',
  green: '#2E7D32',
  red: '#D32F2F',
  white: '#FFFFFF',
  dark: '#1F2937',
  light: '#F5F7FA',
};

// ============================================================
// API
// ============================================================

const API_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000/api';

// ============================================================
// 🌍 TRANSLATIONS
// ============================================================

const translations = {
  en: {
    upcomingActivities: 'Upcoming Activities',

    subtitle:
      'Join us in these life-changing events.',

    loading: 'Loading events...',

    unableToLoad:
      'Unable to load upcoming events. Please try again later.',

    viewAllEvents: 'View All Events',

    noUpcomingEvents:
      'No Upcoming Events',

    checkBack:
      'Check back soon for new activities!',

    upcoming: 'Upcoming',

    registrationOpen:
      'Registration Open',

    fullyBooked:
      'Fully Booked',

    completed:
      'Completed',

    registerNow:
      'Register Now',

    moreDetails:
      'More Details',

    date:
      'Date',

    location:
      'Location',

    capacity:
      'Capacity',

    district:
      'District',

    spots:
      'spots',

    unlimited:
      'Unlimited',

    unlimitedSpots:
      'Unlimited spots',

    unlimitedSpotsAvailable:
      'Unlimited spots available',

    registration:
      'Registration',

    seatsRemaining:
      'seats remaining',

    close:
      'Close',

    registered:
      'Registered',

    seatsStillAvailable:
      'seats are still available.',

    joinExcitingEvent:
      'Join us for this exciting event!',

    tba:
      'TBA',

    errorIconLabel:
      'Error loading events',
  },

  rw: {
    upcomingActivities:
      'Ibikorwa Biteganyijwe',

    subtitle:
      'Twifatanye muri ibi bikorwa bizana impinduka nziza.',

    loading:
      'Ibikorwa birimo gutegurwa...',

    unableToLoad:
      'Ntibyashobotse kubona ibikorwa biteganyijwe. Ongera ugerageze nyuma.',

    viewAllEvents:
      'Reba Ibikorwa Byose',

    noUpcomingEvents:
      'Nta Bikorwa Biteganyijwe',

    checkBack:
      'Ongera usure uru rubuga vuba kugira ngo ubone ibikorwa bishya!',

    upcoming:
      'Birateganyijwe',

    registrationOpen:
      'Kwiyandikisha Birakomeje',

    fullyBooked:
      'Umubare Wuzuye',

    completed:
      'Byarangiye',

    registerNow:
      'Iyandikishe Ubu',

    moreDetails:
      'Andi Makuru',

    date:
      'Itariki',

    location:
      'Aho bizabera',

    capacity:
      'Umubare ntarengwa',

    district:
      'Akarere',

    spots:
      'imyanya',

    unlimited:
      'Nta mubare ntarengwa',

    unlimitedSpots:
      'Imyanya itagira umubare ntarengwa',

    unlimitedSpotsAvailable:
      'Hari imyanya itagira umubare ntarengwa',

    registration:
      'Kwiyandikisha',

    seatsRemaining:
      'imyanya isigaye',

    close:
      'Funga',

    registered:
      'Abiyandikishije',

    seatsStillAvailable:
      'imyanya iracyaboneka.',

    joinExcitingEvent:
      'Twifatanye muri iki gikorwa gishimishije!',

    tba:
      'Ntibiratangazwa',

    errorIconLabel:
      'Habaye ikibazo mu kuzana ibikorwa',
  },
};

// ============================================================
// EVENT TYPE ICONS
// ============================================================

const EVENT_ICONS = {
  camp: 'fa-campground',
  tree_planting: 'fa-tree',
  workshop: 'fa-chalkboard-teacher',
  training: 'fa-user-graduate',
  community: 'fa-hands-helping',
  leadership: 'fa-crown',
  sports: 'fa-running',
  conference: 'fa-users',
  charity: 'fa-heart',
  environmental: 'fa-leaf',
  education: 'fa-book-open',
  health: 'fa-heartbeat',
  other: 'fa-calendar-check',
};

// ============================================================
// COMPONENT
// ============================================================

const UpcomingEvents = () => {
  // ==========================================================
  // LANGUAGE
  // ==========================================================

  const { language } = useLanguage();

  const currentLanguage =
    language === 'rw' || language === 'en'
      ? language
      : 'en';

  const t = translations[currentLanguage];

  // ==========================================================
  // STATE
  // ==========================================================

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);

  // ==========================================================
  // FETCH UPCOMING EVENTS FROM API
  // ==========================================================

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/public/events/upcoming?limit=6`
        );

        if (
          response.data &&
          response.data.success
        ) {
          setEvents(
            response.data.events || []
          );
        } else {
          setEvents([]);
        }

      } catch (err) {
        console.error(
          '❌ Error fetching upcoming events:',
          err
        );

        setError(t.unableToLoad);

        setEvents([]);

      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [t.unableToLoad]);

  // ==========================================================
  // MODAL SCROLL CONTROL
  // ==========================================================

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedEvent]);

  // ==========================================================
  // ESC KEY
  // ==========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedEvent(null);
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return t.tba;
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return t.tba;
    }

    return date.toLocaleDateString(
      currentLanguage === 'rw'
        ? 'rw-RW'
        : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const getProgress = (
    registered,
    total
  ) => {
    if (!total || total === 0) {
      return 0;
    }

    return Math.min(
      (registered / total) * 100,
      100
    );
  };

  // ==========================================================
  // STATUS
  // ==========================================================

  const getStatusBadge = (
    status,
    registrationCount,
    capacity
  ) => {
    if (!status) {
      return {
        label: t.upcoming,
        color: SCOUT.gold,
      };
    }

    if (
      status === 'published' ||
      status === 'upcoming'
    ) {
      if (
        capacity &&
        registrationCount >= capacity
      ) {
        return {
          label: t.fullyBooked,
          color: SCOUT.red,
        };
      }

      return {
        label: t.registrationOpen,
        color: SCOUT.green,
      };
    }

    if (
      status === 'completed' ||
      status === 'past'
    ) {
      return {
        label: t.completed,
        color: SCOUT.darkBlue,
      };
    }

    return {
      label: t.upcoming,
      color: SCOUT.gold,
    };
  };

  // ==========================================================
  // EVENT ICON
  // ==========================================================

  const getEventIcon = (eventType) => {
    return (
      EVENT_ICONS[eventType] ||
      'fa-calendar-check'
    );
  };

  // ==========================================================
  // EVENT BACKGROUND
  // ==========================================================

  const getBgColor = (eventType) => {
    const colors = {
      camp: `${SCOUT.purple}15`,
      tree_planting: `${SCOUT.green}15`,
      workshop: `${SCOUT.gold}20`,
      training: `${SCOUT.darkBlue}15`,
      community: `${SCOUT.purple}10`,
      leadership: `${SCOUT.gold}15`,
      sports: `${SCOUT.green}10`,
      conference: `${SCOUT.darkBlue}10`,
      charity: '#FEE2E2',
      environmental: '#D1FAE5',
      education: '#DBEAFE',
      health: '#FCE4EC',
      other: SCOUT.light,
    };

    return (
      colors[eventType] ||
      SCOUT.light
    );
  };

  // ==========================================================
  // OPEN MODAL
  // ==========================================================

  const openEvent = (event) => {
    setSelectedEvent(event);
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeEvent = () => {
    setSelectedEvent(null);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="upcoming-section">

        <div className="container">

          <div className="section-header">

            <div>

              <h2 className="section-title">

                <i
                  className="fas fa-calendar-plus"
                  style={{
                    color: SCOUT.purple,
                  }}
                ></i>

                {t.upcomingActivities}

              </h2>

              <p className="section-sub">
                {t.loading}
              </p>

            </div>

          </div>

          <div className="event-grid">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="event-card skeleton-card"
              >

                <div
                  className="event-img skeleton-image"
                >
                  <div className="skeleton-circle"></div>
                </div>

                <div className="event-body">

                  <div className="skeleton-line skeleton-title"></div>

                  <div className="skeleton-line skeleton-medium"></div>

                  <div className="skeleton-line skeleton-small"></div>

                  <div className="skeleton-line skeleton-large"></div>

                </div>

              </div>

            ))}

          </div>

        </div>

        <style>{`

          @keyframes pulse {

            0%,
            100% {
              opacity: 0.4;
            }

            50% {
              opacity: 0.8;
            }

          }

          .skeleton-card {
            min-height: 300px;
          }

          .skeleton-image {
            background: ${SCOUT.light};
          }

          .skeleton-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #e8ebee;
            animation: pulse 1.5s ease-in-out infinite;
          }

          .skeleton-line {
            background: ${SCOUT.light};
            border-radius: 5px;
            animation: pulse 1.5s ease-in-out infinite;
          }

          .skeleton-title {
            width: 80%;
            height: 24px;
            margin-bottom: 16px;
          }

          .skeleton-medium {
            width: 60%;
            height: 14px;
            margin-bottom: 9px;
          }

          .skeleton-small {
            width: 55%;
            height: 14px;
            margin-bottom: 9px;
          }

          .skeleton-large {
            width: 70%;
            height: 14px;
          }

        `}</style>

      </section>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <section className="upcoming-section">

        <div className="container">

          <div className="section-header">

            <div>

              <h2 className="section-title">

                <i
                  className="fas fa-calendar-plus"
                  style={{
                    color: SCOUT.purple,
                  }}
                ></i>

                {t.upcomingActivities}

              </h2>

              <p className="section-sub">
                {t.subtitle}
              </p>

            </div>

          </div>

          <div className="error-box">

            <i
              className="fas fa-exclamation-circle"
              style={{
                color: SCOUT.red,
              }}
              aria-label={t.errorIconLabel}
            ></i>

            <p>
              {error}
            </p>

          </div>

        </div>

      </section>
    );
  }

  // ==========================================================
  // NO EVENTS
  // ==========================================================

  if (events.length === 0) {
    return (
      <section className="upcoming-section">

        <div className="container">

          <div className="section-header">

            <div>

              <h2 className="section-title">

                <i
                  className="fas fa-calendar-plus"
                  style={{
                    color: SCOUT.purple,
                  }}
                ></i>

                {t.upcomingActivities}

              </h2>

              <p className="section-sub">
                {t.subtitle}
              </p>

            </div>

            <Link
              to="/events"
              className="view-all"
            >
              {t.viewAllEvents}

              <i className="fas fa-arrow-right"></i>
            </Link>

          </div>

          <div className="empty-events">

            <i
              className="fas fa-calendar-times"
              style={{
                color: SCOUT.purple,
              }}
            ></i>

            <h3>
              {t.noUpcomingEvents}
            </h3>

            <p>
              {t.checkBack}
            </p>

          </div>

        </div>

      </section>
    );
  }

  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <>

      {/* ======================================================
          UPCOMING EVENTS SECTION
      ====================================================== */}

      <section className="upcoming-section">

        <div className="container">

          {/* ==================================================
              SECTION HEADER
          ================================================== */}

          <div className="section-header">

            <div>

              <h2 className="section-title">

                <i
                  className="fas fa-calendar-plus"
                  style={{
                    color: SCOUT.purple,
                  }}
                ></i>

                {t.upcomingActivities}

              </h2>

              <p className="section-sub">
                {t.subtitle}
              </p>

            </div>

            <Link
              to="/events"
              className="view-all"
            >
              {t.viewAllEvents}

              <i className="fas fa-arrow-right"></i>
            </Link>

          </div>

          {/* ==================================================
              EVENT GRID
          ================================================== */}

          <div className="event-grid">

            {events.map((event) => {

              const registrationCount =
                event.registrationCount || 0;

              const capacity =
                event.capacity || 0;

              const progress =
                getProgress(
                  registrationCount,
                  capacity
                );

              const statusBadge =
                getStatusBadge(
                  event.status,
                  registrationCount,
                  capacity
                );

              const bgColor =
                getBgColor(
                  event.event_type
                );

              const icon =
                getEventIcon(
                  event.event_type
                );

              const availableSpots =
                capacity > 0
                  ? Math.max(
                      capacity -
                        registrationCount,
                      0
                    )
                  : null;

              return (
                <article
                  className="event-card"
                  key={event.id}
                >

                  {/* ==========================================
                      EVENT IMAGE / ICON
                  ========================================== */}

                  <div
                    className="event-img"
                    style={{
                      background: bgColor,
                    }}
                  >

                    <i
                      className={`fas ${icon}`}
                      style={{
                        color:
                          SCOUT.purple,
                      }}
                      aria-hidden="true"
                    ></i>

                    {/* STATUS */}

                    <span
                      className="event-status"
                      style={{
                        background:
                          SCOUT.white,
                        color:
                          statusBadge.color,
                        border:
                          `2px solid ${statusBadge.color}`,
                      }}
                    >

                      <i
                        className="fas fa-circle"
                        style={{
                          color:
                            statusBadge.color,
                        }}
                        aria-hidden="true"
                      ></i>

                      {statusBadge.label}

                    </span>

                  </div>

                  {/* ==========================================
                      EVENT BODY
                  ========================================== */}

                  <div className="event-body">

                    <h3>
                      {event.title}
                    </h3>

                    {/* DATE */}

                    <div className="meta">

                      <i
                        className="fas fa-calendar-day"
                        style={{
                          color:
                            SCOUT.purple,
                        }}
                        aria-hidden="true"
                      ></i>

                      <span>
                        {formatDate(
                          event.start_date
                        )}
                      </span>

                    </div>

                    {/* LOCATION */}

                    <div className="meta">

                      <i
                        className="fas fa-map-marker-alt"
                        style={{
                          color:
                            SCOUT.purple,
                        }}
                        aria-hidden="true"
                      ></i>

                      <span>
                        {event.location ||
                          event.venue ||
                          t.tba}
                      </span>

                    </div>

                    {/* DISTRICT */}

                    {event.district && (
                      <div className="meta">

                        <i
                          className="fas fa-building"
                          style={{
                            color:
                              SCOUT.purple,
                          }}
                          aria-hidden="true"
                        ></i>

                        <span>
                          {event.district.name}
                        </span>

                      </div>
                    )}

                    {/* CAPACITY */}

                    <div className="meta">

                      <i
                        className="fas fa-users"
                        style={{
                          color:
                            SCOUT.purple,
                        }}
                        aria-hidden="true"
                      ></i>

                      <span>

                        {capacity > 0
                          ? `${capacity} ${t.spots}`
                          : t.unlimitedSpots}

                      </span>

                    </div>

                    {/* ========================================
                        REGISTRATION PROGRESS
                    ======================================== */}

                    {capacity > 0 && (
                      <div className="progress-section">

                        <div className="progress-label">

                          <span>
                            {t.registration}
                          </span>

                          <strong>
                            {registrationCount}/
                            {capacity}
                          </strong>

                        </div>

                        <div
                          className="progress-bar"
                          aria-label={`${registrationCount} of ${capacity} registered`}
                        >

                          <div
                            className="progress-fill"
                            style={{
                              width:
                                `${progress}%`,
                              background:
                                `linear-gradient(
                                  90deg,
                                  ${SCOUT.purple},
                                  ${SCOUT.gold}
                                )`,
                            }}
                          ></div>

                        </div>

                        <small>

                          {availableSpots === 0
                            ? t.fullyBooked
                            : `${availableSpots} ${t.seatsRemaining}`}

                        </small>

                      </div>
                    )}

                    {/* ========================================
                        ACTIONS
                    ======================================== */}

                    <div className="event-actions">

                      {/* REGISTER */}

                      <Link
                        to="/login"
                        className="btn-register"
                        style={{
                          background:
                            SCOUT.purple,
                          borderColor:
                            SCOUT.purple,
                          color:
                            SCOUT.white,
                        }}
                      >

                        <i
                          className="fas fa-user-plus"
                          aria-hidden="true"
                        ></i>

                        {t.registerNow}

                      </Link>

                      {/* MORE DETAILS */}

                      <button
                        type="button"
                        className="btn-details"
                        style={{
                          color:
                            SCOUT.purple,
                          borderColor:
                            SCOUT.purple,
                        }}
                        onClick={() =>
                          openEvent(event)
                        }
                      >

                        {t.moreDetails}

                        <i
                          className="fas fa-arrow-right"
                          aria-hidden="true"
                        ></i>

                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        </div>

      </section>

      {/* ======================================================
          EVENT DETAILS MODAL
      ====================================================== */}

      {selectedEvent && (

        <div
          className="event-modal-overlay"
          onClick={closeEvent}
          role="presentation"
        >

          <div
            className="event-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >

            {/* ================================================
                MODAL BANNER
            ================================================ */}

            <div
              className="modal-banner"
              style={{
                background:
                  getBgColor(
                    selectedEvent.event_type
                  ),
              }}
            >

              {/* CLOSE */}

              <button
                type="button"
                className="modal-close"
                onClick={closeEvent}
                aria-label={t.close}
                style={{
                  background:
                    SCOUT.white,
                  color:
                    SCOUT.dark,
                  border:
                    'none',
                }}
              >

                <i className="fas fa-times"></i>

              </button>

              {/* ICON */}

              <div
                className="modal-icon"
                style={{
                  background:
                    'rgba(255,255,255,0.9)',
                }}
              >

                <i
                  className={`fas ${getEventIcon(
                    selectedEvent.event_type
                  )}`}
                  style={{
                    color:
                      SCOUT.purple,
                  }}
                ></i>

              </div>

              {/* STATUS */}

              <div
                className="modal-status"
                style={{
                  background:
                    SCOUT.white,
                  color:
                    SCOUT.purple,
                }}
              >

                <i
                  className="fas fa-circle"
                  style={{
                    color:
                      SCOUT.green,
                  }}
                  aria-hidden="true"
                ></i>

                {getStatusBadge(
                  selectedEvent.status,
                  selectedEvent.registrationCount ||
                    0,
                  selectedEvent.capacity ||
                    0
                ).label}

              </div>

            </div>

            {/* ================================================
                MODAL CONTENT
            ================================================ */}

            <div className="modal-content">

              <h2 id="event-modal-title">
                {selectedEvent.title}
              </h2>

              <p className="modal-description">

                {selectedEvent.description ||
                  t.joinExcitingEvent}

              </p>

              {/* ============================================
                  EVENT INFORMATION
              ============================================ */}

              <div className="event-info-grid">

                {/* DATE */}

                <div
                  className="info-box"
                  style={{
                    background:
                      `${SCOUT.purple}08`,
                  }}
                >

                  <i
                    className="fas fa-calendar-day"
                    style={{
                      color:
                        SCOUT.purple,
                    }}
                  ></i>

                  <div>

                    <small>
                      {t.date}
                    </small>

                    <strong>
                      {formatDate(
                        selectedEvent.start_date
                      )}
                    </strong>

                  </div>

                </div>

                {/* LOCATION */}

                <div
                  className="info-box"
                  style={{
                    background:
                      `${SCOUT.purple}08`,
                  }}
                >

                  <i
                    className="fas fa-map-marker-alt"
                    style={{
                      color:
                        SCOUT.purple,
                    }}
                  ></i>

                  <div>

                    <small>
                      {t.location}
                    </small>

                    <strong>
                      {selectedEvent.location ||
                        selectedEvent.venue ||
                        t.tba}
                    </strong>

                  </div>

                </div>

                {/* CAPACITY */}

                <div
                  className="info-box"
                  style={{
                    background:
                      `${SCOUT.purple}08`,
                  }}
                >

                  <i
                    className="fas fa-users"
                    style={{
                      color:
                        SCOUT.purple,
                    }}
                  ></i>

                  <div>

                    <small>
                      {t.capacity}
                    </small>

                    <strong>

                      {selectedEvent.capacity
                        ? `${selectedEvent.capacity} ${t.spots}`
                        : t.unlimited}

                    </strong>

                  </div>

                </div>

                {/* DISTRICT */}

                {selectedEvent.district && (
                  <div
                    className="info-box"
                    style={{
                      background:
                        `${SCOUT.purple}08`,
                    }}
                  >

                    <i
                      className="fas fa-building"
                      style={{
                        color:
                          SCOUT.purple,
                      }}
                    ></i>

                    <div>

                      <small>
                        {t.district}
                      </small>

                      <strong>
                        {
                          selectedEvent
                            .district
                            .name
                        }
                      </strong>

                    </div>

                  </div>
                )}

              </div>

              {/* ============================================
                  REGISTRATION
              ============================================ */}

              {selectedEvent.capacity > 0 && (
                <div
                  className="modal-registration"
                  style={{
                    background:
                      `${SCOUT.green}10`,
                    border:
                      `1px solid ${SCOUT.green}20`,
                  }}
                >

                  <div>

                    <span>
                      {t.registered}
                    </span>

                    <strong
                      style={{
                        color:
                          SCOUT.purple,
                      }}
                    >
                      {
                        selectedEvent
                          .registrationCount ||
                        0
                      }{' '}
                      /{' '}
                      {
                        selectedEvent
                          .capacity
                      }
                    </strong>

                  </div>

                  <div
                    className="modal-progress"
                    style={{
                      background:
                        SCOUT.light,
                    }}
                  >

                    <div
                      style={{
                        width:
                          `${getProgress(
                            selectedEvent.registrationCount ||
                              0,
                            selectedEvent.capacity
                          )}%`,
                        background:
                          `linear-gradient(
                            90deg,
                            ${SCOUT.purple},
                            ${SCOUT.gold}
                          )`,
                      }}
                    ></div>

                  </div>

                  <p>

                    {Math.max(
                      selectedEvent.capacity -
                        (selectedEvent.registrationCount ||
                          0),
                      0
                    )}{' '}

                    {t.seatsStillAvailable}

                  </p>

                </div>
              )}

              {/* ============================================
                  MODAL ACTIONS
              ============================================ */}

              <div className="modal-actions">

                {/* REGISTER */}

                <Link
                  to="/login"
                  className="modal-register-btn"
                  style={{
                    background:
                      SCOUT.purple,
                    borderColor:
                      SCOUT.purple,
                    color:
                      SCOUT.white,
                  }}
                >

                  <i className="fas fa-user-plus"></i>

                  {t.registerNow}

                </Link>

                {/* CLOSE */}

                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeEvent}
                  style={{
                    borderColor:
                      SCOUT.light,
                    color:
                      SCOUT.dark,
                  }}
                >
                  {t.close}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          CSS
      ====================================================== */}

      <style>{`

        /* ======================================================
           SECTION
        ====================================================== */

        .upcoming-section {
          padding: 80px 0;
          background: ${SCOUT.white};
        }


        .container {
          width: min(1180px, 92%);
          margin: 0 auto;
        }


        /* ======================================================
           HEADER
        ====================================================== */

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 30px;

          margin-bottom: 38px;
        }


        .section-title {
          margin: 0;

          color: ${SCOUT.darkBlue};

          font-size: 32px;
          line-height: 1.2;

          font-weight: 800;
        }


        .section-title i {
          margin-right: 12px;
        }


        .section-sub {
          margin: 10px 0 0;

          color: ${SCOUT.dark};

          opacity: 0.7;

          font-size: 16px;

          line-height: 1.6;
        }


        /* ======================================================
           VIEW ALL
        ====================================================== */

        .view-all {
          display: inline-flex;
          align-items: center;

          gap: 8px;

          color: ${SCOUT.purple};

          font-weight: 700;

          text-decoration: none;

          white-space: nowrap;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }


        .view-all:hover {
          color: #7B1FA2;

          transform: translateX(3px);
        }


        /* ======================================================
           EVENT GRID
        ====================================================== */

        .event-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 28px;
        }


        /* ======================================================
           EVENT CARD
        ====================================================== */

        .event-card {
          background: ${SCOUT.white};

          border:
            1px solid #e5e7eb;

          border-radius: 20px;

          overflow: hidden;

          box-shadow:
            0 8px 25px
            rgba(0, 0, 0, 0.06);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }


        .event-card:hover {
          transform: translateY(-6px);

          border-color:
            rgba(106, 27, 154, 0.15);

          box-shadow:
            0 18px 40px
            rgba(106, 27, 154, 0.12);
        }


        /* ======================================================
           EVENT IMAGE
        ====================================================== */

        .event-img {
          height: 190px;

          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;
        }


        .event-img > i {
          font-size: 65px;

          transition:
            transform 0.3s ease;
        }


        .event-card:hover
        .event-img > i {
          transform: scale(1.08);
        }


        /* ======================================================
           STATUS
        ====================================================== */

        .event-status {
          position: absolute;

          top: 16px;
          right: 16px;

          padding: 8px 13px;

          border-radius: 30px;

          font-size: 12px;
          font-weight: 700;

          box-shadow:
            0 4px 12px
            rgba(0, 0, 0, 0.08);

          display: flex;
          align-items: center;

          gap: 6px;
        }


        .event-status i {
          font-size: 7px;
        }


        /* ======================================================
           EVENT BODY
        ====================================================== */

        .event-body {
          padding: 25px;
        }


        .event-body h3 {
          margin: 0 0 18px;

          font-size: 22px;

          line-height: 1.35;

          color: ${SCOUT.dark};
        }


        /* ======================================================
           META
        ====================================================== */

        .meta {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 10px;

          color: ${SCOUT.dark};

          opacity: 0.7;

          font-size: 14px;

          line-height: 1.5;
        }


        .meta i {
          width: 18px;

          flex-shrink: 0;

          text-align: center;
        }


        /* ======================================================
           PROGRESS
        ====================================================== */

        .progress-section {
          margin-top: 22px;

          padding-top: 18px;

          border-top:
            1px solid #eeeeee;
        }


        .progress-label {
          display: flex;

          justify-content: space-between;

          margin-bottom: 8px;

          font-size: 13px;

          color: ${SCOUT.dark};

          opacity: 0.7;
        }


        .progress-label strong {
          color: ${SCOUT.dark};

          opacity: 1;
        }


        .progress-bar {
          height: 8px;

          background: #e5e7eb;

          border-radius: 20px;

          overflow: hidden;
        }


        .progress-fill {
          height: 100%;

          border-radius: 20px;

          transition:
            width 0.5s ease;
        }


        .progress-section small {
          display: block;

          margin-top: 7px;

          color: ${SCOUT.dark};

          opacity: 0.6;

          font-size: 12px;
        }


        /* ======================================================
           ACTIONS
        ====================================================== */

        .event-actions {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;

          margin-top: 22px;
        }


        .btn-register,
        .btn-details {
          min-height: 46px;

          border-radius: 10px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          padding: 8px 12px;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          text-decoration: none;

          transition:
            transform 0.25s ease,
            background 0.25s ease,
            color 0.25s ease,
            border-color 0.25s ease;
        }


        .btn-register,
        .btn-details {
          border: 2px solid;
        }


        .btn-register:hover,
        .btn-details:hover {
          transform: translateY(-2px);
        }


        .btn-details {
          background: transparent;
        }


        /* ======================================================
           ERROR
        ====================================================== */

        .error-box {
          background: #FEE2E2;

          color: #991B1B;

          padding: 24px;

          border-radius: 12px;

          text-align: center;

          border:
            1px solid ${SCOUT.red};
        }


        .error-box i {
          display: block;

          margin-bottom: 12px;

          font-size: 32px;
        }


        .error-box p {
          margin: 0;

          line-height: 1.6;
        }


        /* ======================================================
           EMPTY EVENTS
        ====================================================== */

        .empty-events {
          text-align: center;

          padding: 60px 20px;

          background: ${SCOUT.light};

          border-radius: 16px;
        }


        .empty-events > i {
          font-size: 48px;

          opacity: 0.5;
        }


        .empty-events h3 {
          color: ${SCOUT.dark};

          margin:
            16px 0 8px;

          font-size: 22px;
        }


        .empty-events p {
          color: ${SCOUT.dark};

          opacity: 0.6;

          margin: 0;

          line-height: 1.6;
        }


        /* ======================================================
           MODAL OVERLAY
        ====================================================== */

        .event-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 9999;

          background:
            rgba(15, 23, 42, 0.70);

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 20px;

          backdrop-filter:
            blur(5px);

          animation:
            fadeIn 0.2s ease;
        }


        /* ======================================================
           MODAL
        ====================================================== */

        .event-modal {
          width: min(850px, 100%);

          max-height: 92vh;

          overflow-y: auto;

          background:
            ${SCOUT.white};

          border-radius: 22px;

          box-shadow:
            0 30px 80px
            rgba(0, 0, 0, 0.25);

          animation:
            modalIn 0.25s ease;
        }


        /* ======================================================
           MODAL BANNER
        ====================================================== */

        .modal-banner {
          height: 190px;

          position: relative;

          display: flex;

          align-items: center;
          justify-content: center;
        }


        /* ======================================================
           MODAL ICON
        ====================================================== */

        .modal-icon {
          width: 95px;
          height: 95px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;
        }


        .modal-icon i {
          font-size: 45px;
        }


        /* ======================================================
           MODAL CLOSE
        ====================================================== */

        .modal-close {
          position: absolute;

          top: 18px;
          right: 18px;

          width: 42px;
          height: 42px;

          border-radius: 50%;

          cursor: pointer;

          font-size: 16px;

          box-shadow:
            0 4px 15px
            rgba(0, 0, 0, 0.10);

          transition:
            0.25s ease;
        }


        .modal-close:hover {
          background:
            ${SCOUT.purple} !important;

          color:
            ${SCOUT.white} !important;

          transform:
            rotate(90deg);
        }


        /* ======================================================
           MODAL STATUS
        ====================================================== */

        .modal-status {
          position: absolute;

          bottom: 18px;
          left: 20px;

          padding: 8px 14px;

          border-radius: 30px;

          font-size: 13px;
          font-weight: 700;

          display: flex;

          align-items: center;

          gap: 6px;

          box-shadow:
            0 4px 12px
            rgba(0, 0, 0, 0.06);
        }


        .modal-status i {
          font-size: 7px;
        }


        /* ======================================================
           MODAL CONTENT
        ====================================================== */

        .modal-content {
          padding: 32px;
        }


        .modal-content h2 {
          margin: 0 0 12px;

          color: ${SCOUT.dark};

          font-size: 30px;

          line-height: 1.3;
        }


        .modal-description {
          color: ${SCOUT.dark};

          opacity: 0.7;

          line-height: 1.7;

          margin:
            0 0 28px;
        }


        /* ======================================================
           INFO GRID
        ====================================================== */

        .event-info-grid {
          display: grid;

          grid-template-columns:
            repeat(2, 1fr);

          gap: 14px;
        }


        .info-box {
          display: flex;

          align-items: center;

          gap: 14px;

          padding: 16px;

          border-radius: 12px;
        }


        .info-box > i {
          font-size: 20px;

          flex-shrink: 0;
        }


        .info-box small {
          display: block;

          color: ${SCOUT.dark};

          opacity: 0.6;

          margin-bottom: 4px;

          font-size: 12px;
        }


        .info-box strong {
          display: block;

          color: ${SCOUT.dark};

          font-size: 14px;

          line-height: 1.4;
        }


        /* ======================================================
           MODAL REGISTRATION
        ====================================================== */

        .modal-registration {
          margin-top: 30px;

          padding: 20px;

          border-radius: 14px;
        }


        .modal-registration > div:first-child {
          display: flex;

          justify-content: space-between;

          gap: 15px;

          margin-bottom: 10px;
        }


        .modal-registration span {
          color: ${SCOUT.dark};

          opacity: 0.6;
        }


        .modal-registration strong {
          color: ${SCOUT.purple};
        }


        .modal-progress {
          height: 9px;

          border-radius: 20px;

          overflow: hidden;
        }


        .modal-progress div {
          height: 100%;

          border-radius: 20px;

          transition:
            width 0.5s ease;
        }


        .modal-registration p {
          margin: 8px 0 0;

          font-size: 13px;

          color: ${SCOUT.dark};

          opacity: 0.6;
        }


        /* ======================================================
           MODAL ACTIONS
        ====================================================== */

        .modal-actions {
          display: flex;

          gap: 12px;

          margin-top: 28px;
        }


        .modal-register-btn,
        .modal-cancel-btn {
          flex: 1;

          min-height: 48px;

          border-radius: 10px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 8px;

          padding: 10px 18px;

          font-weight: 700;

          text-decoration: none;

          cursor: pointer;

          border: 2px solid;

          font-family: inherit;

          transition:
            0.25s ease;
        }


        .modal-register-btn:hover,
        .modal-cancel-btn:hover {
          transform:
            translateY(-2px);
        }


        .modal-cancel-btn {
          background:
            ${SCOUT.white};
        }


        /* ======================================================
           ANIMATIONS
        ====================================================== */

        @keyframes fadeIn {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }

        }


        @keyframes modalIn {

          from {
            opacity: 0;

            transform:
              translateY(20px)
              scale(0.98);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }

        }


        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 800px) {

          .event-grid {
            grid-template-columns: 1fr;
          }


          .section-header {
            align-items: flex-start;

            flex-direction: column;
          }


          .event-info-grid {
            grid-template-columns: 1fr;
          }


          .view-all {
            margin-top: -10px;
          }

        }


        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 520px) {

          .upcoming-section {
            padding: 55px 0;
          }


          .section-title {
            font-size: 26px;
          }


          .section-sub {
            font-size: 14px;
          }


          .event-body {
            padding: 20px;
          }


          .event-actions {
            grid-template-columns: 1fr;
          }


          .modal-content {
            padding: 22px;
          }


          .modal-content h2 {
            font-size: 24px;
          }


          .modal-actions {
            flex-direction: column;
          }


          .modal-banner {
            height: 160px;
          }


          .modal-icon {
            width: 75px;
            height: 75px;
          }


          .modal-icon i {
            font-size: 35px;
          }


          .modal-status {
            left: 15px;

            bottom: 15px;

            font-size: 11px;

            padding: 7px 10px;
          }


          .modal-close {
            top: 12px;

            right: 12px;
          }

        }


        /* ======================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 380px) {

          .container {
            width: 94%;
          }


          .section-title {
            font-size: 23px;
          }


          .event-img {
            height: 165px;
          }


          .event-img > i {
            font-size: 55px;
          }


          .event-status {
            top: 12px;

            right: 12px;

            padding: 6px 9px;

            font-size: 10px;
          }


          .event-body h3 {
            font-size: 20px;
          }


          .modal-content {
            padding: 19px;
          }

        }


        /* ======================================================
           REDUCED MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {

          .event-card,
          .event-img > i,
          .view-all,
          .btn-register,
          .btn-details,
          .modal-close,
          .modal-register-btn,
          .modal-cancel-btn,
          .progress-fill,
          .modal-progress div {
            transition: none !important;
          }


          .event-modal-overlay,
          .event-modal,
          .skeleton-circle,
          .skeleton-line {
            animation: none !important;
          }


          .event-card:hover {
            transform: none;
          }

        }

      `}</style>

    </>
  );
};

export default UpcomingEvents;
