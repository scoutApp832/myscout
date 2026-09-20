import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { useLanguage } from '../../contexts/LanguageContext';

const Hero = () => {
  const { language, t } = useLanguage();

  // ============================================================
  // HERO TRANSLATIONS
  // ============================================================
  const heroText = {
    en: {
      tagline: ['Educate', 'Empower', 'Change', 'Build'],
      titleLine1: 'Building Stronger Communities',
      titleLine2: 'Through Scouting',
      description:
        'Empowering young people with leadership, life skills, teamwork, and a commitment to creating positive change in Rwanda.',
      joinUs: 'Join Us Today',
      upcomingEvents: 'Upcoming Events',
      growingTogether: 'Growing Together',
      servingCommunities: 'Serving Communities',
      creatingChange: 'Creating Change',
      explore: 'Explore',
    },

    rw: {
      tagline: ['Igisha', 'Shoboza', 'Hindura', 'Wubake'],
      titleLine1: 'Kubaka Imiryango Ikomeye',
      titleLine2: 'Binyuze mu Buskuti',
      description:
        'Guteza imbere urubyiruko binyuze mu buyobozi, ubumenyi bw’ubuzima, gukorera hamwe no kugira uruhare mu mpinduka nziza mu Rwanda.',
      joinUs: 'Tujyane Ubu',
      upcomingEvents: 'Ibikorwa Biteganyijwe',
      growingTogether: 'Dukura Twese Hamwe',
      servingCommunities: 'Dukorera Imiryango',
      creatingChange: 'Duteza Impinduka',
      explore: 'Shakisha',
    },
  };

  const text = heroText[language] || heroText.en;

  return (
    <section className="hero-section">

      {/* ==================================================
          BACKGROUND VIDEO
      ================================================== */}
      <video
        className="hero-video-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/scout.mp4" type="video/mp4" />

        Your browser does not support the video tag.
      </video>


      {/* ==================================================
          VIDEO OVERLAY
      ================================================== */}
      <div className="hero-video-overlay"></div>


      {/* ==================================================
          SUBTLE GREEN TINT
      ================================================== */}
      <div className="hero-green-tint"></div>


      {/* ==================================================
          HEADER
          FIXED AT THE TOP OF THE HERO
      ================================================== */}
      <div className="hero-header">
        <Header />
      </div>


      {/* ==================================================
          HERO CONTENT
      ================================================== */}
      <div className="hero-content">

        {/* ==================================================
            TAGLINE
        ================================================== */}
        <div className="hero-tagline">

          <i className="fas fa-graduation-cap"></i>

          {text.tagline.map((item, index) => (
            <span key={index}>{item}</span>
          ))}

        </div>


        {/* ==================================================
            MAIN TITLE
        ================================================== */}
        <h1>
          {text.titleLine1}
          <br />
          {text.titleLine2}
        </h1>


        {/* ==================================================
            DESCRIPTION
        ================================================== */}
        <p className="hero-description">
          {text.description}
        </p>


        {/* ==================================================
            HERO BUTTONS
        ================================================== */}
        <div className="hero-buttons">

          <Link
            to="/register"
            className="btn-hero btn-join-hero"
          >
            <i className="fas fa-user-plus"></i>

            {text.joinUs}
          </Link>


          <Link
            to="/events"
            className="btn-hero btn-events-hero"
          >
            <i className="fas fa-calendar-alt"></i>

            {text.upcomingEvents}
          </Link>

        </div>


        {/* ==================================================
            TRUST ITEMS
        ================================================== */}
        <div className="hero-trust">

          <div className="trust-item">

            <i className="fas fa-users"></i>

            <span>{text.growingTogether}</span>

          </div>


          <div className="trust-divider"></div>


          <div className="trust-item">

            <i className="fas fa-heart"></i>

            <span>{text.servingCommunities}</span>

          </div>


          <div className="trust-divider"></div>


          <div className="trust-item">

            <i className="fas fa-leaf"></i>

            <span>{text.creatingChange}</span>

          </div>

        </div>

      </div>


      {/* ==================================================
          BOTTOM FADE
      ================================================== */}
      <div className="hero-bottom-fade"></div>


      {/* ==================================================
          SCROLL INDICATOR
      ================================================== */}
      <div className="hero-scroll">

        <span>{text.explore}</span>

        <i className="fas fa-chevron-down"></i>

      </div>


      {/* ==================================================
          HERO CSS
      ================================================== */}
      <style>{`

        /* ==================================================
           HERO CONTAINER
        ================================================== */

        .hero-section {
          position: relative;

          width: 100%;

          min-height: 680px;

          height: 100vh;

          overflow: hidden;

          background: #006a4e;

          color: #ffffff;
        }


        /* ==================================================
           VIDEO BACKGROUND
           Layer 0
        ================================================== */

        .hero-video-bg {
          position: absolute;

          top: 0;
          left: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          object-position: center center;

          display: block;

          z-index: 0;

          filter: none;
        }


        /* ==================================================
           VIDEO OVERLAY
           Layer 1
        ================================================== */

        .hero-video-overlay {
          position: absolute;

          top: 0;
          left: 0;

          width: 100%;
          height: 100%;

          background:
            rgba(0, 0, 0, 0.12);

          z-index: 1;

          pointer-events: none;
        }


        /* ==================================================
           GREEN TINT
           Layer 2
        ================================================== */

        .hero-green-tint {
          position: absolute;

          top: 0;
          left: 0;

          width: 100%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              rgba(0, 106, 78, 0.18) 0%,
              rgba(0, 106, 78, 0.08) 35%,
              rgba(0, 106, 78, 0.02) 65%,
              transparent 100%
            );

          z-index: 2;

          pointer-events: none;
        }


        /* ==================================================
           HEADER
           TOP OF HERO
           Layer 1000
        ================================================== */

        .hero-header {
          position: absolute;

          top: 0;
          left: 0;
          right: 0;

          width: 100%;

          z-index: 1000;
        }


        /*
          Make sure Header itself remains above
          every Hero layer.
        */

        .hero-header .header {
          position: relative;

          z-index: 1000;
        }


        /* ==================================================
           HERO CONTENT
           Layer 10
        ================================================== */

        .hero-content {
          position: relative;

          z-index: 10;

          width: min(1100px, 92%);

          min-height: 100vh;

          margin: 0 auto;

          padding:
            150px 20px
            100px;

          box-sizing: border-box;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          animation:
            heroFadeUp 0.9s ease-out;
        }


        /* ==================================================
           TAGLINE
        ================================================== */

        .hero-tagline {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          flex-wrap: wrap;

          gap: 7px;

          margin-bottom: 22px;

          padding:
            9px 18px;

          border:
            1px solid
            rgba(255, 255, 255, 0.75);

          border-radius: 50px;

          background:
            rgba(0, 0, 0, 0.12);

          backdrop-filter: blur(4px);

          -webkit-backdrop-filter: blur(4px);

          color: #ffffff;

          font-size: 14px;

          font-weight: 800;

          letter-spacing: 0.4px;

          text-shadow:
            0 2px 6px
            rgba(0, 0, 0, 0.90);
        }


        .hero-tagline i {
          font-size: 15px;

          margin-right: 3px;
        }


        .hero-tagline span:not(:last-child)::after {
          content: "·";

          margin-left: 7px;

          opacity: 0.85;
        }


        /* ==================================================
           MAIN TITLE
        ================================================== */

        .hero-content h1 {
          max-width: 1000px;

          margin: 0;

          color: #ffffff;

          font-size:
            clamp(42px, 6vw, 72px);

          line-height: 1.08;

          font-weight: 900;

          letter-spacing: -1.5px;

          text-shadow:
            0 3px 8px
            rgba(0, 0, 0, 0.90),

            0 7px 22px
            rgba(0, 0, 0, 0.45);
        }


        /* ==================================================
           DESCRIPTION
        ================================================== */

        .hero-description {
          width: min(720px, 100%);

          margin:
            23px auto 0;

          color: #ffffff;

          font-size: 18px;

          line-height: 1.7;

          font-weight: 500;

          text-shadow:
            0 2px 7px
            rgba(0, 0, 0, 0.90),

            0 5px 15px
            rgba(0, 0, 0, 0.35);
        }


        /* ==================================================
           BUTTON CONTAINER
        ================================================== */

        .hero-buttons {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 14px;

          margin-top: 32px;
        }


        /* ==================================================
           GENERAL BUTTON
        ================================================== */

        .btn-hero {
          min-width: 190px;

          min-height: 54px;

          padding:
            0 25px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          box-sizing: border-box;

          border-radius: 9px;

          font-size: 15px;

          font-weight: 800;

          text-decoration: none;

          transition:
            transform 0.25s ease,
            background 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease;
        }


        .btn-hero:hover {
          transform:
            translateY(-3px);
        }


        /* ==================================================
           JOIN BUTTON
        ================================================== */

        .btn-join-hero {
          background: #006a4e;

          color: #ffffff;

          border:
            2px solid #006a4e;

          box-shadow:
            0 8px 22px
            rgba(0, 0, 0, 0.30);
        }


        .btn-join-hero:hover {
          background: #00865f;

          border-color: #00865f;

          box-shadow:
            0 12px 28px
            rgba(0, 0, 0, 0.38);
        }


        /* ==================================================
           EVENTS BUTTON
        ================================================== */

        .btn-events-hero {
          background:
            rgba(255, 255, 255, 0.13);

          color: #ffffff;

          border:
            2px solid
            rgba(255, 255, 255, 0.90);

          backdrop-filter: blur(5px);

          -webkit-backdrop-filter: blur(5px);

          box-shadow:
            0 6px 18px
            rgba(0, 0, 0, 0.18);
        }


        .btn-events-hero:hover {
          background: #ffffff;

          color: #006a4e;

          border-color: #ffffff;
        }


        /* ==================================================
           TRUST SECTION
        ================================================== */

        .hero-trust {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 18px;

          margin-top: 38px;

          color: #ffffff;

          font-size: 13px;

          font-weight: 700;

          text-shadow:
            0 2px 6px
            rgba(0, 0, 0, 0.85);
        }


        .trust-item {
          display: flex;

          align-items: center;

          gap: 7px;
        }


        .trust-item i {
          font-size: 14px;
        }


        .trust-divider {
          width: 1px;

          height: 17px;

          background:
            rgba(255, 255, 255, 0.65);
        }


        /* ==================================================
           BOTTOM FADE
           Layer 4
        ================================================== */

        .hero-bottom-fade {
          position: absolute;

          left: 0;
          right: 0;
          bottom: 0;

          height: 100px;

          background:
            linear-gradient(
              to bottom,
              transparent,
              rgba(0, 0, 0, 0.16)
            );

          z-index: 4;

          pointer-events: none;
        }


        /* ==================================================
           SCROLL INDICATOR
           Layer 20
        ================================================== */

        .hero-scroll {
          position: absolute;

          left: 50%;
          bottom: 20px;

          z-index: 20;

          transform:
            translateX(-50%);

          display: flex;

          flex-direction: column;

          align-items: center;

          gap: 6px;

          color:
            rgba(255, 255, 255, 0.95);

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 1.2px;

          text-transform: uppercase;

          text-shadow:
            0 2px 6px
            rgba(0, 0, 0, 0.80);

          animation:
            heroScroll 2s infinite;
        }


        .hero-scroll i {
          font-size: 12px;
        }


        /* ==================================================
           HERO ANIMATION
        ================================================== */

        @keyframes heroFadeUp {

          from {
            opacity: 0;

            transform:
              translateY(25px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }

        }


        @keyframes heroScroll {

          0%,
          100% {
            transform:
              translate(-50%, 0);
          }

          50% {
            transform:
              translate(-50%, 7px);
          }

        }


        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 768px) {

          .hero-section {
            min-height: 680px;

            height: 100svh;
          }


          .hero-video-bg {
            object-position:
              center center;
          }


          .hero-content {
            width: 92%;

            min-height: 100svh;

            padding:
              130px 10px
              80px;
          }


          .hero-content h1 {
            font-size:
              clamp(38px, 8vw, 56px);

            letter-spacing: -1px;
          }


          .hero-description {
            font-size: 16px;

            line-height: 1.6;
          }


          .hero-buttons {
            gap: 11px;
          }


          .hero-trust {
            gap: 12px;

            font-size: 12px;
          }

        }


        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 520px) {

          .hero-section {
            min-height: 650px;

            height: 100svh;
          }


          .hero-video-overlay {
            background:
              rgba(0, 0, 0, 0.17);
          }


          .hero-green-tint {
            background:
              linear-gradient(
                90deg,
                rgba(0, 106, 78, 0.15),
                rgba(0, 106, 78, 0.02)
              );
          }


          .hero-content {
            width: 92%;

            min-height: 100svh;

            padding:
              120px 5px
              65px;
          }


          .hero-tagline {
            gap: 5px;

            margin-bottom: 18px;

            padding:
              8px 12px;

            font-size: 11px;
          }


          .hero-tagline span:not(:last-child)::after {
            margin-left: 5px;
          }


          .hero-content h1 {
            font-size: 37px;

            line-height: 1.12;

            letter-spacing: -0.7px;
          }


          .hero-content h1 br {
            display: none;
          }


          .hero-description {
            margin-top: 17px;

            font-size: 14px;

            line-height: 1.6;
          }


          .hero-buttons {
            width: 100%;

            flex-direction: column;

            margin-top: 25px;
          }


          .btn-hero {
            width: 100%;

            min-width: 0;

            min-height: 50px;
          }


          .hero-trust {
            flex-wrap: wrap;

            gap: 8px;

            margin-top: 25px;

            font-size: 10px;
          }


          .trust-divider {
            display: none;
          }


          .hero-scroll {
            display: none;
          }

        }


        /* ==================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {

          .hero-content,
          .hero-scroll,
          .btn-hero {
            animation: none;

            transition: none;
          }

        }

      `}</style>
    </section>
  );
};

export default Hero;