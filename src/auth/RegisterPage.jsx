import { useState, useCallback, useId } from 'react';
import { useAuth } from './AuthContext';
import AuthLayout from './AuthLayout';

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const usernameId = useId();
  const passwordId = useId();
  const confirmId = useId();

  // Password strength calculator
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['#ff5c6c', '#ff9f43', '#feca57', '#2ed573', '#1dd1a1'];

  const validate = useCallback(() => {
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Minimum 3 characters';
    else if (!/^[a-zA-Z0-9_-]+$/.test(username))
      errors.username = 'Only letters, numbers, underscores, and hyphens';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Minimum 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      errors.password = 'Need uppercase, lowercase, and a number';

    if (password !== confirmPassword) errors.confirm = 'Passwords do not match';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, password, confirmPassword]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      if (!validate()) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      setSubmitting(true);
      try {
        await register(username.trim(), password);
        // navigate('/dashboard');
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Registration failed';
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } finally {
        setSubmitting(false);
      }
    },
    [validate, register, username, password]
  );

  return (
    <AuthLayout>
      <div className={`auth-card ${shake ? 'shake' : ''}`}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#6c8cff" fillOpacity="0.15" />
              <path
                d="M10 16L14 20L22 12"
                stroke="#6c8cff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>DevTrust</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Set up your credentials to get started</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Username */}
          <div className="field-group">
            <label htmlFor={usernameId}>Username</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.333 14v-1.333A2.667 2.667 0 0010.667 10H5.333a2.667 2.667 0 00-2.666 2.667V14M8 7.333A2.667 2.667 0 108 2a2.667 2.667 0 000 5.333z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                id={usernameId}
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username)
                    setFieldErrors((f) => ({ ...f, username: undefined }));
                }}
                placeholder="Choose a username"
                aria-invalid={!!fieldErrors.username}
                disabled={submitting}
              />
            </div>
            {fieldErrors.username && (
              <span className="field-error" role="alert">{fieldErrors.username}</span>
            )}
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor={passwordId}>Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 7.333V4a2.667 2.667 0 015.333 0v3.333M2.667 7.333h10.666c.737 0 1.334.597 1.334 1.334v5.333c0 .737-.597 1.333-1.334 1.333H2.667A1.333 1.333 0 011.333 14V8.667c0-.737.597-1.334 1.334-1.334z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password)
                    setFieldErrors((f) => ({ ...f, password: undefined }));
                }}
                placeholder="Create a strong password"
                aria-invalid={!!fieldErrors.password}
                disabled={submitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Strength meter */}
            {password && (
              <div className="strength-meter">
                <div className="strength-bars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="strength-bar"
                      style={{
                        background: i < strength ? strengthColors[strength - 1] : 'rgba(255,255,255,0.06)',
                      }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength - 1] || '#5b6472' }}>
                  {strength > 0 ? strengthLabels[strength - 1] : 'Too short'}
                </span>
              </div>
            )}

            {fieldErrors.password && (
              <span className="field-error" role="alert">{fieldErrors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label htmlFor={confirmId}>Confirm Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 7.333V4a2.667 2.667 0 015.333 0v3.333M2.667 7.333h10.666c.737 0 1.334.597 1.334 1.334v5.333c0 .737-.597 1.333-1.334 1.333H2.667A1.333 1.333 0 011.333 14V8.667c0-.737.597-1.334 1.334-1.334z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                id={confirmId}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirm)
                    setFieldErrors((f) => ({ ...f, confirm: undefined }));
                }}
                placeholder="Confirm your password"
                aria-invalid={!!fieldErrors.confirm}
                disabled={submitting}
              />
            </div>
            {fieldErrors.confirm && (
              <span className="field-error" role="alert">{fieldErrors.confirm}</span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="global-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 5.333V8M8 10.667h.007M14.667 8A6.667 6.667 0 111.333 8a6.667 6.667 0 0113.334 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? (
              <span className="btn-content">
                <span className="spinner" />
                Creating account...
              </span>
            ) : (
              <span className="btn-content">
                Create Account
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="btn-arrow">
                  <path
                    d="M3.333 8h9.334M9.333 5.333L12 8l-2.667 2.667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </button>

          

                    <p className="auth-footer">
            Already have an account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => window.location.href = '/login'}
            >
              Sign in
            </button>
          </p>
        </form>
      </div>

      <style>{`
              .auth-footer {
          text-align: center;
          font-size: 13px;
          color: #5b6472;
          margin: 0;
        }

        .auth-link-btn {
          background: none;
          border: none;
          color: #6c8cff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 2px;
          font-family: inherit;
          transition: color 0.2s;
        }

        .auth-link-btn:hover {
          color: #8aa4ff;
          text-decoration: underline;
        }
        .auth-card {
          background: rgba(18, 22, 31, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(108, 140, 255, 0.05);
          transition: transform 0.2s ease;
        }

        .auth-card.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
          40%, 60% { transform: translate3d(3px, 0, 0); }
        }

        .auth-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .auth-logo span {
          font-size: 20px;
          font-weight: 700;
          color: #e7eaf0;
          letter-spacing: -0.5px;
        }

        .auth-title {
          font-size: 24px;
          font-weight: 700;
          color: #e7eaf0;
          margin: 0 0 8px 0;
          letter-spacing: -0.3px;
        }

        .auth-subtitle {
          font-size: 14px;
          color: #5b6472;
          margin: 0;
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-group label {
          font-size: 13px;
          font-weight: 600;
          color: #8b93a4;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #5b6472;
          pointer-events: none;
          z-index: 1;
        }

        .input-wrapper input {
          width: 100%;
          padding: 11px 12px 11px 38px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 14, 20, 0.6);
          color: #e7eaf0;
          font-size: 14px;
          box-sizing: border-box;
          transition: all 0.2s ease;
          outline: none;
        }

        .input-wrapper input:hover {
          border-color: rgba(255, 255, 255, 0.12);
        }

        .input-wrapper input:focus {
          border-color: #6c8cff;
          background: rgba(10, 14, 20, 0.8);
          box-shadow: 0 0 0 3px rgba(108, 140, 255, 0.1);
        }

        .input-wrapper input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .input-wrapper input[aria-invalid="true"] {
          border-color: #ff5c6c;
          box-shadow: 0 0 0 3px rgba(255, 92, 108, 0.1);
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #5b6472;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .toggle-password:hover {
          color: #8b93a4;
          background: rgba(255, 255, 255, 0.05);
        }

        .strength-meter {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          transition: background 0.3s ease;
        }

        .strength-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          min-width: 70px;
          text-align: right;
          transition: color 0.3s ease;
        }

        .field-error {
          font-size: 12px;
          color: #ff5c6c;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .global-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(255, 92, 108, 0.08);
          border: 1px solid rgba(255, 92, 108, 0.15);
          border-radius: 10px;
          font-size: 13px;
          color: #ff5c6c;
          animation: slideIn 0.3s ease;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #6c8cff 0%, #5a7af0 100%);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          margin-top: 4px;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(108, 140, 255, 0.3);
        }

        .submit-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-arrow {
          transition: transform 0.2s;
        }

        .submit-btn:hover .btn-arrow {
          transform: translateX(2px);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          text-align: center;
          font-size: 13px;
          color: #5b6472;
          margin: 0;
        }

        .auth-link {
          color: #6c8cff;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .auth-link:hover {
          color: #8aa4ff;
          text-decoration: underline;
        }
      `}</style>
    </AuthLayout>
  );
}