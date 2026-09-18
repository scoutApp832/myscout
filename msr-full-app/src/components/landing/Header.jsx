import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  const { language, changeLanguage, t } = useLanguage();

  const closeMenu = () => {
    setMenuOpen(false);
    setAboutOpen(false);
    setEventsOpen(false);
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'rw' : 'en');
  };

  return (
    <>
      <header className="header">

        {/* ==================================================
            BRAND
        ================================================== */}
        <div className="brand-logo">
          <Link
            to="/"
            className="brand-link"
            onClick={closeMenu}
          >
            <img
              src="/logo.png"
              alt="MSR Logo"
              className="brand-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />

            <span>MSR · MyScout Rwanda</span>
          </Link>
        </div>

        {/* ==================================================
            MOBILE BUTTON
        ================================================== */}
        <button
          type="button"
          className={`mobile-menu-btn ${
            menuOpen ? 'active' : ''
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* ==================================================
            NAVIGATION
        ================================================== */}
        <nav
          className={`nav-links ${
            menuOpen ? 'mobile-open' : ''
          }`}
        >

          {/* ==================================================
              HOME
          ================================================== */}
          <div className="nav-item">
            <Link
              to="/"
              onClick={closeMenu}
            >
              {t.nav.home}
            </Link>
          </div>

          <span className="separator">|</span>

          {/* ==================================================
              ABOUT
          ================================================== */}
          <div
            className={`nav-item dropdown-wrapper ${
              aboutOpen ? 'dropdown-active' : ''
            }`}
          >
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                setAboutOpen(!aboutOpen);
                setEventsOpen(false);
              }}
              aria-expanded={aboutOpen}
            >
              <span>{t.nav.about}</span>

              <span className="arrow">
                {aboutOpen ? '▲' : '▼'}
              </span>
            </button>

            <div className="dropdown">

              <Link
                to="/about/rsa"
                onClick={closeMenu}
              >
                {t.about?.rsa ||
                  'Rwanda Scout Association'}
              </Link>

              <Link
                to="/about/structure"
                onClick={closeMenu}
              >
                {t.about?.structure ||
                  'Organization Structure'}
              </Link>

              <Link
                to="/about/partners"
                onClick={closeMenu}
              >
                {t.about?.partners ||
                  'Partners & Donate'}
              </Link>

              <Link
                to="/about/membership"
                onClick={closeMenu}
              >
                {t.about?.membership ||
                  'Membership'}
              </Link>

              <Link
                to="/about/team"
                onClick={closeMenu}
              >
                {t.about?.team ||
                  'MSR Development Team'}
              </Link>

            </div>
          </div>

          <span className="separator">|</span>

          {/* ==================================================
              EVENTS
          ================================================== */}
          <div
            className={`nav-item dropdown-wrapper ${
              eventsOpen ? 'dropdown-active' : ''
            }`}
          >
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                setEventsOpen(!eventsOpen);
                setAboutOpen(false);
              }}
              aria-expanded={eventsOpen}
            >
              <span>{t.nav.events}</span>

              <span className="arrow">
                {eventsOpen ? '▲' : '▼'}
              </span>
            </button>

            <div className="dropdown">

              <Link
                to="/events/upcoming"
                onClick={closeMenu}
              >
                {t.events?.upcoming ||
                  'Upcoming Events'}
              </Link>

              <Link
                to="/events/past"
                onClick={closeMenu}
              >
                {t.events?.past ||
                  'Past Events'}
              </Link>

              <Link
                to="/events/news"
                onClick={closeMenu}
              >
                {t.events?.news ||
                  'News'}
              </Link>

            </div>
          </div>

          <span className="separator">|</span>

          {/* ==================================================
              MARKETPLACE
          ================================================== */}
          <div className="nav-item">
            <Link
              to="/marketplace"
              onClick={closeMenu}
            >
              {t.nav.marketplace}
            </Link>
          </div>

          <span className="separator">|</span>

          {/* ==================================================
              CONTACT
          ================================================== */}
          <div className="nav-item">
            <Link
              to="/contact"
              onClick={closeMenu}
            >
              {t.contact?.title || 'Contact Us'}
            </Link>
          </div>

          {/* ==================================================
              LANGUAGE SWITCHER
          ================================================== */}
          <div className="language-switcher">

            <button
              type="button"
              className={`language-btn ${
                language === 'en' ? 'active' : ''
              }`}
              onClick={() => {
                changeLanguage('en');
                closeMenu();
              }}
              aria-label="Switch to English"
              aria-pressed={language === 'en'}
            >
              <span className="language-flag">
                🇬🇧
              </span>

              <span>EN</span>
            </button>

            <span className="language-divider">
              |
            </span>

            <button
              type="button"
              className={`language-btn ${
                language === 'rw' ? 'active' : ''
              }`}
              onClick={() => {
                changeLanguage('rw');
                closeMenu();
              }}
              aria-label="Switch to Kinyarwanda"
              aria-pressed={language === 'rw'}
            >
              <span className="language-flag">
                🇷🇼
              </span>

              <span>RW</span>
            </button>

          </div>

          {/* ==================================================
              JOIN NOW
          ================================================== */}
          <Link
            to="/login"
            className="btn-join-header"
            onClick={closeMenu}
          >
            <i className="fas fa-user-plus"></i>

            <span>
              {t.nav.join}
            </span>
          </Link>

        </nav>
      </header>

      {/* ==================================================
          HEADER CSS
      ================================================== */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* ==================================================
           HEADER
        ================================================== */

        .header {
          position: relative;

          width: 100%;
          min-height: 78px;

          padding: 0 5%;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;

          background: rgba(0, 0, 0, 0.16);

          border-bottom:
            1px solid rgba(255, 255, 255, 0.20);

          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          z-index: 1000;
        }

        /* ==================================================
           BRAND
        ================================================== */

        .brand-logo {
          flex-shrink: 0;
        }

        .brand-link {
          display: flex;
          align-items: center;

          gap: 10px;

          color: #FFD100;

          text-decoration: none;

          font-size: 18px;
          font-weight: 800;

          white-space: nowrap;

          transition: color 0.25s ease;
        }

        .brand-link:hover {
          color: #ffffff;
        }

        .brand-image {
          width: auto;
          height: 42px;

          object-fit: contain;

          display: block;
        }

        /* ==================================================
           NAVIGATION
        ================================================== */

        .nav-links {
          flex: 1;

          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 18px;
        }

        .nav-item {
          position: relative;

          display: flex;
          align-items: center;
        }

        .nav-item > a,
        .nav-link {
          color: #ffffff;

          font-size: 14px;
          font-weight: 700;

          text-decoration: none;

          white-space: nowrap;

          transition:
            color 0.25s ease,
            background 0.25s ease;
        }

        .nav-item > a:hover,
        .nav-link:hover {
          color: #FFD100;
        }

        /* ==================================================
           NAV BUTTON
        ================================================== */

        .nav-link {
          border: 0;
          outline: none;

          background: transparent;

          padding: 8px 0;

          font-family: inherit;

          cursor: pointer;
        }

        .arrow {
          margin-left: 5px;

          font-size: 9px;
        }

        /* ==================================================
           SEPARATOR
        ================================================== */

        .separator {
          color: rgba(255, 255, 255, 0.50);

          font-size: 13px;

          user-select: none;
        }

        /* ==================================================
           DROPDOWN
        ================================================== */

        .dropdown {
          position: absolute;

          top: calc(100% + 15px);
          left: 50%;

          width: 250px;

          padding: 8px;

          background: #ffffff;

          border-radius: 10px;

          box-shadow:
            0 15px 40px rgba(0, 0, 0, 0.25);

          opacity: 0;
          visibility: hidden;

          pointer-events: none;

          transform:
            translateX(-50%)
            translateY(-8px);

          transition:
            opacity 0.22s ease,
            transform 0.22s ease,
            visibility 0.22s ease;

          z-index: 2000;
        }

        .dropdown::before {
          content: "";

          position: absolute;

          top: -6px;
          left: 50%;

          width: 12px;
          height: 12px;

          background: #ffffff;

          transform:
            translateX(-50%)
            rotate(45deg);
        }

        .dropdown-wrapper:hover .dropdown,
        .dropdown-wrapper.dropdown-active .dropdown {
          opacity: 1;

          visibility: visible;

          pointer-events: auto;

          transform:
            translateX(-50%)
            translateY(0);
        }

        .dropdown a {
          display: block;

          padding: 12px 14px;

          color: #263238;

          text-decoration: none;

          font-size: 13px;
          font-weight: 600;

          border-radius: 7px;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            padding-left 0.2s ease;
        }

        .dropdown a:hover {
          color: #006a4e;

          background: #e8f5f0;

          padding-left: 18px;
        }

        /* ==================================================
           LANGUAGE SWITCHER
        ================================================== */

        .language-switcher {
          display: flex;
          align-items: center;
          gap: 4px;

          min-height: 38px;

          padding: 3px 5px;

          background:
            rgba(0, 0, 0, 0.16);

          border:
            1px solid rgba(255, 255, 255, 0.25);

          border-radius: 22px;

          white-space: nowrap;
        }

        .language-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 4px;

          min-height: 30px;

          padding: 4px 8px;

          border: none;
          border-radius: 16px;

          background: transparent;

          color: #ffffff;

          font-family: inherit;

          font-size: 11px;
          font-weight: 800;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .language-btn:hover {
          background:
            rgba(255, 255, 255, 0.12);

          color: #FFD100;
        }

        .language-btn.active {
          background: #FFD100;

          color: #006a4e;

          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .language-btn.active:hover {
          background: #ffffff;

          color: #006a4e;

          transform: translateY(-1px);
        }

        .language-flag {
          font-size: 14px;

          line-height: 1;
        }

        .language-divider {
          color:
            rgba(255, 255, 255, 0.35);

          font-size: 11px;

          user-select: none;
        }

        /* ==================================================
           JOIN BUTTON
        ================================================== */

        .btn-join-header {
          min-height: 42px;

          padding: 0 18px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          background: #FFD100;

          color: #006a4e;

          border:
            2px solid #FFD100;

          border-radius: 8px;

          text-decoration: none;

          font-size: 13px;
          font-weight: 800;

          white-space: nowrap;

          box-shadow:
            0 5px 16px rgba(0, 0, 0, 0.20);

          transition:
            transform 0.25s ease,
            background 0.25s ease,
            color 0.25s ease;
        }

        .btn-join-header:hover {
          background: #ffffff;

          color: #006a4e;

          transform: translateY(-2px);
        }

        /* ==================================================
           MOBILE BUTTON
        ================================================== */

        .mobile-menu-btn {
          display: none;

          width: 44px;
          height: 42px;

          padding: 7px;

          border:
            1px solid rgba(255, 255, 255, 0.45);

          border-radius: 8px;

          background:
            rgba(0, 0, 0, 0.15);

          cursor: pointer;

          flex-shrink: 0;
        }

        .mobile-menu-btn span {
          display: block;

          width: 22px;
          height: 2px;

          margin: 5px auto;

          background: #ffffff;

          border-radius: 2px;

          transition:
            transform 0.25s ease,
            opacity 0.25s ease;
        }

        /* ==================================================
           MOBILE ACTIVE
        ================================================== */

        .mobile-menu-btn.active span:nth-child(1) {
          transform:
            translateY(7px)
            rotate(45deg);
        }

        .mobile-menu-btn.active span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-btn.active span:nth-child(3) {
          transform:
            translateY(-7px)
            rotate(-45deg);
        }

        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 1150px) {

          .header {
            padding: 0 3%;
          }

          .nav-links {
            gap: 11px;
          }

          .separator {
            display: none;
          }

          .brand-link {
            font-size: 16px;
          }

          .nav-item > a,
          .nav-link {
            font-size: 13px;
          }

          .btn-join-header {
            padding: 0 14px;
          }

          .language-switcher {
            min-height: 36px;
          }

          .language-btn {
            padding: 4px 6px;
          }

        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 900px) {

          .header {
            min-height: 72px;

            padding: 0 20px;
          }

          .brand-link {
            font-size: 15px;
          }

          .brand-image {
            height: 38px;
          }

          .mobile-menu-btn {
            display: block;
          }

          .nav-links {
            position: absolute;

            top: 100%;
            left: 0;
            right: 0;

            width: 100%;

            display: none;

            flex-direction: column;
            align-items: stretch;

            gap: 5px;

            padding: 15px 20px 20px;

            background:
              rgba(0, 54, 40, 0.98);

            border-bottom:
              1px solid rgba(255, 255, 255, 0.15);

            box-shadow:
              0 15px 30px rgba(0, 0, 0, 0.25);

            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }

          .nav-links.mobile-open {
            display: flex;
          }

          .nav-item {
            width: 100%;
          }

          .nav-item > a,
          .nav-link {
            width: 100%;

            min-height: 44px;

            padding: 0 10px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            border-radius: 7px;
          }

          .nav-item > a:hover,
          .nav-link:hover {
            background:
              rgba(255, 255, 255, 0.10);
          }

          .separator {
            display: none;
          }

          /* ==================================================
             MOBILE DROPDOWN
          ================================================== */

          .dropdown {
            position: static;

            width: 100%;

            max-height: 0;

            margin-top: 3px;

            padding: 0;

            overflow: hidden;

            background:
              rgba(255, 255, 255, 0.08);

            border-radius: 8px;

            box-shadow: none;

            opacity: 0;
            visibility: hidden;

            transform: none;

            pointer-events: none;

            transition:
              max-height 0.25s ease,
              opacity 0.25s ease;
          }

          .dropdown-wrapper.dropdown-active .dropdown {
            max-height: 400px;

            padding: 4px;

            opacity: 1;

            visibility: visible;

            pointer-events: auto;

            transform: none;
          }

          .dropdown::before {
            display: none;
          }

          .dropdown a {
            color: #ffffff;

            padding: 11px 14px;
          }

          .dropdown a:hover {
            color: #FFD100;

            background:
              rgba(255, 255, 255, 0.10);
          }

          /* ==================================================
             MOBILE LANGUAGE SWITCHER
          ================================================== */

          .language-switcher {
            width: 100%;

            min-height: 46px;

            margin-top: 4px;

            padding: 5px;

            justify-content: center;

            background:
              rgba(255, 255, 255, 0.08);

            border:
              1px solid rgba(255, 255, 255, 0.12);

            border-radius: 8px;
          }

          .language-btn {
            flex: 1;

            min-height: 36px;

            font-size: 12px;

            border-radius: 6px;
          }

          .language-divider {
            display: none;
          }

          /* ==================================================
             MOBILE JOIN
          ================================================== */

          .btn-join-header {
            width: 100%;

            min-height: 46px;

            margin-top: 8px;

            box-sizing: border-box;
          }

        }

        /* ==================================================
           SMALL MOBILE
        ================================================== */

        @media (max-width: 480px) {

          .header {
            min-height: 66px;

            padding: 0 14px;
          }

          .brand-link {
            font-size: 13px;

            gap: 7px;
          }

          .brand-image {
            height: 34px;
          }

          .mobile-menu-btn {
            width: 40px;
            height: 39px;
          }

          .mobile-menu-btn span {
            width: 20px;
          }

        }

        /* ==================================================
           ACCESSIBILITY
        ================================================== */

        .brand-link:focus-visible,
        .nav-item > a:focus-visible,
        .nav-link:focus-visible,
        .btn-join-header:focus-visible,
        .mobile-menu-btn:focus-visible,
        .language-btn:focus-visible {
          outline:
            2px solid #FFD100;

          outline-offset: 3px;
        }

      `}</style>
    </>
  );
};

export default Header;