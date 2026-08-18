import React, { useEffect, useState } from 'react';
import { fetchDoraMetrics } from '../services/api';

// 20-YOE Touch: Injecting a clean stylesheet for things inline styles can't do (animations, hovers)
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .dev-ui-wrapper {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #111827;
    }
    
    .card-hover {
      transition: all 0.2s ease-in-out;
    }
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
    }

    @keyframes pulse-ring {
      0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    
    .status-dot.connected {
      background-color: #22c55e;
      animation: pulse-ring 2s infinite;
    }
    .status-dot.disconnected {
      background-color: #9ca3af;
    }

    .ai-gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `}} />
);

const MetricCard = ({ label, value, unit, description }) => (
  <div className="card-hover" style={{
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    flex: '1',
    minWidth: '160px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
  }}>
    <h4 style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
      {label}
    </h4>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
      <span style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: '#111827' }}>
        {value || '-'}
      </span>
      <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>{unit}</span>
    </div>
    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, fontWeight: 400 }}>{description}</p>
  </div>
);

export default function DoraMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchDoraMetrics(days)
      .then(setMetrics)
      .catch(err => console.error('Failed to load DORA metrics', err));
  }, [days]);

  if (!metrics) return null;

  return (
    <div className="dev-ui-wrapper" style={{ maxWidth: '840px', margin: '0 auto', padding: '32px 24px 16px' }}>
      <GlobalStyles />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}>Engineering Health</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>DORA metrics overview and system reliability</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ 
            fontSize: '13px', fontWeight: 500, padding: '8px 12px', 
            borderRadius: '8px', border: '1px solid #e5e7eb', 
            background: '#f9fafb', color: '#374151', cursor: 'pointer',
            outline: 'none', transition: 'border 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#6366f1'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        >
          <option value={7}>Past 7 days</option>
          <option value={30}>Past 30 days</option>
          <option value={90}>Past 90 days</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <MetricCard label="Deploy Freq" value={metrics.deployment_frequency?.toFixed(1)} unit="/ day" description="Unique deploys per day" />
        <MetricCard label="Failure Rate" value={metrics.change_failure_rate?.toFixed(1)} unit="%" description="Deploys causing incidents" />
        <MetricCard label="MTTR" value={metrics.mean_time_to_recovery_minutes?.toFixed(0)} unit="min" description="Average time to resolve" />
        <MetricCard label="Open Incidents" value={metrics.open_incidents} unit="" description={`of ${metrics.total_incidents} total incidents`} />
      </div>
    </div>
  );
}