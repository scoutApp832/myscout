import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';

// 🎨 Scout Color Palette
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

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ============================================================
// BILINGUAL TEXT
// ============================================================

const TEXT = {
  en: {
    recentActivities: 'Recent Activities',
    highlights: 'Highlights from our past events.',
    loading: 'Loading past events...',
    unableToLoad:
      'Unable to load recent activities. Please try again later.',
    viewAll: 'View All Activities',

    noPastEvents: 'No Past Events',
    checkBack:
      'Check back soon for completed activities!',

    completed: 'Completed',
    participants: 'Participants',
    unlimited: 'Unlimited',

    viewGallery: 'View Gallery',
    readReport: 'Read Report',

    eventHighlights: 'Event Highlights',
    memorableEvent:
      'A memorable event that brought our community together.',

    activityHighlights: 'Activity Highlights',

    activityReport: 'Activity Report',
    keyActivities: 'Key Activities',

    participantsInvolved: 'participants involved',

    close: 'Close',
    closeAria: 'Close',

    tba: 'TBA',

    gallery: [
      'Opening Ceremony',
      'Team Activities',
      'Community Service',
      'Leadership Sessions',
      'Outdoor Adventures',
      'Closing Ceremony',
    ],

    highlightsList: [
      'Team building and leadership',
      'Community engagement',
      'Scout skills development',
      'Outdoor activities',
      'Cultural exchange',
      'Environmental awareness',
    ],

    reportActivities: [
      'Leadership development',
      'Community service projects',
      'Team building activities',
      'Scout skills training',
      'Cultural activities',
      'Environmental initiatives',
    ],

    defaultReport:
      'The event was successfully completed. Participants engaged in various activities including leadership training, community service, and team-building exercises. The event brought together scouts and community members for a memorable experience.',
  },

  rw: {
    recentActivities: 'Ibikorwa Biheruka',

    highlights:
      'Ibikorwa by’ingenzi byabaye mu bikorwa byacu byashize.',

    loading: 'Birimo gutegurwa...',

    unableToLoad:
      'Ntibyashoboye kugaragaza ibikorwa biheruka. Ongera ugerageze nyuma.',

    viewAll: 'Reba Ibikorwa Byose',

    noPastEvents: 'Nta Bikorwa Byashize',

    checkBack:
      'Garuka vuba urebe ibikorwa byarangiye!',

    completed: 'Byarangiye',

    participants: 'Abitabiriye',

    unlimited: 'Nta Mubare Wagenewe',

    viewGallery: 'Reba Amafoto',

    readReport: 'Soma Raporo',

    eventHighlights: 'Iby’ingenzi by’Igikorwa',

    memorableEvent:
      'Igikorwa cyiza cyahuje Abaskuti n’abagize umuryango.',

    activityHighlights:
      'Iby’ingenzi by’Igikorwa',

    activityReport:
      'Raporo y’Igikorwa',

    keyActivities:
      'Ibikorwa by’Ingenzi',

    participantsInvolved:
      'abitabiriye',

    close: 'Funga',

    closeAria: 'Funga',

    tba: 'Ntibizwi',

    gallery: [
      'Umuhango wo Gutangiza',
      'Ibikorwa by’Amatsinda',
      'Gufasha Umuryango',
      'Amahugurwa y’Ubuyobozi',
      'Ibikorwa byo Hanze',
      'Umuhango wo Gusoza',
    ],

    highlightsList: [
      'Kubaka ubumwe n’ubuyobozi',
      'Kugira uruhare mu muryango',
      'Guteza imbere ubumenyi bw’Abaskuti',
      'Ibikorwa byo hanze',
      'Kungurana umuco',
      'Kurengera ibidukikije',
    ],

    reportActivities: [
      'Guteza imbere ubushobozi bw’ubuyobozi',
      'Imishinga yo gufasha umuryango',
      'Ibikorwa byo kubaka ubumwe',
      'Amahugurwa y’ubumenyi bw’Abaskuti',
      'Ibikorwa by’umuco',
      'Ibikorwa byo kurengera ibidukikije',
    ],

    defaultReport:
      'Igikorwa cyarangiye neza. Abitabiriye bagize uruhare mu bikorwa bitandukanye birimo amahugurwa y’ubuyobozi, gufasha umuryango no kubaka ubumwe. Igikorwa cyahuje Abaskuti n’abagize umuryango mu buryo bwiza kandi bwibukwa.',
  },
};

