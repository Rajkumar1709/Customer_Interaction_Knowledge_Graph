import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SearchBar from './components/SearchBar';
import InsightPanel from './components/InsightPanel';
import GraphView from './components/GraphView';
import NodeDetailPanel from './components/NodeDetailPanel';
import SplashScreen from './components/SplashScreen';
import { Network, RotateCcw } from 'lucide-react';
import './index.css';

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('A-100');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);

  const handleNodeClick = useCallback((node: any) => {
    if (node.label === 'Account') {
      setSelectedAccountId(node.id);
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  }, []);

  const handleReset = useCallback(() => setSelectedNode(null), []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className="app-container">

        {/* ── Top Bar (RealPage CMS Style) ───────────────────────────── */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger */}
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <rect y="2" width="18" height="2" rx="1"/><rect y="8" width="18" height="2" rx="1"/><rect y="14" width="18" height="2" rx="1"/>
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
              <svg width="20" height="18" viewBox="0 0 20 18">
                <circle cx="10" cy="4"  r="4" fill="#E8765C"/>
                <circle cx="4"  cy="14" r="4" fill="#E8765C"/>
                <circle cx="16" cy="14" r="4" fill="#E8765C"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em', color: 'white' }}>REALPAGE</span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.25)', margin: '0 0.25rem' }} />

            {/* App title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white', lineHeight: 1.2 }}>
                Customer Interaction Knowledge Graph
              </span>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Intelligence Platform · CSM Workspace
              </span>
            </div>
          </div>

          {/* Right side: buttons + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button className="btn-outline" onClick={handleReset} style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RotateCcw size={13} /> CSM Dashboard
            </button>
            {/* User avatar chip — matches the "VK" chip in screenshot */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0078D4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', color: 'white', userSelect: 'none', cursor: 'default', flexShrink: 0 }}>
              VK
            </div>
          </div>
        </header>

        {/* ── Main 3-column Grid ────────────────────────────────────── */}
        <main className="main-content">

          {/* Left: Search */}
          <aside className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--rp-blue)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.01em' }}>Account Selector</h3>
            <SearchBar onSelect={(id) => { setSelectedAccountId(id); setSelectedNode(null); }} />
          </aside>

          {/* Center: Graph */}
          <section className="glass-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={15} style={{ color: 'var(--rp-blue)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rp-blue)' }}>
                Network Explorer
                {selectedNode && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>— {selectedNode.label}</span>}
              </span>
            </div>
            <GraphView accountId={selectedAccountId} onNodeClick={handleNodeClick} />
          </section>

          {/* Right: Insight / Node Detail */}
          <aside className="glass-panel" style={{ padding: '1.25rem', overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              {selectedNode
                ? <NodeDetailPanel key={selectedNode.id} node={selectedNode} onClose={handleReset} />
                : <InsightPanel key={selectedAccountId} accountId={selectedAccountId} />
              }
            </AnimatePresence>
          </aside>

        </main>
      </div>
    </>
  );
}

export default App;
