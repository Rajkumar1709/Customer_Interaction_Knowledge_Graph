import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import RiskPanel from './components/RiskPanel';
import TopNavSearch from './components/TopNavSearch';
import InsightPanel from './components/InsightPanel';
import GraphView from './components/GraphView';
import NodeDetailPanel from './components/NodeDetailPanel';
import AssociatedIssuesPanel from './components/AssociatedIssuesPanel';
import SplashScreen from './components/SplashScreen';
import AccountDashboard from './components/AccountDashboard';
import { Network, RotateCcw } from 'lucide-react';
import './index.css';

interface GraphData { nodes: any[]; links: any[]; }

interface Filters {
  risky: boolean;
  renewal: boolean;
  implementation: boolean;
}

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  // Group node clicked in the graph (e.g., clicking the "Ticket" node)
  const [selectedGroupNode, setSelectedGroupNode] = useState<any>(null);
  // Individual issue card clicked inside AssociatedIssuesPanel
  const [selectedIssue, setSelectedIssue]         = useState<any>(null);
  const [showSplash, setShowSplash]               = useState(true);
  const [graphData, setGraphData]                 = useState<GraphData>({ nodes: [], links: [] }); // kept for future use
  const [filters, setFilters]                     = useState<Filters>({ risky: false, renewal: false, implementation: false });

  // ── Node click in the graph ─────────────────────────────────────────────────
  const handleNodeClick = useCallback((node: any) => {
    if (node.label === 'Account') {
      // Clicking the central Account node → switch account, clear panels
      setSelectedAccountId(node.id);
      setSelectedGroupNode(null);
      setSelectedIssue(null);
    } else {
      // Clicking a group node (Ticket, PME, etc.) → populate AssociatedIssuesPanel
      setSelectedGroupNode(node);
      setSelectedIssue(null); // clear previous issue detail
    }
  }, []);

  // ── Issue card clicked in AssociatedIssuesPanel ─────────────────────────────
  const handleIssueClick = useCallback((issue: any) => {
    setSelectedIssue(issue);
  }, []);

  // ── CSM Dashboard button / NodeDetailPanel close → back to account overview ──
  const handleReset = useCallback(() => {
    setSelectedGroupNode(null);
    setSelectedIssue(null);
  }, []);

  // ── Account selected from RiskPanel or TopNavSearch ─────────────────────────
  const handleAccountSelect = useCallback((id: string) => {
    setSelectedAccountId(id);
    setSelectedGroupNode(null);
    setSelectedIssue(null);
    setGraphData({ nodes: [], links: [] });
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className="app-container">

        {/* ═══════════════════════════════════════════════════════
            TOP BAR — Logo | Search + Filters | Avatar
        ═══════════════════════════════════════════════════════ */}
        <header className="top-bar">

          {/* Left: Hamburger + Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <rect y="2" width="18" height="2" rx="1"/>
                <rect y="8" width="18" height="2" rx="1"/>
                <rect y="14" width="18" height="2" rx="1"/>
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
              <svg width="20" height="18" viewBox="0 0 20 18">
                <circle cx="10" cy="4"  r="4" fill="#E8765C"/>
                <circle cx="4"  cy="14" r="4" fill="#E8765C"/>
                <circle cx="16" cy="14" r="4" fill="#E8765C"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em', color: 'white' }}>REALPAGE</span>
            </div>

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.22)', margin: '0 0.1rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'white', lineHeight: 1.2 }}>
                Customer Interaction Knowledge Graph
              </span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Intelligence Platform · CSM Workspace
              </span>
            </div>
          </div>

          {/* Center: Global Search + Filter Chips */}
          <div style={{ flex: 1, minWidth: 0, padding: '0 1rem' }}>
            <TopNavSearch
              filters={filters}
              onFiltersChange={setFilters}
              onSelect={handleAccountSelect}
            />
          </div>

          {/* Right: CSM Dashboard button + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <button className="btn-outline" onClick={handleReset}
              style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RotateCcw size={13} /> CSM Dashboard
            </button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0078D4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', color: 'white', userSelect: 'none', cursor: 'default', flexShrink: 0 }}>
              VK
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════
            MAIN CONTENT AREA
        ═══════════════════════════════════════════════════════ */}
        <main className="main-content" style={selectedAccountId ? { display: 'flex', gap: '0.875rem' } : {}}>

          {/* Col 1: Top 100 Risk Panel (Always visible) */}
          <aside className="glass-panel" style={selectedAccountId ? { width: '280px', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } : { overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <RiskPanel
              filters={filters}
              selectedAccountId={selectedAccountId}
              onSelect={handleAccountSelect}
            />
          </aside>

          {selectedAccountId ? (
            /* New Account 360 Dashboard Layout */
            <section style={{ flex: 1, minWidth: 0, overflow: 'hidden', background: 'transparent' }}>
              <AccountDashboard 
                accountId={selectedAccountId} 
                onNodeClick={handleNodeClick}
                onGraphLoad={setGraphData}
                selectedGroupId={selectedGroupNode?.id}
              />
            </section>
          ) : (
            /* Original Empty State Columns */
            <>
              {/* Col 2: Network Explorer */}
              <section className="glass-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Network size={15} style={{ color: 'var(--rp-blue)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rp-blue)' }}>
                    Network Explorer
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', textAlign: 'center', background: '#F8FAFC' }}>
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                    <circle cx="36" cy="14" r="8" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2"/>
                    <circle cx="14" cy="54" r="8" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2"/>
                    <circle cx="58" cy="54" r="8" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2"/>
                    <line x1="36" y1="22" x2="14" y2="46" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 3"/>
                    <line x1="36" y1="22" x2="58" y2="46" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 3"/>
                    <line x1="22" y1="54" x2="50" y2="54" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 3"/>
                    <circle cx="36" cy="14" r="4" fill="#3B82F6"/>
                    <circle cx="14" cy="54" r="4" fill="#60A5FA"/>
                    <circle cx="58" cy="54" r="4" fill="#60A5FA"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>No Account Selected</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '280px', lineHeight: 1.7 }}>
                      Choose a PMC from the <strong style={{ color: '#0078D4' }}>Top Accounts by Risk</strong> panel on the left to explore its customer interaction knowledge graph.
                    </div>
                  </div>
                </div>
              </section>

              {/* Col 3: Associated Issues */}
              <aside className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <AssociatedIssuesPanel
                  selectedGroupNode={selectedGroupNode}
                  onIssueClick={handleIssueClick}
                />
              </aside>

              {/* Col 4: AI Insight */}
              <aside className="glass-panel" style={{ padding: '1.25rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', height: '100%', minHeight: '300px', textAlign: 'center', padding: '1.5rem' }}>
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <rect x="4" y="4" width="48" height="48" rx="14" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2"/>
                    <path d="M28 14 L40 20 L40 30 C40 37 28 43 28 43 C28 43 16 37 16 30 L16 20 Z" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5"/>
                    <circle cx="28" cy="28" r="5" fill="#3B82F6"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>AI Insights Ready</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '190px', lineHeight: 1.7 }}>
                      Select a <strong style={{ color: '#0078D4' }}>PMC</strong> to load AI-generated health scores, risk drivers, and recommended actions.
                    </div>
                  </div>
                </div>
              </aside>
            </>
          )}

        </main>
      </div>
    </>
  );
}

export default App;
