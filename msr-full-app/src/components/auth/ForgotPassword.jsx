// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const validateEmail = () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email is invalid' });
      return false;
    }
    return true;
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setMessage('');
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      // ✅ Always show success message (security best practice)
      setMessage('✅ If an account exists with this email, a password reset link has been sent.');
      setMessageType('success');
      setEmail('');

      // ✅ Log the reset URL from the response (for development)
      if (response.data.resetUrl) {
        console.log('🔗 Reset URL:', response.data.resetUrl);
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      // ✅ Always show success message (security best practice)
      setMessage('✅ If an account exists with this email, a password reset link has been sent.');
      setMessageType('success');
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/logo.jpg" alt="MSR Logo" onError={(e) => e.target.style.display = 'none'} />
            <h1>MSR</h1>
          </div>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a reset link</p>
        </div>

        {message && (
          <div className={`auth-message ${messageType}`}>
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {message}
          </div>
        )}

        <form onSubmit={handleSendResetLink} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
            <small className="form-hint">
              <i className="fas fa-info-circle"></i>
              We'll send a password reset link to your email
            </small>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Sending Reset Link...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="auth-bg-content">
          <i className="fas fa-shield-alt"></i>
          <h3>MyScout Rwanda</h3>
          <p>Reset Your Password</p>
          <div className="auth-bg-features">
            <span><i className="fas fa-check-circle"></i> Secure Password Reset</span>
            <span><i className="fas fa-check-circle"></i> Email Verification</span>
            <span><i className="fas fa-check-circle"></i> Account Recovery</span>
          </div>
        </div>
      </div>

      <style>{`
        .auth-container {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }

        .auth-card {
          flex: 1;
          max-width: 480px;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: white;
          box-shadow: 2px 0 20px rgba(0,0,0,0.05);
        }

        .auth-header {
          margin-bottom: 32px;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .auth-logo img {
          height: 40px;
          width: auto;
        }

        .auth-logo h1 {
          font-size: 28px;
          font-weight: 700;
          color: #006B3F;
          margin: 0;
        }

        .auth-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .auth-header p {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }

        .auth-message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .auth-message.success {
          background: #e8f5ee;
          color: #006b3f;
          border: 1px solid #b8e5d0;
        }

        .auth-message.error {
          background: #fde8eb;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group label i {
          color: #006B3F;
          width: 16px;
        }

        .form-group input {
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          background: white;
        }

        .form-group input:focus {
          outline: none;
          border-color: #006B3F;
          box-shadow: 0 0 0 3px rgba(0,107,63,0.1);
        }

        .form-group input.error {
          border-color: #dc2626;
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc2626;
          font-size: 13px;
          margin-top: 4px;
        }

        .form-hint {
          color: #6b7280;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .auth-btn {
          padding: 12px;
          background: #006B3F;
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

        .auth-btn:hover:not(:disabled) {
          background: #004D2D;
          transform: translateY(-1px);
        }

        .auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          margin: 16px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .auth-divider span {
          padding: 0 16px;
          color: #6b7280;
          font-size: 14px;
        }

        .auth-footer {
          text-align: center;
          margin-top: 8px;
        }

        .auth-footer p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .auth-footer a {
          color: #006B3F;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        .auth-background {
          flex: 1;
          background: linear-gradient(135deg, #006B3F, #004D2D);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .auth-bg-content {
          color: white;
          text-align: center;
          max-width: 400px;
        }

        .auth-bg-content i {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .auth-bg-content h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .auth-bg-content p {
          font-size: 16px;
          opacity: 0.8;
          margin: 0 0 24px 0;
        }

        .auth-bg-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .auth-bg-features span {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          opacity: 0.9;
        }

        .auth-bg-features span i {
          font-size: 16px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .auth-card {
            max-width: 100%;
            padding: 32px 24px;
          }
          
          .auth-background {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 24px 16px;
          }
          
          .auth-header h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;