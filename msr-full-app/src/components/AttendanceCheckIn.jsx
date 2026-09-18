import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AttendanceCheckIn = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [event, setEvent] = useState(null);
  const [email, setEmail] = useState('');
  const [sin, setSin] = useState('');
  const [fullName, setFullName] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [apiError, setApiError] = useState(null);

  // ============================================
  // VERIFY LINK ON LOAD
  // ============================================
  useEffect(() => {
    if (token) {
      verifyLink();
    } else {
      setError('Invalid attendance link: No token provided');
      setVerifying(false);
      setLoading(false);
    }
  }, [token]);

  const verifyLink = async () => {
    try {
      setVerifying(true);
      setError('');
      setApiError(null);
      
      console.log('🔍 Verifying attendance link with token:', token);
      
      if (!token) {
        setError('Invalid attendance link: No token provided');
        setVerifying(false);
        setLoading(false);
        return;
      }
      
      console.log('🔍 API_URL:', API_URL);
      
      // ✅ Use ONLY the public endpoint since it works
      const url = `${API_URL}/public/attendance/verify/${token}`;
      console.log(`📡 Calling: ${url}`);
      
      try {
        const response = await axios.get(url, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📥 Response:', response.data);
        
        // ✅ Check for valid response from public endpoint
        if (response.data.valid === true && response.data.event) {
          const eventData = response.data.event;
          setEvent(eventData);
          setError('');
          
          // Calculate time left
          if (eventData && !eventData.is_expired && eventData.expires_at) {
            const now = new Date();
            const expires = new Date(eventData.expires_at);
            const minutesLeft = Math.floor((expires - now) / 60000);
            setTimeLeft(minutesLeft > 0 ? minutesLeft : 0);
          }
          
          // If expired, show message
          if (eventData && eventData.is_expired) {
            setError('Expired Attendance Link\n\nThis attendance link has expired.\n\n• Attendance links are valid for 30 minutes only\n• Please contact the event organizer for a new link');
            setEvent(null);
          }
        } else {
          setError(response.data.message || 'Invalid or expired attendance link');
          setEvent(null);
        }
      } catch (apiErr) {
        console.error('❌ API call failed:', apiErr);
        
        if (apiErr.code === 'ERR_NETWORK') {
          setError('Connection Error\n\nUnable to connect to the server.\n\n• Make sure the backend server is running (node server.js)\n• Check that the server is on port 5000\n• Try again later');
          setApiError('network');
        } else if (apiErr.code === 'ECONNABORTED') {
          setError('Request Timeout\n\nThe server took too long to respond.\n\n• Try again later\n• Check your internet connection');
          setApiError('timeout');
        } else if (apiErr.response?.status === 404) {
          setError('Invalid Attendance Link\n\nThe attendance link you are trying to use could not be found.\n\n• The link may have expired\n• The link may have been removed');
          setApiError('notfound');
        } else if (apiErr.response?.status === 400 && apiErr.response?.data?.expired) {
          setError('Expired Attendance Link\n\nThis attendance link has expired.\n\n• Attendance links are valid for 30 minutes only\n• Please contact the event organizer for a new link');
          setApiError('expired');
        } else {
          setError(apiErr.response?.data?.message || apiErr.message || 'Unable to verify attendance link. Please try again.');
          setApiError('unknown');
        }
        setEvent(null);
      }
    } catch (err) {
      console.error('❌ Outer verify error:', err);
      setError('An unexpected error occurred. Please try again.');
      setEvent(null);
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  // ============================================
  // HANDLE CHECK-IN
  // ============================================
  const handleCheckIn = async (e) => {
    e.preventDefault();
    
    if (!email && !sin) {
      setError('Please enter either your registered email address or Scout Identification Number (SIN).');
      return;
    }

    setCheckingIn(true);
    setError('');
    setSuccess('');
    setApiError(null);

    try {
      console.log('📝 Checking in with token:', token);
      console.log('📝 Email:', email, 'SIN:', sin);
      
      // ✅ Use ONLY the public endpoint
      const url = `${API_URL}/public/attendance/check-in/${token}`;
      console.log(`📡 Calling: ${url}`);
      
      const response = await axios.post(url, {
        email: email || undefined,
        sin: sin || undefined
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Check-in response:', response.data);
      
      if (response.data.success) {
        setSuccess(response.data.message || '✅ Attendance marked successfully!');
        setCheckedIn(true);
        
        if (response.data.member) {
          setFullName(response.data.member.fullName || response.data.member.name || '');
        }
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } else {
        setError(response.data.message || 'Check-in failed. Please try again.');
      }
      
    } catch (err) {
      console.error('❌ Check-in error:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Connection Error\n\nUnable to connect to the server.\n\n• Please check your internet connection\n• Make sure the server is running');
      } else if (err.response?.status === 400) {
        if (err.response?.data?.expired) {
          setError('Expired Attendance Link\n\nThis attendance link has expired.\n\n• Links are valid for 30 minutes\n• Please request a new link from the event organizer');
        } else {
          setError(err.response?.data?.message || 'Unable to check in. Please verify your information and try again.');
        }
      } else if (err.response?.status === 404) {
        setError('Event Not Found\n\nThe event for this attendance link could not be found.');
      } else {
        setError(err.response?.data?.message || 'Unable to complete check-in. Please try again.');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  // ============================================
  // FORMAT DATE
  // ============================================
  const formatDate = (date) => {
    if (!date) return 'TBD';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'TBD';
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  // ============================================
  // RENDER ERROR WITH PROFESSIONAL FORMATTING
  // ============================================
  const renderError = () => {
    if (!error) return null;
    
    if (error.includes('\n')) {
      const lines = error.split('\n');
      return (
        <div className="checkin-error-card">
          <div className="checkin-error-header">
            <i className="fas fa-exclamation-circle"></i>
            <h3>{lines[0]}</h3>
          </div>
          <div className="checkin-error-body">
            {lines.slice(1).map((line, index) => {
              if (line.trim() === '') return <br key={index} />;
              if (line.startsWith('•')) {
                return <p key={index} className="error-bullet">{line}</p>;
              }
              return <p key={index} className="error-text">{line}</p>;
            })}
          </div>
        </div>
      );
    }
    
    return (
      <div className="checkin-error">
        <i className="fas fa-exclamation-circle"></i>
        <span>{error}</span>
      </div>
    );
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (verifying) {
    return (
      <div className="checkin-container">
        <div className="checkin-card loading-card">
          <div className="checkin-loading">
            <div className="spinner-large"></div>
            <h3>Verifying Attendance Link</h3>
            <p>Please wait while we confirm your access</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE - Invalid Link
  // ============================================
  if (error && !event) {
    return (
      <div className="checkin-container">
        <div className="checkin-card error-card">
          <div className="checkin-error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          {renderError()}
          {apiError === 'network' && (
            <div className="error-actions">
              <button 
                className="btn-primary btn-block"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-sync"></i> Retry
              </button>
            </div>
          )}
          <div className="error-actions">
            <button 
              className="btn-primary btn-block"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-home"></i> Return to Home
            </button>
            <button 
              className="btn-secondary btn-block"
              onClick={() => {
                setError('');
                verifyLink();
              }}
            >
              <i className="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // SUCCESS STATE - Checked In
  // ============================================
  if (checkedIn) {
    return (
      <div className="checkin-container">
        <div className="checkin-card success-card">
          <div className="checkin-success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Check-in Successful!</h2>
          <div className="success-message">
            <p>{success || 'You have been successfully checked in!'}</p>
          </div>
          
          {fullName && (
            <div className="checkin-user-info">
              <p><strong>Welcome, {fullName}!</strong></p>
            </div>
          )}
          
          <div className="checkin-event-info">
            <h4>Event Details</h4>
            <p><strong>{event?.title}</strong></p>
            <p><i className="fas fa-calendar"></i> {formatDate(event?.start_date)}</p>
            {event?.location && (
              <p><i className="fas fa-map-marker-alt"></i> {event?.location}</p>
            )}
            <p className="checkin-time">
              <i className="fas fa-clock"></i> 
              Checked in at: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="checkin-redirect">
            <p>Redirecting to your dashboard in 5 seconds...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
          
          <button 
            className="btn-primary btn-block"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-arrow-right"></i> Go to Dashboard Now
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // CHECK-IN FORM
  // ============================================
  return (
    <div className="checkin-container">
      <div className="checkin-card">
        {/* Header */}
        <div className="checkin-header">
          <div className="checkin-logo">
            <span className="logo-icon">⛺</span>
            <span className="logo-text">Scout Attendance</span>
          </div>
          <h2>Event Check-in</h2>
          <p className="checkin-subtitle">Please verify your identity to check in</p>
        </div>

        {/* Event Info */}
        <div className="checkin-event-info">
          <div className="event-badge">
            <span className="badge-status">🔴 LIVE</span>
          </div>
          <h3>{event?.title || 'Event'}</h3>
          <div className="event-details">
            <p>
              <i className="fas fa-calendar-alt"></i>
              <span>{formatDate(event?.start_date)}</span>
            </p>
            {event?.start_date && (
              <p>
                <i className="fas fa-clock"></i>
                <span>{formatTime(event?.start_date)}</span>
              </p>
            )}
            {event?.location && (
              <p>
                <i className="fas fa-map-marker-alt"></i>
                <span>{event?.location}</span>
              </p>
            )}
            {event?.venue && event?.venue !== event?.location && (
              <p>
                <i className="fas fa-building"></i>
                <span>{event?.venue}</span>
              </p>
            )}
            {timeLeft !== null && timeLeft > 0 && (
              <p className="time-left">
                <i className="fas fa-hourglass-half"></i>
                <span>⏳ Link expires in <strong>{timeLeft} minutes</strong></span>
              </p>
            )}
          </div>
        </div>

        {/* Check-in Form */}
        <form onSubmit={handleCheckIn} className="checkin-form">
          <div className="form-instructions">
            <p>Enter <strong>either</strong> your registered email address <strong>OR</strong> your Scout Identification Number (SIN)</p>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email address"
              className="checkin-input"
              disabled={checkingIn}
            />
          </div>

          <div className="form-divider">
            <span>OR</span>
          </div>

          <div className="form-group">
            <label htmlFor="sin">
              <i className="fas fa-id-card"></i> SIN (Scout Identification Number)
            </label>
            <input
              id="sin"
              type="text"
              value={sin}
              onChange={(e) => setSin(e.target.value.toUpperCase())}
              placeholder="e.g., MSR-2024-0001"
              className="checkin-input"
              disabled={checkingIn}
            />
          </div>

          {error && renderError()}

          <button 
            type="submit" 
            className="btn-checkin"
            disabled={checkingIn || (!email && !sin)}
          >
            {checkingIn ? (
              <>
                <span className="spinner-small"></span>
                Checking in...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Check In Now
              </>
            )}
          </button>

          <p className="checkin-help">
            <i className="fas fa-info-circle"></i>
            Having trouble? Contact your event organizer for assistance.
          </p>
        </form>
      </div>

      <style jsx>{`
        .checkin-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px;
        }

        .checkin-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }

        .checkin-card.loading-card {
          text-align: center;
          padding: 60px 40px;
        }

        .checkin-card.error-card {
          max-width: 520px;
        }

        .checkin-card.success-card {
          text-align: center;
        }

        .checkin-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #6A1B9A;
        }

        .checkin-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .checkin-header h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          color: #1a1a1a;
        }

        .checkin-subtitle {
          margin: 0;
          color: #6B7280;
          font-size: 14px;
        }

        .checkin-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .checkin-loading h3 {
          margin: 0;
          color: #1a1a1a;
        }

        .checkin-loading p {
          margin: 0;
          color: #6B7280;
          font-size: 14px;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #6A1B9A;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .checkin-event-info {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          border: 1px solid #e5e7eb;
        }

        .event-badge {
          margin-bottom: 8px;
        }

        .badge-status {
          font-size: 12px;
          font-weight: 600;
          color: #dc2626;
          animation: pulse-badge 1.5s infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .checkin-event-info h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #1a1a1a;
        }

        .event-details p {
          margin: 4px 0;
          font-size: 14px;
          color: #4a5568;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .event-details i {
          width: 18px;
          color: #6B7280;
        }

        .time-left {
          margin-top: 8px;
          padding: 8px 12px;
          background: #fef3c7;
          border-radius: 6px;
          color: #92400e;
          font-weight: 500;
        }

        .time-left i {
          color: #92400e;
        }

        .time-left strong {
          color: #dc2626;
        }

        .checkin-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-instructions {
          font-size: 13px;
          color: #6B7280;
          text-align: center;
          padding: 8px 12px;
          background: #fef3c7;
          border-radius: 8px;
        }

        .form-instructions strong {
          color: #92400e;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group label i {
          color: #6B7280;
        }

        .checkin-input {
          padding: 12px 14px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .checkin-input:focus {
          outline: none;
          border-color: #6A1B9A;
          box-shadow: 0 0 0 3px rgba(106, 27, 154, 0.2);
        }

        .checkin-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .form-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 0;
        }

        .form-divider::before,
        .form-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
          margin: 0 16px;
        }

        .checkin-error {
          padding: 12px 16px;
          background: #fef2f2;
          border-left: 4px solid #dc2626;
          border-radius: 8px;
          color: #991b1b;
          font-size: 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .checkin-error i {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .checkin-error-card {
          background: #fef2f2;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #fecaca;
        }

        .checkin-error-header {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #991b1b;
          margin-bottom: 8px;
        }

        .checkin-error-header i {
          font-size: 20px;
        }

        .checkin-error-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .checkin-error-body .error-text {
          margin: 2px 0;
          font-size: 14px;
          color: #4a5568;
        }

        .checkin-error-body .error-bullet {
          margin: 2px 0 2px 20px;
          font-size: 14px;
          color: #4a5568;
        }

        .btn-checkin {
          padding: 14px 24px;
          background: #6A1B9A;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-checkin:hover:not(:disabled) {
          background: #4A148C;
          transform: translateY(-2px);
        }

        .btn-checkin:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .checkin-help {
          text-align: center;
          font-size: 13px;
          color: #6B7280;
          margin: 0;
        }

        .checkin-help i {
          color: #6A1B9A;
        }

        .error-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #6A1B9A;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
        }

        .btn-primary:hover {
          background: #4A148C;
          transform: translateY(-2px);
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-block {
          width: 100%;
        }

        .checkin-success-icon {
          font-size: 64px;
          color: #16a34a;
          margin-bottom: 16px;
        }

        .success-card h2 {
          color: #16a34a;
          margin-bottom: 8px;
        }

        .success-message {
          color: #4a5568;
          font-size: 16px;
          margin-bottom: 16px;
        }

        .checkin-user-info {
          padding: 12px;
          background: #f0fdf4;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .checkin-user-info p {
          margin: 0;
          color: #065f46;
          font-size: 16px;
        }

        .checkin-redirect {
          margin: 16px 0;
        }

        .checkin-redirect p {
          color: #6B7280;
          font-size: 14px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress-fill {
          height: 100%;
          width: 100%;
          background: #6A1B9A;
          animation: progress 5s linear forwards;
        }

        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .checkin-error-icon {
          text-align: center;
          font-size: 48px;
          color: #dc2626;
          margin-bottom: 16px;
        }

        @media (max-width: 480px) {
          .checkin-card {
            padding: 24px;
          }

          .checkin-card h2 {
            font-size: 20px;
          }

          .error-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            flex: none;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceCheckIn;