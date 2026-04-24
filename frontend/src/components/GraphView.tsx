import { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';

interface GraphData { nodes: any[]; links: any[]; }

interface Props {
  accountId: string;
  onNodeClick: (node: any) => void;
}

const NODE_COLORS: Record<string, string> = {
  Account:          '#00529B',
  Portfolio:        '#334155',
  Product:          '#0EA5E9',
  Ticket:           '#D32F2F',
  BillingIssue:     '#B45309',
  Implementation:   '#7C3AED',
  Renewal:          '#0F766E',
  // ── New VP Health Score Framework nodes ──
  AccountPlan:      '#1D4ED8',  // deep blue  — Core/Non-Core classification
  HealthEvent:      '#9333EA',  // vivid purple — open/closed health events
  RenewalChatter:   '#059669',  // emerald — chatter/emails between CSM & Renewal Specialist
  Cancellation:     '#DC2626',  // bright red — cancellation history
  PME:              '#D97706',  // amber — Problem Management Escalations
  CustomerMeeting:  '#2563EB',  // blue — customer meetings & activities
};

export default function GraphView({ accountId, onNodeClick }: Props) {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const update = () => {
      const container = document.getElementById('graph-container');
      if (container) setDimensions({ width: container.clientWidth, height: container.clientHeight });
    };
    window.addEventListener('resize', update);
    update(); setTimeout(update, 100);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/accounts/${accountId}/graph`)
      .then(res => setGraphData(res.data))
      .catch(() => {});
  }, [accountId]);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      setTimeout(() => fgRef.current.zoomToFit(400, 50), 600);
    }
  }, [graphData]);

  const renderCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, label, properties } = node;
    let color = NODE_COLORS[label] || '#999';

    // P1 tickets are deep red
    if (label === 'Ticket' && properties?.severity === 'P1') color = '#ff2b2b';
    if (label === 'Ticket' && properties?.severity === 'P2') color = '#ff9500';

    const size = label === 'Account' ? 14 : label === 'Portfolio' ? 11 : label === 'Product' ? 9 : 7;

    // Portfolio node: draw as a dashed ring to signal it's a container
    if (label === 'Portfolio') {
      ctx.beginPath();
      ctx.arc(x, y, size + 4, 0, 2 * Math.PI);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(51,65,85,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Outer glow ring for risky nodes
    if (['Ticket', 'BillingIssue', 'Implementation'].includes(label)) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
    } else {
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
    }

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outline ring on Account node to make it pop
    if (label === 'Account') {
      ctx.beginPath();
      ctx.arc(x, y, size + 3, 0, 2 * Math.PI, false);
      ctx.strokeStyle = 'rgba(0,82,155,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels visible when zoomed or for Account nodes
    if (globalScale > 1.8 || label === 'Account') {
      const fontSize = label === 'Account' ? 13 / globalScale : 10 / globalScale;
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const displayName = properties?.name || label;
      ctx.fillText(displayName, x, y + size + 2 / globalScale);
    }
  }, []);

  return (
    <div id="graph-container" style={{ width: '100%', height: 'calc(100% - 50px)', background: '#F8FAFC', position: 'relative' }}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={renderCanvasObject}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={() => 'rgba(0,82,155,0.2)'}
        linkWidth={1.5}
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={() => 'rgba(0,82,155,0.7)'}
        d3VelocityDecay={0.25}
        onNodeClick={(node: any) => {
          fgRef.current?.centerAt(node.x, node.y, 800);
          fgRef.current?.zoom(3.5, 1500);
          onNodeClick(node);           // ← emit to parent
        }}
      />
      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(255,255,255,0.92)', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.72rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', backdropFilter: 'blur(6px)', border: '1px solid #E2E8F0' }}>
        {Object.entries(NODE_COLORS).map(([lbl, col]) => (
          <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1E293B' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: col, display: 'inline-block', flexShrink: 0 }} />
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}
