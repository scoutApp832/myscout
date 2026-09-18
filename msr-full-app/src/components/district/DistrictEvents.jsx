import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const DistrictEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [filterScope, setFilterScope] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [districts, setDistricts] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState({});
  const [registrationLoading, setRegistrationLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [showAttendanceLinkModal, setShowAttendanceLinkModal] = useState(false);
  const [attendanceLinkData, setAttendanceLinkData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'general',
    category: 'general',
    start_date: '',
    end_date: '',
    location: '',
    venue: '',
    capacity: '',
    price: '0',
    registration_deadline: '',
    status: 'upcoming',
    scope: 'district',
    district_id: null
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const userDistrict = user?.member?.district || user?.district || 'your district';

  const scopeOptions = [
    { id: 'district', label: 'District Event' },
    { id: 'national', label: 'National Event' }
  ];

  const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const eventTypes = [
    { id: 'general', label: 'General' },
    { id: 'training', label: 'Training' },
    { id: 'workshop', label: 'Workshop' },
    { id: 'seminar', label: 'Seminar' },
    { id: 'camp', label: 'Camp' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'competition', label: 'Competition' }
  ];

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'community', label: 'Community Service' },
    { id: 'training', label: 'Training' },
    { id: 'recreation', label: 'Recreation' }
  ];

  useEffect(() => {
    fetchEvents();
    fetchDistricts();
  }, []);

  // ============================================
  // FETCH DISTRICTS
  // ============================================
  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/districts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let districtsData = [];
      if (response.data?.districts) {
        districtsData = response.data.districts;
      } else if (Array.isArray(response.data)) {
        districtsData = response.data;
      } else if (response.data?.data?.districts) {
        districtsData = response.data.data.districts;
      }
      
      setDistricts(districtsData);
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError('Failed to load districts');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ============================================
  // FETCH EVENTS - INCLUDES NATIONAL EVENTS
  // ============================================
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/district/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 API Response:', response.data);
      
      let eventsData = [];
      if (response.data?.success && response.data.events) {
        eventsData = response.data.events;
      } else if (Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response.data?.data?.events) {
        eventsData = response.data.data.events;
      }
      
      console.log('📊 Events Data:', eventsData.map(e => ({ 
        id: e.id, 
        title: e.title, 
        scope: e.scope,
        is_national: e.is_national 
      })));
      
      const processedEvents = eventsData.map(event => {
        const isNational = event.is_national || event.scope === 'national';
        const isDistrict = !isNational;
        const isUsersDistrict = event.district_id === user?.member?.district_id || 
                               event.district_id === user?.district_id;
        
        return {
          ...event,
          date: event.start_date ? new Date(event.start_date).toLocaleDateString() : 'N/A',
          registrations: event.registrations || { pending: 0, approved: 0, total: 0 },
          isRegistered: event.isRegistered || false,
          isNational: isNational,
          isDistrict: isDistrict,
          isUsersDistrict: isUsersDistrict,
          permissions: {
            canView: true,
            canCreate: isUsersDistrict && !isNational || false,
            canEdit: isUsersDistrict && !isNational,
            canDelete: isUsersDistrict && !isNational,
            canCancel: isUsersDistrict && !isNational,
            canManageRegistrations: isUsersDistrict && !isNational,
            canApproveReject: isUsersDistrict && !isNational,
            canMarkAttendance: isUsersDistrict && !isNational,
            canRegister: true, // ✅ Anyone can register for national events
            isNational: isNational,
            isDistrict: isDistrict,
            isUsersDistrict: isUsersDistrict,
            reason: isNational ? '🌍 National Event - Available to all members' : 
                    !isUsersDistrict ? 'This event belongs to another district' : null
          }
        };
      });
      
      console.log('📊 Processed Events:', processedEvents.map(e => ({
        id: e.id,
        title: e.title,
        scope: e.scope,
        isNational: e.isNational,
        isUsersDistrict: e.isUsersDistrict
      })));
      
      setEvents(processedEvents);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FETCH REGISTRATIONS
  // ============================================
  const fetchRegistrations = async (eventId) => {
    try {
      setActionLoading(prev => ({ ...prev, registrations: true }));
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/district/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let registrationsData = [];
      if (response.data?.registrations) {
        registrationsData = response.data.registrations;
      } else if (Array.isArray(response.data)) {
        registrationsData = response.data;
      } else if (response.data?.data?.registrations) {
        registrationsData = response.data.data.registrations;
      }
      
      setRegistrations(registrationsData);
      return registrationsData;
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError(err.response?.data?.message || 'Failed to fetch registrations');
      setTimeout(() => setError(''), 5000);
      setRegistrations([]);
      return [];
    } finally {
      setActionLoading(prev => ({ ...prev, registrations: false }));
    }
  };

  // ============================================
  // FETCH EVENT DETAILS
  // ============================================
  const fetchEventDetails = async (eventId) => {
    try {
      setActionLoading(prev => ({ ...prev, details: true }));
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/district/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let eventDetailData = null;
      if (response.data?.event) {
        eventDetailData = response.data.event;
      } else if (response.data?.data?.event) {
        eventDetailData = response.data.data.event;
      } else {
        eventDetailData = response.data;
      }
      
      setEventDetails(eventDetailData);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(err.response?.data?.message || 'Failed to load event details');
      setTimeout(() => setError(''), 5000);
    } finally {
      setActionLoading(prev => ({ ...prev, details: false }));
    }
  };

  // ============================================
  // FETCH ATTENDANCE SUMMARY
  // ============================================
  const fetchAttendanceSummary = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/district/events/${eventId}/attendance/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let summaryData = null;
      if (response.data?.summary) {
        summaryData = response.data.summary;
      } else if (response.data?.data?.summary) {
        summaryData = response.data.data.summary;
      } else {
        summaryData = response.data;
      }
      
      setAttendanceSummary(summaryData);
    } catch (err) {
      console.error('Error fetching attendance summary:', err);
      setAttendanceSummary(null);
    }
  };

  // ============================================
  // EXPORT ATTENDANCE
  // ============================================
  const handleExportAttendance = async (eventId, format = 'csv') => {
    try {
      setActionLoading(prev => ({ ...prev, export: true }));
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/district/events/${eventId}/attendance/export`, {
        params: { format },
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_${eventId}_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSuccess('✅ Attendance exported as CSV!');
      } else {
        const json = JSON.stringify(response.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_${eventId}_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSuccess('✅ Attendance exported as JSON!');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Export attendance error:', err);
      setError(err.response?.data?.message || 'Failed to export attendance');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, export: false }));
    }
  };

  // ============================================
  // CREATE EVENT
  // ============================================
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, create: true }));
      const token = localStorage.getItem('token');
      
      if (!formData.title) {
        setError('Title is required');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      if (!formData.start_date) {
        setError('Start date is required');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      if (!formData.end_date) {
        setError('End date is required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        setError('End date must be after start date');
        setTimeout(() => setError(''), 3000);
        return;
      }

      let districtId = formData.district_id;
      if (formData.scope === 'district' && !districtId) {
        const userDistrictName = user?.member?.district;
        if (userDistrictName) {
          const district = districts.find(d => d.name === userDistrictName);
          if (district) {
            districtId = district.id;
          }
        }
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        category: formData.category,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location,
        venue: formData.venue,
        capacity: formData.capacity && formData.capacity !== '' 
          ? parseInt(formData.capacity) 
          : null,
        price: formData.price && formData.price !== '' 
          ? parseFloat(formData.price) 
          : 0,
        registration_deadline: formData.registration_deadline || null,
        status: formData.status,
        scope: formData.scope,
        district_id: districtId,
        is_national: formData.scope === 'national'
      };

      console.log('📤 Creating event with data:', submitData);

      await axios.post(`${API_URL}/district/events`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('✅ Event created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Create event error:', err);
      setError(err.response?.data?.message || 'Failed to create event');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, create: false }));
    }
  };

  // ============================================
  // UPDATE EVENT
  // ============================================
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, update: true }));
      const token = localStorage.getItem('token');
      
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        setError('End date must be after start date');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        category: formData.category,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location,
        venue: formData.venue,
        capacity: formData.capacity && formData.capacity !== '' 
          ? parseInt(formData.capacity) 
          : null,
        price: formData.price && formData.price !== '' 
          ? parseFloat(formData.price) 
          : 0,
        registration_deadline: formData.registration_deadline || null,
        status: formData.status,
        scope: formData.scope,
        district_id: formData.district_id,
        is_national: formData.scope === 'national'
      };

      console.log('📤 Updating event with data:', submitData);

      await axios.put(`${API_URL}/district/events/${editingEvent.id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('✅ Event updated successfully!');
      setShowCreateModal(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update event error:', err);
      setError(err.response?.data?.message || 'Failed to update event');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, update: false }));
    }
  };

  // ============================================
  // DELETE EVENT
  // ============================================
  const handleDeleteEvent = async (id) => {
    const event = events.find(e => e.id === id);
    
    if (!event?.permissions?.canDelete) {
      if (event?.permissions?.isNational) {
        setError(`🌍 You cannot delete national events. Only National Commissioner can manage national events.`);
      } else {
        setError(`⚠️ You can only delete events in your own district.`);
      }
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, delete: true }));
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/district/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Event deleted successfully!');
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete event error:', err);
      setError(err.response?.data?.message || 'Failed to delete event');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // ============================================
  // CANCEL EVENT
  // ============================================
  const handleCancelEvent = async (id) => {
    const event = events.find(e => e.id === id);
    
    if (!event?.permissions?.canCancel) {
      if (event?.permissions?.isNational) {
        setError(`🌍 You cannot cancel national events. Only National Commissioner can manage national events.`);
      } else {
        setError(`⚠️ You can only cancel events in your own district.`);
      }
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, cancel: true }));
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/events/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Event cancelled successfully!');
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Cancel event error:', err);
      setError(err.response?.data?.message || 'Failed to cancel event');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, cancel: false }));
    }
  };

  // ============================================
  // EDIT EVENT
  // ============================================
  const handleEditEvent = (event) => {
    if (!event?.permissions?.canEdit) {
      if (event?.permissions?.isNational) {
        setError(`🌍 You cannot edit national events. Only National Commissioner can manage national events.`);
      } else {
        setError(`⚠️ You can only edit events in your own district.`);
      }
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'general',
      category: event.category || 'general',
      start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      venue: event.venue || '',
      capacity: event.capacity || '',
      price: event.price || '0',
      registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
      status: event.status || 'upcoming',
      scope: event.scope || 'district',
      district_id: event.district_id || null
    });
    setShowCreateModal(true);
  };

  // ============================================
  // VIEW REGISTRATIONS
  // ============================================
  const handleViewRegistrations = async (event) => {
    if (!event?.permissions?.canManageRegistrations) {
      if (event?.permissions?.isNational) {
        setError(`🌍 You cannot view registrations for national events. Only National Commissioner can manage national events.`);
      } else {
        setError(`⚠️ You can only view registrations for events in your own district.`);
      }
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
    await fetchRegistrations(event.id);
  };

  // ============================================
  // APPROVE/REJECT
  // ============================================
  const handleApproveReject = async (event) => {
    if (!event?.permissions?.canApproveReject) {
      if (event?.permissions?.isNational) {
        setError(`🌍 You cannot manage registrations for national events. Only National Commissioner can manage national events.`);
      } else {
        setError(`⚠️ You can only manage registrations for events in your own district.`);
      }
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
    await fetchRegistrations(event.id);
  };

  // ============================================
  // ATTENDANCE
  // ============================================
  const handleAttendance = async (event) => {
    if (!event?.permissions?.canMarkAttendance) {
      if (event?.permissions?.isNational) {
        setError(`🌍 You cannot mark attendance for national events. Only National Commissioner can manage national events.`);
      } else {
        setError(`⚠️ You can only mark attendance for events in your own district.`);
      }
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setSelectedEvent(event);
    setShowRegistrationsModal(true);
    await fetchRegistrations(event.id);
  };

  // ============================================
  // ATTENDANCE LINK HANDLERS
  // ============================================

  const handleAttendanceLink = async (event) => {
    if (!event?.permissions?.canManageRegistrations) {
      if (event?.permissions?.isNational) {
        setError(`🌍 You cannot manage attendance links for national events. Only National Commissioner can manage national events.`);
      } else {
        setError(`⚠️ You can only manage attendance links for events in your own district.`);
      }
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setSelectedEvent(event);
    setShowAttendanceLinkModal(true);
    await fetchAttendanceSummary(event.id);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/district/events/${event.id}/attendance-link/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.data?.attendance_link_generated) {
        setAttendanceLinkData({
          attendance_link: response.data.data.attendance_link,
          expires_at: response.data.data.attendance_link_expires,
          is_expired: response.data.data.is_expired,
          is_active: response.data.data.is_active
        });
      } else {
        setAttendanceLinkData(null);
      }
    } catch (err) {
      console.error('Error checking attendance link:', err);
      setAttendanceLinkData(null);
    }
  };

  const handleGenerateAttendanceLink = async (eventId) => {
    try {
      setActionLoading(prev => ({ ...prev, generateLink: true }));
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/district/events/${eventId}/attendance-link/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAttendanceLinkData(response.data.data);
      setSuccess('✅ Attendance link generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchEvents();
      await fetchAttendanceSummary(eventId);
    } catch (err) {
      console.error('Generate attendance link error:', err);
      setError(err.response?.data?.message || 'Failed to generate attendance link');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, generateLink: false }));
    }
  };

  const handleRegenerateAttendanceLink = async (eventId) => {
    if (!window.confirm('Regenerating will invalidate the previous link. Are you sure?')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, regenerateLink: true }));
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/district/events/${eventId}/attendance-link/regenerate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAttendanceLinkData(response.data.data);
      setSuccess('✅ Attendance link regenerated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchEvents();
      await fetchAttendanceSummary(eventId);
    } catch (err) {
      console.error('Regenerate attendance link error:', err);
      setError(err.response?.data?.message || 'Failed to regenerate attendance link');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, regenerateLink: false }));
    }
  };

  const handleDeleteAttendanceLink = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this attendance link?')) return;
    
    try {
      setActionLoading(prev => ({ ...prev, deleteLink: true }));
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/district/events/${eventId}/attendance-link`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAttendanceLinkData(null);
      setSuccess('✅ Attendance link deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchEvents();
      await fetchAttendanceSummary(eventId);
    } catch (err) {
      console.error('Delete attendance link error:', err);
      setError(err.response?.data?.message || 'Failed to delete attendance link');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, deleteLink: false }));
    }
  };

  // ============================================
  // REGISTER FOR EVENT
  // ============================================
  const handleRegisterForEvent = async (eventId) => {
    setRegistrationLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/district/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Successfully registered for event!');
      fetchEvents();
      setShowRegistrationModal(false);
      setSelectedEvent(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register for event');
      setTimeout(() => setError(''), 3000);
    } finally {
      setRegistrationLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  // ============================================
  // CANCEL REGISTRATION
  // ============================================
  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    try {
      setActionLoading(prev => ({ ...prev, cancelReg: true }));
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/district/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Registration cancelled!');
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, cancelReg: false }));
    }
  };

  // ============================================
  // APPROVE REGISTRATION
  // ============================================
  const handleApproveRegistration = async (eventId, registrationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [registrationId]: true }));
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/events/${eventId}/registrations/${registrationId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Registration approved!');
      await fetchRegistrations(eventId);
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve registration');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  // ============================================
  // REJECT REGISTRATION
  // ============================================
  const handleRejectRegistration = async (eventId, registrationId) => {
    if (!window.confirm('Reject this registration?')) return;
    try {
      setActionLoading(prev => ({ ...prev, [registrationId]: true }));
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/events/${eventId}/registrations/${registrationId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('✅ Registration rejected!');
      await fetchRegistrations(eventId);
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject registration');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  // ============================================
  // MARK ATTENDANCE
  // ============================================
  const handleMarkAttendance = async (eventId, registrationId, status) => {
    setAttendanceLoading(prev => ({ ...prev, [registrationId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/district/events/${eventId}/registrations/${registrationId}/attendance`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(`✅ Attendance marked as ${status}!`);
      await fetchRegistrations(eventId);
      fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
      setTimeout(() => setError(''), 3000);
    } finally {
      setAttendanceLoading(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'general',
      category: 'general',
      start_date: '',
      end_date: '',
      location: '',
      venue: '',
      capacity: '',
      price: '0',
      registration_deadline: '',
      status: 'upcoming',
      scope: 'district',
      district_id: null
    });
    setEditingEvent(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'upcoming': 'badge-progress',
      'ongoing': 'badge-registered',
      'completed': 'badge-completed',
      'cancelled': 'badge-rejected'
    };
    return badges[status] || 'badge-default';
  };

  const getScopeBadge = (scope) => {
    return scope === 'national' ? 'badge-national' : 'badge-district';
  };

  const getScopeLabel = (scope) => {
    return scope === 'national' ? '🌍 National' : '📌 District';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'upcoming': 'Upcoming',
      'ongoing': 'Ongoing',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const filteredEvents = events.filter(event => {
    const matchScope = filterScope === 'all' || 
      (filterScope === 'national' && event.scope === 'national') ||
      (filterScope === 'district' && event.scope === 'district');
    const matchStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchScope && matchStatus;
  });

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <span>Loading events...</span>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-left">
          <h2>📅 Events Management</h2>
          <p>Create, manage, and track events in your district</p>
        </div>
        <button className="btn-primary" onClick={() => {
          resetForm();
          setShowCreateModal(true);
        }}>
          ➕ Create Event
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Scope:</label>
          <select value={filterScope} onChange={e => setFilterScope(e.target.value)}>
            <option value="all">All Events</option>
            <option value="national">🌍 National</option>
            <option value="district">📌 District</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {statusOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="stats-info">
          <span>Showing: <strong>{filteredEvents.length}</strong> events</span>
        </div>
      </div>

      {/* PERMISSION LEGEND */}
      <div className="permission-legend">
        <span className="legend-item">
          <span className="legend-dot district-dot"></span>
          <strong>Your District Events:</strong> Full Management
        </span>
        <span className="legend-item">
          <span className="legend-dot national-dot"></span>
          <strong>National Events:</strong> View & Register Only
        </span>
        <span className="legend-item">
          <span className="legend-dot other-dot"></span>
          <strong>Other District Events:</strong> View Only
        </span>
      </div>

      {/* EVENTS GRID */}
      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-calendar-plus"></i>
            <h3>No Events</h3>
            <p>Create your first event or check back later</p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const permissions = event.permissions || {};
            const isNational = event.isNational || event.scope === 'national';
            const isDistrict = event.isDistrict || !isNational;
            const isUsersDistrict = event.isUsersDistrict || false;
            
            return (
              <div key={event.id} className={`event-card ${isNational ? 'national-event' : isUsersDistrict ? 'district-event' : 'other-district-event'}`}>
                {/* Event Header */}
                <div className="event-header">
                  <div className="event-title">
                    <h4>{event.title}</h4>
                    <span className={`scope-badge ${getScopeBadge(event.scope)}`}>
                      {getScopeLabel(event.scope)}
                    </span>
                    {!isUsersDistrict && !isNational && (
                      <span className="other-district-badge">Other District</span>
                    )}
                  </div>
                  <span className={`status-badge ${getStatusBadge(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
                
                {/* Event Details */}
                <div className="event-details">
                  <p>📅 {event.date || 'N/A'}</p>
                  <p>📍 {event.location || event.venue || 'TBD'}</p>
                  <p>👥 Capacity: {event.capacity || 'Unlimited'}</p>
                  <p>💰 {event.price > 0 ? `${event.price} RWF` : 'Free'}</p>
                  
                  <div className="registrations-info">
                    <strong>Registrations:</strong>
                    <span className="reg-pending">⏳ {event.registrations?.pending || 0} pending</span>
                    <span className="reg-approved">✅ {event.registrations?.approved || 0} approved</span>
                  </div>
                  
                  {event.isRegistered && (
                    <p className="registration-status registered">
                      ✅ You are registered for this event
                    </p>
                  )}
                </div>
                
                {/* ============================================
                    ACTION BUTTONS - DISTRICT EVENTS (Full Management)
                    ============================================ */}
                {isDistrict && isUsersDistrict && (
                  <div className="event-actions district-actions">
                    {permissions.canEdit && (
                      <button className="btn-sm btn-edit" onClick={() => handleEditEvent(event)}>
                        ✏️ Edit
                      </button>
                    )}
                    
                    {permissions.canDelete && (
                      <button className="btn-sm btn-delete" onClick={() => handleDeleteEvent(event.id)}>
                        🗑️ Delete
                      </button>
                    )}
                    
                    {permissions.canCancel && (
                      <button className="btn-sm btn-cancel" onClick={() => handleCancelEvent(event.id)}>
                        ❌ Cancel
                      </button>
                    )}
                    
                    {permissions.canManageRegistrations && (
                      <>
                        <button className="btn-sm btn-manage" onClick={() => handleViewRegistrations(event)}>
                          👥 Registrations
                          {event.registrations?.pending > 0 && (
                            <span className="badge-pending-count">{event.registrations.pending}</span>
                          )}
                        </button>
                        
                        <button className="btn-sm btn-approve" onClick={() => handleApproveReject(event)}>
                          ✅ Approve/Reject
                          {event.registrations?.pending > 0 && (
                            <span className="badge-pending-count">{event.registrations.pending}</span>
                          )}
                        </button>
                        
                        {permissions.canMarkAttendance && (
                          <button className="btn-sm btn-attendance" onClick={() => handleAttendance(event)}>
                            📋 Attendance
                          </button>
                        )}
                      </>
                    )}

                    {permissions.canManageRegistrations && (
                      <button 
                        className="btn-sm btn-attendance-link" 
                        onClick={() => handleAttendanceLink(event)}
                        disabled={actionLoading.attendanceLink}
                      >
                        {actionLoading.attendanceLink ? '⏳' : '🔗'} Attendance Link
                      </button>
                    )}
                    
                    <button className="btn-sm btn-view" onClick={() => fetchEventDetails(event.id)}>
                      👁️ View
                    </button>
                  </div>
                )}
                
                {/* ============================================
                    NATIONAL EVENTS - View + Register
                    ============================================ */}
                {isNational && (
                  <div className="event-actions national-actions">
                    {event.isRegistered ? (
                      <>
                        <button className="btn-sm btn-registered" disabled>✅ Registered</button>
                        <button 
                          className="btn-sm btn-cancel-registration"
                          onClick={() => handleCancelRegistration(event.id)}
                          disabled={actionLoading.cancelReg}
                        >
                          {actionLoading.cancelReg ? '⏳' : '❌'} Cancel Registration
                        </button>
                      </>
                    ) : (
                      permissions.canRegister && (
                        <button 
                          className="btn-sm btn-register" 
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowRegistrationModal(true);
                          }}
                          disabled={registrationLoading[event.id]}
                        >
                          {registrationLoading[event.id] ? '⏳' : '📝'} Register
                        </button>
                      )
                    )}
                    <button 
                      className="btn-sm btn-view" 
                      onClick={() => fetchEventDetails(event.id)}
                      disabled={actionLoading.details}
                    >
                      {actionLoading.details ? '⏳' : '👁️'} View Details
                    </button>
                  </div>
                )}
                
                {/* ============================================
                    OTHER DISTRICT EVENTS - View Only
                    ============================================ */}
                {isDistrict && !isUsersDistrict && (
                  <div className="event-actions other-district-actions">
                    <div className="info-message">
                      ℹ️ This event belongs to another district
                    </div>
                    <button 
                      className="btn-sm btn-view" 
                      onClick={() => fetchEventDetails(event.id)}
                      disabled={actionLoading.details}
                    >
                      {actionLoading.details ? '⏳' : '👁️'} View Details
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ============================================
          MODALS - (Keep all your existing modals)
          ============================================ */}

      {/* REGISTRATION MODAL */}
      {showRegistrationModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => {
          setShowRegistrationModal(false);
          setSelectedEvent(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Register for Event</h3>
              <button className="modal-close" onClick={() => {
                setShowRegistrationModal(false);
                setSelectedEvent(null);
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-detail"><strong>Event:</strong> {selectedEvent.title}</div>
              <div className="profile-detail"><strong>Type:</strong> {selectedEvent.scope === 'national' ? '🌍 National' : '📌 District'}</div>
              <div className="profile-detail"><strong>Date:</strong> {selectedEvent.date || 'N/A'}</div>
              <div className="profile-detail"><strong>Location:</strong> {selectedEvent.location || selectedEvent.venue || 'TBD'}</div>
              <div className="profile-detail"><strong>Price:</strong> {selectedEvent.price > 0 ? `${selectedEvent.price} RWF` : 'Free'}</div>
              <div className="alert alert-info">
                ℹ️ You are about to register for this {selectedEvent.scope} event. Please confirm.
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => {
                setShowRegistrationModal(false);
                setSelectedEvent(null);
              }}>Cancel</button>
              <button className="btn-primary" onClick={() => handleRegisterForEvent(selectedEvent.id)}>
                ✅ Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATIONS MANAGEMENT MODAL */}
      {showRegistrationsModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => {
          setShowRegistrationsModal(false);
          setSelectedEvent(null);
          setRegistrations([]);
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👥 Manage Registrations - {selectedEvent.title}</h3>
              <button className="modal-close" onClick={() => {
                setShowRegistrationsModal(false);
                setSelectedEvent(null);
                setRegistrations([]);
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="registration-actions-bar">
                <span className="registrations-count">
                  Total: {registrations.length} | 
                  ⏳ Pending: {registrations.filter(r => r.status === 'pending').length} |
                  ✅ Approved: {registrations.filter(r => r.status === 'approved').length}
                </span>
                <span className="event-status-info">
                  Event Status: <strong>{getStatusLabel(selectedEvent.status)}</strong>
                  {selectedEvent.status === 'ongoing' && ' 🔴 (Attendance can be marked)'}
                </span>
              </div>
              
              {registrations.length === 0 ? (
                <p className="empty-message">No registrations yet</p>
              ) : (
                <table className="registrations-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id}>
                        <td>
                          {reg.member?.full_name || 
                           reg.member?.first_name + ' ' + reg.member?.last_name || 
                           reg.name || 'Unknown'}
                        </td>
                        <td>{reg.email || reg.member?.user?.email || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${reg.status === 'approved' ? 'badge-approved' : reg.status === 'pending' ? 'badge-pending' : 'badge-rejected'}`}>
                            {reg.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <span className={`attendance-badge ${reg.attendance_status === 'present' ? 'badge-approved' : ''}`}>
                            {reg.attendance_status || 'Not marked'}
                          </span>
                        </td>
                        <td>
                          {reg.status === 'pending' && (
                            <>
                              <button 
                                className="btn-sm btn-approve" 
                                onClick={() => handleApproveRegistration(selectedEvent.id, reg.id)}
                                disabled={actionLoading[reg.id]}
                              >
                                {actionLoading[reg.id] ? '⏳' : '✅'} Approve
                              </button>
                              <button 
                                className="btn-sm btn-reject" 
                                onClick={() => handleRejectRegistration(selectedEvent.id, reg.id)}
                                disabled={actionLoading[reg.id]}
                              >
                                {actionLoading[reg.id] ? '⏳' : '❌'} Reject
                              </button>
                            </>
                          )}
                          
                          {reg.status === 'approved' && reg.attendance_status !== 'present' && selectedEvent.status === 'ongoing' && (
                            <>
                              <button 
                                className="btn-sm btn-attendance" 
                                onClick={() => handleMarkAttendance(selectedEvent.id, reg.id, 'present')}
                                disabled={attendanceLoading[reg.id]}
                              >
                                {attendanceLoading[reg.id] ? '⏳' : '✅'} Present
                              </button>
                              <button 
                                className="btn-sm btn-absent" 
                                onClick={() => handleMarkAttendance(selectedEvent.id, reg.id, 'absent')}
                                disabled={attendanceLoading[reg.id]}
                              >
                                {attendanceLoading[reg.id] ? '⏳' : '❌'} Absent
                              </button>
                            </>
                          )}
                          
                          {reg.attendance_status === 'present' && (
                            <span className="attendance-marked">✅ Present</span>
                          )}
                          {reg.status === 'approved' && reg.attendance_status === 'absent' && (
                            <span className="attendance-marked absent">❌ Absent</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {showDetailsModal && eventDetails && (
        <div className="modal-overlay" onClick={() => {
          setShowDetailsModal(false);
          setEventDetails(null);
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Event Details</h3>
              <button className="modal-close" onClick={() => {
                setShowDetailsModal(false);
                setEventDetails(null);
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-detail"><strong>Title:</strong> {eventDetails.title}</div>
              <div className="profile-detail"><strong>Description:</strong> {eventDetails.description || 'No description'}</div>
              <div className="profile-detail"><strong>Scope:</strong> {eventDetails.scope === 'national' ? '🌍 National' : '📌 District'}</div>
              <div className="profile-detail"><strong>Status:</strong> {getStatusLabel(eventDetails.status)}</div>
              <div className="profile-detail"><strong>Start:</strong> {new Date(eventDetails.start_date).toLocaleString()}</div>
              <div className="profile-detail"><strong>End:</strong> {new Date(eventDetails.end_date).toLocaleString()}</div>
              <div className="profile-detail"><strong>Location:</strong> {eventDetails.location || eventDetails.venue || 'TBD'}</div>
              <div className="profile-detail"><strong>Capacity:</strong> {eventDetails.capacity || 'Unlimited'}</div>
              <div className="profile-detail"><strong>Price:</strong> {eventDetails.price > 0 ? `${eventDetails.price} RWF` : 'Free'}</div>
              <div className="profile-detail"><strong>Created By:</strong> {eventDetails.creator?.full_name || 'Unknown'}</div>
              <div className="profile-detail"><strong>District:</strong> {eventDetails.district?.name || 'N/A'}</div>
              <div className="profile-detail"><strong>Registrations:</strong> {eventDetails.registrations?.length || 0}</div>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => {
                setShowDetailsModal(false);
                setEventDetails(null);
              }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setEditingEvent(null);
          resetForm();
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEvent ? '✏️ Edit Event' : '📅 Create New Event'}</h3>
              <button className="modal-close" onClick={() => {
                setShowCreateModal(false);
                setEditingEvent(null);
                resetForm();
              }}>×</button>
            </div>
            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
              <div className="modal-body">
                {/* Event Title */}
                <div className="form-group">
                  <label>Event Title <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                {/* Description */}
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the event"
                    rows="3"
                  />
                </div>
                
                {/* Event Scope */}
                <div className="form-group">
                  <label>Event Scope <span className="required">*</span></label>
                  <select
                    value={formData.scope}
                    onChange={e => setFormData({...formData, scope: e.target.value})}
                    required
                  >
                    {scopeOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  <small>
                    {formData.scope === 'national' 
                      ? '🌍 This event will be visible to all members across Rwanda' 
                      : `📌 This event will be visible to members in your district (${userDistrict}) only`}
                  </small>
                  {formData.scope === 'national' && (
                    <div className="warning-info">
                      ⚠️ Only National Commissioners can create national events
                    </div>
                  )}
                </div>
                
                {/* Start and End Dates */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date <span className="required">*</span></label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={e => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date <span className="required">*</span></label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={e => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                {/* Event Type and Category */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Type</label>
                    <select
                      value={formData.event_type}
                      onChange={e => setFormData({...formData, event_type: e.target.value})}
                    >
                      {eventTypes.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Location and Venue */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="Event location"
                    />
                  </div>
                  <div className="form-group">
                    <label>Venue</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={e => setFormData({...formData, venue: e.target.value})}
                      placeholder="Event venue"
                    />
                  </div>
                </div>
                
                {/* Capacity and Price */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setFormData({...formData, capacity: value});
                      }}
                      placeholder="Unlimited"
                      min="0"
                    />
                    <small>Leave empty for unlimited capacity</small>
                  </div>
                  <div className="form-group">
                    <label>Price (RWF)</label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setFormData({...formData, price: value});
                      }}
                      placeholder="0 for free"
                      min="0"
                      step="100"
                    />
                    <small>Enter 0 or leave empty for free events</small>
                  </div>
                </div>
                
                {/* Registration Deadline and Status */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={formData.registration_deadline || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setFormData({...formData, registration_deadline: value});
                      }}
                    />
                    <small>Leave empty for no deadline</small>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading.create || actionLoading.update}>
                  {actionLoading.create || actionLoading.update ? '⏳ Processing...' : (editingEvent ? '💾 Update Event' : '📅 Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTENDANCE LINK MODAL */}
      {showAttendanceLinkModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => {
          setShowAttendanceLinkModal(false);
          setSelectedEvent(null);
          setAttendanceLinkData(null);
          setAttendanceSummary(null);
        }}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔗 Attendance Link - {selectedEvent.title}</h3>
              <button className="modal-close" onClick={() => {
                setShowAttendanceLinkModal(false);
                setSelectedEvent(null);
                setAttendanceLinkData(null);
                setAttendanceSummary(null);
              }}>×</button>
            </div>
            <div className="modal-body">
              {/* Attendance Summary */}
              {attendanceSummary && (
                <div className="attendance-summary">
                  <h4>📊 Attendance Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Total Registered</span>
                      <span className="summary-value">{attendanceSummary.total_registered}</span>
                    </div>
                    <div className="summary-item present">
                      <span className="summary-label">✅ Present</span>
                      <span className="summary-value">{attendanceSummary.present}</span>
                    </div>
                    <div className="summary-item absent">
                      <span className="summary-label">❌ Absent</span>
                      <span className="summary-value">{attendanceSummary.absent}</span>
                    </div>
                    <div className="summary-item pending">
                      <span className="summary-label">⏳ Not Marked</span>
                      <span className="summary-value">{attendanceSummary.not_marked}</span>
                    </div>
                    <div className="summary-item percentage">
                      <span className="summary-label">📈 Attendance Rate</span>
                      <span className="summary-value">{attendanceSummary.attendance_percentage}%</span>
                    </div>
                  </div>
                </div>
              )}

              {attendanceLinkData ? (
                <>
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>
                    Attendance link generated successfully! 
                    <strong>Expires in 30 minutes.</strong>
                  </div>
                  
                  <div className="link-display">
                    <div className="link-url">
                      <strong>Attendance Link:</strong>
                      <div className="link-box">
                        <input 
                          type="text" 
                          value={attendanceLinkData.attendance_link} 
                          readOnly 
                          onClick={e => e.target.select()}
                        />
                        <button 
                          className="btn-sm btn-copy" 
                          onClick={() => {
                            navigator.clipboard.writeText(attendanceLinkData.attendance_link);
                            setSuccess('✅ Link copied to clipboard!');
                            setTimeout(() => setSuccess(''), 3000);
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                    
                    <div className="link-info">
                      <p><strong>Expires:</strong> {new Date(attendanceLinkData.expires_at).toLocaleString()}</p>
                      <p><strong>Status:</strong> <span className="badge-approved">Active (30 min)</span></p>
                    </div>
                    
                    <div className="link-actions">
                      <button className="btn-sm btn-share" onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `Attendance - ${selectedEvent.title}`,
                            text: `Please mark your attendance for ${selectedEvent.title}. Link expires in 30 minutes.`,
                            url: attendanceLinkData.attendance_link
                          });
                        } else {
                          navigator.clipboard.writeText(attendanceLinkData.attendance_link);
                          setSuccess('✅ Link copied to clipboard! Share it with participants.');
                          setTimeout(() => setSuccess(''), 3000);
                        }
                      }}>
                        📤 Share Link
                      </button>
                      
                      <button className="btn-sm btn-regenerate" onClick={() => handleRegenerateAttendanceLink(selectedEvent.id)}>
                        🔄 Regenerate
                      </button>
                      
                      <button className="btn-sm btn-delete-link" onClick={() => handleDeleteAttendanceLink(selectedEvent.id)}>
                        🗑️ Delete Link
                      </button>
                      
                      <button className="btn-sm btn-export-csv" onClick={() => handleExportAttendance(selectedEvent.id, 'csv')}>
                        📊 Export CSV
                      </button>
                      
                      <button className="btn-sm btn-export-json" onClick={() => handleExportAttendance(selectedEvent.id, 'json')}>
                        📄 Export JSON
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle"></i>
                    Generate a unique attendance link for this event. 
                    <strong>Link expires in 30 minutes.</strong>
                    Registered users will receive a notification with the link.
                  </div>
                  
                  <div className="link-preview">
                    <p><strong>Event:</strong> {selectedEvent.title}</p>
                    <p><strong>Date:</strong> {selectedEvent.date || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${getStatusBadge(selectedEvent.status)}`}>{selectedEvent.status}</span></p>
                    <p><strong>Registered Users:</strong> {selectedEvent.registrations?.approved || 0} approved</p>
                    <p className="link-note">
                      <i className="fas fa-info-circle"></i>
                      The link will be valid for <strong>30 minutes</strong> from generation.
                      All registered users will receive a notification.
                    </p>
                  </div>
                  
                  <button 
                    className="btn-primary" 
                    onClick={() => handleGenerateAttendanceLink(selectedEvent.id)}
                    disabled={actionLoading.generateLink}
                    style={{ width: '100%' }}
                  >
                    {actionLoading.generateLink ? '⏳ Generating...' : '🔗 Generate Attendance Link (30 min)'}
                  </button>
                </>
              )}
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => {
                setShowAttendanceLinkModal(false);
                setSelectedEvent(null);
                setAttendanceLinkData(null);
                setAttendanceSummary(null);
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS STYLES */}
      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left h2 {
          margin: 0;
          color: #1a202c;
          font-size: 24px;
        }

        .header-left p {
          margin: 4px 0 0;
          color: #718096;
          font-size: 14px;
        }

        .btn-primary {
          background: #4299e1;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
        }

        .btn-primary:hover {
          background: #3182ce;
        }

        .btn-primary:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #2d3748;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          white-space: nowrap;
        }

        .btn-sm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-edit {
          background: #ebf8ff;
          color: #2b6cb0;
        }
        .btn-edit:hover:not(:disabled) {
          background: #bee3f8;
        }

        .btn-delete {
          background: #fff5f5;
          color: #c53030;
        }
        .btn-delete:hover:not(:disabled) {
          background: #fed7d7;
        }

        .btn-cancel {
          background: #fefcbf;
          color: #975a16;
        }
        .btn-cancel:hover:not(:disabled) {
          background: #f6e05e;
        }

        .btn-manage {
          background: #e9d8fd;
          color: #6b46c1;
        }
        .btn-manage:hover:not(:disabled) {
          background: #d6bcfa;
        }

        .btn-approve {
          background: #c6f6d5;
          color: #276749;
        }
        .btn-approve:hover:not(:disabled) {
          background: #9ae6b4;
        }

        .btn-reject {
          background: #fed7d7;
          color: #9b2c2c;
        }
        .btn-reject:hover:not(:disabled) {
          background: #feb2b2;
        }

        .btn-attendance {
          background: #fef3c7;
          color: #92400e;
        }
        .btn-attendance:hover:not(:disabled) {
          background: #fde68a;
        }

        .btn-attendance-link {
          background: #d4edda;
          color: #155724;
        }
        .btn-attendance-link:hover:not(:disabled) {
          background: #b7dfc9;
        }

        .btn-view {
          background: #e2e8f0;
          color: #2d3748;
        }
        .btn-view:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .btn-register {
          background: #48bb78;
          color: white;
        }
        .btn-register:hover:not(:disabled) {
          background: #38a169;
        }

        .btn-registered {
          background: #9ae6b4;
          color: #276749;
          cursor: default;
        }

        .btn-cancel-registration {
          background: #fc8181;
          color: white;
        }
        .btn-cancel-registration:hover:not(:disabled) {
          background: #f56565;
        }

        .btn-absent {
          background: #fc8181;
          color: white;
        }
        .btn-absent:hover:not(:disabled) {
          background: #f56565;
        }

        .btn-copy {
          background: #9ae6b4;
          color: #276749;
        }
        .btn-copy:hover:not(:disabled) {
          background: #68d391;
        }

        .btn-share {
          background: #63b3ed;
          color: white;
        }
        .btn-share:hover:not(:disabled) {
          background: #4299e1;
        }

        .btn-regenerate {
          background: #edf2f7;
          color: #2d3748;
        }
        .btn-regenerate:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .btn-delete-link {
          background: #fed7d7;
          color: #9b2c2c;
        }
        .btn-delete-link:hover:not(:disabled) {
          background: #feb2b2;
        }

        .btn-export-csv {
          background: #48bb78;
          color: white;
        }
        .btn-export-csv:hover:not(:disabled) {
          background: #38a169;
        }

        .btn-export-json {
          background: #4299e1;
          color: white;
        }
        .btn-export-json:hover:not(:disabled) {
          background: #3182ce;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .alert-error {
          background: #fff5f5;
          border: 1px solid #feb2b2;
          color: #9b2c2c;
        }

        .alert-success {
          background: #f0fff4;
          border: 1px solid #9ae6b4;
          color: #276749;
        }

        .alert-info {
          background: #ebf8ff;
          border: 1px solid #bee3f8;
          color: #2b6cb0;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
          padding: 0 4px;
        }

        .filter-bar {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 500;
          color: #4a5568;
          font-size: 14px;
        }

        .filter-group select {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 14px;
        }

        .stats-info {
          margin-left: auto;
          color: #4a5568;
          font-size: 14px;
        }

        .permission-legend {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: #f7fafc;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }

        .district-dot {
          background: #48bb78;
        }
        .national-dot {
          background: #4299e1;
        }
        .other-dot {
          background: #a0aec0;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .event-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 16px;
          transition: box-shadow 0.2s;
          border-left: 4px solid #e2e8f0;
        }

        .event-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .event-card.district-event {
          border-left-color: #48bb78;
        }

        .event-card.national-event {
          border-left-color: #4299e1;
        }

        .event-card.other-district-event {
          border-left-color: #a0aec0;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .event-title {
          flex: 1;
        }

        .event-title h4 {
          margin: 0 0 6px 0;
          font-size: 16px;
          color: #1a202c;
        }

        .scope-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .badge-district {
          background: #c6f6d5;
          color: #276749;
        }

        .badge-national {
          background: #bee3f8;
          color: #2b6cb0;
        }

        .other-district-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 12px;
          background: #e2e8f0;
          color: #4a5568;
          margin-left: 6px;
        }

        .status-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge-progress {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-registered {
          background: #c6f6d5;
          color: #276749;
        }

        .badge-completed {
          background: #e2e8f0;
          color: #4a5568;
        }

        .badge-rejected {
          background: #fed7d7;
          color: #9b2c2c;
        }

        .badge-approved {
          background: #c6f6d5;
          color: #276749;
        }

        .badge-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-default {
          background: #e2e8f0;
          color: #4a5568;
        }

        .event-details {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 12px;
        }

        .event-details p {
          margin: 4px 0;
        }

        .registrations-info {
          margin-top: 8px;
          font-size: 13px;
        }

        .registrations-info strong {
          color: #2d3748;
        }

        .reg-pending {
          color: #92400e;
          margin-left: 6px;
        }

        .reg-approved {
          color: #276749;
          margin-left: 6px;
        }

        .registration-status {
          font-size: 13px;
          margin: 8px 0 0;
        }

        .registration-status.registered {
          color: #276749;
        }

        .event-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .district-actions .btn-sm {
          font-size: 11px;
          padding: 4px 10px;
        }

        .national-actions .btn-sm {
          font-size: 11px;
          padding: 4px 10px;
        }

        .other-district-actions {
          justify-content: center;
        }

        .other-district-actions .info-message {
          font-size: 13px;
          color: #718096;
          width: 100%;
          text-align: center;
        }

        .badge-pending-count {
          background: #fc8181;
          color: white;
          border-radius: 50%;
          padding: 1px 6px;
          font-size: 10px;
          margin-left: 4px;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          gap: 12px;
        }

        .spinner {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #4299e1;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
          grid-column: 1 / -1;
        }

        .empty-state i {
          font-size: 48px;
          margin-bottom: 16px;
          display: block;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #2d3748;
        }

        .empty-state p {
          margin: 0;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-large {
          max-width: 900px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
          border-radius: 12px 12px 0 0;
          z-index: 1;
        }

        .modal-header h3 {
          margin: 0;
          color: #1a202c;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #718096;
          padding: 0 4px;
        }

        .modal-close:hover {
          color: #2d3748;
        }

        .modal-body {
          padding: 24px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
          color: #2d3748;
        }

        .form-group .required {
          color: #e53e3e;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66,153,225,0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-group small {
          display: block;
          color: #718096;
          font-size: 12px;
          margin-top: 4px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .warning-info {
          background: #fefcbf;
          color: #975a16;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          margin-top: 6px;
        }

        .profile-detail {
          padding: 8px 0;
          border-bottom: 1px solid #f7fafc;
        }

        .profile-detail:last-child {
          border-bottom: none;
        }

        .profile-detail strong {
          color: #2d3748;
          margin-right: 8px;
        }

        .registrations-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .registrations-table th {
          text-align: left;
          padding: 8px 12px;
          background: #f7fafc;
          font-weight: 600;
          color: #2d3748;
          border-bottom: 2px solid #e2e8f0;
        }

        .registrations-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .registrations-table tr:hover {
          background: #f7fafc;
        }

        .registration-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .registrations-count {
          font-size: 14px;
          color: #4a5568;
        }

        .event-status-info {
          font-size: 14px;
          color: #4a5568;
        }

        .empty-message {
          text-align: center;
          color: #718096;
          padding: 20px 0;
        }

        .attendance-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .attendance-marked {
          font-size: 13px;
          font-weight: 500;
          color: #276749;
        }

        .attendance-marked.absent {
          color: #9b2c2c;
        }

        .attendance-summary {
          background: #f7fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .attendance-summary h4 {
          margin: 0 0 12px 0;
          color: #2d3748;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .summary-item {
          text-align: center;
          padding: 8px;
          background: white;
          border-radius: 6px;
        }

        .summary-item .summary-label {
          display: block;
          font-size: 12px;
          color: #718096;
          margin-bottom: 4px;
        }

        .summary-item .summary-value {
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
        }

        .summary-item.present .summary-value {
          color: #276749;
        }

        .summary-item.absent .summary-value {
          color: #9b2c2c;
        }

        .summary-item.pending .summary-value {
          color: #92400e;
        }

        .summary-item.percentage .summary-value {
          color: #2b6cb0;
        }

        .link-display {
          background: #f7fafc;
          padding: 16px;
          border-radius: 8px;
          margin-top: 12px;
        }

        .link-url {
          margin-bottom: 12px;
        }

        .link-box {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }

        .link-box input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          background: white;
        }

        .link-info {
          font-size: 13px;
          color: #4a5568;
          margin-bottom: 12px;
        }

        .link-info p {
          margin: 4px 0;
        }

        .link-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .link-preview {
          background: #f7fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .link-preview p {
          margin: 4px 0;
          font-size: 14px;
        }

        .link-note {
          color: #718096;
          font-size: 13px;
          margin-top: 8px;
        }

        .link-note i {
          margin-right: 4px;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-info {
            margin-left: 0;
          }

          .permission-legend {
            flex-direction: column;
            gap: 8px;
          }

          .modal-content {
            margin: 10px;
          }

          .registration-actions-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .registrations-table {
            font-size: 12px;
          }

          .registrations-table th,
          .registrations-table td {
            padding: 4px 6px;
          }

          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 12px;
          }

          .event-actions {
            gap: 4px;
          }

          .event-actions .btn-sm {
            font-size: 10px;
            padding: 3px 8px;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default DistrictEvents;