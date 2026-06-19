const severityColors = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#ca8a04',
  LOW: '#65a30d',
};

export default function IncidentCard({ incident }) {
  const color = severityColors[incident.severity] || '#6b7280';

  return (
    <div style={{
      border: `1px solid ${color}33`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '8px',
      padding: '14px 16px',
      marginBottom: '10px',
      background: '#fff',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{incident.serviceName}</span>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color,
          background: `${color}1A`,
          padding: '2px 8px',
          borderRadius: '12px',
        }}>
          {incident.severity}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#374151', margin: '8px 0 4px' }}>
        <strong>{incident.metricName}</strong> = {incident.anomalyValue?.toFixed(1)}
        {' '}(threshold {incident.threshold})
      </p>

      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
        Commit <code>{incident.commitId}</code> by {incident.author}
        {' · '}{incident.deltaSeconds}s after deploy
        {' · '}{Math.round(incident.confidenceScore * 100)}% confidence
      </p>
    </div>
  );
}