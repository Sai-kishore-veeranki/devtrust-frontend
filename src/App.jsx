import IncidentFeed from './components/IncidentFeed';
import DoraMetrics from './components/DoraMetrics';
import ServiceGraph from './components/ServiceGraph';

function App() {
  return (
    <>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px' }}>DevTrust</h1>
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