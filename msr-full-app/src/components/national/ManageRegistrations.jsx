import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ManageRegistrations = () => {
  const { user } = useAuth();

  // ============================================
  // REGISTRATION STATE
  // ============================================
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ============================================
  // DONATION STATE
  // ============================================
  const [donations, setDonations] = useState([]);
  const [projects, setProjects] = useState([]);

  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);

  const [filterDonationStatus, setFilterDonationStatus] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDonationDetailsModal, setShowDonationDetailsModal] =
    useState(false);

  const [donationFormData, setDonationFormData] = useState({
    projectId: '',
    amount: '',
    paymentMethod: 'mobile_money',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    message: '',
    isAnonymous: false,
    status: 'pending'
  });

  // ============================================
  // ATTENDANCE STATE
  // ============================================
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    pending: 0,
    excused: 0,
    attendanceRate: 0
  });

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [attendanceLink, setAttendanceLink] = useState('');
  const [attendanceLinkQR, setAttendanceLinkQR] = useState('');

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [attendanceSearch, setAttendanceSearch] = useState('');

  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedMemberForCheckIn, setSelectedMemberForCheckIn] =
    useState(null);

  const [linkGenerationLoading, setLinkGenerationLoading] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);

  // ============================================
  // OPTIONS
  // ============================================
  const registrationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'event', label: 'Event' },
    { value: 'training', label: 'Training' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'camp', label: 'Camp' },
    { value: 'competition', label: 'Competition' },
    { value: 'community_service', label: 'Community Service' },
    { value: 'ceremony', label: 'Ceremony' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'attended', label: 'Attended' }
  ];

  const donationStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentMethods = [
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'cash', label: 'Cash' }
  ];

  const attendanceStatusOptions = [
    { value: 'all', label: 'All Attendance' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'pending', label: 'Pending' },
    { value: 'excused', label: 'Excused' }
  ];

  // ============================================
  // AUTH CONFIG
  // ============================================
  const getAuthConfig = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      user?.token;

    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      : {};
  };

  // ============================================
  // SAFE HELPERS
  // ============================================
  const safeArray = value => (Array.isArray(value) ? value : []);

  const getResponseArray = (response, keys = []) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    for (const key of keys) {
      if (Array.isArray(response?.data?.[key])) {
        return response.data[key];
      }
    }

    return [];
  };

  const formatDate = date => {
    if (!date) return 'N/A';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'N/A';
    }

    return parsed.toLocaleDateString();
  };

  const formatDateTime = date => {
    if (!date) return 'N/A';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'N/A';
    }

    return parsed.toLocaleString();
  };

  const formatAmount = amount => {
    const value = parseFloat(amount);

    if (Number.isNaN(value)) {
      return '0';
    }

    return value.toLocaleString();
  };

  const csvEscape = value => {
    const text = value === null || value === undefined ? '' : String(value);

    if (
      text.includes(',') ||
      text.includes('"') ||
      text.includes('\n') ||
      text.includes('\r')
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  // ============================================
  // FETCH REGISTRATIONS
  // ============================================
  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/national/registrations/all`,
        getAuthConfig()
      );

      const data = getResponseArray(response, [
        'registrations',
        'data',
        'results'
      ]);

      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);

      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            'Failed to load national registrations.'
        );
      }

      setRegistrations([]);
    }
  };

  // ============================================
  // FETCH NATIONAL EVENTS
  // ============================================
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/national/events`,
        getAuthConfig()
      );

      const allEvents = getResponseArray(response, [
        'events',
        'data',
        'results'
      ]);

      const nationalEvents = allEvents.filter(
        event =>
          event.scope === 'national' ||
          event.is_national === true ||
          event.isNational === true
      );

      const eventsWithRegistrationCounts = await Promise.all(
        nationalEvents.map(async event => {
          try {
            const registrationResponse = await axios.get(
              `${API_URL}/national/events/${event.id}/registrations`,
              getAuthConfig()
            );

            const eventRegistrations = getResponseArray(
              registrationResponse,
              ['registrations', 'data', 'results']
            );

            const approvedCount = eventRegistrations.filter(
              registration => registration.status === 'approved'
            ).length;

            return {
              ...event,
              registrationCount: eventRegistrations.length,
              approvedCount
            };
          } catch (err) {
            console.warn(
              `Could not load registrations for event ${event.id}:`,
              err
            );

            return {
              ...event,
              registrationCount: event.registrationCount || 0,
              approvedCount: event.approvedCount || 0
            };
          }
        })
      );

      setEvents(eventsWithRegistrationCounts);
    } catch (err) {
      console.error('Error fetching events:', err);

      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            'Failed to load national events.'
        );
      }

      setEvents([]);
    }
  };

  // ============================================
  // FETCH DONATIONS
  // ============================================
  const fetchDonations = async () => {
    try {
      const query =
        filterDonationStatus && filterDonationStatus !== 'all'
          ? `?status=${encodeURIComponent(filterDonationStatus)}`
          : '';

      const response = await axios.get(
        `${API_URL}/national/donations${query}`,
        getAuthConfig()
      );

      const data = getResponseArray(response, [
        'donations',
        'data',
        'results'
      ]);

      setDonations(data);
    } catch (err) {
      console.error('Error fetching donations:', err);

      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            'Failed to load donations.'
        );
      }

      setDonations([]);
    }
  };

  // ============================================
  // FETCH PROJECTS
  // ============================================
  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/national/projects`,
        getAuthConfig()
      );

      const data = getResponseArray(response, [
        'projects',
        'data',
        'results'
      ]);

      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);

      if (err.response?.status !== 404) {
        console.warn('National projects could not be loaded.');
      }

      setProjects([]);
    }
  };

  // ============================================
  // FETCH ATTENDANCE
  // ============================================
  const fetchAttendance = async eventId => {
    if (!eventId) {
      setAttendance([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/national/attendance/${eventId}`,
        getAuthConfig()
      );

      const data = getResponseArray(response, [
        'attendance',
        'records',
        'participants',
        'data',
        'results'
      ]);

      setAttendance(data);

      const returnedStats =
        response.data?.stats ||
        response.data?.statistics ||
        response.data?.attendanceStats;

      if (returnedStats) {
        setAttendanceStats({
          total: Number(returnedStats.total) || data.length,
          present: Number(returnedStats.present) || 0,
          absent: Number(returnedStats.absent) || 0,
          pending: Number(returnedStats.pending) || 0,
          excused: Number(returnedStats.excused) || 0,
          attendanceRate:
            Number(
              returnedStats.attendanceRate ??
                returnedStats.rate ??
                returnedStats.attendance_rate
            ) || 0
        });
      } else {
        calculateAttendanceStats(data);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);

      setAttendance([]);
      setAttendanceStats({
        total: 0,
        present: 0,
        absent: 0,
        pending: 0,
        excused: 0,
        attendanceRate: 0
      });

      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            'Failed to load attendance.'
        );
      }
    }
  };

  // ============================================
  // CALCULATE ATTENDANCE STATISTICS
  // ============================================
  const calculateAttendanceStats = data => {
    const records = safeArray(data);

    const total = records.length;

    const present = records.filter(
      item => item.status === 'present'
    ).length;

    const absent = records.filter(
      item => item.status === 'absent'
    ).length;

    const pending = records.filter(
      item => item.status === 'pending' || !item.status
    ).length;

    const excused = records.filter(
      item => item.status === 'excused'
    ).length;

    const attendanceRate =
      total > 0 ? Math.round((present / total) * 100) : 0;

    setAttendanceStats({
      total,
      present,
      absent,
      pending,
      excused,
      attendanceRate
    });
  };

  // ============================================
  // INITIAL DATA
  // ============================================
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        await Promise.all([
          fetchRegistrations(),
          fetchEvents(),
          fetchDonations(),
          fetchProjects()
        ]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [filterDonationStatus]);

  // ============================================
  // APPROVE REGISTRATION
  // ============================================
  const handleApprove = async registrationId => {
    if (!registrationId) return;

    try {
      setError('');

      await axios.put(
        `${API_URL}/national/registrations/${registrationId}/approve`,
        {},
        getAuthConfig()
      );

      setSuccess('Registration approved successfully.');

      await fetchRegistrations();
      await fetchEvents();
    } catch (err) {
      console.error('Approve registration error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to approve registration.'
      );
    }
  };

  // ============================================
  // REJECT REGISTRATION
  // ============================================
  const handleReject = async registrationId => {
    if (!registrationId) return;

    try {
      setError('');

      await axios.put(
        `${API_URL}/national/registrations/${registrationId}/reject`,
        {},
        getAuthConfig()
      );

      setSuccess('Registration rejected successfully.');

      await fetchRegistrations();
      await fetchEvents();
    } catch (err) {
      console.error('Reject registration error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to reject registration.'
      );
    }
  };

  // ============================================
  // MARK REGISTRATION ATTENDED
  // ============================================
  const handleMarkAttended = async registrationId => {
    if (!registrationId) return;

    try {
      setError('');

      await axios.put(
        `${API_URL}/national/registrations/${registrationId}/attended`,
        {},
        getAuthConfig()
      );

      setSuccess('Registration marked as attended.');

      await fetchRegistrations();
      await fetchEvents();
    } catch (err) {
      console.error('Mark attended error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to mark registration as attended.'
      );
    }
  };

  // ============================================
  // CANCEL REGISTRATION
  // ============================================
  const handleCancel = async registrationId => {
    if (!registrationId) return;

    try {
      setError('');

      await axios.put(
        `${API_URL}/national/registrations/${registrationId}/cancel`,
        {},
        getAuthConfig()
      );

      setSuccess('Registration cancelled successfully.');

      await fetchRegistrations();
      await fetchEvents();
    } catch (err) {
      console.error('Cancel registration error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to cancel registration.'
      );
    }
  };

  // ============================================
  // ISSUE CERTIFICATE
  // ============================================
  const handleIssueCertificate = async registrationId => {
    if (!registrationId) return;

    try {
      setError('');

      const response = await axios.post(
        `${API_URL}/national/registrations/${registrationId}/certificate`,
        {},
        getAuthConfig()
      );

      setSuccess(
        response.data?.message ||
          'Certificate issued successfully.'
      );

      await fetchRegistrations();
    } catch (err) {
      console.error('Certificate error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to issue certificate.'
      );
    }
  };

  // ============================================
  // CREATE DONATION
  // ============================================
  const handleCreateDonation = async e => {
    e.preventDefault();

    try {
      setError('');

      const payload = {
        projectId: donationFormData.projectId,
        amount: parseFloat(donationFormData.amount),
        paymentMethod: donationFormData.paymentMethod,
        donorName: donationFormData.isAnonymous
          ? 'Anonymous'
          : donationFormData.donorName,
        donorEmail: donationFormData.donorEmail,
        donorPhone: donationFormData.donorPhone,
        message: donationFormData.message,
        isAnonymous: donationFormData.isAnonymous,
        status: donationFormData.status
      };

      await axios.post(
        `${API_URL}/national/donations`,
        payload,
        getAuthConfig()
      );

      setSuccess('Donation created successfully.');

      setShowAddDonationModal(false);

      setDonationFormData({
        projectId: '',
        amount: '',
        paymentMethod: 'mobile_money',
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        message: '',
        isAnonymous: false,
        status: 'pending'
      });

      await fetchDonations();
    } catch (err) {
      console.error('Create donation error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to create donation.'
      );
    }
  };

  // ============================================
  // UPDATE DONATION STATUS
  // ============================================
  const handleUpdateDonationStatus = async (
    donationId,
    status
  ) => {
    if (!donationId || !status) return;

    try {
      setError('');

      await axios.put(
        `${API_URL}/national/donations/${donationId}/status`,
        { status },
        getAuthConfig()
      );

      setSuccess('Donation status updated successfully.');

      await fetchDonations();
    } catch (err) {
      console.error('Donation status error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to update donation status.'
      );
    }
  };

  // ============================================
  // DELETE DONATION
  // ============================================
  const handleDeleteDonation = async donationId => {
    if (!donationId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this donation? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setError('');

      await axios.delete(
        `${API_URL}/national/donations/${donationId}`,
        getAuthConfig()
      );

      setSuccess('Donation deleted successfully.');

      await fetchDonations();
    } catch (err) {
      console.error('Delete donation error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to delete donation.'
      );
    }
  };

  // ============================================
  // SELECT EVENT
  // ============================================
  const handleSelectEvent = async event => {
    setSelectedEvent(event);
    setAttendanceSearch('');
    setAttendanceFilter('all');

    await fetchAttendance(event.id);
  };

  // ============================================
  // GENERATE ATTENDANCE LINK
  // ============================================
  const generateAttendanceLink = async eventId => {
    if (!eventId) return;

    try {
      setLinkGenerationLoading(true);
      setError('');

      const response = await axios.post(
        `${API_URL}/national/attendance/generate-link/${eventId}`,
        {},
        getAuthConfig()
      );

      const data = response.data || {};

      const generatedLink =
        data.attendanceLink ||
        data.attendance_link ||
        data.link ||
        data.url ||
        data?.data?.attendanceLink ||
        data?.data?.attendance_link ||
        data?.data?.link ||
        data?.data?.url ||
        '';

      const generatedQR =
        data.attendanceLinkQR ||
        data.attendance_link_qr ||
        data.qrCode ||
        data.qr_code ||
        data.qr ||
        data?.data?.attendanceLinkQR ||
        data?.data?.attendance_link_qr ||
        data?.data?.qrCode ||
        data?.data?.qr_code ||
        data?.data?.qr ||
        '';

      setAttendanceLink(generatedLink);
      setAttendanceLinkQR(generatedQR);

      const sentCount =
        Number(
          data.notificationCount ??
            data.notification_count ??
            data.notificationsSent ??
            data.notifications_sent ??
            data?.data?.notificationCount ??
            data?.data?.notification_count ??
            data?.data?.notificationsSent ??
            data?.data?.notifications_sent
        ) || 0;

      setNotificationCount(sentCount);

      setShowLinkModal(true);

      if (sentCount > 0) {
        setSuccess(
          `Attendance link generated. ${sentCount} notification(s) sent to registered users.`
        );
      } else {
        setSuccess('Attendance link generated successfully.');
      }

      await fetchEvents();
    } catch (err) {
      console.error('Generate attendance link error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to generate attendance link.'
      );
    } finally {
      setLinkGenerationLoading(false);
    }
  };

  // ============================================
  // GET MEMBER ID FOR ATTENDANCE
  // ============================================
  const getAttendanceMemberId = record => {
    return (
      record?.memberId ||
      record?.member_id ||
      record?.userId ||
      record?.user_id ||
      record?.member?.id ||
      record?.user?.id ||
      record?.participantId ||
      record?.participant_id ||
      null
    );
  };

  // ============================================
  // MARK ATTENDANCE
  // ============================================
  const markAttendance = async (eventId, memberId) => {
    if (!eventId || !memberId) {
      setError('Unable to identify the participant.');
      return;
    }

    try {
      setCheckingIn(true);
      setError('');

      await axios.post(
        `${API_URL}/national/attendance/mark/${eventId}/${memberId}`,
        { status: 'present' },
        getAuthConfig()
      );

      setSuccess('Participant marked as present.');

      await fetchAttendance(eventId);
    } catch (err) {
      console.error('Mark attendance error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to mark participant as present.'
      );
    } finally {
      setCheckingIn(false);
    }
  };

  // ============================================
  // MARK ABSENT
  // ============================================
  const markAbsent = async (eventId, memberId) => {
    if (!eventId || !memberId) {
      setError('Unable to identify the participant.');
      return;
    }

    try {
      setCheckingIn(true);
      setError('');

      await axios.post(
        `${API_URL}/national/attendance/mark/${eventId}/${memberId}`,
        { status: 'absent' },
        getAuthConfig()
      );

      setSuccess('Participant marked as absent.');

      await fetchAttendance(eventId);
    } catch (err) {
      console.error('Mark absent error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to mark participant as absent.'
      );
    } finally {
      setCheckingIn(false);
    }
  };

  // ============================================
  // ATTENDANCE FILTER
  // ============================================
  const getFilteredAttendance = () => {
    const records = safeArray(attendance);
    const search = attendanceSearch.trim().toLowerCase();

    return records.filter(record => {
      const status = record.status || 'pending';

      const matchesStatus =
        attendanceFilter === 'all' ||
        status === attendanceFilter;

      const searchableText = [
        record.memberName,
        record.name,
        record.fullName,
        record.sin,
        record.email,
        record.phone,
        record.district,
        record.sector,
        record.cell,
        record.village
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search);

      return matchesStatus && matchesSearch;
    });
  };

  // ============================================
  // ATTENDANCE STATISTICS
  // ============================================
  const getAttendanceStats = () => {
    const records = safeArray(attendance);

    const total = records.length;

    const present = records.filter(
      record => record.status === 'present'
    ).length;

    const absent = records.filter(
      record => record.status === 'absent'
    ).length;

    const pending = records.filter(
      record =>
        record.status === 'pending' ||
        !record.status
    ).length;

    const excused = records.filter(
      record => record.status === 'excused'
    ).length;

    const rate =
      total > 0
        ? Math.round((present / total) * 100)
        : 0;

    return {
      total,
      present,
      absent,
      pending,
      excused,
      rate
    };
  };

  // ============================================
  // EXPORT REGISTRATIONS CSV
  // ============================================
  const exportRegistrationsCSV = () => {
    const headers = [
      'Event Name',
      'Member',
      'SIN',
      'Type',
      'Status',
      'Registration Date'
    ];

    const rows = filteredRegistrations.map(reg => [
      reg.eventName || reg.title || 'N/A',
      reg.memberName || reg.fullName || 'N/A',
      reg.sin || 'N/A',
      reg.type || 'N/A',
      reg.status || 'N/A',
      reg.createdAt || reg.registrationDate || 'N/A'
    ]);

    let csv =
      '\uFEFF' +
      headers.map(csvEscape).join(',') +
      '\n';

    rows.forEach(row => {
      csv += row.map(csvEscape).join(',') + '\n';
    });

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `national_registrations_${
      new Date().toISOString().split('T')[0]
    }.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    setSuccess('Registrations exported successfully.');
  };

  // ============================================
  // EXPORT ATTENDANCE CSV
  // ============================================
  const downloadAttendance = () => {
    if (!selectedEvent) {
      setError('Please select a national event first.');
      return;
    }

    const headers = [
      'Name',
      'SIN',
      'Email',
      'Phone',
      'District',
      'Status',
      'Check-in Time',
      'Method'
    ];

    const rows = filteredAttendance.map(record => [
      record.memberName ||
        record.name ||
        record.fullName ||
        'N/A',
      record.sin || 'N/A',
      record.email || 'N/A',
      record.phone || 'N/A',
      record.district || 'N/A',
      record.status || 'pending',
      record.attendanceTime ||
        record.checkedInAt ||
        'N/A',
      record.checkedInBy || 'system'
    ]);

    let csv =
      '\uFEFF' +
      headers.map(csvEscape).join(',') +
      '\n';

    rows.forEach(row => {
      csv += row.map(csvEscape).join(',') + '\n';
    });

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `attendance_${
      selectedEvent.title
        ? selectedEvent.title
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase()
        : 'event'
    }_${new Date().toISOString().split('T')[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    setSuccess('Attendance exported successfully.');
  };

  // ============================================
  // ATTENDANCE PDF
  // ============================================
  const downloadAttendancePDF = () => {
    setError(
      'PDF export is not configured in this component. Please use CSV export for attendance.'
    );
  };

  // ============================================
  // STATUS HELPERS
  // ============================================
  const getStatusBadge = status => {
    const badges = {
      approved: 'badge-approved',
      pending: 'badge-pending',
      rejected: 'badge-rejected',
      cancelled: 'badge-cancelled',
      attended: 'badge-attended',
      completed: 'badge-approved',
      failed: 'badge-rejected',
      refunded: 'badge-cancelled',
      present: 'badge-approved',
      absent: 'badge-rejected',
      excused: 'badge-cancelled'
    };

    return badges[status] || 'badge-default';
  };

  const getStatusIcon = status => {
    const icons = {
      approved: '✓',
      pending: '⏳',
      rejected: '✕',
      cancelled: '✕',
      attended: '✓',
      completed: '✓',
      failed: '✕',
      refunded: '↩',
      present: '✓',
      absent: '✕',
      excused: '📝'
    };

    return icons[status] || '•';
  };

  const getTypeIcon = type => {
    const icons = {
      event: '📅',
      training: '📚',
      workshop: '🔧',
      camp: '⛺',
      competition: '🏆',
      community_service: '🤝',
      ceremony: '🎊'
    };

    return icons[type] || '📋';
  };

  const getAttendanceStatusBadge = status => {
    const badges = {
      present: 'badge-approved',
      absent: 'badge-rejected',
      pending: 'badge-pending',
      excused: 'badge-cancelled'
    };

    return badges[status] || 'badge-default';
  };

  // ============================================
  // SAFE DATA
  // ============================================
  const safeRegistrations = Array.isArray(registrations)
    ? registrations
    : [];

  const safeDonations = Array.isArray(donations)
    ? donations
    : [];

  const safeEvents = Array.isArray(events)
    ? events
    : [];

  // ============================================
  // FILTERED REGISTRATIONS
  // ============================================
  const normalizedSearchTerm = searchTerm
    .trim()
    .toLowerCase();

  const filteredRegistrations = safeRegistrations.filter(
    reg => {
      const matchesType =
        filterType === 'all' ||
        reg.type === filterType;

      const matchesStatus =
        filterStatus === 'all' ||
        reg.status === filterStatus;

      const searchableText = [
        reg.eventName,
        reg.title,
        reg.memberName,
        reg.fullName,
        reg.sin,
        reg.email,
        reg.district
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearchTerm ||
        searchableText.includes(normalizedSearchTerm);

      return (
        matchesType &&
        matchesStatus &&
        matchesSearch
      );
    }
  );

  // ============================================
  // FILTERED DONATIONS
  // ============================================
  const filteredDonations = safeDonations.filter(
    donation => {
      const matchesStatus =
        filterDonationStatus === 'all' ||
        donation.status === filterDonationStatus;

      const searchableText = [
        donation.donorName,
        donation.projectName,
        donation.project?.title,
        donation.message,
        donation.donorEmail,
        donation.donorPhone
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearchTerm ||
        searchableText.includes(normalizedSearchTerm);

      return matchesStatus && matchesSearch;
    }
  );

  const filteredAttendance = getFilteredAttendance();

  // ============================================
  // STATISTICS
  // ============================================
  const totalRegistrations = safeRegistrations.length;

  const pendingCount = safeRegistrations.filter(
    r => r.status === 'pending'
  ).length;

  const approvedCount = safeRegistrations.filter(
    r => r.status === 'approved'
  ).length;

  const attendedCount = safeRegistrations.filter(
    r => r.status === 'attended'
  ).length;

  const rejectedCount = safeRegistrations.filter(
    r =>
      r.status === 'rejected' ||
      r.status === 'cancelled'
  ).length;

  const totalDonations = safeDonations.reduce(
    (sum, donation) =>
      sum + (parseFloat(donation.amount) || 0),
    0
  );

  const completedDonations = safeDonations.filter(
    donation => donation.status === 'completed'
  );

  const totalCompleted = completedDonations.reduce(
    (sum, donation) =>
      sum + (parseFloat(donation.amount) || 0),
    0
  );

  const attendanceStatsData = getAttendanceStats();

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading national data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* ============================================
          HEADER
          ============================================ */}
      <div className="page-header">
        <div>
          <h2>
            <i
              className="fas fa-user-check"
              style={{ color: '#622599' }}
            ></i>{' '}
            National Registration Management
          </h2>

          <p>
            Manage all national event registrations,
            donations, and attendance
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() =>
              setShowAddDonationModal(true)
            }
          >
            <i className="fas fa-hand-holding-heart"></i>{' '}
            Add Donation
          </button>

          <button
            className="btn-secondary"
            onClick={exportRegistrationsCSV}
          >
            <i className="fas fa-file-csv"></i> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>

          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>

          <button
            className="alert-close"
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>

          <div>
            <strong>Success</strong>
            <p>{success}</p>
          </div>

          <button
            className="alert-close"
            onClick={() => setSuccess('')}
          >
            ×
          </button>
        </div>
      )}

      {/* ============================================
          TABS
          ============================================ */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${
            !showDonationModal &&
            !showAttendanceModal
              ? 'active'
              : ''
          }`}
          onClick={() => {
            setShowDonationModal(false);
            setShowAttendanceModal(false);
          }}
        >
          <i className="fas fa-list"></i> Registrations
          <span className="badge">
            {safeRegistrations.length}
          </span>
        </button>

        <button
          className={`tab-btn ${
            showDonationModal ? 'active' : ''
          }`}
          onClick={() => {
            setShowDonationModal(true);
            setShowAttendanceModal(false);
          }}
        >
          <i className="fas fa-hand-holding-heart"></i>{' '}
          Donations
          <span className="badge">
            {safeDonations.length}
          </span>
        </button>

        <button
          className={`tab-btn ${
            showAttendanceModal ? 'active' : ''
          }`}
          onClick={() => {
            setShowAttendanceModal(true);
            setShowDonationModal(false);
          }}
        >
          <i className="fas fa-user-check"></i>{' '}
          Attendance
          <span className="badge">
            {safeEvents.length}
          </span>
        </button>
      </div>

      {/* ============================================
          REGISTRATIONS TAB
          ============================================ */}
      {!showDonationModal &&
        !showAttendanceModal && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: '#F5EDFA',
                    color: '#622599'
                  }}
                >
                  <i className="fas fa-list"></i>
                </div>

                <div className="stat-info">
                  <h3>{totalRegistrations}</h3>
                  <p>Total Registrations</p>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: '#FFF8E1',
                    color: '#FFC107'
                  }}
                >
                  <i className="fas fa-clock"></i>
                </div>

                <div className="stat-info">
                  <h3>{pendingCount}</h3>
                  <p>Pending Approval</p>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: '#E8F5E9',
                    color: '#2E7D32'
                  }}
                >
                  <i className="fas fa-check-circle"></i>
                </div>

                <div className="stat-info">
                  <h3>{approvedCount}</h3>
                  <p>Approved</p>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: '#F5EDFA',
                    color: '#622599'
                  }}
                >
                  <i className="fas fa-user-check"></i>
                </div>

                <div className="stat-info">
                  <h3>{attendedCount}</h3>
                  <p>Attended</p>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{
                    background: '#FFEBEE',
                    color: '#DC3545'
                  }}
                >
                  <i className="fas fa-times-circle"></i>
                </div>

                <div className="stat-info">
                  <h3>{rejectedCount}</h3>
                  <p>Rejected/Cancelled</p>
                </div>
              </div>
            </div>

            <div className="search-filter-bar">
              <div className="search-box">
                <i className="fas fa-search"></i>

                <input
                  type="text"
                  placeholder="Search by event, member, or SIN..."
                  value={searchTerm}
                  onChange={e =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>

              <div className="filter-box">
                <select
                  value={filterType}
                  onChange={e =>
                    setFilterType(e.target.value)
                  }
                >
                  {registrationTypes.map(type => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-box">
                <select
                  value={filterStatus}
                  onChange={e =>
                    setFilterStatus(e.target.value)
                  }
                >
                  {statusOptions.map(status => (
                    <option
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="stats-info">
                <span>
                  Showing:{' '}
                  <strong>
                    {filteredRegistrations.length}
                  </strong>{' '}
                  registrations
                </span>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Event/Training</th>
                    <th>Type</th>
                    <th>Member</th>
                    <th>SIN</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No registrations found
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map(
                      (reg, index) => {
                        const eventName =
                          reg.eventName ||
                          reg.title ||
                          'N/A';

                        const memberName =
                          reg.memberName ||
                          reg.fullName ||
                          'N/A';

                        const sin =
                          reg.sin || 'N/A';

                        const type =
                          reg.type || 'event';

                        const status =
                          reg.status || 'pending';

                        const date =
                          reg.createdAt ||
                          reg.registrationDate;

                        return (
                          <tr
                            key={
                              reg.id || index
                            }
                          >
                            <td>{index + 1}</td>

                            <td>
                              <div className="event-cell">
                                <span className="type-icon">
                                  {getTypeIcon(type)}
                                </span>

                                <strong>
                                  {eventName}
                                </strong>
                              </div>
                            </td>

                            <td>
                              <span className="type-badge">
                                {type}
                              </span>
                            </td>

                            <td>{memberName}</td>

                            <td>
                              <strong>{sin}</strong>
                            </td>

                            <td>
                              {formatDate(date)}
                            </td>

                            <td>
                              <span
                                className={`status-badge ${getStatusBadge(
                                  status
                                )}`}
                              >
                                {getStatusIcon(status)}{' '}
                                {status
                                  .charAt(0)
                                  .toUpperCase() +
                                  status.slice(1)}
                              </span>
                            </td>

                            <td>
                              <div className="action-buttons">
                                {status === 'pending' && (
                                  <>
                                    <button
                                      className="btn-sm btn-approve"
                                      onClick={() =>
                                        handleApprove(reg.id)
                                      }
                                      title="Approve"
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>

                                    <button
                                      className="btn-sm btn-reject"
                                      onClick={() =>
                                        handleReject(reg.id)
                                      }
                                      title="Reject"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </>
                                )}

                                {status === 'approved' && (
                                  <>
                                    <button
                                      className="btn-sm btn-attend"
                                      onClick={() =>
                                        handleMarkAttended(
                                          reg.id
                                        )
                                      }
                                      title="Mark as Attended"
                                    >
                                      <i className="fas fa-user-check"></i>
                                    </button>

                                    <button
                                      className="btn-sm btn-certificate"
                                      onClick={() =>
                                        handleIssueCertificate(
                                          reg.id
                                        )
                                      }
                                      title="Issue Certificate"
                                    >
                                      <i className="fas fa-certificate"></i>
                                    </button>

                                    <button
                                      className="btn-sm btn-cancel"
                                      onClick={() =>
                                        handleCancel(reg.id)
                                      }
                                      title="Cancel"
                                    >
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </>
                                )}

                                <button
                                  className="btn-sm btn-view"
                                  onClick={() => {
                                    setSelectedRegistration(reg);
                                    setShowDetailsModal(true);
                                  }}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

      {/* ============================================
          DONATIONS TAB
          ============================================ */}
      {showDonationModal && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div
                className="stat-icon"
                style={{
                  background: '#F5EDFA',
                  color: '#622599'
                }}
              >
                <i className="fas fa-list"></i>
              </div>

              <div className="stat-info">
                <h3>{safeDonations.length}</h3>
                <p>Total Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{
                  background: '#E8F5E9',
                  color: '#2E7D32'
                }}
              >
                <i className="fas fa-check-circle"></i>
              </div>

              <div className="stat-info">
                <h3>
                  RWF {totalCompleted.toLocaleString()}
                </h3>
                <p>Completed Donations</p>
              </div>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{
                  background: '#FFF8E1',
                  color: '#FFC107'
                }}
              >
                <i className="fas fa-clock"></i>
              </div>

              <div className="stat-info">
                <h3>
                  {
                    safeDonations.filter(
                      d => d.status === 'pending'
                    ).length
                  }
                </h3>

                <p>Pending</p>
              </div>
            </div>

            <div className="stat-card">
              <div
                className="stat-icon"
                style={{
                  background: '#F5EDFA',
                  color: '#622599'
                }}
              >
                <i className="fas fa-hand-holding-heart"></i>
              </div>

              <div className="stat-info">
                <h3>
                  RWF {totalDonations.toLocaleString()}
                </h3>

                <p>Total Amount</p>
              </div>
            </div>
          </div>

          <div className="search-filter-bar">
            <div className="search-box">
              <i className="fas fa-search"></i>

              <input
                type="text"
                placeholder="Search by donor, project, or message..."
                value={searchTerm}
                onChange={e =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <div className="filter-box">
              <select
                value={filterDonationStatus}
                onChange={e =>
                  setFilterDonationStatus(e.target.value)
                }
              >
                {donationStatusOptions.map(option => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="stats-info">
              <span>
                Showing:{' '}
                <strong>
                  {filteredDonations.length}
                </strong>{' '}
                donations
              </span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donor</th>
                  <th>Project</th>
                  <th>Amount (RWF)</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map(
                    (donation, index) => (
                      <tr
                        key={
                          donation.id || index
                        }
                      >
                        <td>{index + 1}</td>

                        <td>
                          {donation.isAnonymous
                            ? 'Anonymous'
                            : donation.donorName ||
                              'Anonymous'}
                        </td>

                        <td>
                          {donation.projectName ||
                            donation.project?.title ||
                            'N/A'}
                        </td>

                        <td>
                          <strong>
                            RWF{' '}
                            {formatAmount(
                              donation.amount
                            )}
                          </strong>
                        </td>

                        <td>
                          {donation.paymentMethod ||
                            'N/A'}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusBadge(
                              donation.status
                            )}`}
                          >
                            {getStatusIcon(
                              donation.status
                            )}{' '}
                            {donation.status ||
                              'pending'}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            donation.createdAt
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <select
                              className="btn-sm btn-status"
                              value={
                                donation.status ||
                                'pending'
                              }
                              onChange={e =>
                                handleUpdateDonationStatus(
                                  donation.id,
                                  e.target.value
                                )
                              }
                            >
                              {donationStatusOptions
                                .filter(
                                  option =>
                                    option.value !==
                                    'all'
                                )
                                .map(option => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                            </select>

                            <button
                              className="btn-sm btn-view"
                              onClick={() => {
                                setSelectedDonation(
                                  donation
                                );
                                setShowDonationDetailsModal(
                                  true
                                );
                              }}
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>

                            <button
                              className="btn-sm btn-delete"
                              onClick={() =>
                                handleDeleteDonation(
                                  donation.id
                                )
                              }
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ============================================
          ATTENDANCE TAB
          ============================================ */}
      {showAttendanceModal && (
        <>
          <div className="event-selector">
            <div className="event-selector-header">
              <h3>
                <i
                  className="fas fa-calendar-check"
                  style={{ color: '#622599' }}
                ></i>{' '}
                Select National Event
              </h3>

              <span className="event-count">
                {safeEvents.length} national events available
              </span>
            </div>

            <div className="event-grid">
              {safeEvents.length === 0 ? (
                <div className="no-events-message">
                  <i className="fas fa-calendar-times"></i>
                  <p>No national events available</p>
                  <small>
                    Create a national event first to manage attendance
                  </small>
                </div>
              ) : (
                safeEvents.map(event => (
                  <div
                    key={event.id}
                    className={`event-card ${
                      selectedEvent?.id === event.id
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      handleSelectEvent(event)
                    }
                  >
                    <div className="event-card-header">
                      <h4>🌍 {event.title}</h4>

                      <span
                        className={`event-status ${
                          event.status || ''
                        }`}
                      >
                        {event.status || 'N/A'}
                      </span>
                    </div>

                    <p className="event-date">
                      <i className="fas fa-calendar"></i>{' '}
                      {formatDate(
                        event.start_date ||
                          event.startDate
                      )}
                    </p>

                    <p className="event-location">
                      <i className="fas fa-map-marker-alt"></i>{' '}
                      {event.location ||
                        event.venue ||
                        'TBD'}
                    </p>

                    <div className="event-registration-info">
                      <span className="reg-count">
                        <i className="fas fa-users"></i>{' '}
                        {event.registrationCount || 0}{' '}
                        registrations
                      </span>

                      {event.attendance_link_generated && (
                        <span className="event-link-status">
                          <i className="fas fa-link"></i>{' '}
                          Link Generated
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedEvent && (
            <div className="attendance-controls">
              <div className="controls-header">
                <div>
                  <h3>
                    <i
                      className="fas fa-users"
                      style={{ color: '#622599' }}
                    ></i>{' '}
                    🌍 {selectedEvent.title} -
                    Attendance Management
                  </h3>

                  <p className="event-details">
                    <span>
                      <i className="fas fa-calendar"></i>{' '}
                      {formatDateTime(
                        selectedEvent.start_date ||
                          selectedEvent.startDate
                      )}
                    </span>

                    <span>
                      <i className="fas fa-map-marker-alt"></i>{' '}
                      {selectedEvent.location ||
                        selectedEvent.venue ||
                        'TBD'}
                    </span>

                    <span className="event-scope-badge national">
                      🌍 National
                    </span>
                  </p>
                </div>

                <div className="controls-actions">
                  <button
                    className="btn-primary"
                    onClick={() =>
                      generateAttendanceLink(
                        selectedEvent.id
                      )
                    }
                    disabled={linkGenerationLoading}
                  >
                    {linkGenerationLoading ? (
                      <>
                        <span className="spinner-small"></span>{' '}
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-link"></i>{' '}
                        Generate Link
                      </>
                    )}
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={downloadAttendance}
                  >
                    <i className="fas fa-download"></i>{' '}
                    Export CSV
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={downloadAttendancePDF}
                  >
                    <i className="fas fa-file-pdf"></i>{' '}
                    Export PDF
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>
                      {attendanceStatsData.total}
                    </h3>
                    <p>Total Registered</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  style={{
                    borderLeft: '4px solid #2E7D32'
                  }}
                >
                  <div className="stat-info">
                    <h3
                      style={{
                        color: '#2E7D32'
                      }}
                    >
                      {attendanceStatsData.present}
                    </h3>
                    <p>✅ Present</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  style={{
                    borderLeft: '4px solid #DC3545'
                  }}
                >
                  <div className="stat-info">
                    <h3
                      style={{
                        color: '#DC3545'
                      }}
                    >
                      {attendanceStatsData.absent}
                    </h3>
                    <p>❌ Absent</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  style={{
                    borderLeft: '4px solid #FFC107'
                  }}
                >
                  <div className="stat-info">
                    <h3
                      style={{
                        color: '#FFC107'
                      }}
                    >
                      {attendanceStatsData.pending}
                    </h3>
                    <p>⏳ Pending</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  style={{
                    borderLeft: '4px solid #8D6E63'
                  }}
                >
                  <div className="stat-info">
                    <h3
                      style={{
                        color: '#8D6E63'
                      }}
                    >
                      {attendanceStatsData.excused || 0}
                    </h3>
                    <p>📝 Excused</p>
                  </div>
                </div>

                <div
                  className="stat-card"
                  style={{
                    borderLeft: '4px solid #622599'
                  }}
                >
                  <div className="stat-info">
                    <h3
                      style={{
                        color: '#622599'
                      }}
                    >
                      {attendanceStatsData.rate}%
                    </h3>
                    <p>Attendance Rate</p>
                  </div>
                </div>
              </div>

              <div className="search-filter-bar">
                <div className="filter-box">
                  <select
                    value={attendanceFilter}
                    onChange={e =>
                      setAttendanceFilter(
                        e.target.value
                      )
                    }
                    className="attendance-filter"
                  >
                    {attendanceStatusOptions.map(
                      option => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="stats-info">
                  <span>
                    Showing:{' '}
                    <strong>
                      {filteredAttendance.length}
                    </strong>{' '}
                    of {attendance.length} participants
                  </span>
                </div>

                <div className="search-box">
                  <i className="fas fa-search"></i>

                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={attendanceSearch}
                    onChange={e =>
                      setAttendanceSearch(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>SIN</th>
                      <th>Email</th>
                      <th>District</th>
                      <th>Status</th>
                      <th>Check-in Time</th>
                      <th>Method</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendance.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="text-center"
                        >
                          No attendance records found
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance.map(
                        (record, index) => {
                          const memberId =
                            getAttendanceMemberId(record);

                          const status =
                            record.status || 'pending';

                          return (
                            <tr
                              key={
                                record.id ||
                                memberId ||
                                index
                              }
                            >
                              <td>{index + 1}</td>

                              <td>
                                <strong>
                                  {record.memberName ||
                                    record.name ||
                                    record.fullName ||
                                    'N/A'}
                                </strong>
                              </td>

                              <td>
                                {record.sin || 'N/A'}
                              </td>

                              <td>
                                {record.email || 'N/A'}
                              </td>

                              <td>
                                {record.district || 'N/A'}
                              </td>

                              <td>
                                <span
                                  className={`status-badge ${getAttendanceStatusBadge(
                                    status
                                  )}`}
                                >
                                  {getStatusIcon(status)}{' '}
                                  {status}
                                </span>
                              </td>

                              <td>
                                {record.attendanceTime
                                  ? formatDateTime(
                                      record.attendanceTime
                                    )
                                  : record.checkedInAt
                                  ? formatDateTime(
                                      record.checkedInAt
                                    )
                                  : 'N/A'}
                              </td>

                              <td>
                                <span className="checkin-method">
                                  {record.checkedInBy ===
                                  'self' ? (
                                    <span className="badge-self">
                                      Self
                                    </span>
                                  ) : record.checkedInBy ===
                                    'admin' ? (
                                    <span className="badge-admin">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="badge-system">
                                      System
                                    </span>
                                  )}
                                </span>
                              </td>

                              <td>
                                <div className="action-buttons">
                                  {status !== 'present' && (
                                    <button
                                      className="btn-sm btn-approve"
                                      onClick={() =>
                                        markAttendance(
                                          selectedEvent.id,
                                          memberId
                                        )
                                      }
                                      title="Mark Present"
                                      disabled={
                                        checkingIn ||
                                        !memberId
                                      }
                                    >
                                      <i className="fas fa-check"></i>
                                    </button>
                                  )}

                                  {status !== 'absent' &&
                                    status !== 'present' && (
                                      <button
                                        className="btn-sm btn-reject"
                                        onClick={() =>
                                          markAbsent(
                                            selectedEvent.id,
                                            memberId
                                          )
                                        }
                                        title="Mark Absent"
                                        disabled={
                                          checkingIn ||
                                          !memberId
                                        }
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    )}

                                  <button
                                    className="btn-sm btn-view"
                                    onClick={() =>
                                      setSelectedMemberForCheckIn(
                                        record
                                      )
                                    }
                                    title="View Details"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="attendance-summary">
                <div className="summary-item">
                  <span className="summary-label">
                    Total:
                  </span>

                  <span className="summary-value">
                    {attendanceStatsData.total}
                  </span>
                </div>

                <div className="summary-item present">
                  <span className="summary-label">
                    ✅ Present:
                  </span>

                  <span className="summary-value">
                    {attendanceStatsData.present}
                  </span>
                </div>

                <div className="summary-item absent">
                  <span className="summary-label">
                    ❌ Absent:
                  </span>

                  <span className="summary-value">
                    {attendanceStatsData.absent}
                  </span>
                </div>

                <div className="summary-item pending">
                  <span className="summary-label">
                    ⏳ Pending:
                  </span>

                  <span className="summary-value">
                    {attendanceStatsData.pending}
                  </span>
                </div>

                <div className="summary-item excused">
                  <span className="summary-label">
                    📝 Excused:
                  </span>

                  <span className="summary-value">
                    {attendanceStatsData.excused || 0}
                  </span>
                </div>

                <div className="summary-item rate">
                  <span className="summary-label">
                    📈 Rate:
                  </span>

                  <span className="summary-value">
                    {attendanceStatsData.rate}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================
          REGISTRATION DETAILS MODAL
          ============================================ */}
      {showDetailsModal &&
        selectedRegistration && (
          <div
            className="modal-overlay"
            onClick={() =>
              setShowDetailsModal(false)
            }
          >
            <div
              className="modal-content"
              onClick={e =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <h3>
                  <i
                    className="fas fa-info-circle"
                    style={{ color: '#622599' }}
                  ></i>{' '}
                  Registration Details
                </h3>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowDetailsModal(false)
                  }
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Event/Training:</strong>

                    <span>
                      {selectedRegistration.eventName ||
                        selectedRegistration.title ||
                        'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Type:</strong>

                    <span>
                      {selectedRegistration.type || 'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Member:</strong>

                    <span>
                      {selectedRegistration.memberName ||
                        selectedRegistration.fullName ||
                        'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>SIN:</strong>

                    <span>
                      {selectedRegistration.sin || 'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Email:</strong>

                    <span>
                      {selectedRegistration.email || 'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Phone:</strong>

                    <span>
                      {selectedRegistration.phone || 'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>District:</strong>

                    <span>
                      {selectedRegistration.district || 'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Registration Date:</strong>

                    <span>
                      {formatDateTime(
                        selectedRegistration.createdAt ||
                          selectedRegistration.registrationDate
                      )}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Status:</strong>

                    <span
                      className={`status-badge ${getStatusBadge(
                        selectedRegistration.status
                      )}`}
                    >
                      {getStatusIcon(
                        selectedRegistration.status
                      )}{' '}
                      {selectedRegistration.status || 'pending'}
                    </span>
                  </div>

                  {selectedRegistration.paymentStatus && (
                    <div className="detail-item">
                      <strong>Payment Status:</strong>

                      <span
                        className={`payment-badge ${
                          selectedRegistration.paymentStatus ===
                          'paid'
                            ? 'payment-paid'
                            : 'payment-pending'
                        }`}
                      >
                        {selectedRegistration.paymentStatus}
                      </span>
                    </div>
                  )}

                  {selectedRegistration.notes && (
                    <div className="detail-item full-width">
                      <strong>Notes:</strong>

                      <span>
                        {selectedRegistration.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                {selectedRegistration.status === 'pending' && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => {
                        handleApprove(
                          selectedRegistration.id
                        );

                        setShowDetailsModal(false);
                      }}
                    >
                      <i className="fas fa-check"></i>{' '}
                      Approve
                    </button>

                    <button
                      className="btn-reject"
                      onClick={() => {
                        handleReject(
                          selectedRegistration.id
                        );

                        setShowDetailsModal(false);
                      }}
                    >
                      <i className="fas fa-times"></i>{' '}
                      Reject
                    </button>
                  </>
                )}

                {selectedRegistration.status === 'approved' && (
                  <>
                    <button
                      className="btn-attend"
                      onClick={() => {
                        handleMarkAttended(
                          selectedRegistration.id
                        );

                        setShowDetailsModal(false);
                      }}
                    >
                      <i className="fas fa-user-check"></i>{' '}
                      Mark Attended
                    </button>

                    <button
                      className="btn-certificate"
                      onClick={() => {
                        handleIssueCertificate(
                          selectedRegistration.id
                        );

                        setShowDetailsModal(false);
                      }}
                    >
                      <i className="fas fa-certificate"></i>{' '}
                      Issue Certificate
                    </button>
                  </>
                )}

                <button
                  className="btn-secondary"
                  onClick={() =>
                    setShowDetailsModal(false)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ============================================
          DONATION DETAILS MODAL
          ============================================ */}
      {showDonationDetailsModal &&
        selectedDonation && (
          <div
            className="modal-overlay"
            onClick={() =>
              setShowDonationDetailsModal(false)
            }
          >
            <div
              className="modal-content"
              onClick={e =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <h3>
                  <i
                    className="fas fa-info-circle"
                    style={{ color: '#622599' }}
                  ></i>{' '}
                  Donation Details
                </h3>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowDonationDetailsModal(false)
                  }
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Donor:</strong>

                    <span>
                      {selectedDonation.isAnonymous
                        ? 'Anonymous'
                        : selectedDonation.donorName ||
                          'Anonymous'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Project:</strong>

                    <span>
                      {selectedDonation.projectName ||
                        selectedDonation.project?.title ||
                        'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Amount:</strong>

                    <span>
                      <strong>
                        RWF{' '}
                        {formatAmount(
                          selectedDonation.amount
                        )}
                      </strong>
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Payment Method:</strong>

                    <span>
                      {selectedDonation.paymentMethod ||
                        'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Status:</strong>

                    <span
                      className={`status-badge ${getStatusBadge(
                        selectedDonation.status
                      )}`}
                    >
                      {getStatusIcon(
                        selectedDonation.status
                      )}{' '}
                      {selectedDonation.status || 'pending'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Date:</strong>

                    <span>
                      {formatDateTime(
                        selectedDonation.createdAt
                      )}
                    </span>
                  </div>

                  {selectedDonation.donorEmail && (
                    <div className="detail-item">
                      <strong>Email:</strong>

                      <span>
                        {selectedDonation.donorEmail}
                      </span>
                    </div>
                  )}

                  {selectedDonation.donorPhone && (
                    <div className="detail-item">
                      <strong>Phone:</strong>

                      <span>
                        {selectedDonation.donorPhone}
                      </span>
                    </div>
                  )}

                  {selectedDonation.message && (
                    <div className="detail-item full-width">
                      <strong>Message:</strong>

                      <span>
                        {selectedDonation.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <select
                  className="btn-status"
                  value={
                    selectedDonation.status || 'pending'
                  }
                  onChange={e => {
                    handleUpdateDonationStatus(
                      selectedDonation.id,
                      e.target.value
                    );

                    setShowDonationDetailsModal(false);
                  }}
                >
                  {donationStatusOptions
                    .filter(
                      option => option.value !== 'all'
                    )
                    .map(option => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                </select>

                <button
                  className="btn-secondary"
                  onClick={() =>
                    setShowDonationDetailsModal(false)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ============================================
          ADD DONATION MODAL
          ============================================ */}
      {showAddDonationModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddDonationModal(false)
          }
        >
          <div
            className="modal-content"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h3>
                <i
                  className="fas fa-hand-holding-heart"
                  style={{ color: '#622599' }}
                ></i>{' '}
                Add Donation
              </h3>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddDonationModal(false)
                }
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateDonation}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Project{' '}
                    <span className="required">*</span>
                  </label>

                  <select
                    value={donationFormData.projectId}
                    onChange={e =>
                      setDonationFormData({
                        ...donationFormData,
                        projectId: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">
                      Select Project
                    </option>

                    {safeArray(projects).map(
                      project => (
                        <option
                          key={project.id}
                          value={project.id}
                        >
                          {project.title ||
                            project.name ||
                            'Untitled Project'}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Amount (RWF){' '}
                    <span className="required">*</span>
                  </label>

                  <input
                    type="number"
                    value={donationFormData.amount}
                    onChange={e =>
                      setDonationFormData({
                        ...donationFormData,
                        amount: e.target.value
                      })
                    }
                    required
                    min="100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Donor Name</label>

                  <input
                    type="text"
                    value={donationFormData.donorName}
                    onChange={e =>
                      setDonationFormData({
                        ...donationFormData,
                        donorName: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Donor Email</label>

                  <input
                    type="email"
                    value={donationFormData.donorEmail}
                    onChange={e =>
                      setDonationFormData({
                        ...donationFormData,
                        donorEmail: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Donor Phone</label>

                  <input
                    type="tel"
                    value={donationFormData.donorPhone}
                    onChange={e =>
                      setDonationFormData({
                        ...donationFormData,
                        donorPhone: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>

                  <select
                    value={donationFormData.paymentMethod}
                    onChange={e =>
                      setDonationFormData({
                        ...donationFormData,
                        paymentMethod: e.target.value
                      })
                    }
                  >
                    {paymentMethods.map(method => (
                      <option
                        key={method.value}
                        value={method.value}
                      >
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Message</label>

                <textarea
                  value={donationFormData.message}
                  onChange={e =>
                    setDonationFormData({
                      ...donationFormData,
                      message: e.target.value
                    })
                  }
                  rows="3"
                  placeholder="Leave a message..."
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={donationFormData.isAnonymous}
                    onChange={e =>
                      setDonationFormData({
                        ...donationFormData,
                        isAnonymous: e.target.checked
                      })
                    }
                  />{' '}
                  Keep donor anonymous
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setShowAddDonationModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  <i className="fas fa-save"></i>{' '}
                  Create Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================
          ATTENDANCE LINK MODAL
          ============================================ */}
      {showLinkModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowLinkModal(false)
          }
        >
          <div
            className="modal-content"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h3>
                <i
                  className="fas fa-link"
                  style={{ color: '#622599' }}
                ></i>{' '}
                Attendance Link
              </h3>

              <button
                className="modal-close"
                onClick={() =>
                  setShowLinkModal(false)
                }
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p>
                The attendance link has been automatically sent to all registered participants through notifications.
              </p>

              <div className="link-container">
                <input
                  type="text"
                  value={attendanceLink}
                  readOnly
                  className="link-input"
                />
              </div>

              {notificationCount > 0 && (
                <div className="notification-info">
                  <i
                    className="fas fa-bell"
                    style={{ color: '#622599' }}
                  ></i>

                  <span>
                    🔔 <strong>{notificationCount}</strong>{' '}
                    notification(s) sent to registered users
                  </span>
                </div>
              )}

              {attendanceLinkQR && (
                <div className="qr-code-container">
                  <p>
                    <i className="fas fa-qrcode"></i>{' '}
                    QR Code for easy sharing:
                  </p>

                  <img
                    src={attendanceLinkQR}
                    alt="Attendance QR Code"
                    className="qr-code-image"
                  />
                </div>
              )}

              <div className="link-instructions">
                <p>
                  <i className="fas fa-info-circle"></i>{' '}
                  Participants can:
                </p>

                <ul>
                  <li>
                    Open the attendance link from their notification
                  </li>

                  <li>
                    Enter their email or SIN to verify their identity
                  </li>

                  <li>
                    Click "Check In" to mark themselves as present
                  </li>

                  <li>
                    Each participant can only check in once
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() =>
                  setShowLinkModal(false)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MEMBER DETAILS MODAL
          ============================================ */}
      {selectedMemberForCheckIn && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedMemberForCheckIn(null)
          }
        >
          <div
            className="modal-content"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h3>
                <i
                  className="fas fa-user"
                  style={{ color: '#622599' }}
                ></i>{' '}
                Participant Details
              </h3>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedMemberForCheckIn(null)
                }
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Name:</strong>

                  <span>
                    {selectedMemberForCheckIn.memberName ||
                      selectedMemberForCheckIn.name ||
                      selectedMemberForCheckIn.fullName ||
                      'N/A'}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>SIN:</strong>

                  <span>
                    {selectedMemberForCheckIn.sin || 'N/A'}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Email:</strong>

                  <span>
                    {selectedMemberForCheckIn.email || 'N/A'}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Phone:</strong>

                  <span>
                    {selectedMemberForCheckIn.phone || 'N/A'}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>District:</strong>

                  <span>
                    {selectedMemberForCheckIn.district || 'N/A'}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Status:</strong>

                  <span
                    className={`status-badge ${getAttendanceStatusBadge(
                      selectedMemberForCheckIn.status
                    )}`}
                  >
                    {getStatusIcon(
                      selectedMemberForCheckIn.status
                    )}{' '}
                    {selectedMemberForCheckIn.status || 'pending'}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Check-in Time:</strong>

                  <span>
                    {selectedMemberForCheckIn.attendanceTime
                      ? formatDateTime(
                          selectedMemberForCheckIn.attendanceTime
                        )
                      : selectedMemberForCheckIn.checkedInAt
                      ? formatDateTime(
                          selectedMemberForCheckIn.checkedInAt
                        )
                      : 'Not checked in'}
                  </span>
                </div>

                <div className="detail-item">
                  <strong>Check-in Method:</strong>

                  <span>
                    {selectedMemberForCheckIn.checkedInBy ===
                    'self'
                      ? 'Self Check-in'
                      : selectedMemberForCheckIn.checkedInBy ===
                        'admin'
                      ? 'Admin'
                      : 'System'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn-secondary"
                onClick={() =>
                  setSelectedMemberForCheckIn(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          RESPONSIVE CSS ONLY
          ============================================ */}
      <style jsx>{`
        .dashboard-container {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .dashboard-container *,
        .dashboard-container *::before,
        .dashboard-container *::after {
          box-sizing: border-box;
        }

        .page-header {
          width: 100%;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .page-header > div:first-child {
          min-width: 0;
          flex: 1 1 400px;
        }

        .page-header h2,
        .page-header p {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .alert {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          overflow-wrap: anywhere;
        }

        .alert > div {
          min-width: 0;
          flex: 1;
        }

        .alert-close {
          flex: 0 0 auto;
        }

        .tabs-container {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tab-btn {
          min-width: 0;
          white-space: nowrap;
        }

        .stats-grid {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(180px, 1fr)
          );
          gap: 16px;
        }

        .stat-card {
          min-width: 0;
          width: 100%;
          overflow: hidden;
        }

        .stat-info {
          min-width: 0;
        }

        .stat-info h3,
        .stat-info p {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .search-filter-bar {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-box {
          min-width: 180px;
          flex: 1 1 280px;
          max-width: 100%;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        .filter-box {
          min-width: 160px;
          max-width: 100%;
          flex: 0 1 220px;
        }

        .filter-box select {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .stats-info {
          min-width: 0;
          flex: 0 1 auto;
          overflow-wrap: anywhere;
        }

        .table-container {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        .table-container .data-table {
          width: max-content;
          min-width: 100%;
        }

        .data-table th,
        .data-table td {
          white-space: nowrap;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          min-width: max-content;
        }

        .btn-sm {
          flex: 0 0 auto;
        }

        .event-selector,
        .attendance-controls {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .event-selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
        }

        .event-selector-header h3,
        .event-count {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .event-grid {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(240px, 1fr)
          );
          gap: 16px;
        }

        .event-card {
          min-width: 0;
          width: 100%;
          overflow: hidden;
        }

        .event-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .event-card-header h4,
        .event-date,
        .event-location,
        .event-registration-info {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .event-card-header h4 {
          min-width: 0;
        }

        .event-status {
          flex: 0 0 auto;
        }

        .event-registration-info {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .controls-header {
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .controls-header > div:first-child {
          min-width: 0;
          flex: 1 1 400px;
        }

        .controls-header h3 {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .event-details {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          overflow-wrap: anywhere;
        }

        .controls-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .attendance-summary {
          width: 100%;
          max-width: 100%;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .summary-item {
          min-width: 120px;
          flex: 1 1 120px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: 100vw;
          max-height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-overflow-scrolling: touch;
        }

        .modal-content {
          width: min(700px, 100%);
          max-width: 100%;
          min-width: 0;
          max-height: calc(100vh - 40px);
          overflow-x: hidden;
          overflow-y: auto;
          margin: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .modal-header h3 {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .modal-close {
          flex: 0 0 auto;
        }

        .modal-body {
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        .detail-grid {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 15px;
        }

        .detail-item {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .detail-item span {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .form-row {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 15px;
        }

        .form-group {
          min-width: 0;
          width: 100%;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .form-actions {
          width: 100%;
          max-width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .link-container,
        .notification-info,
        .link-instructions {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .link-input {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .qr-code-container {
          width: 100%;
          max-width: 100%;
          text-align: center;
          overflow: hidden;
        }

        .qr-code-image {
          display: block;
          max-width: min(100%, 280px);
          height: auto;
          margin: 15px auto;
        }

        .link-instructions ul {
          padding-left: 20px;
        }

        /* ============================================
           TABLET
           ============================================ */

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .event-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .controls-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        /* ============================================
           SMALL TABLET / LARGE PHONE
           ============================================ */

        @media (max-width: 768px) {
          .dashboard-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .page-header > div:first-child {
            width: 100%;
            flex-basis: auto;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .header-actions button {
            flex: 1 1 180px;
          }

          .tabs-container {
            display: grid;
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .tab-btn {
            width: 100%;
            white-space: normal;
            min-height: 48px;
          }

          .stats-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 12px;
          }

          .search-filter-bar {
            display: grid;
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .search-box {
            width: 100%;
            min-width: 0;
            grid-column: 1 / -1;
          }

          .filter-box {
            width: 100%;
            min-width: 0;
            flex: none;
          }

          .stats-info {
            width: 100%;
          }

          .event-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .controls-header {
            flex-direction: column;
          }

          .controls-header > div:first-child {
            width: 100%;
            flex-basis: auto;
          }

          .controls-actions {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .controls-actions button {
            width: 100%;
            min-width: 0;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .detail-item.full-width {
            grid-column: auto;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            justify-content: stretch;
          }

          .form-actions button,
          .form-actions select {
            flex: 1 1 150px;
          }

          .attendance-summary {
            display: grid;
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .summary-item {
            min-width: 0;
          }

          .modal-overlay {
            padding: 12px;
            align-items: flex-start;
          }

          .modal-content {
            width: 100%;
            max-width: 100%;
            max-height: calc(100vh - 24px);
          }
        }

        /* ============================================
           MOBILE
           ============================================ */

        @media (max-width: 600px) {
          .dashboard-container {
            padding-left: 10px;
            padding-right: 10px;
          }

          .page-header h2 {
            font-size: 1.25rem;
            line-height: 1.35;
          }

          .page-header p {
            font-size: 0.9rem;
          }

          .header-actions {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
          }

          .header-actions button {
            width: 100%;
            flex: none;
          }

          .tabs-container {
            grid-template-columns: 1fr;
          }

          .tab-btn {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .search-filter-bar {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .search-box,
          .filter-box,
          .stats-info {
            grid-column: auto;
            width: 100%;
          }

          .event-grid {
            grid-template-columns: 1fr;
          }

          .controls-actions {
            grid-template-columns: 1fr;
          }

          .controls-actions button {
            width: 100%;
          }

          .attendance-summary {
            grid-template-columns: 1fr;
          }

          .summary-item {
            width: 100%;
          }

          .modal-overlay {
            padding: 8px;
          }

          .modal-content {
            max-height: calc(100vh - 16px);
            border-radius: 10px;
          }

          .modal-header {
            align-items: flex-start;
          }

          .modal-header h3 {
            font-size: 1.05rem;
          }

          .form-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .form-actions button,
          .form-actions select {
            width: 100%;
            flex: none;
          }

          .data-table {
            min-width: 950px;
          }

          .event-details {
            flex-direction: column;
            gap: 8px;
          }
        }

        /* ============================================
           VERY SMALL PHONES
           ============================================ */

        @media (max-width: 400px) {
          .dashboard-container {
            padding-left: 8px;
            padding-right: 8px;
          }

          .stats-grid {
            gap: 10px;
          }

          .stat-card {
            padding: 12px;
          }

          .stat-info h3 {
            font-size: 1.2rem;
          }

          .stat-info p {
            font-size: 0.8rem;
          }

          .event-card {
            padding: 12px;
          }

          .modal-content {
            border-radius: 8px;
          }

          .data-table {
            min-width: 900px;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageRegistrations;