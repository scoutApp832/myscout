// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// ============================================================
// LANGUAGE
// ============================================================
import { LanguageProvider } from './contexts/LanguageContext';

// ============================================================
// AUTH
// ============================================================
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// ============================================================
// PUBLIC - ABOUT
// IMPORTANT: Actual folder is "About" with capital A
// ============================================================
import About from './public/About/About';

import OurHistory from './public/About/RSA/OurHistory';
import Mission from './public/About/RSA/Mission';
import VisionValues from './public/About/RSA/VisionValues';

import OrganisationStructure from './public/About/OrganisationStructure';
import PartnersDonate from './public/About/PartnersDonate';
import Membership from './public/About/Membership';
import MSRDevelopmentTeam from './public/About/MSRDevelopmentTeam';

// ============================================================
// PUBLIC - EVENTS
// ============================================================
import UpcomingEvents from './public/events/UpcomingEvents';
import PastEvents from './public/events/PastEvents';
import News from './public/events/News';

// ============================================================
// PUBLIC - MARKETPLACE
// ============================================================
import Marketplace from './public/marketplace/Marketplace';
import Products from './public/marketplace/Products';
import ProductDetails from './public/marketplace/ProductDetails';

// ============================================================
// PUBLIC - CONTACT
// ============================================================
import ContactUs from './public/contact/ContactUs';

// ============================================================
// LANDING PAGE
// ============================================================
import FloatingDonate from './components/landing/FloatingDonate';
import Hero from './components/landing/Hero';
import Stats from './components/landing/Stats';
import ScoutResponsibilities from './components/landing/ScoutResponsibilities';
import SuccessStories from './components/landing/SuccessStories';
import UpcomingEventsLanding from './components/landing/UpcomingEvents';
import RecentActivities from './components/landing/RecentActivities';
import Footer from './components/landing/Footer';

// ============================================================
// LAYOUT
// ============================================================
import Layout from './components/layout/Layout';

// ============================================================
// DASHBOARDS
// ============================================================
import ScoutDashboard from './components/dashboard/ScoutDashboard';
import DistrictDashboard from './components/dashboard/DistrictDashboard';
import NationalDashboard from './components/dashboard/NationalDashboard';
import DonationDashboard from './components/dashboard/DonationDashboard';

// ============================================================
// SCOUT
// ============================================================
import MyEvents from './components/scout/MyEvents';
import ScoutCourses from './components/scout/ScoutCourses';
import MyIdeas from './components/scout/MyIdeas';
import SubmitReport from './components/scout/SubmitReport';
import SubmitProject from './components/scout/SubmitProject';
import ScoutAnnouncements from './components/scout/ScoutAnnouncements';
import MyProfile from './components/scout/MyProfile';
import EventDetail from './components/scout/EventDetail';

// ============================================================
// ATTENDANCE
// ============================================================
import AttendanceCheckIn from './components/AttendanceCheckIn';

// ============================================================
// NOTIFICATIONS
// ============================================================
import Notifications from './components/scout/NotificationBell';

// ============================================================
// DISTRICT
// ============================================================
import ManageReaders from './components/district/ManageReaders';
import Announcements from './components/district/Announcements';
import DistrictMembers from './components/district/DistrictMembers';
import DistrictEvents from './components/district/DistrictEvents';
import UnitReports from './components/district/UnitReports';
import ScoutIdeas from './components/district/ScoutIdeas';

// ============================================================
// NATIONAL
// ============================================================
import ManageMembers from './components/national/ManageMembers';
import ManageLeaders from './components/national/ManageLeaders';
import NationalEvents from './components/national/NationalEvents';
import ReportsStats from './components/national/ReportsStats';
import NationalAnnouncements from './components/national/Announcements';
import ReceivedReports from './components/national/ReceivedReports';
import NationalScoutCourses from './components/national/ScoutCourses';
import ReceivedProjects from './components/national/ReceivedProjects';
import ReceivedIdeas from './components/national/ReceivedIdeas';
import ManageRegistrations from './components/national/ManageRegistrations';

// ============================================================
// NATIONAL - ADMIN
// ============================================================
import MarketplaceAdmin from './components/national/MarketplaceAdmin';

// NEWS MANAGEMENT
import NewsManagement from './components/national/NewsManagement';

// ============================================================
// DONATION
// ============================================================
import MyDonations from './components/donation/MyDonations';
import SupportingProjects from './components/donation/SupportingProjects';
import Updates from './components/donation/Updates';
import MyIdeals from './components/donation/MyIdeals';

