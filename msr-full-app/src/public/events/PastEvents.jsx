
// src/public/events/PastEvents.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PastEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    fetchPastEvents();
  }, []);

  // ============================================================
  // FETCH PAST EVENTS
  // ============================================================

  const fetchPastEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/public/events/past`
      );

      setEvents(response.data?.events || []);
    } catch (err) {
      console.error('Error fetching past events:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load past events. Please try again.'
      );

      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DATE HELPERS
  // ============================================================

  const getEventDate = (event) => {
    return event?.start_date || event?.date || event?.event_date;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Date TBD';
    }

    return date.toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'Date TBD';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Date TBD';
    }

    return date.toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================================================
  // AVAILABLE YEARS
  // ============================================================

  const availableYears = useMemo(() => {
    const years = events
      .map((event) => {
        const date = new Date(getEventDate(event));

        if (Number.isNaN(date.getTime())) {
          return null;
        }

        return date.getFullYear();
      })
      .filter(Boolean);

    return [...new Set(years)].sort((a, b) => b - a);
  }, [events]);

  // ============================================================
  // FILTER EVENTS
  // ============================================================

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      filtered = filtered.filter((event) => {
        const title =
          event.title?.toLowerCase() || '';

        const description =
          event.description?.toLowerCase() || '';

        const location =
          event.location?.toLowerCase() || '';

        const venue =
          event.venue?.toLowerCase() || '';

        const category =
          event.category?.toLowerCase() || '';

        return (
          title.includes(term) ||
          description.includes(term) ||
          location.includes(term) ||
          venue.includes(term) ||
          category.includes(term)
        );
      });
    }

    // Year
    if (filterYear !== 'all') {
      filtered = filtered.filter((event) => {
        const date = new Date(getEventDate(event));

        if (Number.isNaN(date.getTime())) {
          return false;
        }

        return (
          date.getFullYear() === Number(filterYear)
        );
      });
    }

    // Newest past event first
    filtered.sort((a, b) => {
      const dateA = new Date(getEventDate(a));
      const dateB = new Date(getEventDate(b));

      return dateB - dateA;
    });

    return filtered;
  }, [events, searchTerm, filterYear]);

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearchTerm('');
    setFilterYear('all');
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="past-events-loading-page">
        <div className="past-events-spinner"></div>

        <h3>Loading Past Events</h3>

        <p>
          Please wait while we load previous scouting
          events...
        </p>

        <style>{`
          .past-events-loading-page {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: #f7faf8;
            text-align: center;
          }

          .past-events-spinner {
            width: 52px;
            height: 52px;
            border: 5px solid #dcebe5;
            border-top-color: #006a4e;
            border-radius: 50%;
            animation: pastEventsSpin 0.8s linear infinite;
            margin-bottom: 20px;
          }

          .past-events-loading-page h3 {
            margin: 0 0 8px;
            color: #12372a;
            font-size: 1.25rem;
          }

          .past-events-loading-page p {
            margin: 0;
            color: #66736e;
          }

          @keyframes pastEventsSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="past-events-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="past-events-hero">
        <div className="past-events-container">

          <Link
            to="/events"
            className="past-events-back"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to Events</span>
          </Link>

          <div className="past-events-eyebrow">
            <i className="fas fa-history"></i>
            PAST EVENTS
          </div>

          <h1>Past Events</h1>

          <p>
            Explore previous scouting events, activities,
            training sessions, camps, and community
            gatherings organized across Rwanda.
          </p>

          <div className="past-events-hero-stats">

            <div className="hero-stat">
              <strong>{events.length}</strong>
              <span>Completed Events</span>
            </div>

            <div className="hero-stat-divider"></div>

            <div className="hero-stat">
              <strong>{availableYears.length}</strong>
              <span>Years of Activities</span>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="past-events-section">

        <div className="past-events-container">

          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <div className="past-events-filter-card">

            <div className="filter-heading">

              <div className="filter-heading-icon">
                <i className="fas fa-sliders-h"></i>
              </div>

              <div>
                <h2>Explore Past Events</h2>
                <p>
                  Search and filter previous events
                </p>
              </div>

            </div>

            <div className="past-events-filters">

              {/* Search */}

              <div className="search-wrapper">

                <i className="fas fa-search"></i>

                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="search-input"
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() =>
                      setSearchTerm('')
                    }
                    aria-label="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}

              </div>

              {/* Year */}

              <div className="year-wrapper">

                <i className="fas fa-calendar-alt"></i>

                <select
                  value={filterYear}
                  onChange={(e) =>
                    setFilterYear(e.target.value)
                  }
                  className="filter-select"
                >
                  <option value="all">
                    All Years
                  </option>

                  {availableYears.map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </select>

              </div>

              {/* Result count */}

              <div className="event-count">

                <strong>
                  {filteredEvents.length}
                </strong>

                <span>
                  {filteredEvents.length === 1
                    ? 'event found'
                    : 'events found'}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="past-events-error">

              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>

              <div>
                <strong>Unable to load events</strong>

                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={fetchPastEvents}
              >
                <i className="fas fa-redo"></i>
                Retry
              </button>

            </div>
          )}

          {/* ==================================================
              RESULTS HEADER
          ================================================== */}

          {filteredEvents.length > 0 && (
            <div className="results-header">

              <div>
                <span className="results-label">
                  COMPLETED ACTIVITIES
                </span>

                <h2>
                  {filterYear === 'all'
                    ? 'Our Past Events'
                    : `Events in ${filterYear}`}
                </h2>
              </div>

              {(searchTerm ||
                filterYear !== 'all') && (
                <button
                  type="button"
                  className="clear-top-btn"
                  onClick={clearFilters}
                >
                  <i className="fas fa-times"></i>
                  Clear Filters
                </button>
              )}

            </div>
          )}

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {filteredEvents.length === 0 ? (

            <div className="past-events-empty">

              <div className="empty-icon">
                <i className="fas fa-calendar-times"></i>
              </div>

              <span className="empty-label">
                NO EVENTS FOUND
              </span>

              <h3>No Past Events Found</h3>

              <p>
                {searchTerm ||
                filterYear !== 'all'
                  ? 'We could not find any events matching your search or selected year.'
                  : 'There are no past events available at the moment. Check back later for completed scouting activities.'}
              </p>

              {(searchTerm ||
                filterYear !== 'all') && (
                <button
                  type="button"
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  <i className="fas fa-sync-alt"></i>
                  Reset Filters
                </button>
              )}

            </div>

          ) : (

            /* ==================================================
               EVENTS GRID
            ================================================== */

            <div className="past-events-grid">

              {filteredEvents.map((event) => {

                const eventDate =
                  getEventDate(event);

                const participants =
                  Number(
                    event.participants_count ||
                    event.attendees_count ||
                    event.participants ||
                    0
                  );

                const galleryCount =
                  Array.isArray(event.gallery)
                    ? event.gallery.length
                    : Number(
                        event.gallery_count || 0
                      );

                return (

                  <article
                    className="past-event-card"
                    key={event.id}
                  >

                    {/* Card top */}

                    <div className="past-event-card-top">

                      <div className="completed-badge">
                        <i className="fas fa-check-circle"></i>
                        Completed
                      </div>

                      <div className="event-date-icon">
                        <i className="fas fa-calendar-check"></i>
                      </div>

                    </div>

                    {/* Date */}

                    <div className="past-event-date">
                      {formatShortDate(eventDate)}
                    </div>

                    {/* Title */}

                    <h3>
                      {event.title ||
                        'Untitled Event'}
                    </h3>

                    {/* Description */}

                    <p className="past-event-description">
                      {event.description ||
                        'No description available for this event.'}
                    </p>

                    {/* Meta */}

                    <div className="past-event-meta">

                      <div className="meta-item">

                        <span className="meta-icon">
                          <i className="fas fa-map-marker-alt"></i>
                        </span>

                        <span>
                          {event.location ||
                            event.venue ||
                            'Location not specified'}
                        </span>

                      </div>

                      <div className="meta-item">

                        <span className="meta-icon">
                          <i className="fas fa-users"></i>
                        </span>

                        <span>
                          {participants.toLocaleString()}
                          {' '}
                          {participants === 1
                            ? 'participant'
                            : 'participants'}
                        </span>

                      </div>

                    </div>

                    {/* Gallery */}

                    {galleryCount > 0 && (
                      <div className="past-event-gallery">

                        <i className="fas fa-images"></i>

                        <span>
                          {galleryCount}{' '}
                          {galleryCount === 1
                            ? 'photo'
                            : 'photos'}
                        </span>

                      </div>
                    )}

                    {/* Divider */}

                    <div className="event-card-divider"></div>

                    {/* Action */}

                    <Link
                      to={`/events/${event.id}`}
                      className="past-event-link"
                    >
                      <span>View Event Details</span>

                      <i className="fas fa-arrow-right"></i>
                    </Link>

                  </article>

                );
              })}

            </div>

          )}

        </div>

      </section>

      {/* ======================================================
          BOTTOM CTA
      ====================================================== */}

      <section className="past-events-cta">

        <div className="past-events-container">

          <div className="cta-icon">
            <i className="fas fa-users"></i>
          </div>

          <div className="cta-content">

            <span>
              JOIN THE SCOUTING MOVEMENT
            </span>

            <h2>
              Be Part of Our Next Event
            </h2>

            <p>
              Don't just read about our activities.
              Join the Rwanda Scouting community and
              take part in future events.
            </p>

          </div>

          <Link
            to="/register"
            className="cta-button"
          >
            Join Now
            <i className="fas fa-arrow-right"></i>
          </Link>

        </div>

      </section>

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>{`

        /* =====================================================
           BASE
        ===================================================== */

        .past-events-page {
          min-height: 100vh;
          background: #f7faf8;
          color: #26352f;
        }

        .past-events-container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .past-events-hero {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #003d2d 0%,
              #006a4e 55%,
              #00845f 100%
            );
          color: white;
          padding: 72px 0 70px;
        }

        .past-events-hero::before {
          content: '';
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          right: -120px;
          top: -170px;
        }

        .past-events-hero::after {
          content: '';
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          border: 1px solid rgba(255,209,0,0.12);
          left: -130px;
          bottom: -170px;
        }

        .past-events-hero .past-events-container {
          position: relative;
          z-index: 2;
        }

        .past-events-back {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #FFD100;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 22px;
          transition: all 0.25s ease;
        }

        .past-events-back:hover {
          color: white;
          transform: translateX(-3px);
        }

        .past-events-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFD100;
          color: #12372a;
          padding: 7px 15px;
          border-radius: 30px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 15px;
        }

        .past-events-hero h1 {
          margin: 0 0 13px;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .past-events-hero p {
          max-width: 690px;
          margin: 0;
          color: rgba(255,255,255,0.88);
          font-size: 1.05rem;
          line-height: 1.75;
        }

        .past-events-hero-stats {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-top: 34px;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .hero-stat strong {
          font-size: 1.8rem;
          line-height: 1;
          color: #FFD100;
        }

        .hero-stat span {
          color: rgba(255,255,255,0.75);
          font-size: 0.78rem;
          font-weight: 600;
        }

        .hero-stat-divider {
          width: 1px;
          height: 38px;
          background: rgba(255,255,255,0.2);
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .past-events-section {
          padding: 55px 0 75px;
        }

        /* =====================================================
           FILTER CARD
        ===================================================== */

        .past-events-filter-card {
          background: white;
          border: 1px solid #e3ebe7;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 42px;
          box-shadow: 0 8px 30px rgba(0,52,38,0.06);
        }

        .filter-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 20px;
        }

        .filter-heading-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #eaf5f0;
          color: #006a4e;
        }

        .filter-heading h2 {
          margin: 0 0 3px;
          color: #12372a;
          font-size: 1.05rem;
        }

        .filter-heading p {
          margin: 0;
          color: #7b8782;
          font-size: 0.8rem;
        }

        .past-events-filters {
          display: grid;
          grid-template-columns: minmax(250px, 1fr) 190px auto;
          gap: 12px;
          align-items: center;
        }

        .search-wrapper,
        .year-wrapper {
          height: 48px;
          display: flex;
          align-items: center;
          position: relative;
          background: #f7faf8;
          border: 1px solid #dce7e2;
          border-radius: 10px;
          transition: all 0.25s ease;
        }

        .search-wrapper:focus-within,
        .year-wrapper:focus-within {
          background: white;
          border-color: #006a4e;
          box-shadow: 0 0 0 3px rgba(0,106,78,0.08);
        }

        .search-wrapper > i,
        .year-wrapper > i {
          margin-left: 15px;
          color: #75837d;
          font-size: 0.88rem;
        }

        .search-input {
          width: 100%;
          height: 100%;
          padding: 0 40px 0 11px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #24332d;
          font-size: 0.9rem;
          box-sizing: border-box;
        }

        .search-input::placeholder {
          color: #99a49f;
        }

        .search-clear {
          position: absolute;
          right: 9px;
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 50%;
          background: #dfe9e5;
          color: #52625b;
          cursor: pointer;
        }

        .filter-select {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          padding: 0 12px;
          color: #33443c;
          font-size: 0.88rem;
          cursor: pointer;
        }

        .event-count {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 17px;
          border-radius: 10px;
          background: #f1f7f4;
          color: #66756e;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        .event-count strong {
          color: #006a4e;
          font-size: 1rem;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .past-events-error {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff7f6;
          border: 1px solid #f2d3ce;
          border-left: 4px solid #d9534f;
          border-radius: 12px;
          padding: 15px 17px;
          margin-bottom: 30px;
        }

        .error-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fde9e7;
          color: #d9534f;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .past-events-error strong {
          color: #8d2926;
          font-size: 0.9rem;
        }

        .past-events-error p {
          margin: 3px 0 0;
          color: #87605d;
          font-size: 0.8rem;
        }

        .past-events-error button {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border: 0;
          border-radius: 8px;
          background: #d9534f;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        /* =====================================================
           RESULTS HEADER
        ===================================================== */

        .results-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .results-label {
          color: #006a4e;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .results-header h2 {
          margin: 5px 0 0;
          color: #12372a;
          font-size: 1.75rem;
          letter-spacing: -0.5px;
        }

        .clear-top-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: white;
          border: 1px solid #d8e4df;
          color: #53635b;
          border-radius: 8px;
          padding: 8px 13px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .clear-top-btn:hover {
          border-color: #006a4e;
          color: #006a4e;
        }

        /* =====================================================
           GRID
        ===================================================== */

        .past-events-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 22px;
        }

        /* =====================================================
           CARD
        ===================================================== */

        .past-event-card {
          position: relative;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: white;
          border: 1px solid #e1e9e5;
          border-radius: 16px;
          padding: 21px;
          box-shadow: 0 5px 20px rgba(0,52,38,0.055);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
          overflow: hidden;
        }

        .past-event-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #006a4e;
          opacity: 0.7;
        }

        .past-event-card:hover {
          transform: translateY(-5px);
          border-color: #bcd9ce;
          box-shadow: 0 14px 35px rgba(0,52,38,0.11);
        }

        .past-event-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .completed-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #47705f;
          background: #edf7f2;
          border: 1px solid #d8ebe2;
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 0.68rem;
          font-weight: 700;
        }

        .completed-badge i {
          color: #006a4e;
        }

        .event-date-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #fff8d8;
          color: #a47e00;
        }

        .past-event-date {
          color: #006a4e;
          font-size: 0.76rem;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .past-event-card h3 {
          color: #12372a;
          font-size: 1.15rem;
          line-height: 1.35;
          margin: 0 0 10px;
        }

        .past-event-description {
          color: #697871;
          font-size: 0.86rem;
          line-height: 1.65;
          margin: 0 0 17px;

          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }

        /* =====================================================
           META
        ===================================================== */

        .past-event-meta {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 11px;
        }

        .meta-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #68766f;
          font-size: 0.79rem;
          line-height: 1.45;
        }

        .meta-icon {
          width: 22px;
          flex-shrink: 0;
          color: #006a4e;
          text-align: center;
        }

        /* =====================================================
           GALLERY
        ===================================================== */

        .past-event-gallery {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          background: #f5f7f6;
          color: #68766f;
          border-radius: 7px;
          padding: 6px 9px;
          font-size: 0.75rem;
          margin-bottom: 5px;
        }

        .past-event-gallery i {
          color: #006a4e;
        }

        /* =====================================================
           CARD LINK
        ===================================================== */

        .event-card-divider {
          height: 1px;
          background: #edf1ef;
          margin: 15px 0 13px;
        }

        .past-event-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #006a4e;
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 700;
          transition: all 0.25s ease;
        }

        .past-event-link i {
          transition: transform 0.25s ease;
        }

        .past-event-link:hover {
          color: #004f3a;
        }

        .past-event-link:hover i {
          transform: translateX(4px);
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .past-events-empty {
          background: white;
          border: 1px dashed #cbdcd5;
          border-radius: 18px;
          text-align: center;
          padding: 70px 25px;
        }

        .empty-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #edf6f2;
          color: #006a4e;
          font-size: 1.7rem;
        }

        .empty-label {
          color: #75847d;
          font-size: 0.67rem;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .past-events-empty h3 {
          margin: 8px 0;
          color: #12372a;
          font-size: 1.3rem;
        }

        .past-events-empty p {
          max-width: 500px;
          margin: 0 auto 20px;
          color: #75817c;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .clear-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 17px;
          border: 0;
          border-radius: 8px;
          background: #006a4e;
          color: white;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
        }

        .clear-filters-btn:hover {
          background: #004f3a;
        }

        /* =====================================================
           CTA
        ===================================================== */

        .past-events-cta {
          background: #003d2d;
          color: white;
          padding: 42px 0;
        }

        .past-events-cta .past-events-container {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .cta-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 15px;
          background: rgba(255,209,0,0.13);
          color: #FFD100;
          font-size: 1.4rem;
        }

        .cta-content {
          flex: 1;
        }

        .cta-content > span {
          color: #FFD100;
          font-size: 0.67rem;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .cta-content h2 {
          margin: 4px 0 5px;
          font-size: 1.45rem;
        }

        .cta-content p {
          margin: 0;
          color: rgba(255,255,255,0.7);
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 19px;
          border-radius: 9px;
          background: #FFD100;
          color: #12372a;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 800;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .cta-button:hover {
          background: #ffe05c;
          transform: translateY(-2px);
        }

        .cta-button i {
          transition: transform 0.25s ease;
        }

        .cta-button:hover i {
          transform: translateX(3px);
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 950px) {

          .past-events-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .past-events-filters {
            grid-template-columns:
              minmax(0, 1fr)
              180px;
          }

          .event-count {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }

        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 680px) {

          .past-events-container {
            padding: 0 17px;
          }

          .past-events-hero {
            padding: 48px 0 50px;
          }

          .past-events-hero h1 {
            font-size: 2.2rem;
          }

          .past-events-hero p {
            font-size: 0.9rem;
            line-height: 1.65;
          }

          .past-events-hero-stats {
            gap: 18px;
            margin-top: 26px;
          }

          .hero-stat strong {
            font-size: 1.45rem;
          }

          .hero-stat span {
            font-size: 0.7rem;
          }

          .past-events-section {
            padding: 35px 0 55px;
          }

          .past-events-filter-card {
            padding: 17px;
            border-radius: 14px;
          }

          .past-events-filters {
            grid-template-columns: 1fr;
          }

          .event-count {
            grid-column: auto;
            justify-content: flex-start;
          }

          .results-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .results-header h2 {
            font-size: 1.45rem;
          }

          .past-events-grid {
            grid-template-columns: 1fr;
          }

          .past-event-card {
            padding: 19px;
          }

          .past-events-error {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .past-events-error button {
            margin-left: 52px;
          }

          .past-events-cta .past-events-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }

        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 420px) {

          .past-events-hero {
            padding: 40px 0 44px;
          }

          .past-events-hero h1 {
            font-size: 2rem;
          }

          .past-events-hero-stats {
            flex-wrap: wrap;
          }

          .hero-stat-divider {
            display: none;
          }

          .past-events-filter-card {
            padding: 14px;
          }

          .filter-heading {
            align-items: flex-start;
          }

          .filter-heading-icon {
            width: 38px;
            height: 38px;
          }

          .past-event-card h3 {
            font-size: 1.05rem;
          }

        }

      `}</style>
    </div>
  );
};

export default PastEvents;