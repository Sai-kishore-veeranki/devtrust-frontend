import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE = 'http://localhost:8080/api';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [needsSetup, setNeedsSetup] = useState(null); // null = still checking
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/auth/setup-status`)
      .then(res => setNeedsSetup(res.data.needsSetup))
      .catch(() => setError('Cannot reach DevTrust backend.'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (needsSetup) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg, #0a0e14)',
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '320px', padding: '28px', borderRadius: '14px',
        background: 'var(--surface, #12161f)', border: '1px solid var(--border, #232935)',
      }}>
        <h1 style={{
          fontSize: '18px', margin: '0 0 4px', color: 'var(--text, #e7eaf0)',
          fontFamily: 'var(--font-display, sans-serif)',
        }}>
          DevTrust
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-faint, #5b6472)', margin: '0 0 20px' }}>
          {needsSetup === null ? 'Checking setup status...'
            : needsSetup ? 'First run — create the admin account'
            : 'Sign in'}
        </p>

        <input
          type="text" placeholder="Username" value={username}
          onChange={e => setUsername(e.target.value)} required
          style={inputStyle}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} required minLength={8}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: 'var(--sev-critical, #ff5c6c)', fontSize: '12px', margin: '4px 0 12px' }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting || needsSetup === null} style={{
          width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
          background: 'var(--brand, #6c8cff)', color: '#0a0e14', fontWeight: 600,
          fontSize: '13px', cursor: 'pointer', marginTop: '4px',
        }}>
          {needsSetup ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 11px', marginBottom: '10px', borderRadius: '8px',
  border: '1px solid var(--border, #232935)', background: 'var(--bg, #0a0e14)',
  color: 'var(--text, #e7eaf0)', fontSize: '13px', boxSizing: 'border-box',
};
