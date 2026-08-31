import { useState, useCallback, useId, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from './AuthContext';
import AuthLayout from './AuthLayout';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('checking'); // 'checking' | 'login' | 'setup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const usernameId = useId();
  const passwordId = useId();

  // Check setup status
  useEffect(() => {
    let cancelled = false;
    const check = async (retries = 2) => {
      try {
        const res = await api.get('/auth/setup-status', { timeout: 5000 });
        if (!cancelled) setMode(res.data.needsSetup ? 'setup' : 'login');
      } catch {
        if (retries > 0 && !cancelled) {
          setTimeout(() => check(retries - 1), 1500);
        } else if (!cancelled) {
          setMode('login');
          setError('Cannot reach backend. You can still try to sign in.');
        }
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  const validate = useCallback(() => {
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Minimum 3 characters';
    else if (!/^[a-zA-Z0-9_-]+$/.test(username))
      errors.username = 'Only letters, numbers, underscores, and hyphens';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Minimum 8 characters';
    else if (mode === 'setup' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Need uppercase, lowercase, and a number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, password, mode]);

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
        if (mode === 'setup') {
          await register(username.trim(), password);
        } else {
          await login(username.trim(), password);
        }
        // Navigate to dashboard here
        // navigate('/dashboard');
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Authentication failed';
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } finally {
        setSubmitting(false);
      }
    },
    [validate, mode, register, login, username, password]
  );

  const isBusy = submitting || mode === 'checking';

  return (
    <AuthLayout>
      <div className={`auth-card ${shake ? 'shake' : ''}`}>
        {/* Header */}
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
          <h1 className="auth-title">
            {mode === 'checking'
              ? 'Loading...'
              : mode === 'setup'
              ? 'Create Admin Account'
              : 'Welcome Back'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'checking'
              ? 'Checking system status...'
              : mode === 'setup'
              ? 'First-time setup — create your admin credentials'
              : 'Sign in to access your monitoring dashboard'}
          </p>
        </div>

        {/* Loading State */}
        {mode === 'checking' ? (
          <div className="auth-skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ) : (
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
                  placeholder="Enter username"
                  aria-invalid={!!fieldErrors.username}
                  aria-describedby={fieldErrors.username ? `${usernameId}-error` : undefined}
                  disabled={isBusy}
                />
              </div>
              {fieldErrors.username && (
                <span id={`${usernameId}-error`} className="field-error" role="alert">
                  {fieldErrors.username}
                </span>
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
                  autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((f) => ({ ...f, password: undefined }));
                  }}
                  placeholder={mode === 'setup' ? 'Create strong password' : 'Enter password'}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? `${passwordId}-error` : undefined}
                  disabled={isBusy}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M1.333 8s2.667-5.333 6.667-5.333S14.667 8 14.667 8s-2.667 5.333-6.667 5.333S1.333 8 1.333 8z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2.667 13.333L13.333 2.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M1.333 8s2.667-5.333 6.667-5.333S14.667 8 14.667 8s-2.667 5.333-6.667 5.333S1.333 8 1.333 8z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <span id={`${passwordId}-error`} className="field-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* Global Error */}
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
            <button type="submit" className="submit-btn" disabled={isBusy}>
              {submitting ? (
                <span className="btn-content">
                  <span className="spinner" />
                  {mode === 'setup' ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                <span className="btn-content">
                  {mode === 'setup' ? 'Create Admin Account' : 'Sign In'}
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

            {/* Setup hint */}
            {mode === 'setup' && (
              <p className="setup-hint">
                This is a one-time setup. After creating the admin account, registration will be permanently disabled.
              </p>
            )}

                        {/* Register link */}
            <div className="auth-footer">
              <span>Don't have an account?</span>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => window.location.href = '/register'}
              >
                Create account
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
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

                .auth-footer {
          text-align: center;
          font-size: 13px;
          color: #5b6472;
          margin-top: 8px;
        }

        .auth-link-btn {
          background: none;
          border: none;
          color: #6c8cff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          font-family: inherit;
          transition: color 0.2s;
        }

        .auth-link-btn:hover {
          color: #8aa4ff;
          text-decoration: underline;
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

        .field-error {
          font-size: 12px;
          color: #ff5c6c;
          display: flex;
          align-items: center;
          gap: 4px;
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

        .setup-hint {
          text-align: center;
          font-size: 12px;
          color: #5b6472;
          margin: 0;
          line-height: 1.5;
          padding: 0 8px;
        }

        .auth-skeleton {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 8px 0;
        }

        .skeleton-line {
          height: 44px;
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          border-radius: 10px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-line.short {
          width: 60%;
          height: 16px;
          align-self: center;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </AuthLayout>
  );
}