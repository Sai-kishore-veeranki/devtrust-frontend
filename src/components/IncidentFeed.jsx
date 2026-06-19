import { useEffect, useState } from 'react';
import { fetchLatestIncidents } from '../services/api';
import { connectIncidentSocket } from '../services/websocket';
import IncidentCard from './IncidentCard';

export default function IncidentFeed() {
  const [incidents, setIncidents] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchLatestIncidents()
      .then(setIncidents)
      .catch((err) => console.error('Failed to load incidents', err));

    const client = connectIncidentSocket((newIncident) => {
      setIncidents((prev) => [newIncident, ...prev].slice(0, 50));
      setConnected(true);
    });

    return () => client.deactivate();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Live Incident Feed</h2>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: connected ? '#22c55e' : '#9ca3af',
        }} />
      </div>

      {incidents.length === 0 && (
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>Waiting for incidents...</p>
      )}

      {incidents.map((incident) => (
        <IncidentCard key={incident.incidentId} incident={incident} />
      ))}
    </div>
  );
}