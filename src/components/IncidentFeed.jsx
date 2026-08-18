import React, { useEffect, useState } from 'react';
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

    const client = connectIncidentSocket((updatedIncident) => {
      setIncidents((prev) => {
        const existingIndex = prev.findIndex((i) => i.incidentId === updatedIncident.incidentId);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedIncident;
          return updated;
        }
        return [updatedIncident, ...prev].slice(0, 50);
      });
      setConnected(true);
    });

    return () => client.deactivate();
  }, []);

  return (
    <div className="dev-ui-wrapper" style={{ maxWidth: '840px', margin: '0 auto', padding: '16px 24px 40px' }}>
      
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Live Incident Stream</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f3f4f6', padding: '4px 10px', borderRadius: '999px' }}>
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>
              {connected ? 'Real-time active' : 'Connecting...'}
            </span>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>Showing last {incidents.length} events</span>
      </div>

      {incidents.length === 0 && (
        <div style={{ 
          padding: '48px', textAlign: 'center', background: '#f9fafb', 
          border: '1px dashed #d1d5db', borderRadius: '12px' 
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Waiting for incoming incidents...</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {incidents.map((incident) => (
          <IncidentCard key={incident.incidentId} incident={incident} />
        ))}
      </div>
    </div>
  );
}