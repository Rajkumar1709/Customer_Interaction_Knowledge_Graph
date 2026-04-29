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

export const NODE_COLORS: Record<string, string> = {
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
    const container = document.getElementById('graph-container');
    if (!container) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Fetch raw graph data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!accountId) return;
    axios.get(`/api/accounts/${accountId}/graph`)
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

    const numGroups = groups.size;
    const radius = 160; // Fixed radius for radial layout
    let i = 0;

    // Center Account node
    const nodes: any[] = [{ ...accountNode, fx: 0, fy: 0 }];
    const links: any[] = [];

    groups.forEach((items, label) => {
      const angle = (i * 2 * Math.PI) / numGroups;
      const groupId = `group_${label}`;
      
      nodes.push({
        id:      groupId,
        label,
        isGroup: true,
        count:   items.length,
        items,          // ← individual records, passed to AssociatedIssuesPanel
        fx:      Math.cos(angle) * radius,
        fy:      Math.sin(angle) * radius,
      });
      links.push({ source: groupId, target: accountNode.id });
      i++;
    });

    return { nodes, links };
  }, [rawGraphData]);

  // ── Physics tuning — group graph is sparse so lighter settings work well ─────
  useEffect(() => {
    if (fgRef.current && groupedData.nodes.length > 0) {
      // Re-center when data or container dimensions change
      setTimeout(() => fgRef.current?.zoomToFit(400, 70), 50);
    }
  }, [groupedData, dimensions.width, dimensions.height]);

  // ── Canvas renderer ──────────────────────────────────────────────────────────
  const renderCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, label, properties, isGroup, count } = node;
    const color      = NODE_COLORS[label] || '#999';
    const isSelected = node.id === selectedGroupId;
    const hasSelection = selectedGroupId != null;
    const isDimmed   = hasSelection && !isSelected && label !== 'Account';
    const size       = label === 'Account' ? 14 : isGroup ? 11 : 7;

    ctx.globalAlpha = isDimmed ? 0.25 : 1.0;

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
    
    ctx.globalAlpha = 1.0; // Reset alpha
  }, [selectedGroupId]);

  return (
    <div id="graph-container" style={{ width: '100%', height: 'calc(100% - 50px)', background: '#F8FAFC', position: 'relative' }}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={groupedData}
        cooldownTicks={0}
        enableNodeDrag={false}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        nodeCanvasObject={renderCanvasObject}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={(link: any) => {
          if (!selectedGroupId) return 'rgba(0,82,155,0.2)';
          if (link.source.id === selectedGroupId || link.target.id === selectedGroupId) return 'rgba(0,82,155,0.6)';
          return 'rgba(0,82,155,0.05)';
        }}
        linkWidth={1.5}
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={() => 'rgba(0,82,155,0.7)'}
        onNodeClick={(node: any) => {
          if (node.id === selectedGroupId) return;
          onNodeClick(node);
        }}
      />

    </div>
  );
}
