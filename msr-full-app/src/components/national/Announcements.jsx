import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Announcements = () => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    district: 'all',
    audience: ['all'],
    send_email: false,
    schedule_date: ''
  });

  // Check if user can manage announcements
  const canManageAnnouncements =
    user?.role === 'super_admin' ||
    user?.role === 'super-admin' ||
    user?.role === 'admin' ||
    user?.role === 'national_commissioner' ||
    user?.role === 'national-commissioner';

  const announcementTypes = [
    { value: 'general', label: 'General' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'important', label: 'Important' },
    { value: 'info', label: 'Information' }
  ];

  const districts = [
    'all',
    'Gasabo',
    'Kicukiro',
    'Nyarugenge',
    'Musanze',
    'Rubavu',
    'Rulindo',
    'Gakenke',
    'Burera',
    'Huye',
    'Nyanza',
    'Muhanga',
    'Ruhango',
    'Gisagara',
    'Nyagatare',
    'Gatsibo',
    'Kayonza',
    'Rwamagana',
    'Ngoma',
    'Rusizi',
    'Nyamasheke',
    'Karongi',
    'Ngororero'
  ];

  // Audience options
  const audienceOptions = [
    {
      value: 'public',
      label: '🌐 Public Site (Landing Page)'
    },
    {
      value: 'scouts',
      label: '🎯 Scouts'
    },
    {
      value: 'unit_leaders',
      label: '📋 Unit Leaders'
    },
    {
      value: 'district_commissioners',
      label: '🏛️ District Commissioners'
    },
    {
      value: 'national_commissioners',
      label: '👑 National Commissioners'
    },
    {
      value: 'donors',
      label: '🤝 Donors'
    },
    {
      value: 'all',
      label: '📢 Everyone (All Users)'
    }
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, [user?.role]);

  // ============================================================
  // FETCH ANNOUNCEMENTS
  // ============================================================

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to view announcements');
        setLoading(false);
        return;
      }

      let apiUrl;

      if (
        user?.role === 'national_commissioner' ||
        user?.role === 'national-commissioner' ||
        user?.role === 'super_admin' ||
        user?.role === 'super-admin' ||
        user?.role === 'admin'
      ) {
        apiUrl = `${API_URL}/national/announcements`;
      } else if (
        user?.role === 'district_commissioner' ||
        user?.role === 'district-commissioner'
      ) {
        apiUrl = `${API_URL}/district/announcements`;
      } else if (
        user?.role === 'unit_leader' ||
        user?.role === 'scout'
      ) {
        apiUrl = `${API_URL}/scout/announcements`;
      } else {
        apiUrl = `${API_URL}/announcements`;
      }

      console.log(
        `📢 Fetching announcements from: ${apiUrl}`
      );

      console.log(
        `👤 User role: ${user?.role}`
      );

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(
        '📊 Announcements response:',
        response.data
      );

      let announcementsData = [];

      if (response.data?.success) {
        announcementsData =
          response.data.announcements || [];
      } else if (Array.isArray(response.data)) {
        announcementsData = response.data;
      } else if (response.data?.data) {
        announcementsData = response.data.data;
      } else if (response.data?.announcements) {
        announcementsData = response.data.announcements;
      }

      setAnnouncements(
        Array.isArray(announcementsData)
          ? announcementsData
          : []
      );
    } catch (err) {
      console.error(
        '❌ Fetch announcements error:',
        err
      );

      if (err.response?.status === 403) {
        setError(
          'You do not have permission to view announcements'
        );
      } else if (err.response?.status === 401) {
        setError('Please login to view announcements');
      } else if (err.response?.status === 500) {
        setError(
          'Server error. Please try again later.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to load announcements'
        );
      }

      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE ANNOUNCEMENT
  // ============================================================

  const handleDelete = async (id) => {
    if (!canManageAnnouncements) {
      setError(
        '❌ You do not have permission to delete announcements'
      );

      setTimeout(() => setError(''), 3000);

      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to delete this announcement? This action cannot be undone!'
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      let apiUrl;

      if (
        user?.role === 'national_commissioner' ||
        user?.role === 'national-commissioner' ||
        user?.role === 'super_admin' ||
        user?.role === 'super-admin' ||
        user?.role === 'admin'
      ) {
        apiUrl = `${API_URL}/national/announcements/${id}`;
      } else {
        apiUrl = `${API_URL}/announcements/${id}`;
      }

      await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess(
        '✅ Announcement deleted successfully!'
      );

      setTimeout(() => setSuccess(''), 3000);

      fetchAnnouncements();
    } catch (err) {
      console.error(
        '❌ Delete announcement error:',
        err
      );

      setError(
        err.response?.data?.message ||
          '❌ Failed to delete announcement'
      );

      setTimeout(() => setError(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // HANDLE FORM INPUT
  // ============================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    if (name === 'audience') {
      setFormData((prev) => {
        let newAudience = [...prev.audience];

        if (checked) {
          // If "all" is selected, remove other audiences
          if (value === 'all') {
            newAudience = ['all'];
          } else {
            // Remove all
            newAudience = newAudience.filter(
              (a) => a !== 'all'
            );

            if (!newAudience.includes(value)) {
              newAudience.push(value);
            }
          }
        } else {
          newAudience = newAudience.filter(
            (a) => a !== value
          );

          if (newAudience.length === 0) {
            newAudience = ['all'];
          }
        }

        return {
          ...prev,
          audience: newAudience
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? checked
            : value
      }));
    }

    if (error) {
      setError('');
    }
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      announcement_type: 'general',
      district: 'all',
      audience: ['all'],
      send_email: false,
      schedule_date: ''
    });

    setEditingId(null);
    setError('');
    setSuccess('');
  };

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleEditAnnouncement = (announcement) => {
    if (!canManageAnnouncements) {
      setError(
        '❌ You do not have permission to edit announcements'
      );

      setTimeout(() => setError(''), 3000);

      return;
    }

    console.log(
      '✏️ Editing announcement:',
      announcement
    );

    let audienceValue = announcement.audience;

    if (!audienceValue) {
      audienceValue = ['all'];
    } else if (typeof audienceValue === 'string') {
      try {
        const parsed =
          JSON.parse(audienceValue);

        if (Array.isArray(parsed)) {
          audienceValue = parsed;
        } else {
          audienceValue = [audienceValue];
        }
      } catch (parseError) {
        if (audienceValue.includes(',')) {
          audienceValue = audienceValue
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        } else {
          audienceValue = [audienceValue];
        }
      }
    }

    if (!Array.isArray(audienceValue)) {
      audienceValue = ['all'];
    }

    if (audienceValue.length === 0) {
      audienceValue = ['all'];
    }

    // Convert scheduled date into datetime-local format
    let scheduleDate = '';

    if (announcement.schedule_date) {
      const date = new Date(
        announcement.schedule_date
      );

      if (!Number.isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(
          date.getMonth() + 1
        ).padStart(2, '0');
        const day = String(
          date.getDate()
        ).padStart(2, '0');
        const hours = String(
          date.getHours()
        ).padStart(2, '0');
        const minutes = String(
          date.getMinutes()
        ).padStart(2, '0');

        scheduleDate =
          `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }

    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      announcement_type:
        announcement.announcement_type ||
        'general',
      district:
        announcement.district || 'all',
      audience: audienceValue,
      send_email:
        announcement.send_email === true ||
        announcement.send_email === 1 ||
        announcement.send_email === 'true',
      schedule_date: scheduleDate
    });

    setEditingId(announcement.id);
    setError('');
    setSuccess('');
    setShowCreateModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleCloseCreateModal = () => {
    if (creating || editing) {
      return;
    }

    setShowCreateModal(false);
    resetForm();
  };

  // ============================================================
  // CREATE / UPDATE ANNOUNCEMENT
  // ============================================================

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    if (
      !Array.isArray(formData.audience) ||
      formData.audience.length === 0
    ) {
      setError('Please select at least one audience');
      return;
    }

    if (editingId) {
      setEditing(true);
    } else {
      setCreating(true);
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        announcement_type:
          formData.announcement_type,
        district: formData.district,
        audience: formData.audience,
        send_email: formData.send_email,
        schedule_date:
          formData.schedule_date || null
      };

      console.log(
        editingId
          ? '📤 Updating announcement:'
          : '📤 Creating announcement:',
        submitData
      );

      if (editingId) {
        // ====================================================
        // UPDATE EXISTING ANNOUNCEMENT
        // ====================================================

        const response = await axios.put(
          `${API_URL}/national/announcements/${editingId}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json'
            }
          }
        );

        console.log(
          '✅ Announcement updated:',
          response.data
        );

        setSuccess(
          '✅ Announcement updated successfully!'
        );
      } else {
        // ====================================================
        // CREATE NEW ANNOUNCEMENT
        // ====================================================

        const response = await axios.post(
          `${API_URL}/national/announcements`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type':
                'application/json'
            }
          }
        );

        console.log(
          '✅ Announcement created:',
          response.data
        );

        setSuccess(
          '✅ Announcement created successfully!'
        );
      }

      setTimeout(() => {
        setSuccess('');
      }, 4000);

      setShowCreateModal(false);
      resetForm();

      await fetchAnnouncements();
    } catch (err) {
      console.error(
        editingId
          ? '❌ Update announcement error:'
          : '❌ Create announcement error:',
        err
      );

      console.error(
        '❌ Error response:',
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          (editingId
            ? 'Failed to update announcement'
            : 'Failed to create announcement')
      );
    } finally {
      setCreating(false);
      setEditing(false);
    }
  };

  // ============================================================
  // RETRY
  // ============================================================

  const handleRetry = () => {
    fetchAnnouncements();
  };

  // ============================================================
  // GET AUDIENCE LABELS
  // ============================================================

  const getAudienceLabels = (audience) => {
    if (!audience) {
      return 'Everyone';
    }

    let audienceArray = audience;

    if (typeof audience === 'string') {
      try {
        const parsed =
          JSON.parse(audience);

        if (Array.isArray(parsed)) {
          audienceArray = parsed;
        } else if (audience.includes(',')) {
          audienceArray = audience
            .split(',')
            .map((a) => a.trim());
        } else {
          audienceArray = [audience];
        }
      } catch (error) {
        if (audience.includes(',')) {
          audienceArray = audience
            .split(',')
            .map((a) => a.trim());
        } else {
          audienceArray = [audience];
        }
      }
    }

    if (!Array.isArray(audienceArray)) {
      audienceArray = [audienceArray];
    }

    if (audienceArray.includes('all')) {
      return 'Everyone';
    }

    const labels = audienceArray.map(
      (val) => {
        const option =
          audienceOptions.find(
            (opt) =>
              opt.value ===
              String(val).trim()
          );

        return option
          ? option.label.replace(
              /[🌐🎯📋🏛️👑🤝📢]\s*/,
              ''
            )
          : String(val).trim();
      }
    );

    return (
      labels.join(', ') || 'Everyone'
    );
  };

  // ============================================================
  // CHECK AUDIENCE
  // ============================================================

  const isAudienceSelected = (value) => {
    return formData.audience.includes(value);
  };

  // ============================================================
  // CHECK PUBLIC AUDIENCE
  // ============================================================

  const isPublicAnnouncement = (
    announcement
  ) => {
    if (!announcement?.audience) {
      return false;
    }

    let audience = announcement.audience;

    if (typeof audience === 'string') {
      try {
        const parsed =
          JSON.parse(audience);

        if (Array.isArray(parsed)) {
          audience = parsed;
        } else {
          audience = [audience];
        }
      } catch (error) {
        audience = audience.includes(',')
          ? audience
              .split(',')
              .map((item) =>
                item.trim()
              )
          : [audience];
      }
    }

    if (!Array.isArray(audience)) {
      audience = [audience];
    }

    return audience.includes('public');
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="announcements-loading">
        <div className="spinner"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR PAGE
  // ============================================================

  if (
    error &&
    announcements.length === 0 &&
    !showCreateModal
  ) {
    return (
      <div className="announcements-error">
        <i
          className="fas fa-exclamation-circle"
          style={{
            fontSize: '48px',
            color: '#dc3545'
          }}
        ></i>

        <h3>Error Loading Announcements</h3>

        <p>{error}</p>

        <button
          onClick={handleRetry}
          className="btn-primary"
        >
          <i className="fas fa-redo"></i>{' '}
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="announcements-container">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="announcements-header">
          <h2>
            <i
              className="fas fa-bullhorn"
              style={{
                color: '#FFD100'
              }}
            ></i>

            Announcements

            <span className="announcement-count">
              {announcements.length}
            </span>
          </h2>

          {canManageAnnouncements && (
            <button
              className="btn-primary"
              onClick={
                handleOpenCreateModal
              }
            >
              <i className="fas fa-plus"></i>{' '}
              New Announcement
            </button>
          )}
        </div>

        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>

            <div>
              <strong>
                Success
              </strong>

              <p>{success}</p>
            </div>
          </div>
        )}

        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>

            <div>
              <strong>
                Error
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {announcements.length === 0 ? (
          <div className="announcements-empty">
            <i
              className="fas fa-bullhorn"
              style={{
                fontSize: '48px',
                color: '#ccc'
              }}
            ></i>

            <h3>
              No Announcements
            </h3>

            <p>
              There are no announcements
              at this time.
            </p>

            {canManageAnnouncements && (
              <button
                className="btn-primary"
                onClick={
                  handleOpenCreateModal
                }
              >
                <i className="fas fa-plus"></i>{' '}
                Create Announcement
              </button>
            )}
          </div>
        ) : (
          /* ====================================================
             ANNOUNCEMENT LIST
          ==================================================== */

          <div className="announcements-list">
            {announcements.map(
              (announcement) => (
                <div
                  key={announcement.id}
                  className="announcement-card"
                >

                  {/* HEADER */}

                  <div className="announcement-header">

                    <div className="announcement-title">
                      <h3>
                        {
                          announcement.title
                        }
                      </h3>

                      <span
                        className={`announcement-type ${
                          announcement.announcement_type ||
                          'general'
                        }`}
                      >
                        {
                          announcement.announcement_type ||
                          'general'
                        }
                      </span>
                    </div>

                    <div className="announcement-meta">

                      {announcement.district ===
                        'all' && (
                        <span className="national-badge">
                          <i className="fas fa-flag"></i>{' '}
                          National
                        </span>
                      )}

                      {announcement.district &&
                        announcement.district !==
                          'all' && (
                          <span className="district-badge">
                            <i className="fas fa-map-marker-alt"></i>{' '}
                            {
                              announcement.district
                            }
                          </span>
                        )}

                      {isPublicAnnouncement(
                        announcement
                      ) && (
                        <span className="public-badge">
                          <i className="fas fa-globe"></i>{' '}
                          Public
                        </span>
                      )}

                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="announcement-content">
                    <p>
                      {
                        announcement.content
                      }
                    </p>
                  </div>

                  {/* FOOTER */}

                  <div className="announcement-footer">

                    <div className="announcement-author">
                      <i className="fas fa-user"></i>

                      <span>
                        {
                          announcement.author
                            ?.full_name ||
                          'Unknown'
                        }
                      </span>
                    </div>

                    <div className="announcement-date">
                      <i className="fas fa-calendar"></i>

                      <span>
                        {announcement.created_at
                          ? new Date(
                              announcement.created_at
                            ).toLocaleDateString(
                              'en-RW',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )
                          : 'Unknown date'}
                      </span>
                    </div>

                    <div className="announcement-audience">
                      <i className="fas fa-users"></i>

                      <span className="audience-label">
                        {
                          getAudienceLabels(
                            announcement.audience
                          )
                        }
                      </span>
                    </div>

                    {canManageAnnouncements && (
                      <div className="announcement-actions">

                        {/* EDIT */}

                        <button
                          className="btn-sm btn-edit"
                          title="Edit"
                          onClick={() =>
                            handleEditAnnouncement(
                              announcement
                            )
                          }
                        >
                          <i className="fas fa-edit"></i>
                        </button>

                        {/* DELETE */}

                        <button
                          className="btn-sm btn-delete"
                          title="Delete"
                          onClick={() =>
                            handleDelete(
                              announcement.id
                            )
                          }
                          disabled={
                            deletingId ===
                            announcement.id
                          }
                        >
                          {deletingId ===
                          announcement.id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </button>

                      </div>
                    )}

                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={
            handleCloseCreateModal
          }
        >
          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <h3>
                <i
                  className={
                    editingId
                      ? 'fas fa-edit'
                      : 'fas fa-plus-circle'
                  }
                  style={{
                    color: '#FFD100'
                  }}
                ></i>

                {editingId
                  ? 'Edit Announcement'
                  : 'Create Announcement'}
              </h3>

              <button
                className="modal-close"
                onClick={
                  handleCloseCreateModal
                }
                disabled={
                  creating || editing
                }
              >
                <i className="fas fa-times"></i>
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreateAnnouncement
              }
            >

              <div className="modal-body">

                {/* FORM ERROR */}

                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>

                    <p>{error}</p>
                  </div>
                )}

                {/* FORM SUCCESS */}

                {success && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle"></i>

                    <p>{success}</p>
                  </div>
                )}

                {/* TITLE */}

                <div className="form-group">
                  <label>
                    Title{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                {/* CONTENT */}

                <div className="form-group">
                  <label>
                    Content{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <textarea
                    name="content"
                    value={
                      formData.content
                    }
                    onChange={
                      handleChange
                    }
                    rows="5"
                    placeholder="Write your announcement content..."
                    required
                  />
                </div>

                {/* TYPE + DISTRICT */}

                <div className="form-row">

                  <div className="form-group">
                    <label>
                      Announcement Type
                    </label>

                    <select
                      name="announcement_type"
                      value={
                        formData.announcement_type
                      }
                      onChange={
                        handleChange
                      }
                    >
                      {announcementTypes.map(
                        (type) => (
                          <option
                            key={
                              type.value
                            }
                            value={
                              type.value
                            }
                          >
                            {
                              type.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      District
                    </label>

                    <select
                      name="district"
                      value={
                        formData.district
                      }
                      onChange={
                        handleChange
                      }
                    >
                      {districts.map(
                        (district) => (
                          <option
                            key={
                              district
                            }
                            value={
                              district
                            }
                          >
                            {district ===
                            'all'
                              ? 'All Districts'
                              : district}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>

                {/* AUDIENCE */}

                <div className="form-group">

                  <label>
                    Audience{' '}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <div className="audience-checkboxes">

                    {audienceOptions.map(
                      (option) => (
                        <label
                          key={
                            option.value
                          }
                          className="audience-checkbox"
                        >
                          <input
                            type="checkbox"
                            name="audience"
                            value={
                              option.value
                            }
                            checked={isAudienceSelected(
                              option.value
                            )}
                            onChange={
                              handleChange
                            }
                          />

                          <span className="checkbox-label-text">
                            {
                              option.label
                            }
                          </span>
                        </label>
                      )
                    )}

                  </div>

                  <small className="form-hint">

                    <i className="fas fa-info-circle"></i>

                    Select multiple
                    audiences.{' '}

                    <strong>
                      Public Site
                    </strong>{' '}
                    makes it visible on
                    the landing page.

                    <br />

                    <span className="selected-audience">

                      Selected:{' '}

                      <strong>
                        {
                          getAudienceLabels(
                            formData.audience
                          )
                        }
                      </strong>

                    </span>

                  </small>

                </div>

                {/* SCHEDULE */}

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Schedule Date
                      (Optional)
                    </label>

                    <input
                      type="datetime-local"
                      name="schedule_date"
                      value={
                        formData.schedule_date
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="form-group checkbox-group">

                  <label className="checkbox-label">

                    <input
                      type="checkbox"
                      name="send_email"
                      checked={
                        formData.send_email
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      Send email notification
                      to recipients
                    </span>

                  </label>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={
                    handleCloseCreateModal
                  }
                  disabled={
                    creating || editing
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    creating || editing
                  }
                >
                  {creating ||
                  editing ? (
                    <>
                      <span className="loading-spinner"></span>

                      {editing
                        ? ' Updating...'
                        : ' Creating...'}
                    </>
                  ) : (
                    <>
                      <i
                        className={
                          editingId
                            ? 'fas fa-save'
                            : 'fas fa-paper-plane'
                        }
                      ></i>

                      {editingId
                        ? ' Update Announcement'
                        : ' Publish'}
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style jsx>{`

        .announcements-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .announcements-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .announcements-header h2 {
          margin: 0;
          font-size: 24px;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .announcement-count {
          background: #FFD100;
          color: #1a1a1a;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: bold;
        }

        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .announcement-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .announcement-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .announcement-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .announcement-title h3 {
          margin: 0;
          font-size: 18px;
          color: #1a1a1a;
        }

        .announcement-type {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .announcement-type.general {
          background: #e5e7eb;
          color: #374151;
        }

        .announcement-type.urgent {
          background: #fee2e2;
          color: #991b1b;
        }

        .announcement-type.important {
          background: #fef3c7;
          color: #92400e;
        }

        .announcement-type.info {
          background: #dbeafe;
          color: #1e40af;
        }

        .announcement-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .national-badge {
          background: #FFD100;
          color: #1a1a1a;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .district-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .public-badge {
          background: #22c55e;
          color: #fff;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .announcement-content {
          margin-bottom: 16px;
        }

        .announcement-content p {
          margin: 0;
          color: #4B5563;
          line-height: 1.6;
        }

        .announcement-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 8px;
        }

        .announcement-author {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6B7280;
        }

        .announcement-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6B7280;
        }

        .announcement-audience {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6B7280;
        }

        .audience-label {
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
        }

        .announcement-actions {
          display: flex;
          gap: 6px;
        }

        .btn-sm {
          padding: 4px 10px;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-sm:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .btn-sm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-edit {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-edit:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-delete {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-delete:hover:not(:disabled) {
          background: #fecaca;
        }

        .btn-primary {
          background: #FFD100;
          color: #1a1a1a;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #f5c800;
          transform: scale(1.02);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .announcements-loading,
        .announcements-error,
        .announcements-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .announcements-loading .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #FFD100;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        .announcements-error h3,
        .announcements-empty h3 {
          margin: 16px 0 8px 0;
          color: #1a1a1a;
        }

        .announcements-error p,
        .announcements-empty p {
          color: #6B7280;
          margin-bottom: 16px;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .alert i {
          font-size: 20px;
          margin-top: 2px;
        }

        .alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #065f46;
        }

        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .form-hint {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          color: #6B7280;
        }

        .form-hint i {
          margin-right: 4px;
        }

        .selected-audience {
          display: block;
          margin-top: 4px;
          color: #374151;
        }

        .audience-checkboxes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
        }

        .audience-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: #f9fafb;
        }

        .audience-checkbox:hover {
          background: #f3f4f6;
          border-color: #FFD100;
        }

        .audience-checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #FFD100;
        }

        .audience-checkbox .checkbox-label-text {
          font-size: 13px;
          color: #374151;
          font-weight: 400;
        }

        .checkbox-group {
          margin: 8px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: normal !important;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #FFD100;
        }

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
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: white;
          z-index: 2;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6B7280;
        }

        .modal-close:hover {
          color: #374151;
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 14px;
          color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #FFD100;
          box-shadow: 0 0 0 3px rgba(255, 209, 0, 0.2);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .required {
          color: #ef4444;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 2;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          vertical-align: middle;
          margin-right: 5px;
        }

        @media (max-width: 768px) {

          .announcements-container {
            padding: 12px;
          }

          .announcements-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .announcement-header {
            flex-direction: column;
          }

          .announcement-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .announcement-actions {
            width: 100%;
          }

          .btn-sm {
            min-width: 40px;
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions button {
            width: 100%;
            justify-content: center;
          }

          .modal-content {
            max-width: 95%;
            margin: 10px;
            max-height: 95vh;
          }

          .modal-body {
            padding: 18px;
          }

          .audience-checkboxes {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </>
  );
};

export default Announcements;