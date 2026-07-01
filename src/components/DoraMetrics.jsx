import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const MetricCard = ({ label, value, unit, description }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    flex: '1',
    minWidth: '140px',
  }}>
    <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px', textTransform: 'uppercase', fontWeight: 600 }}>
      {label}
    </p>
    <p style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 4px', color: '#111827' }}>
      {value}<span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '4px' }}>{unit}</span>
    </p>
    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{description}</p>
  </div>
);

export default function DoraMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    axios.get(`${API_BASE}/dora?days=${days}`)
      .then(res => setMetrics(res.data))
      .catch(err => console.error('Failed to load DORA metrics', err));
  }, [days]);

  if (!metrics) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>Engineering health</h3>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <MetricCard
          label="Deploy frequency"
          value={metrics.deployment_frequency?.toFixed(2)}
          unit="/ day"
          description="Unique deploys per day"
        />
        <MetricCard
          label="Change failure rate"
          value={metrics.change_failure_rate?.toFixed(1)}
          unit="%"
          description="Deploys causing incidents"
        />
        <MetricCard
          label="MTTR"
          value={metrics.mean_time_to_recovery_minutes?.toFixed(0)}
          unit="min"
          description="Avg time to resolve"
        />
        <MetricCard
          label="Open incidents"
          value={metrics.open_incidents}
          unit=""
          description={`of ${metrics.total_incidents} total`}
        />
      </div>
    </div>
  );
}