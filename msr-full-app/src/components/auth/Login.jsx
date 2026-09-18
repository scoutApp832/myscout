import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './Login.css';

/* =========================================================
   ICONS
========================================================= */

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M4 5H20C21.1 5 22 5.9 22 7V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V7C2 5.9 2.9 5 4 5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 7L12 13L2 7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <rect
      x="4"
      y="10"
      width="16"
      height="11"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M8 10V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M12 14V17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const EyeIcon = ({ visible }) =>
  visible ? (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M2 12C2 12 5.5 19 12 19C13.5 19 14.8 18.7 16 18.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M19 12H5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 19L5 12L12 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 5L19 12L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3L20 6V11.5C20 16.5 16.8 20.2 12 22C7.2 20.2 4 16.5 4 11.5V6L12 3Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 12L10.8 14.3L15.8 9.3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M12 8V12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

/* =========================================================
   LOGIN
========================================================= */

const Login = () => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const translations = {
    en: {
      welcomeBrand: 'WELCOME TO MYSCOUT RWANDA',
      welcome: 'Welcome Back',
      welcomeText: 'Sign in to continue to your account',

      emailAddress: 'Email Address',
      emailPlaceholder: 'Enter your email address',

      password: 'Password',
      passwordPlaceholder: 'Enter your password',

      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',

      signIn: 'SIGN IN',
      signingIn: 'SIGNING IN...',

      noAccount: "Don't have an account?",
      createOne: 'Create one',

      backHome: 'Back to Home',

      secureAccess: 'Secure Access',
      secureText:
        'Your account information is protected with secure authentication.',

      authenticationFailed: 'Authentication failed',
      emailRequired: 'Email address is required.',
      emailInvalid: 'Please enter a valid email address.',
      passwordRequired: 'Password is required.',
      invalidCredentials: 'Invalid email or password.',
      generalError: 'Something went wrong. Please try again.',

      showPassword: 'Show password',
      hidePassword: 'Hide password'
    },

    rw: {
      welcomeBrand: 'IKAZE KURI MYSCOUT RWANDA',
      welcome: 'Murakaza Neza',
      welcomeText: 'Injira kugira ngo ukomeze kuri konti yawe',

      emailAddress: 'Aderesi ya Email',
      emailPlaceholder: 'Andika aderesi ya email',

      password: 'Ijambo ry’ibanga',
      passwordPlaceholder: 'Andika ijambo ry’ibanga',

      rememberMe: 'Nyibuke',
      forgotPassword: 'Wibagiwe ijambo ry’ibanga?',

      signIn: 'INJIRA',
      signingIn: 'URI KWINJIRA...',

      noAccount: 'Ntabwo ufite konti?',
      createOne: 'Fungura konti',

      backHome: 'Subira Ahabanza',

      secureAccess: 'Umutekano Wizewe',
      secureText:
        'Amakuru ya konti yawe arinzwe hakoreshejwe uburyo bwizewe bwo kwinjira.',

      authenticationFailed: 'Kwinjira byanze',
      emailRequired: 'Aderesi ya email irakenewe.',
      emailInvalid: 'Andika aderesi ya email iboneye.',
      passwordRequired: 'Ijambo ry’ibanga rirakenewe.',
      invalidCredentials: 'Email cyangwa ijambo ry’ibanga si byo.',
      generalError: 'Hari ikibazo cyabaye. Ongera ugerageze.',

      showPassword: 'Erekana ijambo ry’ibanga',
      hidePassword: 'Hisha ijambo ry’ibanga'
    }
  };

  const t = translations[language] || translations.en;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================================================
     IMAGE PATHS
  ========================================================= */

  const backgroundImagePath =
    `${process.env.PUBLIC_URL}/flog.png`;

  const logoImagePath =
    `${process.env.PUBLIC_URL}/logo1.png`;

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: ''
      }));
    }

    if (loginError) {
      setLoginError('');
    }
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();

    if (!email) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(
        formData.email.trim(),
        formData.password
      );

      if (result?.success) {
        navigate('/dashboard');
      } else {
        setLoginError(
          result?.message || t.invalidCredentials
        );
      }
    } catch (error) {
      console.error('Login error:', error);

      setLoginError(
        error?.response?.data?.message ||
          error?.message ||
          t.generalError
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="login-page">

      {/* REAL PUBLIC IMAGE:
          C:\Users\user\OneDrive\Desktop\APP\MSR\
          frontend\msr-full-app\public\flog.png
      */}
      <div
        className="login-background"
        style={{
          backgroundImage: `url("${backgroundImagePath}")`
        }}
      />

      <div className="login-overlay" />

      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />

      <div className="login-wrapper">

        <section className="login-card">

          {/* BACK TO HOME */}
          <Link to="/" className="back-home">
            <span className="back-home-icon">
              <ArrowLeft />
            </span>

            <span>{t.backHome}</span>
          </Link>

          {/* BRAND */}
          <div className="login-brand">

            <div className="welcome-brand">
              {t.welcomeBrand}
            </div>

            {/* REAL LOGO:
                C:\Users\user\OneDrive\Desktop\APP\MSR\
                frontend\msr-full-app\public\logo1.png
            */}
            <div className="logo-container">
              <img
                src={logoImagePath}
                alt="MyScout Rwanda"
                className="login-logo"
              />
            </div>

          </div>

          {/* HEADER */}
          <div className="login-header">
            <h1>{t.welcome}</h1>
            <p>{t.welcomeText}</p>
          </div>

          {/* ERROR */}
          {loginError && (
            <div className="login-error" role="alert">

              <div className="error-icon">
                <AlertIcon />
              </div>

              <div className="error-content">
                <strong>
                  {t.authenticationFailed}
                </strong>

                <span>{loginError}</span>
              </div>

            </div>
          )}

          {/* FORM */}
          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                {t.emailAddress}
              </label>

              <div
                className={`input-wrapper ${
                  errors.email ? 'input-error' : ''
                }`}
              >

                <span className="input-icon">
                  <EmailIcon />
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.email)}
                />

              </div>

              {errors.email && (
                <span className="field-error">
                  {errors.email}
                </span>
              )}

            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                {t.password}
              </label>

              <div
                className={`input-wrapper ${
                  errors.password ? 'input-error' : ''
                }`}
              >

                <span className="input-icon">
                  <LockIcon />
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.password)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? t.hidePassword
                      : t.showPassword
                  }
                >
                  <EyeIcon visible={showPassword} />
                </button>

              </div>

              {errors.password && (
                <span className="field-error">
                  {errors.password}
                </span>
              )}

            </div>

            {/* OPTIONS */}
            <div className="login-options">

              <label className="remember-wrapper">

                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />

                <span className="custom-checkbox">
                  <span />
                </span>

                <span className="remember-text">
                  {t.rememberMe}
                </span>

              </label>

              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                {t.forgotPassword}
              </Link>

            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              className={`sign-in-button ${
                isLoading ? 'loading' : ''
              }`}
              disabled={isLoading}
            >

              {isLoading ? (
                <>
                  <span className="loading-spinner" />
                  <span>{t.signingIn}</span>
                </>
              ) : (
                <>
                  <span>{t.signIn}</span>

                  <span className="button-arrow">
                    <ArrowRight />
                  </span>
                </>
              )}

            </button>

          </form>

          {/* REGISTER */}
          <div className="register-section">

            <span>{t.noAccount}</span>

            <Link to="/register">
              {t.createOne}
            </Link>

          </div>

          {/* SECURE ACCESS */}
          <div className="secure-access">

            <div className="secure-icon">
              <ShieldIcon />
            </div>

            <div className="secure-content">

              <strong>
                {t.secureAccess}
              </strong>

              <span>
                {t.secureText}
              </span>

            </div>

          </div>

          {/* FOOTER */}
          <div className="login-footer">

            <span>
              © {new Date().getFullYear()} MyScout Rwanda
            </span>

            <span className="footer-dot">•</span>

            <span>
              Rwanda Scouts Association
            </span>

          </div>

        </section>

      </div>

    </main>
  );
};

export default Login;
