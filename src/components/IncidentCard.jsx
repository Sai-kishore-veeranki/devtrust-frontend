import React from 'react';

// Design System definition for Severities
const severities = {
  CRITICAL: { bg: '#fef2f2', text: '#b91c1c', border: '#f87171', icon: '🚨' },
  HIGH:     { bg: '#fff7ed', text: '#c2410c', border: '#fb923c', icon: '🔥' },
  MEDIUM:   { bg: '#fefce8', text: '#a16207', border: '#facc15', icon: '⚠️' },
  LOW:      { bg: '#f0fdf4', text: '#15803d', border: '#4ade80', icon: 'ℹ️' },
};

export default function IncidentCard({ incident }) {
  const theme = severities[incident.severity] || severities.LOW;

  return (
    <div className="card-hover" style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${theme.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
    }}>
      
      {/* 1. Header Section */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '16px', color: '#111827' }}>
                {incident.serviceName}
              </span>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: theme.text, background: theme.bg,
                padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                {theme.icon} {incident.severity}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
              Anomaly detected in <strong style={{ fontWeight: 600 }}>{incident.metricName}</strong> 
              {' '}(Value: <span style={{ color: '#ef4444', fontWeight: 500 }}>{incident.anomalyValue?.toFixed(1)}</span> / Threshold: {incident.threshold})
            </p>
          </div>
        </div>
      </div>

      {/* 2. Metadata & Impact Section */}
      <div style={{ padding: '12px 20px', background: '#f9fafb', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="21" y2="12"></line></svg>
           <span>Commit <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#111827' }}>{incident.commitId}</code> by <strong style={{ fontWeight: 500 }}>{incident.author}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
           <span>{incident.deltaSeconds}s post-deploy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
           <span>{Math.round(incident.confidenceScore * 100)}% Confidence</span>
        </div>
      </div>

      {/* 3. Cost & SLA Warning */}
      {incident.costSummary && (
        <div style={{
          padding: '12px 20px',
          background: incident.slaBreached ? '#fef2f2' : '#ffffff',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
               ${incident.estimatedRevenueLost?.toLocaleString()} at risk
            </span>
            <span style={{ fontSize: '13px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
               ~{incident.estimatedUsersAffected?.toLocaleString()} users affected
            </span>
            <span style={{ fontSize: '13px', color: '#4b5563' }}>
               {incident.durationMinutes}m elapsed
            </span>
            {incident.slaBreached && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                SLA BREACHED
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: incident.slaBreached ? '#991b1b' : '#6b7280', fontSize: '12px' }}>
            {incident.costSummary}
          </p>
        </div>
      )}

      {/* 4. AI Root Cause (The "Magic" Section) */}
      {incident.rootCauseAnalysis && (
        <div style={{
          margin: '12px 20px 20px',
          padding: '16px',
          background: 'linear-gradient(to right, #f5f3ff, #faf5ff)',
          border: '1px solid #e9d5ff',
          borderRadius: '8px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#ai-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <strong className="ai-gradient-text" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Root Cause Analysis
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
            {incident.rootCauseAnalysis}
          </p>
        </div>
      )}

    </div>
  );
}