const RecentActivities = () => {
  const { language } = useLanguage();

  const text = TEXT[language] || TEXT.en;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalType, setModalType] = useState(null);

  // ==========================================================
  // FETCH PAST EVENTS FROM API
  // ==========================================================

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_URL}/public/events/past?limit=4`
        );

        if (response.data && response.data.success) {
          setEvents(response.data.events || []);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('❌ Error fetching past events:', err);

        setError(text.unableToLoad);

        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [language, text.unableToLoad]);

  // ==========================================================
  // MODAL CONTROLS
  // ==========================================================

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedEvent]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedEvent(null);
        setModalType(null);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return text.tba;
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return text.tba;
    }

    return date.toLocaleDateString(
      language === 'rw' ? 'rw-RW' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  const getEventIcon = (eventType) => {
    const icons = {
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
      other: 'fa-flag',
    };

    return icons[eventType] || 'fa-flag';
  };

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

    return colors[eventType] || SCOUT.light;
  };

  const openModal = (event, type) => {
    setSelectedEvent(event);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setModalType(null);
  };

  // ==========================================================
  // RENDER - LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="recent-section">
        <div className="container">

          <div className="section-header">
            <div>
              <h2 className="section-title">
                <i
                  className="fas fa-history"
                  style={{ color: SCOUT.purple }}
                ></i>

                {text.recentActivities}
              </h2>

              <p className="section-sub">
                {text.loading}
              </p>
            </div>
          </div>

          <div className="event-grid">

            {[1, 2].map((i) => (
              <div
                key={i}
                className="event-card"
                style={{ minHeight: '280px' }}
              >

                <div
                  className="event-img"
                  style={{
                    background: SCOUT.light,
                    height: '190px',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: SCOUT.light,
                      animation:
                        'pulse 1.5s ease-in-out infinite',
                    }}
                  ></div>
                </div>

                <div className="event-body">

                  <div
                    style={{
                      width: '80%',
                      height: '24px',
                      background: SCOUT.light,
                      borderRadius: '4px',
                      marginBottom: '16px',
                      animation:
                        'pulse 1.5s ease-in-out infinite 0.2s',
                    }}
                  ></div>

                  <div
                    style={{
                      width: '60%',
                      height: '14px',
                      background: SCOUT.light,
                      borderRadius: '4px',
                      marginBottom: '8px',
                      animation:
                        'pulse 1.5s ease-in-out infinite 0.4s',
                    }}
                  ></div>

                  <div
                    style={{
                      width: '70%',
                      height: '14px',
                      background: SCOUT.light,
                      borderRadius: '4px',
                      animation:
                        'pulse 1.5s ease-in-out infinite 0.6s',
                    }}
                  ></div>

                </div>
              </div>
            ))}

          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.4;
            }

            50% {
              opacity: 0.8;
            }
          }
        `}</style>
      </section>
    );
  }

  // ==========================================================
  // RENDER - ERROR
  // ==========================================================

  if (error) {
    return (
      <section className="recent-section">
        <div className="container">

          <div className="section-header">
            <div>

              <h2 className="section-title">
                <i
                  className="fas fa-history"
                  style={{ color: SCOUT.purple }}
                ></i>

                {text.recentActivities}
              </h2>

              <p className="section-sub">
                {text.highlights}
              </p>

            </div>
          </div>

          <div
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${SCOUT.red}`,
            }}
          >

            <i
              className="fas fa-exclamation-circle"
              style={{
                color: SCOUT.red,
                fontSize: '32px',
                display: 'block',
                marginBottom: '12px',
              }}
            ></i>

            <p style={{ margin: 0 }}>
              {error}
            </p>

          </div>

        </div>
      </section>
    );
  }

  // ==========================================================
  // RENDER - EMPTY
  // ==========================================================

  if (events.length === 0) {
    return (
      <section className="recent-section">
        <div className="container">

          <div className="section-header">

            <div>

              <h2 className="section-title">
                <i
                  className="fas fa-history"
                  style={{ color: SCOUT.purple }}
                ></i>

                {text.recentActivities}
              </h2>

              <p className="section-sub">
                {text.highlights}
              </p>

            </div>

            <a
              href="/events"
              className="view-all"
            >
              {text.viewAll}

              <i className="fas fa-arrow-right"></i>
            </a>

          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: SCOUT.light,
              borderRadius: '12px',
            }}
          >

            <i
              className="fas fa-calendar-times"
              style={{
                color: SCOUT.purple,
                fontSize: '48px',
                opacity: 0.5,
              }}
            ></i>

            <h3
              style={{
                color: SCOUT.dark,
                marginTop: '16px',
              }}
            >
              {text.noPastEvents}
            </h3>

            <p
              style={{
                color: SCOUT.dark,
                opacity: 0.6,
              }}
            >
              {text.checkBack}
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
      <section className="recent-section">

        <div className="container">

          {/* HEADER */}
          <div className="section-header">

            <div>

              <h2 className="section-title">
                <i
                  className="fas fa-history"
                  style={{ color: SCOUT.purple }}
                ></i>

                {text.recentActivities}
              </h2>

              <p className="section-sub">
                {text.highlights}
              </p>

            </div>

            <a
              href="/events"
              className="view-all"
            >
              {text.viewAll}

              <i className="fas fa-arrow-right"></i>
            </a>

          </div>


          {/* EVENTS */}
          <div className="event-grid">

            {events.map((event) => {

              const icon = getEventIcon(
                event.event_type
              );

              const bgColor = getBgColor(
                event.event_type
              );

              const capacity =
                event.capacity || 0;

              return (
                <div
                  className="event-card"
                  key={event.id}
                >

                  {/* IMAGE / ICON AREA */}

                  <div
                    className="event-img"
                    style={{
                      background: bgColor,
                    }}
                  >

                    <i
                      className={`fas ${icon}`}
                      style={{
                        color: SCOUT.purple,
                      }}
                    ></i>


                    <span
                      className="completed-badge"
                      style={{
                        background: SCOUT.white,
                        color: SCOUT.green,
                        border:
                          `2px solid ${SCOUT.green}`,
                      }}
                    >

                      <i
                        className="fas fa-check-circle"
                        style={{
                          color: SCOUT.green,
                        }}
                      ></i>

                      {text.completed}

                    </span>

                  </div>


                  {/* BODY */}

                  <div className="event-body">

                    <h3>
                      {event.title}
                    </h3>


                    <div className="meta">

                      <i
                        className="fas fa-map-marker-alt"
                        style={{
                          color: SCOUT.purple,
                        }}
                      ></i>

                      <span>
                        {
                          event.location ||
                          event.venue ||
                          text.tba
                        }
                      </span>

                    </div>


                    <div className="meta">

                      <i
                        className="fas fa-calendar-day"
                        style={{
                          color: SCOUT.purple,
                        }}
                      ></i>

                      <span>
                        {formatDate(
                          event.start_date
                        )}
                      </span>

                    </div>


                    <div className="meta">

                      <i
                        className="fas fa-users"
                        style={{
                          color: SCOUT.purple,
                        }}
                      ></i>

                      <span>
                        {capacity > 0
                          ? `${capacity} ${text.participants}`
                          : text.unlimited}
                      </span>

                    </div>


                    {event.district && (
                      <div className="meta">

                        <i
                          className="fas fa-building"
                          style={{
                            color: SCOUT.purple,
                          }}
                        ></i>

                        <span>
                          {event.district.name}
                        </span>

                      </div>
                    )}


                    {/* ACTIONS */}

                    <div className="event-actions">

                      <button
                        type="button"
                        className="btn-gallery"
                        onClick={() =>
                          openModal(
                            event,
                            'gallery'
                          )
                        }
                        style={{
                          background:
                            SCOUT.purple,
                          borderColor:
                            SCOUT.purple,
                          color:
                            SCOUT.white,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            '#7B1FA2';

                          e.target.style.borderColor =
                            '#7B1FA2';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            SCOUT.purple;

                          e.target.style.borderColor =
                            SCOUT.purple;
                        }}
                      >

                        <i className="fas fa-images"></i>

                        {text.viewGallery}

                      </button>


                      <button
                        type="button"
                        className="btn-report"
                        onClick={() =>
                          openModal(
                            event,
                            'report'
                          )
                        }
                        style={{
                          color:
                            SCOUT.purple,
                          borderColor:
                            SCOUT.purple,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            SCOUT.purple;

                          e.target.style.color =
                            SCOUT.white;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            'transparent';

                          e.target.style.color =
                            SCOUT.purple;
                        }}
                      >

                        <i className="fas fa-file-alt"></i>

                        {text.readReport}

                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>


      {/* ======================================================
          MODAL
      ====================================================== */}

      {selectedEvent && (
        <div
          className="activity-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="activity-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL TOP */}

            <div
              className="modal-banner"
              style={{
                background:
                  getBgColor(
                    selectedEvent.event_type
                  ),
              }}
            >

              <button
                className="modal-close"
                onClick={closeModal}
                aria-label={text.closeAria}
                style={{
                  background:
                    SCOUT.white,
                  color:
                    SCOUT.dark,
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    SCOUT.purple;

                  e.target.style.color =
                    SCOUT.white;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    SCOUT.white;

                  e.target.style.color =
                    SCOUT.dark;
                }}
              >

                <i className="fas fa-times"></i>

              </button>


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


              <span
                className="modal-completed"
                style={{
                  background:
                    SCOUT.white,
                  color:
                    SCOUT.green,
                }}
              >

                <i
                  className="fas fa-check-circle"
                  style={{
                    color:
                      SCOUT.green,
                  }}
                ></i>

                {text.completed}

              </span>

            </div>


            {/* MODAL CONTENT */}

            <div className="modal-content">

              <h2>
                {selectedEvent.title}
              </h2>


              <div className="modal-meta">

                <span>

                  <i
                    className="fas fa-map-marker-alt"
                    style={{
                      color:
                        SCOUT.purple,
                    }}
                  ></i>

                  {
                    selectedEvent.location ||
                    selectedEvent.venue ||
                    text.tba
                  }

                </span>


                <span>

                  <i
                    className="fas fa-calendar-day"
                    style={{
                      color:
                        SCOUT.purple,
                    }}
                  ></i>

                  {formatDate(
                    selectedEvent.start_date
                  )}

                </span>


                <span>

                  <i
                    className="fas fa-users"
                    style={{
                      color:
                        SCOUT.purple,
                    }}
                  ></i>

                  {
                    selectedEvent.capacity ||
                    text.unlimited
                  }{' '}

                  {selectedEvent.capacity
                    ? text.participants
                    : ''}

                </span>

              </div>


              {/* ==================================================
                  GALLERY
              ================================================== */}

              {modalType === 'gallery' && (
                <>

                  <div className="modal-heading">

                    <i
                      className="fas fa-images"
                      style={{
                        color:
                          SCOUT.purple,
                      }}
                    ></i>

                    {text.eventHighlights}

                  </div>


                  <p className="modal-description">

                    {
                      selectedEvent.description ||
                      text.memorableEvent
                    }

                  </p>


                  <div className="gallery-grid">

                    {text.gallery.map(
                      (item, index) => (
                        <div
                          className="gallery-item"
                          key={index}
                        >

                          <div
                            className="gallery-placeholder"
                            style={{
                              background:
                                `${SCOUT.purple}10`,
                            }}
                          >

                            <i
                              className="fas fa-camera"
                              style={{
                                color:
                                  SCOUT.purple,
                              }}
                            ></i>

                          </div>

                          <span>
                            {item}
                          </span>

                        </div>
                      )
                    )}

                  </div>


                  <div className="highlights-section">

                    <h3>

                      <i
                        className="fas fa-star"
                        style={{
                          color:
                            SCOUT.gold,
                        }}
                      ></i>

                      {text.activityHighlights}

                    </h3>


                    <div className="highlights-list">

                      {text.highlightsList.map(
                        (highlight, index) => (
                          <div
                            className="highlight-item"
                            key={index}
                            style={{
                              background:
                                `${SCOUT.purple}06`,
                            }}
                          >

                            <i
                              className="fas fa-check"
                              style={{
                                color:
                                  SCOUT.purple,
                              }}
                            ></i>

                            {highlight}

                          </div>
                        )
                      )}

                    </div>

                  </div>

                </>
              )}


              {/* ==================================================
                  REPORT
              ================================================== */}

              {modalType === 'report' && (
                <>

                  <div className="modal-heading">

                    <i
                      className="fas fa-file-alt"
                      style={{
                        color:
                          SCOUT.purple,
                      }}
                    ></i>

                    {text.activityReport}

                  </div>


                  <div
                    className="report-box"
                    style={{
                      borderLeftColor:
                        SCOUT.purple,
                      background:
                        `${SCOUT.purple}06`,
                    }}
                  >

                    <p>

                      {
                        selectedEvent.report ||
                        `${language === 'rw'
                          ? `Igikorwa ${selectedEvent.title} cyarangiye neza. `
                          : `The ${selectedEvent.title} was successfully completed. `
                        }${language === 'rw'
                          ? 'Abitabiriye bagize uruhare mu bikorwa bitandukanye birimo amahugurwa y’ubuyobozi, gufasha umuryango no kubaka ubumwe.'
                          : 'Participants engaged in various activities including leadership training, community service, and team-building exercises. The event brought together scouts and community members for a memorable experience.'
                        }`
                      }

                    </p>

                  </div>


                  <div className="highlights-section">

                    <h3>

                      <i
                        className="fas fa-star"
                        style={{
                          color:
                            SCOUT.gold,
                        }}
                      ></i>

                      {text.keyActivities}

                    </h3>


                    <div className="highlights-list">

                      {text.reportActivities.map(
                        (highlight, index) => (
                          <div
                            className="highlight-item"
                            key={index}
                            style={{
                              background:
                                `${SCOUT.purple}06`,
                            }}
                          >

                            <i
                              className="fas fa-check"
                              style={{
                                color:
                                  SCOUT.purple,
                              }}
                            ></i>

                            {highlight}

                          </div>
                        )
                      )}

                    </div>

                  </div>


                  <div
                    className="report-summary"
                    style={{
                      background:
                        `${SCOUT.green}10`,
                      border:
                        `1px solid ${SCOUT.green}20`,
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

                      <strong
                        style={{
                          color:
                            SCOUT.purple,
                        }}
                      >
                        {
                          selectedEvent.capacity ||
                          '100+'
                        }
                      </strong>

                      <span>
                        {text.participantsInvolved}
                      </span>

                    </div>

                  </div>

                </>
              )}


              {/* CLOSE */}

              <button
                type="button"
                className="close-modal-btn"
                onClick={closeModal}
                style={{
                  borderColor:
                    SCOUT.purple,
                  color:
                    SCOUT.purple,
                  background:
                    SCOUT.white,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    SCOUT.purple;

                  e.target.style.color =
                    SCOUT.white;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    SCOUT.white;

                  e.target.style.color =
                    SCOUT.purple;
                }}
              >

                {text.close}

              </button>

            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          CSS
      ====================================================== */}

      <style>{`

        .recent-section {
          padding: 80px 0;
          background: ${SCOUT.light};
        }

        .container {
          width: min(1180px, 92%);
          margin: 0 auto;
        }

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
        }

        .view-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: ${SCOUT.purple};
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .view-all:hover {
          color: #7B1FA2;
          text-decoration: underline;
        }

        .event-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }

        .event-card {
          background: ${SCOUT.white};
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.06);
          transition: 0.3s ease;
        }

        .event-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(106, 27, 154, 0.12);
        }

        .event-img {
          height: 190px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .event-img > i {
          font-size: 65px;
        }

        .completed-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 8px 13px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .completed-badge i {
          font-size: 14px;
        }

        .event-body {
          padding: 25px;
        }

        .event-body h3 {
          margin: 0 0 18px;
          font-size: 22px;
          color: ${SCOUT.dark};
        }

        .meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: ${SCOUT.dark};
          opacity: 0.7;
          font-size: 14px;
        }

        .meta i {
          width: 18px;
        }

        .event-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 22px;
        }

        .btn-gallery,
        .btn-report {
          min-height: 46px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.25s ease;
          border: 2px solid;
          background: transparent;
        }

        .btn-gallery:hover,
        .btn-report:hover {
          transform: translateY(-2px);
        }

        /* MODAL */

        .activity-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15,23,42,0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .activity-modal {
          width: min(850px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          background: ${SCOUT.white};
          border-radius: 22px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.25);
          animation: modalIn 0.25s ease;
        }

        .modal-banner {
          height: 180px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

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

        .modal-close {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.10);
          transition: 0.25s ease;
        }

        .modal-completed {
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
        }

        .modal-completed i {
          font-size: 14px;
        }

        .modal-content {
          padding: 32px;
        }

        .modal-content h2 {
          margin: 0 0 14px;
          color: ${SCOUT.dark};
          font-size: 30px;
        }

        .modal-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 25px;
          color: ${SCOUT.dark};
          opacity: 0.7;
          font-size: 14px;
        }

        .modal-meta span {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .modal-heading {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 10px 0 15px;
          color: ${SCOUT.dark};
          font-size: 20px;
          font-weight: 800;
        }

        .modal-description {
          color: ${SCOUT.dark};
          opacity: 0.7;
          line-height: 1.7;
          margin-bottom: 25px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .gallery-item {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: ${SCOUT.light};
        }

        .gallery-placeholder {
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-placeholder i {
          font-size: 32px;
        }

        .gallery-item span {
          display: block;
          padding: 10px;
          font-size: 12px;
          color: ${SCOUT.dark};
          opacity: 0.7;
          font-weight: 600;
        }

        .highlights-section {
          margin-top: 30px;
        }

        .highlights-section h3 {
          margin: 0 0 15px;
          font-size: 18px;
          color: ${SCOUT.dark};
        }

        .highlights-section h3 i {
          margin-right: 8px;
        }

        .highlights-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px;
          border-radius: 9px;
          color: ${SCOUT.dark};
          font-size: 14px;
        }

        .highlight-item i {
          flex-shrink: 0;
        }

        .report-box {
          padding: 22px;
          border-left: 4px solid;
          border-radius: 10px;
        }

        .report-box p {
          margin: 0;
          color: ${SCOUT.dark};
          opacity: 0.8;
          line-height: 1.8;
        }

        .report-summary {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 25px;
          padding: 18px;
          border-radius: 12px;
        }

        .report-summary > i {
          font-size: 28px;
        }

        .report-summary strong,
        .report-summary span {
          display: block;
        }

        .report-summary strong {
          font-size: 20px;
        }

        .report-summary span {
          opacity: 0.6;
          font-size: 13px;
        }

        .close-modal-btn {
          width: 100%;
          min-height: 48px;
          margin-top: 30px;
          border: 2px solid;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .close-modal-btn:hover {
          transform: translateY(-2px);
        }

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
            transform: translateY(20px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 800px) {

          .event-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .highlights-list {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 520px) {

          .recent-section {
            padding: 55px 0;
          }

          .section-title {
            font-size: 26px;
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

          .modal-banner {
            height: 160px;
          }

          .gallery-grid {
            grid-template-columns: 1fr;
          }

          .modal-meta {
            flex-direction: column;
            gap: 10px;
          }

        }

      `}</style>
    </>
  );
};

export default RecentActivities;