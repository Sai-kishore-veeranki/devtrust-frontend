import { useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import IncidentFeed from './components/IncidentFeed';
import DoraMetrics from './components/DoraMetrics';
import ServiceGraph from './components/ServiceGraph';

function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e14' }}>
        <div style={{ color: '#5b6472', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px', color: '#e7eaf0' }}>DevTrust</h1>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
          Engineering intelligence platform
        </p>
      </div>
      <ServiceGraph />
      <DoraMetrics />
      <IncidentFeed />
    </>
  );
}

export default App;