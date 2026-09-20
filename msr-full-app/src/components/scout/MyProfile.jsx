import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// 🎨 Scout Color Palette
const SCOUT = {
  purple: '#6A1B9A',
  gold: '#FFD100',
  darkBlue: '#002B5C',
  green: '#2E7D32',
  red: '#D32F2F',
  white: '#FFFFFF',
  dark: '#1F2937',
  light: '#F5F7FA',
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');
const MyProfile = () => {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();

  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    bio: '',
    district: '',
    gender: '',
    dateOfBirth: ''
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ Avatar states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ Alert states
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const notify = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 4000);
  };

  // ✅ Load user data including avatar
  useEffect(() => {
    if (!user) return;

    setProfile({
      fullName: user.full_name || '',
      phone: user.phone || '',
      bio: user.member?.bio || '',
      district: user.member?.district || '',
      gender: user.member?.gender || '',
      dateOfBirth: user.member?.date_of_birth || ''
    });

    const avatar = user.member?.profile_image || user.avatar_url || '';
    if (avatar) {
      setAvatarPreview(avatar);
    }
  }, [user]);

  // ✅ Handle input change
  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle avatar selection with preview
  const onAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify('error', 'Please select an image file');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify('error', 'Image must be less than 5MB');
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    setUploadProgress(0);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setShowConfirmDialog(true);
    };
    reader.onerror = () => notify('error', 'Failed to read file');
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  // ✅ Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // ✅ Drag controls
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomLevel > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ✅ Confirm and upload avatar
  const confirmUpload = async () => {
    if (!avatarFile) {
      notify('error', 'No image selected');
      return;
    }

    setAvatarLoading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const token = localStorage.getItem('token');
      if (!token) {
        notify('error', 'Please login first');
        setAvatarLoading(false);
        return;
      }

      setUploadProgress(30);

      const response = await fetch(`${API_URL}/scout/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      setUploadProgress(70);

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        await refreshUser();
        const avatarUrl = data.avatarUrl;
        setAvatarPreview(avatarUrl);
        setAvatarFile(null);
        setShowConfirmDialog(false);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
        notify('success', 'Avatar updated successfully!');
      } else {
        notify('error', data.message || 'Upload failed');
        setShowConfirmDialog(false);
      }
    } catch (err) {
      console.error('❌ Avatar upload error:', err);
      notify('error', 'Upload failed. Please try again.');
      setShowConfirmDialog(false);
    } finally {
      setAvatarLoading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Cancel upload
  const cancelUpload = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setShowConfirmDialog(false);
    setUploadProgress(0);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    const avatar = user?.member?.profile_image || user?.avatar_url || '';
    if (avatar) {
      setAvatarPreview(avatar);
    }
  };

  // ✅ Remove avatar
  const removeAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/scout/profile/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        await refreshUser();
        setAvatarPreview('');
        notify('success', 'Profile picture removed');
      } else {
        notify('error', data.message || 'Failed to remove avatar');
      }
    } catch (err) {
      console.error('❌ Remove avatar error:', err);
      notify('error', 'Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit profile update
  const submitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const res = await updateProfile(profile);
      if (res?.success) {
        await refreshUser();
        notify('success', 'Profile updated successfully!');
      } else {
        notify('error', res?.message || 'Update failed');
      }
    } catch (err) {
      console.error('❌ Profile update error:', err);
      notify('error', 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit password change
  const submitPassword = async (e) => {
    e.preventDefault();

    if (password.newPassword !== password.confirmPassword) {
      return notify('error', 'Passwords do not match');
    }

    if (password.newPassword.length < 6) {
      return notify('error', 'Password must be at least 6 characters');
    }

    if (!password.currentPassword) {
      return notify('error', 'Current password is required');
    }

    setLoading(true);
    setAlert({ type: '', message: '' });

    try {
      const res = await changePassword(password.currentPassword, password.newPassword);
      if (res?.success) {
        setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
        notify('success', 'Password changed successfully!');
      } else {
        notify('error', res?.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('❌ Password change error:', err);
      notify('error', 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get avatar URL
  const getAvatarUrl = () => {
    if (avatarPreview && avatarPreview.startsWith('data:')) {
      return avatarPreview;
    }
    
    let avatarPath = '';
    if (user?.member?.profile_image) {
      avatarPath = user.member.profile_image;
    } else if (user?.avatar_url) {
      avatarPath = user.avatar_url;
    } else if (avatarPreview) {
      avatarPath = avatarPreview;
    }
    
    if (avatarPath) {
      if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
      }
      if (avatarPath.startsWith('/')) {
        return `${BASE_URL}${avatarPath}`;
      }
      return `${BASE_URL}/${avatarPath}`;
    }
    
    const name = profile.fullName || user?.full_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6A1B9A&color=FFFFFF&size=150`;
  };

  // ✅ Get SIN from user
  const getUserSIN = () => {
    return user?.member?.sin || user?.sin || 'N/A';
  };

  // ✅ Get District from user
  const getUserDistrict = () => {
    return user?.member?.district || user?.district || 'N/A';
  };

  return (
    <div className="dashboard-container">

      {/* HEADER with District & SIN - BIG & TRANSPARENT */}
      <div className="page-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        padding: '20px 24px',
        background: SCOUT.light,
        borderRadius: '12px',
        border: `1px solid ${SCOUT.purple}20`,
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: SCOUT.purple,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="fas fa-user" style={{ color: SCOUT.purple }}></i> My Profile
          </h2>
          <p style={{ color: SCOUT.dark, fontSize: '14px', margin: '4px 0 0', opacity: 0.7 }}>Manage your account information</p>
        </div>
        
        {/* ✅ District & SIN Display - BIG & TRANSPARENT */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: `${SCOUT.purple}14`,
          padding: '12px 24px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${SCOUT.purple}20`
        }}>
          {/* District */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '12px', 
              color: SCOUT.dark, 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              fontWeight: '600',
              opacity: 0.6
            }}>
              <i className="fas fa-map-marker-alt" style={{ color: SCOUT.purple, marginRight: '4px' }}></i> District
            </div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              color: SCOUT.purple,
              opacity: 0.8,
              letterSpacing: '0.5px'
            }}>
              {getUserDistrict()}
            </div>
          </div>
          
          {/* Divider */}
          <div style={{ 
            width: '2px', 
            height: '40px', 
            background: `${SCOUT.purple}25`,
            borderRadius: '2px'
          }}></div>
          
          {/* SIN */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '12px', 
              color: SCOUT.dark, 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              fontWeight: '600',
              opacity: 0.6
            }}>
              <i className="fas fa-id-card" style={{ color: SCOUT.purple, marginRight: '4px' }}></i> SIN
            </div>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              color: SCOUT.purple,
              opacity: 0.8,
              letterSpacing: '1px',
              fontFamily: 'monospace'
            }}>
              {getUserSIN()}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <span className="role-badge" style={{ 
            background: `${SCOUT.purple}15`, 
            color: SCOUT.purple, 
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {user?.role === 'national_commissioner' && '👑 National Commissioner'}
            {user?.role === 'district_commissioner' && '🏛️ District Commissioner'}
            {user?.role === 'scout' && '🎯 Scout'}
            {user?.role === 'unit_leader' && '📋 Unit Leader'}
            {user?.role === 'donor' && '🤝 Donor'}
          </span>
        </div>
      </div>

      {/* ALERT */}
      {alert.message && (
        <div className={`alert alert-${alert.type}`} style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderLeft: `4px solid ${alert.type === 'success' ? SCOUT.green : SCOUT.red}`,
          background: alert.type === 'success' ? `${SCOUT.green}10` : `${SCOUT.red}10`
        }}>
          <i className={`fas fa-${alert.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} 
             style={{ color: alert.type === 'success' ? SCOUT.green : SCOUT.red }}></i>
          <div>
            <strong style={{ color: alert.type === 'success' ? SCOUT.green : SCOUT.red }}>
              {alert.type === 'success' ? 'Success' : 'Error'}
            </strong>
            <p style={{ margin: 0, color: SCOUT.dark }}>{alert.message}</p>
          </div>
        </div>
      )}

      <div className="profile-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>

        {/* AVATAR CARD */}
        <section className="profile-card avatar-card" style={{ 
          borderTop: `4px solid ${SCOUT.purple}`,
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ color: SCOUT.darkBlue, marginBottom: '16px' }}>
            <i className="fas fa-camera" style={{ color: SCOUT.purple }}></i> Profile Picture
          </h3>

          <div className="avatar-container" style={{ textAlign: 'center' }}>
            <img
              src={getAvatarUrl()}
              alt="Profile Avatar"
              className="profile-avatar"
              style={{ 
                border: `4px solid ${SCOUT.purple}`,
                borderRadius: '50%',
                width: '150px',
                height: '150px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.onerror = null;
                const name = profile.fullName || user?.full_name || 'User';
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6A1B9A&color=FFFFFF&size=150`;
              }}
            />
          </div>

          {avatarLoading && (
            <div className="upload-progress" style={{ marginTop: '12px' }}>
              <div className="progress-bar" style={{ background: SCOUT.light, borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div className="progress-fill" style={{ width: `${uploadProgress}%`, background: SCOUT.purple, height: '100%', transition: 'width 0.3s' }}></div>
              </div>
              <span className="progress-text" style={{ fontSize: '0.8rem', color: SCOUT.dark, opacity: 0.6 }}>{uploadProgress}%</span>
            </div>
          )}

          <div className="avatar-upload-section" style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={onAvatarSelect}
                className="hidden"
                disabled={avatarLoading}
                style={{ display: 'none' }}
              />
              <label htmlFor="avatar-input" className="btn-primary" style={{ 
                cursor: avatarLoading ? 'not-allowed' : 'pointer', 
                padding: '8px 20px', 
                background: SCOUT.purple, 
                borderRadius: '8px', 
                color: SCOUT.white, 
                border: 'none', 
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s, transform 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!avatarLoading) {
                  e.target.style.background = '#7B1FA2';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = SCOUT.purple;
                e.target.style.transform = 'translateY(0)';
              }}>
                <i className="fas fa-camera"></i> Choose Photo
              </label>
            </div>

            <div className="avatar-actions">
              {user?.member?.profile_image && (
                <button
                  className="btn-danger"
                  onClick={removeAvatar}
                  disabled={avatarLoading}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.8rem', 
                    background: SCOUT.red, 
                    color: SCOUT.white, 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#B71C1C'}
                  onMouseLeave={(e) => e.target.style.background = SCOUT.red}
                >
                  <i className="fas fa-trash"></i> Remove
                </button>
              )}
            </div>
          </div>

          <p className="file-hint" style={{ 
            color: SCOUT.dark, 
            fontSize: '0.8rem', 
            marginTop: '12px',
            opacity: 0.6
          }}>
            <i className="fas fa-info-circle" style={{ color: SCOUT.purple }}></i>
            Max: 5MB • JPG, PNG, GIF, WEBP
          </p>
        </section>

        {/* PROFILE FORM */}
        <section className="profile-card" style={{ 
          borderTop: `4px solid ${SCOUT.green}`,
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ color: SCOUT.darkBlue, marginBottom: '16px' }}>
            <i className="fas fa-id-card" style={{ color: SCOUT.green }}></i> Personal Info
          </h3>

          <form onSubmit={submitProfile} className="profile-form">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange(setProfile)}
                placeholder="Full name"
                className="form-input"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: `1px solid ${SCOUT.light}`, 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = SCOUT.purple;
                  e.target.style.boxShadow = `0 0 0 3px ${SCOUT.purple}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = SCOUT.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange(setProfile)}
                  placeholder="Phone"
                  className="form-input"
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: `1px solid ${SCOUT.light}`, 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = SCOUT.purple;
                    e.target.style.boxShadow = `0 0 0 3px ${SCOUT.purple}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = SCOUT.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>District</label>
                <input
                  type="text"
                  name="district"
                  value={profile.district}
                  onChange={handleChange(setProfile)}
                  placeholder="District"
                  className="form-input"
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: `1px solid ${SCOUT.light}`, 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = SCOUT.purple;
                    e.target.style.boxShadow = `0 0 0 3px ${SCOUT.purple}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = SCOUT.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange(setProfile)}
                  className="form-select"
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: `1px solid ${SCOUT.light}`, 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    background: SCOUT.white,
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = SCOUT.purple;
                    e.target.style.boxShadow = `0 0 0 3px ${SCOUT.purple}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = SCOUT.light;
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth?.split('T')[0] || ''}
                  onChange={handleChange(setProfile)}
                  className="form-input"
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: `1px solid ${SCOUT.light}`, 
                    borderRadius: '8px', 
                    fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = SCOUT.purple;
                    e.target.style.boxShadow = `0 0 0 3px ${SCOUT.purple}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = SCOUT.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange(setProfile)}
                placeholder="Tell us about yourself..."
                rows="2"
                className="form-textarea"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: `1px solid ${SCOUT.light}`, 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  resize: 'vertical',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = SCOUT.purple;
                  e.target.style.boxShadow = `0 0 0 3px ${SCOUT.purple}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = SCOUT.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ 
                padding: '10px 24px', 
                fontSize: '0.9rem', 
                background: SCOUT.green, 
                color: SCOUT.white, 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s, transform 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = '#1B5E20';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = SCOUT.green;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <><span className="spinner-small"></span> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> Save Profile</>
              )}
            </button>
          </form>
        </section>

        {/* PASSWORD SECTION */}
        <section className="profile-card security-card" style={{ 
          borderTop: `4px solid ${SCOUT.gold}`,
          background: SCOUT.white,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ color: SCOUT.darkBlue, marginBottom: '16px' }}>
            <i className="fas fa-lock" style={{ color: SCOUT.gold }}></i> Security
          </h3>

          <form onSubmit={submitPassword} className="password-form" style={{ maxWidth: '600px' }}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={password.currentPassword}
                onChange={handleChange(setPassword)}
                placeholder="Current password"
                autoComplete="current-password"
                className="form-input"
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: `1px solid ${SCOUT.light}`, 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = SCOUT.gold;
                  e.target.style.boxShadow = `0 0 0 3px ${SCOUT.gold}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = SCOUT.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handleChange(setPassword)}
                placeholder="New password (min 6 chars)"
                autoComplete="new-password"
                className="form-input"
                required
                minLength="6"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: `1px solid ${SCOUT.light}`, 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = SCOUT.gold;
                  e.target.style.boxShadow = `0 0 0 3px ${SCOUT.gold}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = SCOUT.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ color: SCOUT.dark, fontWeight: '600', display: 'block', marginBottom: '4px' }}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={password.confirmPassword}
                onChange={handleChange(setPassword)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="form-input"
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: `1px solid ${SCOUT.light}`, 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = SCOUT.gold;
                  e.target.style.boxShadow = `0 0 0 3px ${SCOUT.gold}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = SCOUT.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="password-hint" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 14px', 
              background: `${SCOUT.gold}15`, 
              borderRadius: '6px', 
              marginBottom: '16px',
              border: `1px solid ${SCOUT.gold}30`
            }}>
              <i className="fas fa-info-circle" style={{ color: SCOUT.gold }}></i>
              <span style={{ fontSize: '0.85rem', color: SCOUT.dark, opacity: 0.7 }}>Password must be at least 6 characters</span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ 
                padding: '10px 24px', 
                fontSize: '0.9rem', 
                background: SCOUT.gold, 
                color: SCOUT.dark, 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s, transform 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = '#E6BD00';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = SCOUT.gold;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <><span className="spinner-small"></span> Updating...</>
              ) : (
                <><i className="fas fa-key"></i> Update Password</>
              )}
            </button>
          </form>
        </section>

      </div>

      {/* ✅ CONFIRM DIALOG MODAL WITH ZOOM CONTROLS */}
      {showConfirmDialog && (
        <div className="modal-overlay" onClick={cancelUpload} style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()} style={{ 
            background: SCOUT.white, 
            borderRadius: '12px', 
            maxWidth: '500px', 
            width: '100%', 
            padding: '24px', 
            maxHeight: '90vh', 
            overflowY: 'auto' 
          }}>
            <div className="modal-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingBottom: '8px', 
              marginBottom: '12px', 
              borderBottom: `1px solid ${SCOUT.light}` 
            }}>
              <h3 style={{ fontSize: '1.1rem', color: SCOUT.darkBlue }}>
                <i className="fas fa-image" style={{ color: SCOUT.purple }}></i> Preview & Crop
              </h3>
              <button className="modal-close" onClick={cancelUpload} style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '20px', 
                cursor: 'pointer', 
                color: SCOUT.dark,
                opacity: 0.5,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.5'}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p style={{ 
                fontSize: '0.9rem', 
                marginBottom: '12px', 
                textAlign: 'center', 
                color: SCOUT.dark,
                opacity: 0.6 
              }}>
                Use zoom controls to adjust your profile picture
              </p>
              
              {/* Image Container with Zoom */}
              <div 
                className="image-editor-container"
                ref={containerRef}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '50%',
                  width: '250px',
                  height: '250px',
                  margin: '0 auto 12px',
                  border: `4px solid ${SCOUT.purple}`,
                  boxShadow: '0 4px 20px rgba(106, 27, 154, 0.15)',
                  background: SCOUT.light,
                  cursor: zoomLevel > 1 ? 'grab' : 'default'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  ref={imageRef}
                  src={avatarPreview}
                  alt="Preview Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                  onLoad={(e) => {
                    const img = e.target;
                    setImageDimensions({
                      width: img.naturalWidth,
                      height: img.naturalHeight
                    });
                  }}
                />
                
                {/* Zoom indicator */}
                {zoomLevel > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {Math.round(zoomLevel * 100)}%
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="zoom-controls" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <button
                  className="btn-secondary"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '0.85rem', 
                    background: `${SCOUT.purple}10`, 
                    color: SCOUT.purple, 
                    border: `1px solid ${SCOUT.purple}20`, 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = `${SCOUT.purple}20`}
                  onMouseLeave={(e) => e.target.style.background = `${SCOUT.purple}10`}
                >
                  <i className="fas fa-search-minus"></i>
                </button>
                
                <button
                  className="btn-primary"
                  onClick={handleZoomReset}
                  style={{ 
                    padding: '6px 16px', 
                    fontSize: '0.85rem', 
                    background: SCOUT.purple, 
                    color: SCOUT.white, 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    transition: 'background 0.2s, transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#7B1FA2';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = SCOUT.purple;
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fas fa-expand"></i> Reset
                </button>
                
                <button
                  className="btn-secondary"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '0.85rem', 
                    background: `${SCOUT.purple}10`, 
                    color: SCOUT.purple, 
                    border: `1px solid ${SCOUT.purple}20`, 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = `${SCOUT.purple}20`}
                  onMouseLeave={(e) => e.target.style.background = `${SCOUT.purple}10`}
                >
                  <i className="fas fa-search-plus"></i>
                </button>
              </div>

              {/* File Info */}
              {avatarFile && (
                <div className="file-info" style={{ 
                  padding: '6px 12px', 
                  margin: '8px 0',
                  background: SCOUT.light,
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '0.8rem', color: SCOUT.dark, opacity: 0.7 }}>
                    <strong>File:</strong> {avatarFile.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: SCOUT.dark, opacity: 0.7 }}>
                    <strong>Size:</strong> {(avatarFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}

              {/* Upload Progress */}
              {avatarLoading && (
                <div className="upload-progress" style={{ margin: '8px 0' }}>
                  <div className="progress-bar" style={{ background: SCOUT.light, borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ width: `${uploadProgress}%`, background: SCOUT.purple, height: '100%', transition: 'width 0.3s' }}></div>
                  </div>
                  <span className="progress-text" style={{ fontSize: '0.8rem', color: SCOUT.dark, opacity: 0.6 }}>{uploadProgress}%</span>
                </div>
              )}
            </div>

            <div className="form-actions" style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: `1px solid ${SCOUT.light}`, 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px' 
            }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={cancelUpload}
                disabled={avatarLoading}
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '0.85rem', 
                  background: SCOUT.light, 
                  color: SCOUT.dark, 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#E5E7EB'}
                onMouseLeave={(e) => e.target.style.background = SCOUT.light}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={confirmUpload}
                disabled={avatarLoading}
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '0.85rem', 
                  background: SCOUT.purple, 
                  color: SCOUT.white, 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!avatarLoading) {
                    e.target.style.background = '#7B1FA2';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = SCOUT.purple;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {avatarLoading ? (
                  <><span className="spinner-small"></span> Uploading...</>
                ) : (
                  <><i className="fas fa-check"></i> Confirm & Upload</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;