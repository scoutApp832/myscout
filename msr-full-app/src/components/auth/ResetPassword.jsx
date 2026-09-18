// src/components/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validToken, setValidToken] = useState(true);
  const [verifying, setVerifying] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    console.log('🔑 ResetPassword component mounted');
    console.log('📝 Token from URL:', token);
    
    if (!token) {
      console.log('❌ No token found in URL');
      setValidToken(false);
      setVerifying(false);
      return;
    }
    
    // Log the token for debugging
    console.log('✅ Token found:', token);
    console.log('📤 Sending to API:', `${API_URL}/auth/reset-password/${token}`);
    
    setVerifying(false);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Submitting reset password form');
    console.log('🔑 Token being used:', token);
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('📤 Sending request to:', `${API_URL}/auth/reset-password/${token}`);
      
      const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });

      console.log('✅ Response:', response.data);

      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('❌ Reset password error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="icon error">🔒</div>
          <h2>Invalid Reset Link</h2>
          <p>The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="auth-btn" style={{ display: 'inline-flex', width: 'auto' }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/logo.jpg" alt="MSR Logo" onError={(e) => e.target.style.display = 'none'} />
            <h1>MSR</h1>
          </div>
          <h2>Create New Password</h2>
          <p>Enter your new password below</p>
        </div>

        {error && (
          <div className="auth-message error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message success">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading}
              className="form-control"
            />
            <small className="form-hint">Must be at least 8 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="fas fa-check-circle"></i> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
              className="form-control"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Resetting...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt"></i> Reset Password
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-footer">
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="auth-bg-content">
          <i className="fas fa-lock"></i>
          <h3>MyScout Rwanda</h3>
          <p>Reset Your Password</p>
          <div className="auth-bg-features">
            <span><i className="fas fa-check-circle"></i> Secure Password Reset</span>
            <span><i className="fas fa-check-circle"></i> Email Verification</span>
            <span><i className="fas fa-check-circle"></i> Account Recovery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;