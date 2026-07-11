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

      {/* Header — service name + severity badge */}
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

      {/* Metric line */}
      <p style={{ fontSize: '13px', color: '#374151', margin: '8px 0 4px' }}>
        <strong>{incident.metricName}</strong> = {incident.anomalyValue?.toFixed(1)}
        {' '}(threshold {incident.threshold})
      </p>

      {/* Commit info */}
      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
        Commit <code>{incident.commitId}</code> by {incident.author}
        {' · '}{incident.deltaSeconds}s after deploy
        {' · '}{Math.round(incident.confidenceScore * 100)}% confidence
      </p>

      {/* Blast radius / cost data */}
      {incident.costSummary && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: incident.slaBreached ? '#fef2f2' : '#f0fdf4',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: '1.5',
        }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#dc2626' }}>
              ${incident.estimatedRevenueLost?.toLocaleString()} lost
            </span>
            <span style={{ color: '#6b7280' }}>
              ~{incident.estimatedUsersAffected?.toLocaleString()} users affected
            </span>
            <span style={{ color: '#6b7280' }}>
              {incident.durationMinutes}m duration
            </span>
            {incident.slaBreached && (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ SLA BREACHED</span>
            )}
          </div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '11px' }}>{incident.costSummary}</p>
        </div>
      )}

      {/* AI root cause analysis */}
      {incident.rootCauseAnalysis && (
        <div style={{
          marginTop: '10px',
          padding: '10px 12px',
          background: '#f9fafb',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#374151',
          lineHeight: '1.5',
        }}>
          <strong style={{
            display: 'block',
            marginBottom: '4px',
            color: '#6b7280',
            fontSize: '11px',
            textTransform: 'uppercase',
          }}>
            AI root cause analysis
          </strong>
          {incident.rootCauseAnalysis}
        </div>
      )}

    </div>
  );
}