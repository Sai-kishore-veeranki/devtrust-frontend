import { useEffect, useState, useCallback, useId } from 'react';
import { useAuth } from './AuthContext';
import { api } from './AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [needsSetup, setNeedsSetup] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  
  const usernameId = useId();
  const passwordId = useId();

  // Check setup status with retry
  useEffect(() => {
    let cancelled = false;
    const checkSetup = async (retries = 2) => {
      try {
        const res = await api.get('/auth/setup-status', { timeout: 5000 });
        if (!cancelled) setNeedsSetup(res.data.needsSetup);
      } catch (err) {
        if (retries > 0 && !cancelled) {
          setTimeout(() => checkSetup(retries - 1), 1500);
        } else if (!cancelled) {
          setError('Cannot reach DevTrust backend. Please check your connection.');
          setNeedsSetup(false); // Allow manual retry via form
        }
      }
    };
    checkSetup();
    return () => { cancelled = true; };
  }, []);

  const validate = useCallback(() => {
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required';
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_-]+$/.test(username)) errors.username = 'Only letters, numbers, underscores, and hyphens allowed';
    
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (needsSetup && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and a number';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [username, password, needsSetup]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setSubmitting(true);
    try {
      if (needsSetup) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      // Navigation happens in router or parent, or use navigate() here
    } catch (err) {
      const msg = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Authentication failed. Please try again.';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  }, [validate, needsSetup, register, login, username, password]);

  const isBusy = submitting || needsSetup === null;

  return (
    <div className="login-container">
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-header">
          <div className="logo">DevTrust</div>
          <p className="subtitle">
            {needsSetup === null ? 'Checking setup status...'
              : needsSetup ? 'First run — create the admin account'
              : 'Sign in to your account'}
          </p>
        </div>

        {needsSetup === null ? (
          <div className="skeleton-loader">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label htmlFor={usernameId}>Username</label>
              <input
                id={usernameId}
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors(f => ({ ...f, username: undefined }));
                }}
                placeholder="Enter username"
                aria-invalid={!!fieldErrors.username}
                aria-describedby={fieldErrors.username ? `${usernameId}-error` : undefined}
                disabled={isBusy}
              />
              {fieldErrors.username && (
                <span id={`${usernameId}-error`} className="field-error" role="alert">
                  {fieldErrors.username}
                </span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor={passwordId}>Password</label>
              <div className="password-wrapper">
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={needsSetup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(f => ({ ...f, password: undefined }));
                  }}
                  placeholder={needsSetup ? 'Create a strong password' : 'Enter password'}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? `${passwordId}-error` : undefined}
                  disabled={isBusy}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && (
                <span id={`${passwordId}-error`} className="field-error" role="alert">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {error && (
              <div className="global-error" role="alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isBusy}
            >
              {submitting ? (
                <span className="spinner">
                  <span className="spinner-circle" />
                  {needsSetup ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                needsSetup ? 'Create admin account' : 'Sign in'
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg, #0a0e14);
          padding: 20px;
          font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        }

        .login-card {
          width: 100%;
          max-width: 360px;
          padding: 32px;
          border-radius: 16px;
          background: var(--surface, #12161f);
          border: 1px solid var(--border, #232935);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
          transition: transform 0.2s ease;
        }

        .login-card.shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .login-header {
          margin-bottom: 24px;
        }

        .logo {
          font-size: 22px;
          font-weight: 700;
          color: var(--text, #e7eaf0);
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 14px;
          color: var(--text-faint, #5b6472);
          margin: 0;
          line-height: 1.4;
        }

        .field-group {
          margin-bottom: 16px;
        }

        .field-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted, #8b93a4);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .field-group input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border, #232935);
          background: var(--bg, #0a0e14);
          color: var(--text, #e7eaf0);
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .field-group input:focus {
          border-color: var(--brand, #6c8cff);
          box-shadow: 0 0 0 3px rgba(108, 140, 255, 0.1);
        }

        .field-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .field-group input[aria-invalid="true"] {
          border-color: var(--sev-critical, #ff5c6c);
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 40px;
        }

        .toggle-password {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
          font-size: 16px;
        }

        .toggle-password:hover {
          opacity: 1;
        }

        .field-error {
          display: block;
          font-size: 12px;
          color: var(--sev-critical, #ff5c6c);
          margin-top: 6px;
        }

        .global-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255, 92, 108, 0.1);
          border: 1px solid rgba(255, 92, 108, 0.2);
          border-radius: 8px;
          font-size: 13px;
          color: var(--sev-critical, #ff5c6c);
          margin-bottom: 16px;
        }

        .error-icon {
          flex-shrink: 0;
        }

        .submit-btn {
          width: 100%;
          padding: 11px;
          border-radius: 8px;
          border: none;
          background: var(--brand, #6c8cff);
          color: #0a0e14;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--brand-hover, #8aa4ff);
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .spinner-circle {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(10, 14, 20, 0.3);
          border-top-color: #0a0e14;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .skeleton-loader {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-line {
          height: 40px;
          background: linear-gradient(90deg, var(--border, #232935) 25%, var(--surface-hover, #1a1f2a) 50%, var(--border, #232935) 75%);
          background-size: 200% 100%;
          border-radius: 8px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-line.short {
          width: 60%;
          height: 16px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}