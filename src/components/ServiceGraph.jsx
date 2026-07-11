import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const statusColors = {
  HEALTHY:  '#22c55e',
  DEGRADED: '#f59e0b',
  CRITICAL: '#ef4444',
  UNKNOWN:  '#9ca3af',
};

export default function ServiceGraph() {
  const svgRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/graph`)
      .then(res => setGraphData(res.data))
      .catch(err => console.error('Failed to load graph', err));
  }, []);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const width = 560;
    const height = 380;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const nodes = graphData.nodes.map(n => ({ ...n }));
    const links = graphData.edges.map(e => ({
      source: e.from,
      target: e.to,
      type: e.type,
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Draw edges
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => d.type === 'HARD' ? '#6b7280' : '#d1d5db')
      .attr('stroke-width', d => d.type === 'HARD' ? 2 : 1)
      .attr('stroke-dasharray', d => d.type === 'SOFT' ? '4,4' : null)
      .attr('marker-end', 'url(#arrowhead)');

    // Arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#9ca3af');

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
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
      );

    // Node circles
    node.append('circle')
      .attr('r', 24)
      .attr('fill', d => statusColors[d.status] || '#9ca3af')
      .attr('fill-opacity', 0.15)
      .attr('stroke', d => statusColors[d.status] || '#9ca3af')
      .attr('stroke-width', 2);

    // Node labels
    node.append('text')
      .text(d => d.id.length > 12 ? d.id.substring(0, 10) + '…' : d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', '#374151');

    // Incident count badge
    node.filter(d => d.totalIncidents > 0)
      .append('circle')
      .attr('cx', 18)
      .attr('cy', -18)
      .attr('r', 10)
      .attr('fill', '#ef4444');

    node.filter(d => d.totalIncidents > 0)
      .append('text')
      .text(d => d.totalIncidents)
      .attr('x', 18)
      .attr('y', -14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#fff');

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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px' }}>Service dependency graph</h3>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#6b7280' }}>
          {Object.entries(statusColors).map(([status, color]) => (
            <span key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }}/>
              {status}
            </span>
          ))}
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fafafa' }}>
        <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      </div>

      {selected && (
        <div style={{
          marginTop: '12px',
          padding: '12px 16px',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '13px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong>{selected.id}</strong>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: statusColors[selected.status],
              background: `${statusColors[selected.status]}1A`,
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              {selected.status}
            </span>
          </div>
          <p style={{ margin: '0 0 4px', color: '#6b7280' }}>
            Tier: {selected.tier} · Total incidents: {selected.totalIncidents}
          </p>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>
            Last incident: {selected.lastIncidentAt === 'never'
              ? 'No incidents recorded'
              : new Date(selected.lastIncidentAt).toLocaleString()}
          </p>
          <button
            onClick={() => setSelected(null)}
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}>
            dismiss
          </button>
        </div>
      )}

      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
        Solid lines = hard dependencies · Dashed = soft · Badge = incident count · Click any node for details
      </p>
    </div>
  );
}