// ============================================================
// PAYMENT
// ============================================================
import PaymentSystem from './components/payment/PaymentSystem';
import PaymentManagementDashboard from './components/payment/PaymentManagementDashboard';

// ============================================================
// CHAT
// ============================================================
import ScoutChat from './components/chat/ScoutChat';

// ============================================================
// STYLES
// ============================================================
import './styles/App.css';
import './styles/landing.css';
import './styles/dashboard.css';


// ============================================================
// LANDING PAGE
// ============================================================
const LandingPage = () => {
  return (
    <div className="App">
      <FloatingDonate />

      <Hero />

      <Stats />

      <ScoutResponsibilities />

      <SuccessStories />

      <UpcomingEventsLanding />

      <RecentActivities />

      <Footer />
    </div>
  );
};


// ============================================================
// RWANDA SCOUT ASSOCIATION PAGE
// History + Mission + Vision & Values
// ============================================================
const RSAPage = () => {
  return (
    <main className="rsa-page">

      <section id="history">
        <OurHistory />
      </section>

      <section id="mission">
        <Mission />
      </section>

      <section id="vision-values">
        <VisionValues />
      </section>

    </main>
  );
};


// ============================================================
// PROTECTED ROUTES
// ============================================================
const ProtectedRoutes = () => {
  const { user } = useAuth();

  // ----------------------------------------------------------
  // NOT LOGGED IN
  // ----------------------------------------------------------
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;

  // ----------------------------------------------------------
  // ROLE CHECKS
  // ----------------------------------------------------------
  const isSuperAdmin =
    role === 'super_admin' ||
    role === 'super-admin' ||
    role === 'admin';

  const isNationalCommissioner =
    role === 'national_commissioner' ||
    role === 'national-commissioner';

  const isDistrictCommissioner =
    role === 'district_commissioner' ||
    role === 'district-commissioner';

  const isScout =
    role === 'scout' ||
    role === 'unit_leader';

  const isDonor =
    role === 'donor';

  const isNationalOrSuper =
    isNationalCommissioner ||
    isSuperAdmin;


  // ----------------------------------------------------------
  // PROTECTED APPLICATION
  // ----------------------------------------------------------
  return (
    <Layout>

      <Routes>

        {/* ==================================================
            DASHBOARD
        ================================================== */}
        <Route
          path="/dashboard"
          element={
            isScout ? (
              <ScoutDashboard />
            ) : isDistrictCommissioner ? (
              <DistrictDashboard />
            ) : isNationalOrSuper ? (
              <NationalDashboard />
            ) : isDonor ? (
              <DonationDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        {/* ==================================================
            PAYMENT
        ================================================== */}
        <Route
          path="/payment"
          element={<PaymentSystem />}
        />

        <Route
          path="/payments/dashboard"
          element={
            isNationalOrSuper || isDistrictCommissioner ? (
              <PaymentManagementDashboard />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />


        {/* ==================================================
            SCOUT
        ================================================== */}

        <Route
          path="/scout-announcements"
          element={
            isScout ? (
              <ScoutAnnouncements />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/my-events"
          element={
            isScout ? (
              <MyEvents />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/scout-courses"
          element={
            isScout ? (
              <ScoutCourses />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/my-ideas"
          element={
            isScout ? (
              <MyIdeas />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/submit-report"
          element={
            role === 'unit_leader' ? (
              <SubmitReport />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/submit-project"
          element={
            isScout ? (
              <SubmitProject />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />


        {/* ==================================================
            DISTRICT
        ================================================== */}

        <Route
          path="/manage-readers"
          element={
            isDistrictCommissioner || isNationalOrSuper ? (
              <ManageReaders />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/announcements"
          element={
            isDistrictCommissioner || isNationalOrSuper ? (
              <Announcements />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/district-members"
          element={
            isDistrictCommissioner || isNationalOrSuper ? (
              <DistrictMembers />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/district-events"
          element={
            isDistrictCommissioner || isNationalOrSuper ? (
              <DistrictEvents />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/unit-reports"
          element={
            isDistrictCommissioner || isNationalOrSuper ? (
              <UnitReports />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/scout-ideas"
          element={
            isDistrictCommissioner || isNationalOrSuper ? (
              <ScoutIdeas />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />


        {/* ==================================================
            NATIONAL
        ================================================== */}

        <Route
          path="/manage-members"
          element={
            isNationalOrSuper ? (
              <ManageMembers />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/manage-leaders"
          element={
            isNationalOrSuper ? (
              <ManageLeaders />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/national-events"
          element={
            isNationalOrSuper ? (
              <NationalEvents />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/reports-stats"
          element={
            isNationalOrSuper ? (
              <ReportsStats />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/national-announcements"
          element={
            isNationalOrSuper ? (
              <NationalAnnouncements />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/received-reports"
          element={
            isNationalOrSuper ? (
              <ReceivedReports />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/national-scout-courses"
          element={
            isNationalOrSuper ? (
              <NationalScoutCourses />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/received-projects"
          element={
            isNationalOrSuper ? (
              <ReceivedProjects />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/received-ideas"
          element={
            isNationalOrSuper ? (
              <ReceivedIdeas />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/manage-registrations"
          element={
            isNationalOrSuper ? (
              <ManageRegistrations />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />


        {/* ==================================================
            NATIONAL - MARKETPLACE ADMIN
        ================================================== */}

        <Route
          path="/admin/marketplace"
          element={
            isNationalOrSuper ? (
              <MarketplaceAdmin />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />


        {/* ==================================================
            NATIONAL - NEWS MANAGEMENT
        ================================================== */}

        <Route
          path="/admin/news"
          element={
            isNationalOrSuper ? (
              <NewsManagement />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />


        {/* ==================================================
            DONATION
        ================================================== */}

        <Route
          path="/my-donations"
          element={
            isDonor || isNationalOrSuper ? (
              <MyDonations />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/supporting-projects"
          element={
            isDonor || isNationalOrSuper ? (
              <SupportingProjects />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/updates"
          element={
            isDonor || isNationalOrSuper ? (
              <Updates />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/my-ideals"
          element={
            isDonor || isNationalOrSuper ? (
              <MyIdeals />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />


        {/* ==================================================
            CHAT
        ================================================== */}

        <Route
          path="/chat"
          element={<ScoutChat />}
        />


        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />


        {/* ==================================================
            PROFILE
        ================================================== */}

        <Route
          path="/profile"
          element={<MyProfile />}
        />


        {/* ==================================================
            UNKNOWN PROTECTED ROUTE
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>

    </Layout>
  );
};


// ============================================================
// MAIN APP
// ============================================================
function App() {
  return (
    <LanguageProvider>

      <AuthProvider>

        <Routes>

          {/* ==================================================
              PUBLIC LANDING
          ================================================== */}

          <Route
            path="/"
            element={<LandingPage />}
          />


          {/* ==================================================
              AUTHENTICATION
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />


          {/* ==================================================
              ABOUT
          ================================================== */}

          <Route
            path="/about"
            element={<About />}
          />

          {/* Rwanda Scout Association:
              History + Mission + Vision & Values
          */}

          <Route
            path="/about/rsa"
            element={<RSAPage />}
          />

          <Route
            path="/about/structure"
            element={<OrganisationStructure />}
          />

          <Route
            path="/about/partners"
            element={<PartnersDonate />}
          />

          <Route
            path="/about/membership"
            element={<Membership />}
          />

          <Route
            path="/about/team"
            element={<MSRDevelopmentTeam />}
          />


          {/* ==================================================
              PUBLIC EVENTS
          ================================================== */}

          <Route
            path="/events/upcoming"
            element={<UpcomingEvents />}
          />

          <Route
            path="/events/past"
            element={<PastEvents />}
          />

          <Route
            path="/events/news"
            element={<News />}
          />


          {/* ==================================================
              PUBLIC NEWS
              READ MORE DOES NOT REQUIRE LOGIN
          ================================================== */}

          <Route
            path="/news"
            element={<News />}
          />

          <Route
            path="/news/:id"
            element={<News />}
          />


          {/* ==================================================
              EVENT DETAILS ARE PUBLIC
          ================================================== */}

          <Route
            path="/events/:id"
            element={<EventDetail />}
          />


          {/* ==================================================
              MARKETPLACE
          ================================================== */}

          <Route
            path="/marketplace"
            element={<Marketplace />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/marketplace/:id"
            element={<ProductDetails />}
          />


          {/* ==================================================
              CONTACT
          ================================================== */}

          <Route
            path="/contact"
            element={<ContactUs />}
          />


          {/* ==================================================
              ATTENDANCE
          ================================================== */}

          <Route
            path="/attendance/:token"
            element={<AttendanceCheckIn />}
          />


          {/* ==================================================
              ALL PROTECTED ROUTES
          ================================================== */}

          <Route
            path="/*"
            element={<ProtectedRoutes />}
          />

        </Routes>

      </AuthProvider>

    </LanguageProvider>
  );
}

export default App;