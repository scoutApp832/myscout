import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import usePermissions from '../../hooks/usePermissions';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BASE_URL =
  API_URL.replace(/\/api\/?$/, '');

const Sidebar = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  /* =========================================================
     SCREEN SIZE
  ========================================================= */

  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;
  const isVerySmallMobile = screenWidth <= 360;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;
  const isDesktop = screenWidth > 1024;
  const isLargeScreen = screenWidth > 1400;

  /* =========================================================
     USER ROLES
  ========================================================= */

  const isSuperAdmin =
    user?.role === 'super_admin' ||
    user?.role === 'super-admin' ||
    user?.role === 'admin' ||
    user?.permissions?.canManageSuperAdmins === true;

  const isNationalCommissioner =
    user?.role === 'national_commissioner' ||
    user?.role === 'national-commissioner';

  const isDistrictCommissioner =
    user?.role === 'district_commissioner' ||
    user?.role === 'district-commissioner';

  const isDonor = user?.role === 'donor';

  const isScout = user?.role === 'scout';

  const isUnitLeader = user?.role === 'unit_leader';

  /* =========================================================
     RESIZE
  ========================================================= */

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);

      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /* =========================================================
     CLOSE MOBILE SIDEBAR WHEN ROUTE CHANGES
  ========================================================= */

  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  /* =========================================================
     PREVENT BODY SCROLL WHEN MOBILE SIDEBAR IS OPEN
  ========================================================= */

  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileMenuOpen]);

  /* =========================================================
     FETCH UNREAD ANNOUNCEMENTS
  ========================================================= */

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setUnreadCount(0);
        return;
      }

      if (!isScout && !isUnitLeader) {
        setUnreadCount(0);
        return;
      }

      const response = await axios.get(
        `${API_URL}/scout/announcements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const announcements =
          response.data.announcements || [];

        let unread = 0;

        announcements.forEach((item) => {
          const readKey = `announcement_read_${item.id}`;
          const isRead =
            localStorage.getItem(readKey) === 'true';

          if (!isRead) {
            unread++;
          }
        });

        setUnreadCount(unread);
      }
    } catch (error) {
      console.error(
        'Error fetching unread announcement count:',
        error
      );

      setUnreadCount(0);
    }
  }, [isScout, isUnitLeader]);

  /* =========================================================
     FETCH NOTIFICATION COUNT
  ========================================================= */

  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setNotificationCount(0);
        return;
      }

      const response = await axios.get(
        `${API_URL}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotificationCount(
        response.data?.unreadCount || 0
      );
    } catch (error) {
      console.error(
        'Error fetching notification count:',
        error
      );

      setNotificationCount(0);
    }
  }, []);

  /* =========================================================
     POLLING
  ========================================================= */

  useEffect(() => {
    fetchUnreadCount();
    fetchNotificationCount();

    const intervalId = setInterval(() => {
      fetchUnreadCount();
      fetchNotificationCount();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    fetchUnreadCount,
    fetchNotificationCount,
  ]);

  /* =========================================================
     AVATAR
  ========================================================= */

  const getAvatarUrl = () => {
    const avatarPath =
      user?.member?.profile_image ||
      user?.avatar_url ||
      '';

    if (avatarPath) {
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
    }

    const name = user?.full_name || 'User';

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=6A1B9A&color=FFFFFF&size=72`;
  };

  /* =========================================================
     MENU ITEMS
  ========================================================= */

  const getMenuItems = () => {
    const items = [];

    items.push({
      id: 'dashboard',
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'fa-chart-pie',
    });

    items.push({
      id: 'chat',
      path: '/chat',
      label: '💬 Chat',
      icon: 'fa-comments',
    });

    /* ---------------------------------------------------------
       SUPER ADMIN
    --------------------------------------------------------- */

    if (isSuperAdmin) {
      items.push(
        {
          id: 'manage-members',
          path: '/manage-members',
          label: 'Manage Members',
          icon: 'fa-users',
        },
        {
          id: 'manage-leaders',
          path: '/manage-leaders',
          label: 'Manage Leaders',
          icon: 'fa-user-tie',
        },
        {
          id: 'national-events',
          path: '/national-events',
          label: 'National Events',
          icon: 'fa-calendar-alt',
        },
        {
          id: 'reports-stats',
          path: '/reports-stats',
          label: 'Reports & Stats',
          icon: 'fa-chart-bar',
        },
        {
          id: 'national-announcements',
          path: '/national-announcements',
          label: 'Manage Announcements',
          icon: 'fa-bullhorn',
        },
        {
          id: 'received-reports',
          path: '/received-reports',
          label: 'Received Reports',
          icon: 'fa-file-alt',
        },
        {
          id: 'national-scout-courses',
          path: '/national-scout-courses',
          label: 'Manage Courses',
          icon: 'fa-book',
        },
        {
          id: 'received-projects',
          path: '/received-projects',
          label: 'Received Projects',
          icon: 'fa-project-diagram',
        },
        {
          id: 'received-ideas',
          path: '/received-ideas',
          label: 'Received Ideas',
          icon: 'fa-lightbulb',
        },
        {
          id: 'manage-registrations',
          path: '/manage-registrations',
          label: 'Manage Registrations',
          icon: 'fa-user-check',
        },
        {
          id: 'payment-dashboard',
          path: '/payments/dashboard',
          label: 'Payment Dashboard',
          icon: 'fa-credit-card',
        },
        {
          id: 'marketplace-admin',
          path: '/admin/marketplace',
          label: '🛍️ Marketplace',
          icon: 'fa-store',
        },
        {
          id: 'news-management',
          path: '/admin/news',
          label: '📰 News Management',
          icon: 'fa-newspaper',
        }
      );
    }

    /* ---------------------------------------------------------
       NATIONAL COMMISSIONER
    --------------------------------------------------------- */

    if (isNationalCommissioner) {
      if (permissions.canManageMembers) {
        items.push({
          id: 'manage-members',
          path: '/manage-members',
          label: 'Manage Members',
          icon: 'fa-users',
        });
      }

      if (permissions.canManageEvents) {
        items.push({
          id: 'national-events',
          path: '/national-events',
          label: 'National Events',
          icon: 'fa-calendar-alt',
        });
      }

      if (permissions.canViewStatistics) {
        items.push({
          id: 'reports-stats',
          path: '/reports-stats',
          label: 'Reports & Stats',
          icon: 'fa-chart-bar',
        });
      }

      if (permissions.canManageAnnouncements) {
        items.push({
          id: 'national-announcements',
          path: '/national-announcements',
          label: 'Manage Announcements',
          icon: 'fa-bullhorn',
        });
      }

      if (permissions.canManageReports) {
        items.push({
          id: 'received-reports',
          path: '/received-reports',
          label: 'Received Reports',
          icon: 'fa-file-alt',
        });
      }

      if (permissions.canManageCourses) {
        items.push({
          id: 'national-scout-courses',
          path: '/national-scout-courses',
          label: 'Manage Courses',
          icon: 'fa-book',
        });
      }

      if (permissions.canManageProjects) {
        items.push({
          id: 'received-projects',
          path: '/received-projects',
          label: 'Received Projects',
          icon: 'fa-project-diagram',
        });
      }

      items.push({
        id: 'payment-dashboard',
        path: '/payments/dashboard',
        label: '💰 Payments',
        icon: 'fa-credit-card',
      });

      items.push({
        id: 'marketplace-admin',
        path: '/admin/marketplace',
        label: '🛍️ Marketplace',
        icon: 'fa-store',
      });

      items.push({
        id: 'news-management',
        path: '/admin/news',
        label: '📰 News Management',
        icon: 'fa-newspaper',
      });
    }

    /* ---------------------------------------------------------
       DISTRICT COMMISSIONER
    --------------------------------------------------------- */

    if (isDistrictCommissioner) {
      items.push(
        {
          id: 'district-members',
          path: '/district-members',
          label: 'District Members',
          icon: 'fa-users',
        },
        {
          id: 'district-events',
          path: '/district-events',
          label: 'District Events',
          icon: 'fa-calendar-alt',
        },
        {
          id: 'district-announcements',
          path: '/announcements',
          label: 'Announcements',
          icon: 'fa-bullhorn',
        },
        {
          id: 'unit-reports',
          path: '/unit-reports',
          label: 'Unit Reports',
          icon: 'fa-file-alt',
        },
        {
          id: 'scout-ideas',
          path: '/scout-ideas',
          label: 'Scout Ideas',
          icon: 'fa-lightbulb',
        },
        {
          id: 'manage-readers',
          path: '/manage-readers',
          label: 'Manage Leaders',
          icon: 'fa-user-tie',
        },
        {
          id: 'payment-dashboard',
          path: '/payments/dashboard',
          label: '💰 Payments',
          icon: 'fa-credit-card',
        }
      );
    }

    /* ---------------------------------------------------------
       SCOUT + UNIT LEADER
    --------------------------------------------------------- */

    if (isScout || isUnitLeader) {
      const announcementLabel =
        unreadCount > 0
          ? `📢 (${unreadCount})`
          : '📢';

      items.push(
        {
          id: 'scout-announcements',
          path: '/scout-announcements',
          label: `Announcements ${announcementLabel}`,
          icon: 'fa-bullhorn',
        },
        {
          id: 'my-events',
          path: '/my-events',
          label: 'My Events',
          icon: 'fa-calendar-check',
        },
        {
          id: 'my-courses',
          path: '/scout-courses',
          label: 'My Courses',
          icon: 'fa-book',
        },
        {
          id: 'my-ideas',
          path: '/my-ideas',
          label: 'My Ideas',
          icon: 'fa-lightbulb',
        },
        {
          id: 'submit-project',
          path: '/submit-project',
          label: 'Submit Project',
          icon: 'fa-project-diagram',
        }
      );

      if (isUnitLeader) {
        items.push({
          id: 'submit-report',
          path: '/submit-report',
          label: 'Submit Report',
          icon: 'fa-file-alt',
        });
      }

      items.push({
        id: 'make-payment',
        path: '/payment',
        label: '💳 Payment',
        icon: 'fa-hand-holding-heart',
      });
    }

    /* ---------------------------------------------------------
       DONOR
    --------------------------------------------------------- */

    if (isDonor) {
      items.push(
        {
          id: 'donor-dashboard',
          path: '/donor-dashboard',
          label: 'Donor Dashboard',
          icon: 'fa-chart-pie',
        },
        {
          id: 'my-donations',
          path: '/my-donations',
          label: 'My Donations',
          icon: 'fa-hand-holding-heart',
        },
        {
          id: 'supporting-projects',
          path: '/supporting-projects',
          label: 'Supporting Projects',
          icon: 'fa-handshake',
        },
        {
          id: 'donor-updates',
          path: '/updates',
          label: 'Updates',
          icon: 'fa-bell',
        },
        {
          id: 'my-ideals',
          path: '/my-ideals',
          label: 'My Ideals',
          icon: 'fa-star',
        },
        {
          id: 'make-donation',
          path: '/payment',
          label: '🤝 Donate',
          icon: 'fa-hand-holding-heart',
        }
      );

      const notificationLabel =
        notificationCount > 0
          ? `(${notificationCount})`
          : '';

      items.push({
        id: 'donor-notifications',
        path: '/notifications',
        label: `Notifications ${notificationLabel}`,
        icon: 'fa-bell',
      });
    }

    /* ---------------------------------------------------------
       NOTIFICATIONS FOR OTHER ROLES
    --------------------------------------------------------- */

    if (
      !isDonor &&
      !isScout &&
      !isUnitLeader &&
      !isSuperAdmin &&
      !isNationalCommissioner &&
      !isDistrictCommissioner
    ) {
      const notificationLabel =
        notificationCount > 0
          ? `(${notificationCount})`
          : '';

      items.push({
        id: 'notifications',
        path: '/notifications',
        label: `Notifications ${notificationLabel}`,
        icon: 'fa-bell',
      });
    }

    /* ---------------------------------------------------------
       PROFILE
    --------------------------------------------------------- */

    items.push({
      id: 'profile',
      path: '/profile',
      label: 'My Profile',
      icon: 'fa-user',
    });

    return items;
  };

  const menuItems = getMenuItems();

  /* =========================================================
     ROLE DISPLAY
  ========================================================= */

  const getRoleDisplay = () => {
    if (isSuperAdmin) {
      return '⭐ Super Admin';
    }

    if (isNationalCommissioner) {
      return '👑 National Commissioner';
    }

    if (isDistrictCommissioner) {
      return '🏛️ District Commissioner';
    }

    if (isScout) {
      return '🎯 Scout';
    }

    if (isUnitLeader) {
      return '📋 Unit Leader';
    }

    if (isDonor) {
      return '🤝 Donor';
    }

    return user?.role || 'User';
  };

  /* =========================================================
     SIDEBAR WIDTH
  ========================================================= */

  const getSidebarWidth = () => {
    if (isMobile) {
      if (isVerySmallMobile) return '270px';
      if (isSmallMobile) return '290px';
      return '310px';
    }

    if (isTablet) {
      return '230px';
    }

    if (isLargeScreen) {
      return '285px';
    }

    return '255px';
  };

  const sidebarWidth = getSidebarWidth();

  /* =========================================================
     SIDEBAR STYLE
     
     IMPORTANT MOBILE FIX:
     Sidebar = 2000
     Header = normally 1000
     Overlay = 1990
     Toggle = 2100
  ========================================================= */

  const sidebarStyles = {
    position: 'fixed',

    top: isMobile ? '0' : '70px',

    left: isMobile
      ? isMobileMenuOpen
        ? '0'
        : `-${sidebarWidth}`
      : '0',

    width: sidebarWidth,
    maxWidth: '100vw',

    height: isMobile
      ? '100dvh'
      : 'calc(100dvh - 70px)',

    minHeight: isMobile
      ? '100vh'
      : 'calc(100vh - 70px)',

    overflow: 'hidden',

    background:
      'linear-gradient(180deg, #6A1B9A 0%, #4A148C 100%)',

    color: '#ffffff',

    transition:
      'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    /* FIXED */
    zIndex: 2000,

    boxShadow:
      '4px 0 25px rgba(0, 0, 0, 0.22)',

    display: 'flex',
    flexDirection: 'column',

    /* Prevent stacking/visibility problems */
    visibility: 'visible',
    opacity: 1,

    WebkitTransform: 'translateZ(0)',
    transform: 'translateZ(0)',

    isolation: 'isolate',
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      <button
        type="button"
        className="sidebar-toggle"
        onClick={() =>
          setIsMobileMenuOpen((previous) => !previous)
        }
        aria-label={
          isMobileMenuOpen
            ? 'Close navigation menu'
            : 'Open navigation menu'
        }
        aria-expanded={isMobileMenuOpen}
        style={{
          position: 'fixed',

          top: isSmallMobile ? '10px' : '14px',
          left: isSmallMobile ? '10px' : '14px',

          /* FIXED */
          zIndex: 2100,

          width: isSmallMobile ? '44px' : '48px',
          height: isSmallMobile ? '44px' : '48px',

          display: isMobile ? 'flex' : 'none',

          alignItems: 'center',
          justifyContent: 'center',

          background:
            'linear-gradient(135deg, #6A1B9A, #4A148C)',

          color: '#ffffff',

          border:
            '2px solid rgba(255,255,255,0.20)',

          borderRadius: '12px',

          fontSize:
            isSmallMobile ? '20px' : '22px',

          cursor: 'pointer',

          boxShadow:
            '0 5px 20px rgba(106,27,154,0.40)',

          lineHeight: 1,

          padding: 0,

          outline: 'none',

          WebkitTapHighlightColor:
            'transparent',
        }}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isMobile && isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setIsMobileMenuOpen(false)
          }
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: '0',

            background:
              'rgba(0, 0, 0, 0.55)',

            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',

            /* FIXED */
            zIndex: 1990,
          }}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className="dashboard-sidebar"
        style={sidebarStyles}
        aria-label="Dashboard navigation"
      >
        {/* ===================================================
            SIDEBAR HEADER / USER
        =================================================== */}

        <div
          className="sidebar-user"
          style={{
            padding: isMobile
              ? '24px 18px 20px'
              : isTablet
              ? '18px 12px'
              : isLargeScreen
              ? '26px 20px 22px'
              : '20px 16px',

            textAlign: 'center',

            borderBottom:
              '1px solid rgba(255,255,255,0.13)',

            flexShrink: 0,

            position: 'relative',
          }}
        >
          {isMobile && (
            <button
              type="button"
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
              aria-label="Close sidebar"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',

                width: '36px',
                height: '36px',

                border: 'none',
                borderRadius: '9px',

                background:
                  'rgba(255,255,255,0.10)',

                color: '#ffffff',

                cursor: 'pointer',

                fontSize: '17px',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          )}

          {/* Avatar */}

          <div
            className="user-avatar"
            style={{
              position: 'relative',
              display: 'inline-block',
            }}
          >
            <img
              src={getAvatarUrl()}
              alt={user?.full_name || 'User'}
              style={{
                width: isMobile
                  ? '70px'
                  : isTablet
                  ? '54px'
                  : isLargeScreen
                  ? '74px'
                  : '62px',

                height: isMobile
                  ? '70px'
                  : isTablet
                  ? '54px'
                  : isLargeScreen
                  ? '74px'
                  : '62px',

                borderRadius: '50%',
                objectFit: 'cover',

                border:
                  '3px solid #FFD100',

                background: '#ffffff',

                boxShadow:
                  '0 4px 18px rgba(255,209,0,0.20)',
              }}

              onError={(event) => {
                event.currentTarget.onerror = null;

                const name =
                  user?.full_name || 'User';

                event.currentTarget.src =
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                  )}&background=6A1B9A&color=FFFFFF&size=72`;
              }}
            />

            {isSuperAdmin && (
              <div
                className="super-admin-badge-sidebar"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-3px',

                  width: '27px',
                  height: '27px',

                  borderRadius: '50%',

                  background: '#FFD100',
                  color: '#000000',

                  border:
                    '2px solid #6A1B9A',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  fontSize: '12px',
                  fontWeight: 'bold',

                  boxShadow:
                    '0 2px 8px rgba(255,209,0,0.45)',
                }}
              >
                ⭐
              </div>
            )}

            {isDonor && (
              <div
                className="donor-badge-sidebar"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-3px',

                  width: '27px',
                  height: '27px',

                  borderRadius: '50%',

                  background: '#006B3F',
                  color: '#ffffff',

                  border:
                    '2px solid #6A1B9A',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  fontSize: '12px',
                  fontWeight: 'bold',

                  boxShadow:
                    '0 2px 8px rgba(0,107,63,0.45)',
                }}
              >
                ❤️
              </div>
            )}
          </div>

          {/* User Name */}

          <div
            className="user-name"
            style={{
              marginTop: '11px',

              fontSize: isMobile
                ? '17px'
                : isTablet
                ? '14px'
                : isLargeScreen
                ? '17px'
                : '15px',

              fontWeight: '600',

              color: '#ffffff',

              letterSpacing: '0.2px',

              lineHeight: '1.35',

              wordBreak: 'break-word',
            }}
          >
            {user?.full_name || 'User'}
          </div>

          {/* Role */}

          <div
            className="user-role"
            style={{
              fontSize: isMobile
                ? '12px'
                : isTablet
                ? '10px'
                : isLargeScreen
                ? '13px'
                : '11px',

              color: '#FFD100',

              marginTop: '5px',

              fontWeight: '600',

              lineHeight: '1.4',

              wordBreak: 'break-word',
            }}
          >
            {getRoleDisplay()}

            {isSuperAdmin && (
              <span
                style={{
                  display: 'block',

                  fontSize: isMobile
                    ? '11px'
                    : '10px',

                  color: '#FFD100',

                  fontWeight: 'bold',

                  marginTop: '3px',

                  opacity: 0.9,
                }}
              >
                🔓 Full System Access
              </span>
            )}

            {isDonor && (
              <span
                style={{
                  display: 'block',

                  fontSize: isMobile
                    ? '11px'
                    : '10px',

                  color: '#FFD100',

                  fontWeight: 'bold',

                  marginTop: '3px',

                  opacity: 0.9,
                }}
              >
                🇷🇼 Supporting Scouts
              </span>
            )}
          </div>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
          style={{
            flex: '1 1 auto',

            minHeight: 0,

            overflowY: 'auto',
            overflowX: 'hidden',

            padding: isMobile
              ? '12px 12px 18px'
              : isTablet
              ? '9px 8px 14px'
              : isLargeScreen
              ? '13px 15px 18px'
              : '10px 11px 16px',
          }}
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? 'active' : ''
                }`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',

                width: '100%',
                minWidth: 0,

                boxSizing: 'border-box',

                padding: isMobile
                  ? '13px 14px'
                  : isTablet
                  ? '10px 10px'
                  : isLargeScreen
                  ? '13px 15px'
                  : '11px 13px',

                marginBottom: '3px',

                gap: isMobile
                  ? '13px'
                  : isTablet
                  ? '10px'
                  : '13px',

                color: isActive
                  ? '#ffffff'
                  : 'rgba(255,255,255,0.76)',

                backgroundColor: isActive
                  ? 'rgba(255,209,0,0.16)'
                  : 'transparent',

                textDecoration: 'none',

                borderLeft: isActive
                  ? '4px solid #FFD100'
                  : '4px solid transparent',

                borderRadius: isActive
                  ? '0 10px 10px 0'
                  : '8px',

                fontSize: isMobile
                  ? '14px'
                  : isTablet
                  ? '12px'
                  : isLargeScreen
                  ? '14px'
                  : '13px',

                fontWeight: isActive
                  ? '600'
                  : '400',

                cursor: 'pointer',

                transition:
                  'background 0.2s ease, color 0.2s ease',

                lineHeight: '1.35',

                minHeight: isMobile
                  ? '44px'
                  : '40px',
              })}

              onClick={() => {
                if (isMobile) {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              <i
                className={`fas ${item.icon}`}
                aria-hidden="true"
                style={{
                  flex: '0 0 auto',

                  width: isMobile
                    ? '23px'
                    : isTablet
                    ? '19px'
                    : '22px',

                  textAlign: 'center',

                  fontSize: isMobile
                    ? '17px'
                    : isTablet
                    ? '14px'
                    : isLargeScreen
                    ? '17px'
                    : '15px',
                }}
              />

              <span
                style={{
                  minWidth: 0,

                  flex: '1 1 auto',

                  overflowWrap: 'anywhere',

                  wordBreak: 'break-word',
                }}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div
          style={{
            padding: isMobile
              ? '12px 14px 16px'
              : isTablet
              ? '11px 10px 13px'
              : isLargeScreen
              ? '16px 18px 18px'
              : '13px 14px 15px',

            borderTop:
              '1px solid rgba(255,255,255,0.13)',

            flexShrink: 0,

            background:
              'rgba(0,0,0,0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            style={{
              width: '100%',

              minHeight: isMobile
                ? '44px'
                : '40px',

              padding: '9px 12px',

              background:
                'rgba(255,255,255,0.08)',

              color: '#ffffff',

              border:
                '1px solid rgba(255,255,255,0.08)',

              borderRadius: '10px',

              cursor: 'pointer',

              fontSize: isMobile
                ? '14px'
                : isTablet
                ? '12px'
                : '13px',

              fontWeight: '500',

              transition:
                'background 0.2s ease, transform 0.2s ease',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              gap: '9px',
            }}

            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                'rgba(255,255,255,0.16)';
            }}

            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                'rgba(255,255,255,0.08)';
            }}
          >
            <i
              className="fas fa-sign-out-alt"
              aria-hidden="true"
              style={{
                fontSize: isMobile
                  ? '15px'
                  : '13px',
              }}
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>
        {`
          .dashboard-sidebar {
            scrollbar-width: thin;
            scrollbar-color:
              #FFD100
              rgba(255,255,255,0.06);

            /* IMPORTANT */
            position: fixed !important;
          }

          .dashboard-sidebar *,
          .dashboard-sidebar *::before,
          .dashboard-sidebar *::after {
            box-sizing: border-box;
          }

          .dashboard-sidebar::-webkit-scrollbar,
          .sidebar-nav::-webkit-scrollbar {
            width: 5px;
          }

          .dashboard-sidebar::-webkit-scrollbar-track,
          .sidebar-nav::-webkit-scrollbar-track {
            background:
              rgba(255,255,255,0.04);
          }

          .dashboard-sidebar::-webkit-scrollbar-thumb,
          .sidebar-nav::-webkit-scrollbar-thumb {
            background: #FFD100;
            border-radius: 20px;
          }

          .dashboard-sidebar::-webkit-scrollbar-thumb:hover,
          .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: #e6c800;
          }

          .sidebar-link:hover {
            background:
              rgba(255,255,255,0.09) !important;

            color:
              #ffffff !important;
          }

          .sidebar-link.active {
            box-shadow:
              inset 0 0 18px
              rgba(255,209,0,0.05);
          }

          /* ==================================================
             MOBILE
          ================================================== */

          @media (max-width: 768px) {

            .dashboard-sidebar {
              position: fixed !important;

              top: 0 !important;

              height: 100dvh !important;

              min-height: 100vh !important;

              width: 310px !important;

              max-width:
                calc(100vw - 20px) !important;

              /*
                CRITICAL FIX:
                Put sidebar above the header.
              */
              z-index: 2000 !important;

              visibility: visible !important;

              opacity: 1 !important;

              overflow: hidden !important;

              display: flex !important;

              flex-direction: column !important;

              box-shadow:
                5px 0 35px
                rgba(0,0,0,0.35) !important;

              isolation: isolate !important;

              -webkit-backface-visibility: hidden;

              backface-visibility: hidden;

              will-change: left;
            }

            .sidebar-toggle {
              display: flex !important;

              position: fixed !important;

              z-index: 2100 !important;
            }

            .sidebar-overlay {
              display: block !important;

              position: fixed !important;

              inset: 0 !important;

              z-index: 1990 !important;
            }

            .sidebar-link {
              min-height: 44px !important;
            }

            .sidebar-nav {
              min-height: 0 !important;

              flex: 1 1 auto !important;

              overflow-y: auto !important;

              overflow-x: hidden !important;

              -webkit-overflow-scrolling: touch;
            }
          }

          /* ==================================================
             SMALL MOBILE
          ================================================== */

          @media (max-width: 480px) {

            .dashboard-sidebar {
              width: 290px !important;

              max-width:
                calc(100vw - 12px) !important;
            }

            .sidebar-link {
              min-height: 43px !important;
            }
          }

          /* ==================================================
             VERY SMALL MOBILE
          ================================================== */

          @media (max-width: 360px) {

            .dashboard-sidebar {
              width: 270px !important;

              max-width:
                calc(100vw - 8px) !important;
            }

            .sidebar-link {
              padding-left: 11px !important;

              padding-right: 10px !important;
            }
          }

          /* ==================================================
             TABLET
          ================================================== */

          @media (min-width: 769px) and (max-width: 1024px) {

            .dashboard-sidebar {
              width: 230px !important;
            }

            .sidebar-nav {
              padding-left: 8px !important;

              padding-right: 8px !important;
            }

            .sidebar-link {
              white-space: normal !important;
            }

            .sidebar-toggle,
            .sidebar-overlay {
              display: none !important;
            }
          }

          /* ==================================================
             DESKTOP
          ================================================== */

          @media (min-width: 1025px) {

            .sidebar-toggle {
              display: none !important;
            }

            .sidebar-overlay {
              display: none !important;
            }
          }

          /* ==================================================
             LARGE DESKTOP
          ================================================== */

          @media (min-width: 1401px) {

            .dashboard-sidebar {
              width: 285px !important;
            }
          }

          /* ==================================================
             REDUCED MOTION
          ================================================== */

          @media (prefers-reduced-motion: reduce) {

            .dashboard-sidebar,
            .sidebar-link,
            .sidebar-toggle {
              transition: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default Sidebar;
