import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';

interface GraphData { nodes: any[]; links: any[]; }

interface Props {
  accountId: string;
  onNodeClick: (node: any) => void;
  onGraphLoad?: (data: GraphData) => void;
  selectedGroupId?: string; // highlights the currently-selected group node
}

const NODE_COLORS: Record<string, string> = {
  Account:          '#00529B',
  Portfolio:        '#334155',
  Product:          '#0EA5E9',
  Ticket:           '#D32F2F',
  BillingIssue:     '#B45309',
  Implementation:   '#7C3AED',
  Renewal:          '#0F766E',
  AccountPlan:      '#1D4ED8',
  HealthEvent:      '#9333EA',
  RenewalChatter:   '#059669',
  Cancellation:     '#1E293B',
  PME:              '#D97706',
  CustomerMeeting:  '#2563EB',
};

export default function GraphView({ accountId, onNodeClick, onGraphLoad, selectedGroupId }: Props) {
  const fgRef                   = useRef<any>(null);
  const [rawGraphData, setRawGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions]     = useState({ width: 800, height: 600 });

  // ── Responsive container dimensions ─────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const container = document.getElementById('graph-container');
      if (container) setDimensions({ width: container.clientWidth, height: container.clientHeight });
    };
    window.addEventListener('resize', update);
    update(); setTimeout(update, 100);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Fetch raw graph data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!accountId) return;
    axios.get(`http://localhost:8000/api/accounts/${accountId}/graph`)
      .then(res => {
        setRawGraphData(res.data);
        onGraphLoad?.(res.data);   // lift raw data to App for reference
      })
      .catch(() => {});
  }, [accountId, onGraphLoad]);

  // ── Group individual nodes by label → one group node per entity type ─────────
  const groupedData = useMemo((): GraphData => {
    if (!rawGraphData.nodes.length) return { nodes: [], links: [] };

    const accountNode = rawGraphData.nodes.find(n => n.label === 'Account');
    if (!accountNode) return { nodes: [], links: [] };

    // Collect all non-Account nodes grouped by label
    const groups = new Map<string, any[]>();
    rawGraphData.nodes.forEach(n => {
      if (n.label === 'Account') return;
      if (!groups.has(n.label)) groups.set(n.label, []);
      groups.get(n.label)!.push(n);
    });

    const nodes: any[] = [{ ...accountNode }];
    const links: any[] = [];

    groups.forEach((items, label) => {
      const groupId = `group_${label}`;
      nodes.push({
        id:      groupId,
        label,
        isGroup: true,
        count:   items.length,
        items,          // ← individual records, passed to AssociatedIssuesPanel
      });
      links.push({ source: groupId, target: accountNode.id });
    });

    return { nodes, links };
  }, [rawGraphData]);

  // ── Physics tuning — group graph is sparse so lighter settings work well ─────
  useEffect(() => {
    if (fgRef.current && groupedData.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-260);
      fgRef.current.d3Force('link').distance(110);
      setTimeout(() => fgRef.current?.zoomToFit(400, 50), 600);
    }
  }, [groupedData]);

  // ── Canvas renderer ──────────────────────────────────────────────────────────
  const renderCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, label, properties, isGroup, count } = node;
    const color      = NODE_COLORS[label] || '#999';
    const isSelected = node.id === selectedGroupId;
    const size       = label === 'Account' ? 14 : isGroup ? 11 : 7;

    // Glow ring
    ctx.shadowColor = color;
    ctx.shadowBlur  = isSelected ? 24 : isGroup ? 14 : 6;

    // Main filled circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Selection ring (dashed outline around selected group node)
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, size + 5, 0, 2 * Math.PI, false);
      ctx.strokeStyle = color;
      ctx.lineWidth   = Math.max(1.2, 2 / globalScale);
      ctx.setLineDash([4 / globalScale, 3 / globalScale]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Account node subtle outer ring
    if (label === 'Account') {
      ctx.beginPath();
      ctx.arc(x, y, size + 3, 0, 2 * Math.PI, false);
      ctx.strokeStyle = 'rgba(0,82,155,0.25)';
      ctx.lineWidth   = 2;
      ctx.stroke();
    }

    // Count badge inside group nodes (always visible)
    if (isGroup && count != null) {
      const fs = Math.max(6, 9 / globalScale);
      ctx.font         = `bold ${fs}px Inter, sans-serif`;
      ctx.fillStyle    = 'white';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(count), x, y);
    }

    // Labels: always for Account and group nodes; only when zoomed for others
    if (isGroup || label === 'Account' || globalScale > 1.8) {
      const fontSize = label === 'Account' ? 13 / globalScale : 9.5 / globalScale;
      ctx.font         = `600 ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle    = isSelected ? color : '#1E293B';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      const displayName = isGroup ? label : (properties?.name || label);
      ctx.fillText(displayName, x, y + size + 3 / globalScale);
    }
  }, [selectedGroupId]);

  return (
    <div id="graph-container" style={{ width: '100%', height: 'calc(100% - 50px)', background: '#F8FAFC', position: 'relative' }}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={groupedData}
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
          onNodeClick(node);
        }}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '1rem',
        background: 'rgba(255,255,255,0.92)', borderRadius: '8px',
        padding: '0.6rem 0.75rem', fontSize: '0.72rem',
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        backdropFilter: 'blur(6px)', border: '1px solid #E2E8F0',
      }}>
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
