
// src/components/layout/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../scout/NotificationBell';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // =========================================================
  // API URL
  // =========================================================

  const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const BASE_URL = API_URL.replace(/\/$/, '');

  // =========================================================
  // USER SIN
  // =========================================================

  const userSin =
    user?.member?.sin ||
    user?.sin ||
    null;

  // =========================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // CLOSE DROPDOWN WITH ESCAPE
  // =========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    setShowDropdown(false);

    logout();

    navigate('/login');
  };

  // =========================================================
  // CLOSE DROPDOWN
  // =========================================================

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  // =========================================================
  // ROLE DISPLAY
  // =========================================================

  const getRoleDisplay = () => {
    const roleMap = {
      national_commissioner:
        'National Commissioner',

      'national-commissioner':
        'National Commissioner',

      district_commissioner:
        'District Commissioner',

      'district-commissioner':
        'District Commissioner',

      scout:
        'Scout',

      unit_leader:
        'Unit Leader',

      'unit-leader':
        'Unit Leader',

      donor:
        'Donor',

      super_admin:
        'Super Admin',

      'super-admin':
        'Super Admin',

      admin:
        'Admin',
    };

    return (
      roleMap[user?.role] ||
      'Member'
    );
  };

  // =========================================================
  // ROLE ICON
  // =========================================================

  const getRoleIcon = () => {
    const roleIcons = {
      national_commissioner:
        'fa-landmark',

      'national-commissioner':
        'fa-landmark',

      district_commissioner:
        'fa-building',

      'district-commissioner':
        'fa-building',

      scout:
        'fa-compass',

      unit_leader:
        'fa-users',

      'unit-leader':
        'fa-users',

      donor:
        'fa-hand-holding-heart',

      super_admin:
        'fa-star',

      'super-admin':
        'fa-star',

      admin:
        'fa-shield-alt',
    };

    return (
      roleIcons[user?.role] ||
      'fa-user'
    );
  };

  // =========================================================
  // FALLBACK AVATAR
  // =========================================================

  const getFallbackAvatar = () => {
    const name =
      user?.full_name ||
      'User';

    return (
      'https://ui-avatars.com/api/?name=' +
      encodeURIComponent(name) +
      '&background=6A1B9A&color=FFFFFF&size=100&bold=true'
    );
  };

  // =========================================================
  // AVATAR URL
  // =========================================================

  const getAvatarUrl = () => {
    const avatarPath =
      user?.profile_image ||
      user?.avatar_url ||
      user?.member?.profile_image ||
      '';

    if (!avatarPath) {
      return getFallbackAvatar();
    }

    if (
      avatarPath.startsWith('http://') ||
      avatarPath.startsWith('https://')
    ) {
      return avatarPath;
    }

    if (avatarPath.startsWith('/')) {
      return `${BASE_URL}${avatarPath}`;
    }

    return `${BASE_URL}/${avatarPath}`;
  };

  // =========================================================
  // TOGGLE DROPDOWN
  // =========================================================

  const toggleDropdown = () => {
    setShowDropdown(
      (previous) => !previous
    );
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="msr-dashboard-header">

        <div className="msr-header-inner">

          {/* =================================================
              BRAND
          ================================================== */}

          <div className="msr-header-left">

            <Link
              to="/dashboard"
              className="msr-brand"
              onClick={closeDropdown}
            >

              <div className="msr-brand-logo">

                <img
                  src="/logo.jpg"
                  alt="MyScout Rwanda"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none';
                  }}
                />

              </div>

              <div className="msr-brand-text">

                <span className="msr-brand-name">
                  MSR
                </span>

                <span className="msr-brand-dashboard">
                  Dashboard
                </span>

              </div>

            </Link>

          </div>


          {/* =================================================
              CENTER ROLE
          ================================================== */}

          <div className="msr-header-center">

            <div className="msr-role-badge">

              <span className="msr-role-icon">
                <i
                  className={`fas ${getRoleIcon()}`}
                ></i>
              </span>

              <span className="msr-role-name">
                {getRoleDisplay()}
              </span>

            </div>

          </div>


          {/* =================================================
              RIGHT
          ================================================== */}

          <div className="msr-header-right">

            <div className="msr-header-actions">

              {/* =============================================
                  NOTIFICATION
              ============================================== */}

              <div className="msr-notification-wrapper">
                <NotificationBell />
              </div>


              {/* =============================================
                  PROFILE
              ============================================== */}

              <div
                className="msr-user-profile"
                ref={dropdownRef}
              >

                {/* Profile Button */}

                <button
                  type="button"
                  className={
                    `msr-profile-trigger ${
                      showDropdown
                        ? 'active'
                        : ''
                    }`
                  }
                  onClick={toggleDropdown}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >

                  {/* Avatar */}

                  <div className="msr-header-avatar">

                    <img
                      src={getAvatarUrl()}
                      alt={
                        user?.full_name ||
                        'User'
                      }
                      onError={(event) => {
                        event.currentTarget.onerror =
                          null;

                        event.currentTarget.src =
                          getFallbackAvatar();
                      }}
                    />

                    <span className="msr-online-indicator"></span>

                  </div>


                  {/* User Info */}

                  <div className="msr-header-user-info">

                    <span className="msr-header-user-name">
                      {user?.full_name ||
                        'User'}
                    </span>

                    {userSin && (
                      <span className="msr-header-user-sin">

                        <i className="fas fa-id-card"></i>

                        SIN: {userSin}

                      </span>
                    )}

                  </div>


                  {/* Arrow */}

                  <span className="msr-profile-arrow">

                    <i
                      className={
                        `fas fa-chevron-${
                          showDropdown
                            ? 'up'
                            : 'down'
                        }`
                      }
                    ></i>

                  </span>

                </button>


                {/* =========================================
                    DROPDOWN
                ========================================== */}

                {showDropdown && (

                  <div
                    className="msr-profile-dropdown"
                    role="menu"
                  >

                    {/* =====================================
                        USER HEADER
                    ====================================== */}

                    <div className="msr-dropdown-header">

                      <div className="msr-dropdown-avatar">

                        <img
                          src={getAvatarUrl()}
                          alt={
                            user?.full_name ||
                            'User'
                          }
                          onError={(event) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              getFallbackAvatar();
                          }}
                        />

                      </div>


                      <div className="msr-dropdown-user">

                        <strong>
                          {user?.full_name ||
                            'User'}
                        </strong>


                        {user?.email && (
                          <span className="msr-dropdown-email">
                            {user.email}
                          </span>
                        )}


                        <span className="msr-dropdown-role">

                          <i
                            className={
                              `fas ${getRoleIcon()}`
                            }
                          ></i>

                          {getRoleDisplay()}

                        </span>


                        {userSin && (
                          <span className="msr-dropdown-sin">

                            <i className="fas fa-id-card"></i>

                            SIN: {userSin}

                          </span>
                        )}

                      </div>

                    </div>


                    <div className="msr-dropdown-divider"></div>


                    {/* =====================================
                        PROFILE
                    ====================================== */}

                    <Link
                      to="/profile"
                      className="msr-dropdown-item"
                      onClick={closeDropdown}
                      role="menuitem"
                    >

                      <span className="msr-dropdown-item-icon">
                        <i className="fas fa-user"></i>
                      </span>

                      <span>
                        My Profile
                      </span>

                    </Link>


                    {/* =====================================
                        NOTIFICATIONS
                    ====================================== */}

                    <Link
                      to="/notifications"
                      className="msr-dropdown-item"
                      onClick={closeDropdown}
                      role="menuitem"
                    >

                      <span className="msr-dropdown-item-icon">
                        <i className="fas fa-bell"></i>
                      </span>

                      <span>
                        All Notifications
                      </span>

                    </Link>


                    {/* =====================================
                        SETTINGS
                    ====================================== */}

                    <Link
                      to="/settings"
                      className="msr-dropdown-item"
                      onClick={closeDropdown}
                      role="menuitem"
                    >

                      <span className="msr-dropdown-item-icon">
                        <i className="fas fa-cog"></i>
                      </span>

                      <span>
                        Settings
                      </span>

                    </Link>


                    <div className="msr-dropdown-divider"></div>


                    {/* =====================================
                        LOGOUT
                    ====================================== */}

                    <button
                      type="button"
                      className={
                        'msr-dropdown-item ' +
                        'msr-logout-item'
                      }
                      onClick={handleLogout}
                      role="menuitem"
                    >

                      <span className="msr-dropdown-item-icon">
                        <i className="fas fa-sign-out-alt"></i>
                      </span>

                      <span>
                        Logout
                      </span>

                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          ALL CSS
          Everything is contained in this Header.jsx.
      ====================================================== */}

      <style>{`

        /* ===================================================
           VARIABLES
        ==================================================== */

        :root {
          --msr-purple: #6A1B9A;
          --msr-purple-dark: #4A148C;
          --msr-purple-light: #8B2FC9;
          --msr-blue: #002B5C;
          --msr-gold: #FFD100;

          --msr-white: #FFFFFF;
          --msr-text: #1F2937;
          --msr-muted: #6B7280;
          --msr-border: #E5E7EB;
          --msr-danger: #DC2626;

          --msr-header-height: 70px;
        }


        /* =================================================
           HEADER
        ================================================== */

        .msr-dashboard-header {

          position: fixed;

          top: 0;
          left: 0;
          right: 0;

          width: 100%;

          height:
            var(--msr-header-height);

          z-index: 1000;

          background:
            linear-gradient(
              135deg,
              #4A148C 0%,
              #6A1B9A 55%,
              #8B2FC9 100%
            );

          color:
            #FFFFFF;

          box-shadow:
            0 4px 24px
            rgba(0, 0, 0, 0.14);

          isolation: isolate;
        }


        /* =================================================
           INNER
        ================================================== */

        .msr-header-inner {

          width: 100%;

          max-width: 1600px;

          height: 100%;

          margin: 0 auto;

          padding:
            0 clamp(16px, 3vw, 40px);

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;
        }


        /* =================================================
           LEFT
        ================================================== */

        .msr-header-left {

          display: flex;

          align-items: center;

          flex: 1 1 0;

          min-width: 0;
        }


        .msr-brand {

          display: inline-flex;

          align-items: center;

          gap: 11px;

          min-width: 0;

          text-decoration: none;

          color: #FFFFFF;

          transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        }


        .msr-brand:hover {

          opacity: 0.95;

          transform:
            translateY(-1px);
        }


        .msr-brand-logo {

          width: 42px;

          height: 42px;

          flex: 0 0 42px;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: hidden;

          border-radius: 10px;

          background:
            #FFFFFF;

          border:
            2px solid #FFD100;

          box-shadow:
            0 2px 8px
            rgba(0, 0, 0, 0.18);
        }


        .msr-brand-logo img {

          width: 100%;

          height: 100%;

          display: block;

          object-fit: cover;
        }


        .msr-brand-text {

          display: flex;

          flex-direction: column;

          justify-content: center;

          min-width: 0;

          line-height: 1.05;
        }


        .msr-brand-name {

          color:
            #FFD100;

          font-size: 17px;

          font-weight: 800;

          letter-spacing: 0.5px;
        }


        .msr-brand-dashboard {

          margin-top: 3px;

          color:
            rgba(255, 255, 255, 0.88);

          font-size: 11px;

          font-weight: 500;
        }


        /* =================================================
           CENTER
        ================================================== */

        .msr-header-center {

          display: flex;

          align-items: center;

          justify-content: center;

          flex: 0 1 auto;

          min-width: 0;
        }


        .msr-role-badge {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          min-height: 38px;

          padding:
            7px 16px;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.11);

          border:
            1px solid
            rgba(255, 255, 255, 0.18);

          box-shadow:
            inset 0 1px 0
            rgba(255, 255, 255, 0.08);

          backdrop-filter:
            blur(8px);

          white-space: nowrap;
        }


        .msr-role-icon {

          width: 25px;

          height: 25px;

          flex: 0 0 25px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255, 209, 0, 0.16);

          color:
            #FFD100;

          font-size: 11px;
        }


        .msr-role-name {

          color:
            #FFFFFF;

          font-size: 13px;

          font-weight: 650;

          letter-spacing: 0.2px;
        }


        /* =================================================
           RIGHT
        ================================================== */

        .msr-header-right {

          display: flex;

          align-items: center;

          justify-content: flex-end;

          flex: 1 1 0;

          min-width: 0;
        }


        .msr-header-actions {

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 12px;
        }


        /* =================================================
           NOTIFICATION
        ================================================== */

        .msr-notification-wrapper {

          display: flex;

          align-items: center;

          justify-content: center;

          min-width: 40px;
        }


        /* =================================================
           USER PROFILE
        ================================================== */

        .msr-user-profile {

          position: relative;

          display: flex;

          align-items: center;
        }


        .msr-profile-trigger {

          appearance: none;

          border: 0;

          background:
            transparent;

          color:
            #FFFFFF;

          font: inherit;

          cursor: pointer;

          display: flex;

          align-items: center;

          gap: 9px;

          padding:
            5px 8px;

          min-height: 48px;

          border-radius: 12px;

          transition:
            background 0.2s ease;
        }


        .msr-profile-trigger:hover,
        .msr-profile-trigger.active {

          background:
            rgba(255, 255, 255, 0.12);
        }


        .msr-profile-trigger:focus-visible {

          outline:
            2px solid #FFD100;

          outline-offset:
            2px;
        }


        /* =================================================
           AVATAR
        ================================================== */

        .msr-header-avatar {

          position: relative;

          width: 38px;

          height: 38px;

          flex: 0 0 38px;

          border-radius: 50%;

          background:
            #FFFFFF;

          border:
            2px solid #FFD100;

          box-shadow:
            0 2px 8px
            rgba(0, 0, 0, 0.18);
        }


        .msr-header-avatar img {

          width: 100%;

          height: 100%;

          display: block;

          object-fit: cover;

          border-radius: 50%;
        }


        /* =================================================
           ONLINE
        ================================================== */

        .msr-online-indicator {

          position: absolute;

          right: -1px;

          bottom: 0;

          width: 9px;

          height: 9px;

          border-radius: 50%;

          background:
            #22C55E;

          border:
            2px solid #6A1B9A;
        }


        /* =================================================
           USER INFO
        ================================================== */

        .msr-header-user-info {

          display: flex;

          flex-direction: column;

          align-items: flex-start;

          justify-content: center;

          min-width: 0;

          max-width: 170px;
        }


        .msr-header-user-name {

          width: 100%;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color:
            #FFFFFF;

          font-size: 13px;

          font-weight: 650;
        }


        .msr-header-user-sin {

          display: flex;

          align-items: center;

          gap: 4px;

          margin-top: 2px;

          color:
            rgba(255, 255, 255, 0.76);

          font-size: 10px;
        }


        .msr-header-user-sin i {

          font-size: 9px;
        }


        /* =================================================
           ARROW
        ================================================== */

        .msr-profile-arrow {

          display: flex;

          align-items: center;

          justify-content: center;

          color:
            rgba(255, 255, 255, 0.72);

          font-size: 10px;
        }


        /* =================================================
           DROPDOWN
        ================================================== */

        .msr-profile-dropdown {

          position: absolute;

          top:
            calc(100% + 9px);

          right: 0;

          width: 300px;

          max-width:
            calc(100vw - 24px);

          overflow: hidden;

          background:
            #FFFFFF;

          border:
            1px solid
            rgba(0, 0, 0, 0.06);

          border-radius: 14px;

          box-shadow:
            0 18px 50px
            rgba(0, 0, 0, 0.18),
            0 4px 15px
            rgba(0, 0, 0, 0.08);

          animation:
            msrDropdownIn 0.18s ease-out;

          transform-origin:
            top right;
        }


        @keyframes msrDropdownIn {

          from {

            opacity: 0;

            transform:
              translateY(-7px)
              scale(0.98);
          }

          to {

            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }


        /* =================================================
           DROPDOWN HEADER
        ================================================== */

        .msr-dropdown-header {

          display: flex;

          align-items: center;

          padding:
            16px;

          background:
            linear-gradient(
              135deg,
              rgba(106, 27, 154, 0.06),
              rgba(139, 47, 201, 0.02)
            );
        }


        .msr-dropdown-avatar {

          width: 48px;

          height: 48px;

          flex: 0 0 48px;

          overflow: hidden;

          border-radius: 50%;

          background:
            #FFFFFF;

          border:
            2px solid #FFD100;
        }


        .msr-dropdown-avatar img {

          width: 100%;

          height: 100%;

          display: block;

          object-fit: cover;
        }


        .msr-dropdown-user {

          min-width: 0;

          margin-left: 12px;

          display: flex;

          flex-direction: column;

          align-items: flex-start;

          gap: 2px;
        }


        .msr-dropdown-user strong {

          width: 100%;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color:
            #1F2937;

          font-size: 14px;

          font-weight: 700;
        }


        .msr-dropdown-email {

          width: 100%;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color:
            #6B7280;

          font-size: 11px;
        }


        .msr-dropdown-role {

          display: inline-flex;

          align-items: center;

          gap: 5px;

          margin-top: 4px;

          padding:
            3px 8px;

          border-radius: 999px;

          background:
            rgba(106, 27, 154, 0.09);

          color:
            #6A1B9A;

          font-size: 10px;

          font-weight: 700;
        }


        .msr-dropdown-role i {

          font-size: 9px;
        }


        .msr-dropdown-sin {

          display: flex;

          align-items: center;

          gap: 5px;

          margin-top: 2px;

          color:
            #6B7280;

          font-size: 10px;
        }


        /* =================================================
           DIVIDER
        ================================================== */

        .msr-dropdown-divider {

          width: 100%;

          height: 1px;

          background:
            #E5E7EB;
        }


        /* =================================================
           DROPDOWN ITEMS
        ================================================== */

        .msr-dropdown-item {

          width: 100%;

          min-height: 43px;

          padding:
            9px 16px;

          display: flex;

          align-items: center;

          gap: 11px;

          border: 0;

          background:
            transparent;

          color:
            #1F2937;

          text-decoration: none;

          font-family: inherit;

          font-size: 13px;

          font-weight: 500;

          text-align: left;

          cursor: pointer;

          transition:
            background 0.18s ease,
            color 0.18s ease,
            padding-left 0.18s ease;
        }


        .msr-dropdown-item:hover {

          background:
            #F5F3F7;

          color:
            #6A1B9A;

          padding-left:
            19px;
        }


        .msr-dropdown-item:focus-visible {

          outline:
            none;

          background:
            #F5F3F7;

          color:
            #6A1B9A;
        }


        /* =================================================
           ITEM ICON
        ================================================== */

        .msr-dropdown-item-icon {

          width: 27px;

          height: 27px;

          flex: 0 0 27px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 7px;

          background:
            #F3F4F6;

          color:
            #6B7280;

          font-size: 11px;
        }


        .msr-dropdown-item:hover
        .msr-dropdown-item-icon {

          background:
            rgba(106, 27, 154, 0.1);

          color:
            #6A1B9A;
        }


        /* =================================================
           LOGOUT
        ================================================== */

        .msr-dropdown-item.msr-logout-item {

          color:
            #DC2626;
        }


        .msr-dropdown-item.msr-logout-item
        .msr-dropdown-item-icon {

          color:
            #DC2626;

          background:
            rgba(220, 38, 38, 0.08);
        }


        .msr-dropdown-item.msr-logout-item:hover {

          background:
            #FEF2F2;

          color:
            #DC2626;
        }


        /* =================================================
           TABLET
        ================================================== */

        @media (max-width: 900px) {

          .msr-header-inner {

            padding:
              0 18px;

            gap: 12px;
          }


          .msr-role-badge {

            padding:
              6px 11px;
          }


          .msr-role-name {

            font-size: 12px;
          }


          .msr-header-user-info {

            max-width: 130px;
          }
        }


        /* =================================================
           SMALL TABLET
        ================================================== */

        @media (max-width: 700px) {

          .msr-dashboard-header {

            height: 64px;
          }


          .msr-header-inner {

            padding:
              0 13px;
          }


          .msr-brand-logo {

            width: 38px;

            height: 38px;

            flex-basis: 38px;

            border-radius: 9px;
          }


          .msr-brand-name {

            font-size: 15px;
          }


          .msr-brand-dashboard {

            font-size: 9px;
          }


          .msr-role-badge {

            min-height: 34px;

            padding:
              5px 9px;

            gap: 6px;
          }


          .msr-role-icon {

            width: 22px;

            height: 22px;

            flex-basis: 22px;

            font-size: 9px;
          }


          .msr-role-name {

            font-size: 11px;
          }


          .msr-header-user-info {

            display: none;
          }


          .msr-profile-arrow {

            display: none;
          }


          .msr-profile-trigger {

            padding:
              4px 5px;
          }


          .msr-header-actions {

            gap: 7px;
          }


          .msr-profile-dropdown {

            top:
              calc(100% + 8px);

            width: 290px;
          }
        }


        /* =================================================
           PHONE
        ================================================== */

        @media (max-width: 560px) {

          .msr-header-inner {

            padding:
              0 10px;

            gap: 7px;
          }


          .msr-header-left {

            flex:
              0 0 auto;
          }


          .msr-header-center {

            flex:
              1 1 auto;

            min-width: 0;
          }


          .msr-brand-text {

            display: none;
          }


          .msr-brand-logo {

            width: 38px;

            height: 38px;
          }


          .msr-role-badge {

            max-width: 100%;

            padding:
              5px 8px;
          }


          .msr-role-name {

            max-width: 135px;

            overflow: hidden;

            text-overflow: ellipsis;
          }


          .msr-notification-wrapper {

            min-width: 36px;
          }


          .msr-header-avatar {

            width: 36px;

            height: 36px;

            flex-basis: 36px;
          }


          .msr-profile-dropdown {

            right: -6px;

            width:
              min(
                290px,
                calc(100vw - 20px)
              );
          }
        }


        /* =================================================
           SMALL PHONE
        ================================================== */

        @media (max-width: 400px) {

          .msr-header-inner {

            padding:
              0 7px;

            gap: 5px;
          }


          .msr-role-badge {

            gap: 5px;

            padding:
              4px 7px;
          }


          .msr-role-icon {

            width: 20px;

            height: 20px;

            flex-basis: 20px;
          }


          .msr-role-name {

            max-width: 105px;

            font-size: 10px;
          }


          .msr-header-actions {

            gap: 3px;
          }


          .msr-header-avatar {

            width: 34px;

            height: 34px;

            flex-basis: 34px;
          }


          .msr-online-indicator {

            width: 8px;

            height: 8px;
          }
        }


        /* =================================================
           VERY SMALL PHONE
        ================================================== */

        @media (max-width: 340px) {

          .msr-role-icon {

            display: none;
          }


          .msr-role-name {

            max-width: 90px;
          }


          .msr-profile-dropdown {

            right: -5px;
          }
        }


        /* =================================================
           REDUCED MOTION
        ================================================== */

        @media (prefers-reduced-motion: reduce) {

          .msr-profile-dropdown,
          .msr-brand,
          .msr-profile-trigger,
          .msr-dropdown-item {

            animation: none !important;

            transition: none !important;
          }
        }


        /* =================================================
           CONTENT OFFSET
        ================================================= */

        .dashboard-main,
        .dashboard-content,
        .main-content {

          scroll-margin-top:
            calc(
              var(--msr-header-height) + 20px
            );
        }

      `}</style>
    </>
  );
};

export default Header;