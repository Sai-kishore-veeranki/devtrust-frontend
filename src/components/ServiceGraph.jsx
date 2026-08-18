import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { fetchServiceGraph } from '../services/api';

// Design System for Services
const statusTheme = {
  HEALTHY:  { color: '#22c55e', bg: '#f0fdf4', icon: '✓' },
  DEGRADED: { color: '#f59e0b', bg: '#fffbeb', icon: '⚠️' },
  CRITICAL: { color: '#ef4444', bg: '#fef2f2', icon: '🚨' },
  UNKNOWN:  { color: '#9ca3af', bg: '#f9fafb', icon: '?' },
};

// Global Styles for micro-interactions
const GraphStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    .service-graph-wrapper { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    .node-group { transition: opacity 0.2s; }
    .node-circle { transition: all 0.2s ease; }
    .node-group:hover .node-circle { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
    .graph-tooltip-card {
      animation: slide-up 0.2s ease-out forwards;
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}} />
);

export default function ServiceGraph() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchServiceGraph()
      .then(setGraphData)
      .catch(err => console.error('Failed to load graph', err));
  }, []);

  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;

    // Responsive dimensions
    const width = containerRef.current.clientWidth;
    const height = 440;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#f9fafb')
      .style('cursor', 'grab');

    // Pan & Zoom setup
    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))
      .on('start', () => svg.style('cursor', 'grabbing'))
      .on('end', () => svg.style('cursor', 'grab'));
    
    svg.call(zoom);

    // Filters for drop shadows
    const defs = svg.append('defs');
    
    // Arrowhead marker definition (Modern, sharp design)
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24) // Offset for node radius
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .append('path')
      .attr('d', 'M0,-4 L10,0 L0,4')
      .attr('fill', '#9ca3af');

    const nodes = graphData.nodes.map(n => ({ ...n }));
    const links = graphData.edges.map(e => ({
      source: e.from,
      target: e.to,
      type: e.type,
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(45));

    // Draw edges
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => d.type === 'HARD' ? '#9ca3af' : '#d1d5db')
      .attr('stroke-width', d => d.type === 'HARD' ? 1.5 : 1.5)
      .attr('stroke-dasharray', d => d.type === 'SOFT' ? '5,5' : null)
      .attr('marker-end', 'url(#arrowhead)')
      .style('opacity', 0.6);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelected(d))
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      )
      // Micro-interaction: Scale on hover
      .on('mouseenter', function() { d3.select(this).select('circle.main-node').transition().duration(200).attr('r', 20); })
      .on('mouseleave', function() { d3.select(this).select('circle.main-node').transition().duration(200).attr('r', 18); });

    // Node circles (Modern solid white with thick colored border)
    node.append('circle')
      .attr('class', 'main-node node-circle')
      .attr('r', 18)
      .attr('fill', '#ffffff')
      .attr('stroke', d => statusTheme[d.status]?.color || '#9ca3af')
      .attr('stroke-width', 3.5);

    // Text label with SVG paint-order trick for perfect legibility over lines
    node.append('text')
      .text(d => d.id.length > 14 ? d.id.substring(0, 12) + '…' : d.id)
      .attr('dy', 32)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .style('paint-order', 'stroke')
      .style('stroke', '#ffffff')
      .style('stroke-width', '4px')
      .style('stroke-linecap', 'butt')
      .style('stroke-linejoin', 'miter');

    // Incident count badge (Notification pill style)
    const incidentNodes = node.filter(d => d.totalIncidents > 0);
    
    incidentNodes.append('circle')
      .attr('cx', 16)
      .attr('cy', -14)
      .attr('r', 9)
      .attr('fill', '#ef4444')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    incidentNodes.append('text')
      .text(d => d.totalIncidents > 9 ? '9+' : d.totalIncidents)
      .attr('x', 16)
      .attr('y', -11)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  }, [graphData]);

  return (
    <div className="service-graph-wrapper" ref={containerRef} style={{ maxWidth: '840px', margin: '0 auto', padding: '24px' }}>
      <GraphStyles />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em', color: '#111827' }}>Architecture Topology</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Real-time service dependencies and health states</p>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>
          {Object.entries(statusTheme).map(([status, theme]) => (
            <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                width: '10px', height: '10px', borderRadius: '50%', 
                border: `2px solid ${theme.color}`, background: '#fff', display: 'inline-block' 
              }}/>
              {status}
            </span>
          ))}
        </div>
      </div>

      {/* Graph Container */}
      <div style={{ 
        position: 'relative', border: '1px solid #e5e7eb', borderRadius: '12px', 
        overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' 
      }}>
        
        {/* Helper overlay */}
        <div style={{ 
          position: 'absolute', top: 12, left: 16, pointerEvents: 'none',
          background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '6px',
          fontSize: '11px', color: '#6b7280', border: '1px solid #e5e7eb', backdropFilter: 'blur(4px)'
        }}>
          Scroll to zoom · Drag to pan · Solid: Hard Dep · Dashed: Soft Dep
        </div>

        <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />

        {/* 20-YOE Touch: Overlaid details card (instead of pushing layout down) */}
        {selected && (
          <div className="graph-tooltip-card" style={{
            position: 'absolute', bottom: 16, right: 16, left: 16,
            background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px',
            padding: '16px 20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Status Indicator Icon */}
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '8px', 
                background: statusTheme[selected.status].bg, color: statusTheme[selected.status].color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' 
              }}>
                {statusTheme[selected.status].icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '16px', color: '#111827' }}>{selected.id}</strong>
                  <span style={{ 
                    fontSize: '11px', fontWeight: 600, color: statusTheme[selected.status].color, 
                    background: statusTheme[selected.status].bg, padding: '2px 8px', borderRadius: '999px' 
                  }}>
                    {selected.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', display: 'flex', gap: '12px' }}>
                  <span>Tier: <strong>{selected.tier}</strong></span>
                  <span>Incidents: <strong style={{ color: selected.totalIncidents > 0 ? '#ef4444' : 'inherit'}}>{selected.totalIncidents}</strong></span>
                  <span>Last Event: {selected.lastIncidentAt === 'never' ? 'None' : new Date(selected.lastIncidentAt).toLocaleTimeString()}</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelected(null)}
              style={{
                background: '#f3f4f6', border: 'none', borderRadius: '6px', padding: '6px',
                color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
              onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}