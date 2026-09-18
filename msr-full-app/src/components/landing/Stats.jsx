// src/components/Stats/Stats.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000/api';

// ============================================================
// SCOUT COLORS
// ============================================================

const SCOUT = {
  purple: '#6A1B9A',
  gold: '#FFD100',
  darkBlue: '#002B5C',
  green: '#2E7D32',
  red: '#D32F2F',
  white: '#FFFFFF',
  light: '#F5F7FA',
  text: '#1F2937',
  muted: '#667085',
};

// ============================================================
// BILINGUAL TEXT
// ============================================================

const TEXT = {
  en: {
    eyebrow: 'MYSCOUT RWANDA',

    our: 'Our',
    impact: 'Impact',

    description:
      'Discover the growing Scout community and our impact across Rwanda.',

    activeScouts: 'Active Scouts',
    trainedLeaders: 'Trained Leaders',
    districts: 'Districts',
    eventsYearly: 'Events Yearly',
    communityProjects: 'Community Projects',

    error:
      'Unable to load the latest statistics.',
  },

  rw: {
    eyebrow: 'MYSCOUT RWANDA',

    our: 'Ingaruka',
    impact: 'Zacu',

    description:
      'Menya umuryango w’Abaskuti ukomeje kwaguka n’uruhare rwacu mu Rwanda.',

    activeScouts: 'Abaskuti Bakora',
    trainedLeaders: 'Abayobozi Bahuguwe',
    districts: 'Uturere',
    eventsYearly: 'Ibikorwa Bikorwa Buri Mwaka',
    communityProjects: 'Imishinga y’Umuryango',

    error:
      'Ntabwo bishoboye kubona imibare mishya.',
  },
};

// ============================================================
// STAT CONFIGURATION
// ============================================================

const statsData = [
  {
    key: 'activeScouts',
    icon: 'fa-user-graduate',
  },
  {
    key: 'trainedLeaders',
    icon: 'fa-chalkboard-teacher',
  },
  {
    key: 'districts',
    icon: 'fa-map-marked-alt',
  },
  {
    key: 'eventsYearly',
    icon: 'fa-calendar-check',
  },
  {
    key: 'communityProjects',
    icon: 'fa-hands-helping',
  },
];

// ============================================================
// COMPONENT
// ============================================================

