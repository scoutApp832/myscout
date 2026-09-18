// src/public/events/UpcomingEvents.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UpcomingEvents = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState('');

  /* ============================================================
     LOAD UPCOMING EVENTS
  ============================================================ */

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ============================================================
     LOAD EVENT DETAILS WHEN /events/:id IS OPENED
  ============================================================ */

  useEffect(() => {
    if (id) {
      fetchEventDetails(id);
    } else {
      setSelectedEvent(null);
      setDetailsLoading(false);
    }
  }, [id]);

  /* ============================================================
     FETCH UPCOMING EVENTS
  ============================================================ */

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/public/events/upcoming`
      );

      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);

      setError('Failed to load upcoming events.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FETCH COMPLETE EVENT DETAILS
  ============================================================ */

  const fetchEventDetails = async (eventId) => {
    try {
      setDetailsLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/public/events/${eventId}`
      );

      const event =
        response.data.event ||
        response.data;

      setSelectedEvent(event);
    } catch (err) {
      console.error('Error fetching event details:', err);

      /*
       * FALLBACK
       *
       * If the backend does not provide:
       *
       * GET /api/public/events/:id
       *
       * we try to use the event already loaded
       * from the upcoming events list.
       */

      const existingEvent = events.find(
        (event) =>
          String(event.id) === String(eventId)
      );

      if (existingEvent) {
        setSelectedEvent(existingEvent);
        setError('');
      } else {
        setSelectedEvent(null);

        setError(
          err.response?.data?.message ||
          'Unable to load event details.'
        );
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ============================================================
     OPEN EVENT DETAILS
  ============================================================ */

  const openEventDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  /* ============================================================
     CLOSE DETAILS
  ============================================================ */

  const closeEventDetails = () => {
    navigate('/events/upcoming');
  };

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = (date) => {
    if (!date) {
      return 'Not specified';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not specified';
    }

    return parsedDate.toLocaleDateString('en-RW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /* ============================================================
     FORMAT SHORT DATE
  ============================================================ */

  const formatShortDate = (date) => {
    if (!date) {
      return 'Date TBD';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date TBD';
    }

    return parsedDate.toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /* ============================================================
     FORMAT TIME
  ============================================================ */

  const formatTime = (date) => {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleTimeString('en-RW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* ============================================================
     LOADING PAGE
  ============================================================ */

  if (loading) {
    return (
      <div className="events-loading">

        <div className="events-spinner"></div>

        <p>
          Loading upcoming events...
        </p>

        <style>{`

          .events-loading {
            min-height: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f7faf8;
            color: #006a4e;
          }

          .events-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #dcefe9;
            border-top-color: #006a4e;
            border-radius: 50%;
            animation: eventSpin .8s linear infinite;
          }

          .events-loading p {
            margin-top: 14px;
            font-size: 14px;
            font-weight: 700;
          }

          @keyframes eventSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

        `}</style>

      </div>
    );
  }

  /* ============================================================
     COMPLETE EVENT DETAILS
     
     IMPORTANT:
     This section is PUBLIC.
     There is NO LOGIN CHECK here.
  ============================================================ */

  if (id) {
    return (
      <div className="event-details-page">

        {/* ======================================================
            EVENT DETAILS HERO
        ====================================================== */}

        <section className="event-details-hero">

          <div className="event-container">

            <button
              type="button"
              className="details-back"
              onClick={closeEventDetails}
            >
              <i className="fas fa-arrow-left"></i>

              Back to Upcoming Events
            </button>


            {detailsLoading ? (

              <div className="details-loading">

                <div className="details-spinner"></div>

                <span>
                  Loading event details...
                </span>

              </div>

            ) : selectedEvent ? (

              <>

                <span className="details-badge">

                  <i className="fas fa-calendar-check"></i>

                  Upcoming Event

                </span>


                <h1>
                  {selectedEvent.title}
                </h1>


                {selectedEvent.location && (

                  <div className="details-location">

                    <i className="fas fa-map-marker-alt"></i>

                    <span>
                      {selectedEvent.location}
                    </span>

                  </div>

                )}

              </>

            ) : (

              <div className="details-not-found">

                <i className="fas fa-calendar-times"></i>

                <h1>
                  Event Not Found
                </h1>

              </div>

            )}

          </div>

        </section>


        {/* ======================================================
            EVENT DETAILS CONTENT
        ====================================================== */}

        <section className="event-details-section">

          <div className="event-container">

            {error && !selectedEvent && (

              <div className="details-error">

                <div className="details-error-icon">

                  <i className="fas fa-exclamation-circle"></i>

                </div>

                <h2>
                  Unable to Load Event
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  className="back-events-button"
                  onClick={closeEventDetails}
                >
                  <i className="fas fa-arrow-left"></i>

                  Back to Upcoming Events
                </button>

              </div>

            )}


            {selectedEvent && !detailsLoading && (

              <div className="details-layout">

                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <main className="details-main">


                  {/* =================================================
                      ABOUT EVENT
                  ================================================= */}

                  <article className="details-card">

                    <div className="details-card-heading">

                      <div className="heading-icon">

                        <i className="fas fa-info-circle"></i>

                      </div>

                      <div>

                        <span>
                          EVENT INFORMATION
                        </span>

                        <h2>
                          About This Event
                        </h2>

                      </div>

                    </div>


                    <div className="full-description">

                      {selectedEvent.description ? (

                        selectedEvent.description
                          .split('\n')
                          .map((paragraph, index) => (

                            <p key={index}>
                              {paragraph}
                            </p>

                          ))

                      ) : (

                        <p>
                          No detailed description is
                          available for this event yet.
                        </p>

                      )}

                    </div>

                  </article>


                  {/* =================================================
                      EVENT INFORMATION
                  ================================================= */}

                  <article className="details-card">

                    <div className="details-card-heading">

                      <div className="heading-icon">

                        <i className="fas fa-calendar-alt"></i>

                      </div>

                      <div>

                        <span>
                          IMPORTANT DETAILS
                        </span>

                        <h2>
                          Event Information
                        </h2>

                      </div>

                    </div>


                    <div className="details-info-grid">


                      {/* START DATE */}

                      <div className="info-box">

                        <div className="info-icon">

                          <i className="fas fa-calendar-day"></i>

                        </div>

                        <div className="info-content">

                          <span>
                            Start Date
                          </span>

                          <strong>
                            {formatDate(
                              selectedEvent.start_date
                            )}
                          </strong>

                        </div>

                      </div>


                      {/* START TIME */}

                      {selectedEvent.start_date && (

                        <div className="info-box">

                          <div className="info-icon">

                            <i className="fas fa-clock"></i>

                          </div>

                          <div className="info-content">

                            <span>
                              Start Time
                            </span>

                            <strong>
                              {formatTime(
                                selectedEvent.start_date
                              )}
                            </strong>

                          </div>

                        </div>

                      )}


                      {/* END DATE */}

                      {selectedEvent.end_date && (

                        <div className="info-box">

                          <div className="info-icon">

                            <i className="fas fa-calendar-check"></i>

                          </div>

                          <div className="info-content">

                            <span>
                              End Date
                            </span>

                            <strong>
                              {formatDate(
                                selectedEvent.end_date
                              )}
                            </strong>

                          </div>

                        </div>

                      )}


                      {/* END TIME */}

                      {selectedEvent.end_date && (

                        <div className="info-box">

                          <div className="info-icon">

                            <i className="fas fa-hourglass-end"></i>

                          </div>

                          <div className="info-content">

                            <span>
                              End Time
                            </span>

                            <strong>
                              {formatTime(
                                selectedEvent.end_date
                              )}
                            </strong>

                          </div>

                        </div>

                      )}


                      {/* LOCATION */}

                      <div className="info-box">

                        <div className="info-icon">

                          <i className="fas fa-map-marker-alt"></i>

                        </div>

                        <div className="info-content">

                          <span>
                            Location
                          </span>

                          <strong>
                            {selectedEvent.location ||
                              'Location to be announced'}
                          </strong>

                        </div>

                      </div>


                      {/* EVENT ID */}

                      <div className="info-box">

                        <div className="info-icon">

                          <i className="fas fa-hashtag"></i>

                        </div>

                        <div className="info-content">

                          <span>
                            Event ID
                          </span>

                          <strong>
                            {selectedEvent.id}
                          </strong>

                        </div>

                      </div>

                    </div>

                  </article>


                  {/* =================================================
                      ADDITIONAL INFORMATION
                  ================================================= */}

                  {(selectedEvent.organizer ||
                    selectedEvent.category ||
                    selectedEvent.capacity ||
                    selectedEvent.status) && (

                    <article className="details-card">

                      <div className="details-card-heading">

                        <div className="heading-icon">

                          <i className="fas fa-list-alt"></i>

                        </div>

                        <div>

                          <span>
                            MORE INFORMATION
                          </span>

                          <h2>
                            Additional Details
                          </h2>

                        </div>

                      </div>


                      <div className="additional-grid">

                        {selectedEvent.organizer && (

                          <div className="additional-item">

                            <span>
                              Organizer
                            </span>

                            <strong>
                              {selectedEvent.organizer}
                            </strong>

                          </div>

                        )}


                        {selectedEvent.category && (

                          <div className="additional-item">

                            <span>
                              Category
                            </span>

                            <strong>
                              {selectedEvent.category}
                            </strong>

                          </div>

                        )}


                        {selectedEvent.capacity && (

                          <div className="additional-item">

                            <span>
                              Capacity
                            </span>

                            <strong>
                              {selectedEvent.capacity}
                            </strong>

                          </div>

                        )}


                        {selectedEvent.status && (

                          <div className="additional-item">

                            <span>
                              Status
                            </span>

                            <strong>
                              {selectedEvent.status}
                            </strong>

                          </div>

                        )}

                      </div>

                    </article>

                  )}


                  {/* =================================================
                      EVENT DATE SUMMARY
                  ================================================= */}

                  <article className="event-summary-card">

                    <div className="summary-date">

                      <div className="summary-icon">

                        <i className="fas fa-calendar-check"></i>

                      </div>

                      <div>

                        <span>
                          EVENT DATE
                        </span>

                        <strong>
                          {formatShortDate(
                            selectedEvent.start_date
                          )}
                        </strong>

                      </div>

                    </div>


                    <div className="summary-location">

                      <div className="summary-icon">

                        <i className="fas fa-map-marker-alt"></i>

                      </div>

                      <div>

                        <span>
                          LOCATION
                        </span>

                        <strong>
                          {selectedEvent.location ||
                            'TBD'}
                        </strong>

                      </div>

                    </div>

                  </article>

                </main>


                {/* ==================================================
                    SIDEBAR
                ================================================== */}

                <aside className="details-sidebar">


                  {/* =================================================
                      REGISTER CARD
                  ================================================= */}

                  <div className="registration-card">

                    <div className="registration-icon">

                      <i className="fas fa-users"></i>

                    </div>


                    <span className="registration-label">
                      PARTICIPATE
                    </span>


                    <h2>
                      Join This Event
                    </h2>


                    <p>
                      Interested in participating in
                      this scouting event? Log in to
                      your MSR account to register.
                    </p>


                    {/* LOGIN IS ONLY FOR REGISTRATION */}

                    <Link
                      to="/login"
                      className="register-event-button"
                    >
                      <i className="fas fa-user-plus"></i>

                      Register Now
                    </Link>


                    <div className="login-note">

                      <i className="fas fa-lock"></i>

                      <span>
                        You can view all event details
                        without logging in. Login is
                        only required to register.
                      </span>

                    </div>

                  </div>


                  {/* =================================================
                      QUICK NAVIGATION
                  ================================================= */}

                  <div className="quick-links-card">

                    <h3>
                      Event Navigation
                    </h3>


                    <button
                      type="button"
                      onClick={closeEventDetails}
                    >
                      <i className="fas fa-calendar-alt"></i>

                      All Upcoming Events
                    </button>


                    <Link to="/events">
                      <i className="fas fa-th-large"></i>

                      Events Home
                    </Link>


                    <Link to="/events/past">
                      <i className="fas fa-history"></i>

                      Past Events
                    </Link>


                    <Link to="/events/news">
                      <i className="fas fa-newspaper"></i>

                      Event News
                    </Link>

                  </div>

                </aside>

              </div>

            )}

          </div>

        </section>


        {/* ========================================================
            COMPLETE DETAILS CSS
        ======================================================== */}

        <style>{`

          * {
            box-sizing: border-box;
          }

          .event-details-page {
            min-height: 100vh;
            background: #f6f8f7;
            color: #263238;
          }

          .event-container {
            width: min(1150px, 100%);
            margin: 0 auto;
            padding: 0 20px;
          }


          /* ======================================================
             DETAILS HERO
          ====================================================== */

          .event-details-hero {
            padding: 55px 0 65px;
            color: #ffffff;

            background:
              linear-gradient(
                135deg,
                #006a4e 0%,
                #00533d 55%,
                #003e2f 100%
              );
          }

          .details-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;

            margin-bottom: 25px;
            padding: 0;

            border: 0;
            background: transparent;

            color: #FFD100;

            font-size: 14px;
            font-weight: 800;

            cursor: pointer;
          }

          .details-back:hover {
            text-decoration: underline;
          }

          .details-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;

            margin-bottom: 16px;
            padding: 6px 14px;

            border-radius: 30px;

            background: #FFD100;
            color: #006a4e;

            font-size: 11px;
            font-weight: 900;

            text-transform: uppercase;
            letter-spacing: .5px;
          }

          .event-details-hero h1 {
            max-width: 900px;

            margin: 0 0 18px;

            color: #ffffff;

            font-size:
              clamp(2.1rem, 5vw, 3.7rem);

            line-height: 1.1;
            font-weight: 900;
          }

          .details-location {
            display: flex;
            align-items: center;
            gap: 9px;

            color: rgba(255,255,255,.92);

            font-size: 16px;
            font-weight: 600;
          }

          .details-location i {
            color: #FFD100;
          }


          /* ======================================================
             DETAILS LOADING
          ====================================================== */

          .details-loading {
            display: flex;
            align-items: center;
            gap: 12px;

            color: #ffffff;

            font-size: 14px;
            font-weight: 600;
          }

          .details-spinner {
            width: 26px;
            height: 26px;

            border: 3px solid
              rgba(255,255,255,.30);

            border-top-color: #FFD100;

            border-radius: 50%;

            animation:
              detailsSpin .7s linear infinite;
          }

          @keyframes detailsSpin {

            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }

          }


          /* ======================================================
             NOT FOUND
          ====================================================== */

          .details-not-found {
            padding-top: 10px;
          }

          .details-not-found i {
            color: #FFD100;
            font-size: 38px;
          }

          .details-not-found h1 {
            margin-top: 12px;
          }


          /* ======================================================
             DETAILS SECTION
          ====================================================== */

          .event-details-section {
            padding: 45px 0 75px;
          }

          .details-layout {
            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              330px;

            gap: 28px;

            align-items: start;
          }


          /* ======================================================
             DETAILS CARD
          ====================================================== */

          .details-card {
            margin-bottom: 24px;
            padding: 28px;

            background: #ffffff;

            border:
              1px solid #e3ebe7;

            border-radius: 15px;

            box-shadow:
              0 5px 18px
              rgba(0,0,0,.05);
          }

          .details-card-heading {
            display: flex;
            align-items: center;
            gap: 12px;

            margin-bottom: 22px;
            padding-bottom: 16px;

            border-bottom:
              1px solid #e8eeeb;
          }

          .heading-icon {
            width: 42px;
            height: 42px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background: #e8f5f0;
            color: #006a4e;

            font-size: 17px;
          }

          .details-card-heading span {
            display: block;

            margin-bottom: 3px;

            color: #7a858a;

            font-size: 10px;
            font-weight: 900;

            letter-spacing: .6px;
          }

          .details-card-heading h2 {
            margin: 0;

            color: #006a4e;

            font-size: 1.3rem;
            font-weight: 900;
          }


          /* ======================================================
             DESCRIPTION
          ====================================================== */

          .full-description {
            color: #59636a;

            font-size: 16px;
            line-height: 1.85;
          }

          .full-description p {
            margin: 0 0 15px;
          }

          .full-description p:last-child {
            margin-bottom: 0;
          }


          /* ======================================================
             INFORMATION GRID
          ====================================================== */

          .details-info-grid {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 15px;
          }

          .info-box {
            display: flex;
            align-items: flex-start;
            gap: 12px;

            padding: 15px;

            background: #f7faf8;

            border-radius: 10px;
          }

          .info-icon {
            width: 38px;
            height: 38px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: #006a4e;
            color: #ffffff;

            font-size: 13px;
          }

          .info-content {
            display: flex;
            flex-direction: column;
            gap: 4px;

            min-width: 0;
          }

          .info-content span {
            color: #7a858a;

            font-size: 10px;
            font-weight: 900;

            text-transform: uppercase;
            letter-spacing: .4px;
          }

          .info-content strong {
            color: #263238;

            font-size: 14px;
            line-height: 1.45;

            word-break: break-word;
          }


          /* ======================================================
             ADDITIONAL INFORMATION
          ====================================================== */

          .additional-grid {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 14px;
          }

          .additional-item {
            padding: 15px;

            background: #f7faf8;

            border-radius: 9px;
          }

          .additional-item span {
            display: block;

            margin-bottom: 5px;

            color: #7a858a;

            font-size: 10px;
            font-weight: 900;

            text-transform: uppercase;
          }

          .additional-item strong {
            color: #263238;

            font-size: 14px;
            line-height: 1.4;
          }


          /* ======================================================
             SUMMARY CARD
          ====================================================== */

          .event-summary-card {
            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 15px;

            margin-bottom: 24px;
            padding: 20px;

            background:
              linear-gradient(
                135deg,
                #006a4e,
                #00533d
              );

            border-radius: 14px;

            color: #ffffff;
          }

          .summary-date,
          .summary-location {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .summary-icon {
            width: 42px;
            height: 42px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: rgba(255,255,255,.12);

            color: #FFD100;
          }

          .summary-date span,
          .summary-location span {
            display: block;

            margin-bottom: 3px;

            color: rgba(255,255,255,.65);

            font-size: 9px;
            font-weight: 900;

            letter-spacing: .5px;
          }

          .summary-date strong,
          .summary-location strong {
            display: block;

            color: #ffffff;

            font-size: 13px;
            line-height: 1.4;
          }


          /* ======================================================
             SIDEBAR
          ====================================================== */

          .details-sidebar {
            position: sticky;
            top: 25px;
          }


          /* ======================================================
             REGISTRATION CARD
          ====================================================== */

          .registration-card {
            padding: 28px 24px;

            background: #ffffff;

            border-top:
              5px solid #FFD100;

            border-radius: 16px;

            box-shadow:
              0 8px 25px
              rgba(0,0,0,.08);
          }

          .registration-icon {
            width: 58px;
            height: 58px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 13px;

            border-radius: 50%;

            background: #e8f5f0;
            color: #006a4e;

            font-size: 24px;
          }

          .registration-label {
            display: block;

            margin-bottom: 6px;

            color: #7a858a;

            font-size: 10px;
            font-weight: 900;

            letter-spacing: .6px;
          }

          .registration-card h2 {
            margin: 0 0 10px;

            color: #006a4e;

            font-size: 1.4rem;
            font-weight: 900;
          }

          .registration-card > p {
            margin: 0 0 22px;

            color: #6b7479;

            font-size: 14px;
            line-height: 1.65;
          }


          /* ======================================================
             REGISTER BUTTON
             
             ONLY THIS BUTTON GOES TO LOGIN
          ====================================================== */

          .register-event-button {
            min-height: 52px;

            display: flex;
            align-items: center;
            justify-content: center;

            gap: 9px;

            border:
              1px solid #FFD100;

            border-radius: 8px;

            background: #FFD100;
            color: #006a4e;

            text-decoration: none;

            font-size: 14px;
            font-weight: 900;

            box-shadow:
              0 5px 15px
              rgba(0,0,0,.12);

            transition:
              transform .2s ease,
              background .2s ease;
          }

          .register-event-button:hover {
            background: #e8bf00;

            transform:
              translateY(-2px);
          }


          /* ======================================================
             LOGIN NOTE
          ====================================================== */

          .login-note {
            display: flex;
            align-items: flex-start;
            gap: 8px;

            margin-top: 17px;
            padding-top: 15px;

            border-top:
              1px solid #e8eeeb;

            color: #7a858a;

            font-size: 11px;
            line-height: 1.5;
          }

          .login-note i {
            margin-top: 2px;

            color: #006a4e;
          }


          /* ======================================================
             QUICK LINKS
          ====================================================== */

          .quick-links-card {
            margin-top: 18px;
            padding: 20px;

            background: #ffffff;

            border:
              1px solid #e3ebe7;

            border-radius: 12px;
          }

          .quick-links-card h3 {
            margin: 0 0 12px;

            color: #263238;

            font-size: 15px;
            font-weight: 800;
          }

          .quick-links-card a,
          .quick-links-card button {
            width: 100%;
            min-height: 42px;

            display: flex;
            align-items: center;
            gap: 9px;

            margin-bottom: 5px;
            padding: 0 10px;

            border: 0;
            border-radius: 7px;

            background: transparent;
            color: #59636a;

            text-decoration: none;

            font-family: inherit;
            font-size: 13px;
            font-weight: 600;

            text-align: left;

            cursor: pointer;
          }

          .quick-links-card a:hover,
          .quick-links-card button:hover {
            background: #e8f5f0;
            color: #006a4e;
          }

          .quick-links-card i {
            width: 18px;

            color: #006a4e;

            text-align: center;
          }


          /* ======================================================
             ERROR
          ====================================================== */

          .details-error {
            padding: 60px 20px;

            background: #ffffff;

            border:
              1px solid #e3ebe7;

            border-radius: 14px;

            text-align: center;

            box-shadow:
              0 3px 15px
              rgba(0,0,0,.05);
          }

          .details-error-icon {
            width: 65px;
            height: 65px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin: 0 auto 15px;

            border-radius: 50%;

            background: #fee2e2;
            color: #dc2626;

            font-size: 28px;
          }

          .details-error h2 {
            margin: 0 0 8px;

            color: #263238;
          }

          .details-error p {
            margin: 0 0 20px;

            color: #6b7479;
          }

          .back-events-button {
            min-height: 44px;

            display: inline-flex;
            align-items: center;
            gap: 8px;

            padding: 0 18px;

            border: 0;
            border-radius: 8px;

            background: #006a4e;
            color: #ffffff;

            font-weight: 700;

            cursor: pointer;
          }

          .back-events-button:hover {
            background: #00865f;
          }


          /* ======================================================
             TABLET
          ====================================================== */

          @media (max-width: 850px) {

            .details-layout {
              grid-template-columns: 1fr;
            }

            .details-sidebar {
              position: static;
            }

            .registration-card {
              max-width: 520px;
              margin: 0 auto;
            }

            .quick-links-card {
              max-width: 520px;
              margin: 18px auto 0;
            }

          }


          /* ======================================================
             MOBILE
          ====================================================== */

          @media (max-width: 600px) {

            .event-details-hero {
              padding: 40px 0 45px;
            }

            .event-details-hero h1 {
              font-size: 2rem;
            }

            .event-details-section {
              padding: 30px 0 50px;
            }

            .details-card {
              padding: 20px;
            }

            .details-info-grid {
              grid-template-columns: 1fr;
            }

            .additional-grid {
              grid-template-columns: 1fr;
            }

            .event-summary-card {
              grid-template-columns: 1fr;
            }

            .full-description {
              font-size: 14px;
              line-height: 1.75;
            }

            .registration-card {
              padding: 23px 20px;
            }

          }

        `}</style>

      </div>
    );
  }

  /* ============================================================
     UPCOMING EVENTS LIST PAGE
  ============================================================ */

  return (
    <div className="events-page">

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="events-hero">

        <div className="events-container">

          <Link
            to="/events"
            className="events-back"
          >
            <i className="fas fa-arrow-left"></i>

            Back to Events
          </Link>


          <span className="events-eyebrow">
            UPCOMING EVENTS
          </span>


          <h1>
            Upcoming Events
          </h1>


          <p>
            Discover upcoming scouting events and
            activities happening across Rwanda.
          </p>

        </div>

      </section>


      {/* ========================================================
          EVENTS SECTION
      ======================================================== */}

      <section className="events-section">

        <div className="events-container">

          {error && (

            <div className="events-error">

              <i className="fas fa-exclamation-circle"></i>

              {error}

            </div>

          )}


          {events.length === 0 ? (

            /* ==================================================
               EMPTY
            ================================================== */

            <div className="events-empty">

              <div className="events-empty-icon">

                <i className="fas fa-calendar-alt"></i>

              </div>


              <h3>
                No Upcoming Events
              </h3>


              <p>
                Check back soon for upcoming
                scouting events.
              </p>

            </div>

          ) : (

            /* ==================================================
               EVENTS GRID
            ================================================== */

            <div className="events-grid">

              {events.map((event) => (

                <article
                  className="event-card"
                  key={event.id}
                >

                  {/* BADGE */}

                  <div className="event-card-badge">

                    <i className="fas fa-circle"></i>

                    Upcoming

                  </div>


                  {/* ICON */}

                  <div className="event-card-icon">

                    <i className="fas fa-calendar-check"></i>

                  </div>


                  {/* TITLE */}

                  <h3>
                    {event.title}
                  </h3>


                  {/* DESCRIPTION */}

                  <p className="event-description">

                    {event.description ||
                      'Join us for this upcoming scouting event.'}

                  </p>


                  {/* META */}

                  <div className="event-meta">

                    <span>

                      <i className="fas fa-calendar-alt"></i>

                      {formatShortDate(
                        event.start_date
                      )}

                    </span>


                    {event.start_date && (

                      <span>

                        <i className="fas fa-clock"></i>

                        {formatTime(
                          event.start_date
                        )}

                      </span>

                    )}


                    <span>

                      <i className="fas fa-map-marker-alt"></i>

                      {event.location || 'TBD'}

                    </span>

                  </div>


                  {/* =================================================
                      ACTION BUTTONS
                      
                      Learn More = PUBLIC
                      Register Now = LOGIN
                  ================================================= */}

                  <div className="event-actions">


                    {/* PUBLIC DETAILS */}

                    <button
                      type="button"
                      className="event-learn-btn"
                      onClick={() =>
                        openEventDetails(event.id)
                      }
                    >
                      <i className="fas fa-info-circle"></i>

                      Learn More
                    </button>


                    {/* LOGIN REQUIRED FOR REGISTRATION */}

                    <Link
                      to="/login"
                      className="event-register-btn"
                    >
                      <i className="fas fa-user-plus"></i>

                      Register Now
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* ========================================================
          LIST PAGE CSS
      ======================================================== */}

      <style>{`

        .events-page {
          min-height: 100vh;
          background: #f7faf8;
        }

        .events-container {
          width: min(1100px, 100%);
          margin: 0 auto;
          padding: 0 20px;
        }


        /* ======================================================
           HERO
        ====================================================== */

        .events-hero {
          padding: 60px 20px 55px;

          color: #ffffff;

          background:
            linear-gradient(
              135deg,
              #006a4e,
              #004d3a
            );
        }

        .events-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 17px;

          color: #FFD100;

          text-decoration: none;

          font-size: 14px;
          font-weight: 700;
        }

        .events-back:hover {
          text-decoration: underline;
        }

        .events-eyebrow {
          display: inline-flex;
          align-items: center;

          padding: 5px 14px;

          border-radius: 20px;

          background: #FFD100;
          color: #006a4e;

          font-size: 11px;
          font-weight: 900;

          letter-spacing: .6px;
        }

        .events-hero h1 {
          margin: 12px 0 8px;

          color: #ffffff;

          font-size:
            clamp(2rem, 4vw, 3rem);

          line-height: 1.15;
          font-weight: 900;
        }

        .events-hero p {
          max-width: 650px;

          margin: 0;

          color:
            rgba(255,255,255,.9);

          font-size: 16px;
          line-height: 1.6;
        }


        /* ======================================================
           SECTION
        ====================================================== */

        .events-section {
          padding: 50px 0 70px;
        }


        /* ======================================================
           GRID
        ====================================================== */

        .events-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fill,
              minmax(300px, 1fr)
            );

          gap: 24px;
        }


        /* ======================================================
           EVENT CARD
        ====================================================== */

        .event-card {
          position: relative;

          display: flex;
          flex-direction: column;

          min-height: 390px;

          padding: 25px;

          overflow: hidden;

          background: #ffffff;

          border:
            1px solid #e3ebe7;

          border-left:
            4px solid #006a4e;

          border-radius: 14px;

          box-shadow:
            0 3px 12px
            rgba(0,0,0,.06);

          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .event-card:hover {
          transform:
            translateY(-5px);

          box-shadow:
            0 12px 30px
            rgba(0,106,78,.14);
        }


        /* BADGE */

        .event-card-badge {
          position: absolute;

          top: 15px;
          right: 15px;

          display: inline-flex;
          align-items: center;
          gap: 6px;

          padding: 5px 11px;

          border-radius: 20px;

          background: #e8f5f0;
          color: #006a4e;

          font-size: 10px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .event-card-badge i {
          font-size: 6px;
        }


        /* ICON */

        .event-card-icon {
          width: 52px;
          height: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 17px;

          border-radius: 12px;

          background: #006a4e;
          color: #FFD100;

          font-size: 21px;
        }


        /* TITLE */

        .event-card h3 {
          margin:
            0 95px 10px 0;

          color: #006a4e;

          font-size: 1.2rem;
          line-height: 1.35;

          font-weight: 900;
        }


        /* DESCRIPTION */

        .event-description {
          min-height: 50px;

          margin: 0 0 17px;

          color: #687277;

          font-size: 14px;
          line-height: 1.65;

          display: -webkit-box;

          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;

          overflow: hidden;
        }


        /* META */

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 9px;

          margin-bottom: 22px;

          color: #6f797e;

          font-size: 12px;
        }

        .event-meta span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .event-meta i {
          width: 16px;

          color: #006a4e;

          text-align: center;
        }


        /* ======================================================
           ACTIONS
        ====================================================== */

        .event-actions {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 9px;

          margin-top: auto;
        }

        .event-learn-btn,
        .event-register-btn {
          min-height: 43px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          border-radius: 7px;

          font-size: 12px;
          font-weight: 800;

          text-decoration: none;

          cursor: pointer;

          transition:
            transform .2s ease,
            background .2s ease,
            color .2s ease;
        }


        /* LEARN MORE */

        .event-learn-btn {
          padding: 0 10px;

          border:
            1px solid #006a4e;

          background: #ffffff;

          color: #006a4e;
        }

        .event-learn-btn:hover {
          background: #006a4e;
          color: #ffffff;

          transform:
            translateY(-2px);
        }


        /* REGISTER */

        .event-register-btn {
          padding: 0 10px;

          border:
            1px solid #FFD100;

          background: #FFD100;

          color: #006a4e;
        }

        .event-register-btn:hover {
          background: #e8bf00;

          border-color: #e8bf00;

          transform:
            translateY(-2px);
        }


        /* ======================================================
           EMPTY
        ====================================================== */

        .events-empty {
          padding: 75px 20px;

          background: #ffffff;

          border:
            1px solid #e3ebe7;

          border-radius: 14px;

          text-align: center;

          box-shadow:
            0 3px 12px
            rgba(0,0,0,.05);
        }

        .events-empty-icon {
          width: 70px;
          height: 70px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 15px;

          border-radius: 50%;

          background: #e8f5f0;
          color: #006a4e;

          font-size: 28px;
        }

        .events-empty h3 {
          margin: 0 0 8px;

          color: #006a4e;

          font-size: 1.2rem;
        }

        .events-empty p {
          margin: 0;

          color: #6f797e;

          font-size: 14px;
        }


        /* ======================================================
           ERROR
        ====================================================== */

        .events-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          margin-bottom: 20px;
          padding: 15px;

          border-radius: 8px;

          background: #fee2e2;
          color: #b91c1c;

          text-align: center;

          font-size: 14px;
          font-weight: 600;
        }


        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 768px) {

          .events-hero {
            padding:
              45px 20px;
          }

          .events-section {
            padding:
              35px 0 50px;
          }

          .events-grid {
            grid-template-columns:
              1fr;
          }

        }


        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 520px) {

          .event-card {
            min-height: auto;
            padding: 20px;
          }

          .event-card h3 {
            margin-right: 80px;
          }

          .event-actions {
            grid-template-columns:
              1fr;
          }

          .event-learn-btn,
          .event-register-btn {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
};

export default UpcomingEvents;