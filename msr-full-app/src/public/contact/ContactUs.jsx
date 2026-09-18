// src/public/contact/ContactUs.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-container">
          <Link to="/" className="contact-back">← Back to Home</Link>
          <span className="contact-eyebrow">GET IN TOUCH</span>
          <h1>Contact Us</h1>
          <p>
            Have a question, partnership proposal, Scout inquiry or idea?
            We would like to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-layout">
            {/* Left - Contact Information */}
            <div className="contact-info">
              <div className="contact-info-header">
                <span className="contact-info-eyebrow">CONTACT</span>
                <h2>Let's Connect</h2>
                <p>Reach out to us through any of the following channels</p>
              </div>

              <div className="contact-items">
                <div className="contact-item">
                  <div className="contact-item-icon">📍</div>
                  <div>
                    <h3>Office</h3>
                    <p>Rwanda Scout Association<br />Kigali, Rwanda</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">📧</div>
                  <div>
                    <h3>Email</h3>
                    <p>
                      <a href="mailto:info@myscoutrwanda.org">info@myscoutrwanda.org</a>
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">📞</div>
                  <div>
                    <h3>Phone</h3>
                    <p>
                      <a href="tel:+250788123456">+250 788 123 456</a>
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">💬</div>
                  <div>
                    <h3>MSR Support</h3>
                    <p>
                      For MyScout Rwanda technical support, membership or
                      account questions, send us a message.
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-social">
                <span>Follow us:</span>
                <div className="social-links">
                  <a href="#" className="social-link" aria-label="Facebook">📘</a>
                  <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                  <a href="#" className="social-link" aria-label="Instagram">📸</a>
                  <a href="#" className="social-link" aria-label="YouTube">▶️</a>
                </div>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="contact-form-card">
              <h2>Send Us a Message</h2>
              <p>We'll get back to you within 24 hours</p>

              {submitted && (
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  <div>
                    <strong>Thank you!</strong>
                    <p>Your message has been submitted successfully. We'll get back to you soon.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+250 788 123 456"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject <span className="required">*</span></label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help?"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message <span className="required">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Write your message..."
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <span className="arrow">→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map">
        <div className="contact-container">
          <div className="map-placeholder">
            <span className="map-icon">📍</span>
            <h3>Find Us</h3>
            <p>Rwanda Scout Association Headquarters</p>
            <p className="map-address">Kigali, Rwanda</p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="map-link"
            >
              View on Google Maps →
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .contact-page {
          background: #f8f9fa;
          min-height: calc(100vh - 200px);
        }
        .contact-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero */
        .contact-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .contact-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 8px 0;
        }
        .contact-hero p {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          opacity: 0.9;
          max-width: 600px;
        }
        .contact-back {
          color: #FFD100;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 16px;
        }
        .contact-back:hover {
          text-decoration: underline;
        }
        .contact-eyebrow {
          display: inline-block;
          background: #FFD100;
          color: #002B5C;
          padding: 3px 14px;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Contact Layout */
        .contact-section {
          padding: 50px 0;
        }
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
        }

        /* Contact Info */
        .contact-info {
          background: white;
          padding: 32px;
          border-radius: 16px;
          border: 1px solid #e8d5f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .contact-info-eyebrow {
          display: inline-block;
          background: #6A1B9A;
          color: white;
          padding: 3px 14px;
          border-radius: 16px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .contact-info-header h2 {
          color: #002B5C;
          font-size: 1.8rem;
          margin: 0 0 4px 0;
        }
        .contact-info-header p {
          color: #6B7280;
          margin: 0 0 24px 0;
        }

        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contact-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 12px 16px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .contact-item:hover {
          background: #f8f0fa;
        }
        .contact-item-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          width: 40px;
          text-align: center;
        }
        .contact-item h3 {
          color: #002B5C;
          margin: 0 0 2px 0;
          font-size: 1rem;
        }
        .contact-item p {
          color: #6B7280;
          margin: 0;
          font-size: 0.95rem;
        }
        .contact-item a {
          color: #6A1B9A;
          text-decoration: none;
        }
        .contact-item a:hover {
          text-decoration: underline;
        }

        .contact-social {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e8d5f0;
        }
        .contact-social span {
          color: #6B7280;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 8px;
        }
        .social-links {
          display: flex;
          gap: 12px;
        }
        .social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f8f0fa;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }
        .social-link:hover {
          background: #6A1B9A;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(106,27,154,0.3);
        }

        /* Contact Form */
        .contact-form-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          border: 1px solid #e8d5f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .contact-form-card h2 {
          color: #002B5C;
          font-size: 1.8rem;
          margin: 0 0 4px 0;
        }
        .contact-form-card > p {
          color: #6B7280;
          margin: 0 0 24px 0;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group label {
          color: #002B5C;
          font-weight: 500;
          font-size: 0.9rem;
        }
        .required {
          color: #D32F2F;
        }
        .form-input,
        .form-textarea {
          padding: 10px 14px;
          border: 1px solid #e8d5f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-family: inherit;
          background: #faf8fc;
        }
        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #6A1B9A;
          box-shadow: 0 0 0 3px rgba(106,27,154,0.1);
          background: white;
        }
        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          padding: 14px 32px;
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(106,27,154,0.35);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .submit-btn .arrow {
          transition: transform 0.3s ease;
        }
        .submit-btn:hover:not(:disabled) .arrow {
          transform: translateX(4px);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Success Message */
        .success-message {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          background: #e8f5e9;
          border-radius: 10px;
          border-left: 4px solid #2E7D32;
          margin-bottom: 20px;
        }
        .success-icon {
          font-size: 1.5rem;
        }
        .success-message strong {
          color: #1B5E20;
        }
        .success-message p {
          color: #2E7D32;
          margin: 0;
          font-size: 0.95rem;
        }

        /* Map Section */
        .contact-map {
          padding: 0 0 50px 0;
        }
        .map-placeholder {
          background: linear-gradient(135deg, #f0eaf5, #e8d5f0);
          padding: 60px 40px;
          border-radius: 16px;
          text-align: center;
          border: 1px solid #e8d5f0;
        }
        .map-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 12px;
        }
        .map-placeholder h3 {
          color: #002B5C;
          margin: 0;
        }
        .map-placeholder p {
          color: #6B7280;
          margin: 4px 0;
        }
        .map-address {
          font-weight: 500;
          color: #002B5C !important;
        }
        .map-link {
          display: inline-block;
          margin-top: 12px;
          color: #6A1B9A;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .map-link:hover {
          text-decoration: underline;
          transform: translateX(4px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .contact-layout {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .contact-hero {
            padding: 40px 20px;
          }
          .contact-info,
          .contact-form-card {
            padding: 24px;
          }
          .map-placeholder {
            padding: 40px 20px;
          }
        }
        @media (max-width: 480px) {
          .contact-items {
            gap: 12px;
          }
          .contact-item {
            padding: 10px 12px;
          }
          .contact-item-icon {
            font-size: 1.2rem;
            width: 32px;
          }
          .submit-btn {
            padding: 12px 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;