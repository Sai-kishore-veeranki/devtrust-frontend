import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ServiceGraph from './components/ServiceGraph';
import DoraMetrics from './components/DoraMetrics';
import IncidentFeed from './components/IncidentFeed';

function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: '#06080c', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ marginBottom: '8px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: '#e7eaf0', letterSpacing: '-0.3px' }}>
            DevTrust
          </h1>
          <p style={{ fontSize: '13px', color: '#5b6472', margin: 0 }}>
            Engineering intelligence platform
          </p>
        </div>
        <ServiceGraph />
        <DoraMetrics />
        <IncidentFeed />
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#06080c',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        border: '2px solid rgba(108, 140, 255, 0.15)',
        borderTopColor: '#6c8cff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}