const Stats = () => {
  const { language } = useLanguage();

  const text = TEXT[language] || TEXT.en;

  const [stats, setStats] = useState({
    activeScouts: 0,
    trainedLeaders: 0,
    districts: 0,
    eventsYearly: 0,
    communityProjects: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ==========================================================
  // FETCH REAL SYSTEM STATISTICS
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await axios.get(
          `${API_URL}/public/stats`
        );

        if (!mounted) return;

        if (
          response.data &&
          response.data.success &&
          response.data.stats
        ) {
          const data = response.data.stats;

          setStats({
            activeScouts:
              Number(data.activeScouts) || 0,

            trainedLeaders:
              Number(data.trainedLeaders) || 0,

            districts:
              Number(data.districts) || 0,

            eventsYearly:
              Number(data.eventsYearly) || 0,

            communityProjects:
              Number(data.communityProjects) || 0,
          });
        }
      } catch (err) {
        console.error(
          '❌ Failed to load public statistics:',
          err
        );

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // FORMAT NUMBER
  // ==========================================================

  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString(
      language === 'rw' ? 'rw-RW' : 'en-US'
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section
      className="msr-stats-section"
      style={{
        '--scout-purple': SCOUT.purple,
        '--scout-gold': SCOUT.gold,
        '--scout-blue': SCOUT.darkBlue,
        '--scout-green': SCOUT.green,
      }}
    >

      <div className="msr-stats-container">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="msr-stats-header">

          <span className="msr-stats-eyebrow">

            <span className="msr-stats-eyebrow-line"></span>

            {text.eyebrow}

            <span className="msr-stats-eyebrow-line"></span>

          </span>


          <h2>
            {text.our}{' '}
            <span>{text.impact}</span>
          </h2>


          <p>
            {text.description}
          </p>

        </div>


        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (
          <div className="msr-stats-error">

            <i className="fas fa-exclamation-circle"></i>

            <span>
              {text.error}
            </span>

          </div>
        )}


        {/* ====================================================
            STATS GRID
        ==================================================== */}

        <div className="msr-stats-grid">

          {statsData.map((stat, index) => (

            <div
              key={stat.key}
              className="msr-stat-card"
              style={{
                '--delay': `${index * 0.08}s`,
              }}
            >

              {/* Top Scout Gold Line */}

              <div className="msr-stat-top-line"></div>


              {/* Icon */}

              <div className="msr-stat-icon-wrapper">

                <div className="msr-stat-icon">

                  <i
                    className={`fas ${stat.icon}`}
                  ></i>

                </div>

              </div>


              {/* Number */}

              <div className="msr-stat-number">

                {loading ? (
                  <span className="msr-stat-loading">
                    ...
                  </span>
                ) : (
                  formatNumber(stats[stat.key])
                )}

              </div>


              {/* Label */}

              <div className="msr-stat-label">

                {text[stat.key]}

              </div>


              {/* Gold Accent */}

              <div className="msr-stat-accent"></div>

            </div>

          ))}

        </div>

      </div>


      {/* ======================================================
          CSS
      ====================================================== */}

      <style>{`

        /* ====================================================
           SECTION
        ==================================================== */

        .msr-stats-section {
          width: 100%;
          padding: 70px 20px;
          background: ${SCOUT.white};
          position: relative;
          overflow: hidden;
        }

        .msr-stats-section::before {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(106, 27, 154, 0.035);
          top: -140px;
          left: -100px;
          pointer-events: none;
        }

        .msr-stats-section::after {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(255, 209, 0, 0.045);
          bottom: -170px;
          right: -100px;
          pointer-events: none;
        }

        /* ====================================================
           CONTAINER
        ==================================================== */

        .msr-stats-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        /* ====================================================
           HEADER
        ==================================================== */

        .msr-stats-header {
          text-align: center;
          margin-bottom: 42px;
        }

        .msr-stats-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: ${SCOUT.purple};
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .msr-stats-eyebrow-line {
          width: 25px;
          height: 2px;
          background: ${SCOUT.gold};
          border-radius: 10px;
        }

        .msr-stats-header h2 {
          margin: 0;
          color: ${SCOUT.darkBlue};
          font-size: clamp(30px, 4vw, 42px);
          font-weight: 800;
          line-height: 1.15;
        }

        .msr-stats-header h2 span {
          color: ${SCOUT.purple};
        }

        .msr-stats-header p {
          max-width: 600px;
          margin: 12px auto 0;
          color: ${SCOUT.muted};
          font-size: 15px;
          line-height: 1.7;
        }

        /* ====================================================
           ERROR
        ==================================================== */

        .msr-stats-error {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          margin: 0 auto 20px;
          color: #b42318;
          font-size: 13px;
          font-weight: 600;
        }

        /* ====================================================
           GRID
        ==================================================== */

        .msr-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        /* ====================================================
           CARD
        ==================================================== */

        .msr-stat-card {
          position: relative;
          min-height: 205px;
          padding: 30px 18px 25px;
          background: ${SCOUT.white};
          border: 1px solid #ececf0;
          border-radius: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(31, 41, 55, 0.07);
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease,
            border-color 0.35s ease;
          animation: msrStatsFadeUp 0.55s ease both;
          animation-delay: var(--delay);
        }

        .msr-stat-card:hover {
          transform: translateY(-9px);
          border-color: rgba(106, 27, 154, 0.3);
          box-shadow: 0 18px 42px rgba(106, 27, 154, 0.14);
        }

        /* ====================================================
           TOP LINE
        ==================================================== */

        .msr-stat-top-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background:
            linear-gradient(
              90deg,
              ${SCOUT.purple},
              ${SCOUT.gold}
            );
        }

        /* ====================================================
           ICON
        ==================================================== */

        .msr-stat-icon-wrapper {
          margin-bottom: 15px;
        }

        .msr-stat-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(106, 27, 154, 0.08);
          color: ${SCOUT.purple};
          font-size: 23px;
          transition:
            transform 0.35s ease,
            background 0.35s ease,
            color 0.35s ease;
        }

        .msr-stat-card:hover .msr-stat-icon {
          background: ${SCOUT.purple};
          color: ${SCOUT.gold};
          transform: scale(1.1) rotate(-4deg);
        }

        /* ====================================================
           NUMBER
        ==================================================== */

        .msr-stat-number {
          min-height: 34px;
          color: ${SCOUT.darkBlue};
          font-size: 30px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }

        /* ====================================================
           LOADING
        ==================================================== */

        .msr-stat-loading {
          display: inline-block;
          color: ${SCOUT.purple};
          animation:
            msrStatsPulse 1.1s ease-in-out infinite;
        }

        /* ====================================================
           LABEL
        ==================================================== */

        .msr-stat-label {
          margin-top: 7px;
          color: ${SCOUT.muted};
          font-size: 13px;
          font-weight: 700;
          line-height: 1.4;
        }

        /* ====================================================
           ACCENT
        ==================================================== */

        .msr-stat-accent {
          width: 30px;
          height: 3px;
          margin-top: 15px;
          border-radius: 10px;
          background: ${SCOUT.gold};
          transition: width 0.3s ease;
        }

        .msr-stat-card:hover .msr-stat-accent {
          width: 55px;
        }

        /* ====================================================
           ANIMATIONS
        ==================================================== */

        @keyframes msrStatsFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes msrStatsPulse {
          0%,
          100% {
            opacity: 0.35;
          }

          50% {
            opacity: 1;
          }
        }

        /* ====================================================
           TABLET
        ==================================================== */

        @media (max-width: 1100px) {
          .msr-stats-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        /* ====================================================
           MOBILE
        ==================================================== */

        @media (max-width: 700px) {
          .msr-stats-section {
            padding: 55px 15px;
          }

          .msr-stats-header {
            margin-bottom: 30px;
          }

          .msr-stats-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .msr-stat-card {
            min-height: 175px;
            padding: 25px 12px 20px;
            border-radius: 16px;
          }

          .msr-stat-icon {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .msr-stat-number {
            font-size: 25px;
          }

          .msr-stat-label {
            font-size: 12px;
          }
        }

        /* ====================================================
           SMALL MOBILE
        ==================================================== */

        @media (max-width: 430px) {
          .msr-stats-grid {
            grid-template-columns: 1fr;
          }

          .msr-stat-card {
            min-height: 150px;
          }
        }

        /* ====================================================
           REDUCED MOTION
        ==================================================== */

        @media (prefers-reduced-motion: reduce) {
          .msr-stat-card,
          .msr-stat-icon,
          .msr-stat-accent,
          .msr-stat-loading {
            animation: none;
            transition: none;
          }
        }

      `}</style>

    </section>
  );
};

export default Stats;