import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import RiskPanel from './components/RiskPanel';
import TopNavSearch from './components/TopNavSearch';
import SplashScreen from './components/SplashScreen';
import AccountDashboard from './components/AccountDashboard';
import { RotateCcw } from 'lucide-react';
import './index.css';

interface Filters {
  risky: boolean;
  core: boolean;
  nonCore: boolean;
}

function App() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  // Group node clicked in the graph (e.g., clicking the "Ticket" node)
  const [selectedGroupNode, setSelectedGroupNode] = useState<any>(null);
  const [, setSelectedIssue] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [filters, setFilters] = useState<Filters>({ risky: false, core: false, nonCore: false });

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
    setSelectedIssue(null);
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
        <main className="main-content" style={{ display: 'flex', gap: '0.875rem' }}>

          {/* Col 1: Risk Panel (Always visible) */}
          <aside className="glass-panel" style={{ width: selectedAccountId ? '280px' : '240px', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                selectedGroupId={selectedGroupNode?.id}
                selectedGroupNode={selectedGroupNode}
              />
            </section>
          ) : (
          /* Full-width PMC selection welcome screen */
          <section style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F0FDF4 100%)', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', position: 'relative' }}>

            {/* Background decorative circles */}
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, #BFDBFE44, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, #BBF7D044, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '3rem 2rem', textAlign: 'center', maxWidth: '680px', position: 'relative', zIndex: 1 }}>

              {/* Animated graph SVG */}
              <div style={{ position: 'relative' }}>
                <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                  <circle cx="70" cy="28" r="18" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2"/>
                  <circle cx="28" cy="105" r="18" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2"/>
                  <circle cx="112" cy="105" r="18" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="2"/>
                  <line x1="70" y1="46" x2="28" y2="87" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4"/>
                  <line x1="70" y1="46" x2="112" y2="87" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4"/>
                  <line x1="46" y1="105" x2="94" y2="105" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6 4"/>
                  <circle cx="70" cy="28" r="9" fill="#3B82F6"/>
                  <circle cx="28" cy="105" r="9" fill="#60A5FA"/>
                  <circle cx="112" cy="105" r="9" fill="#60A5FA"/>
                </svg>
                <style>{`@keyframes pulse-dot { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.3); opacity:0.7; } } svg circle:last-child, svg circle:nth-last-child(2), svg circle:nth-last-child(3) { animation: pulse-dot 2s ease-in-out infinite; }`}</style>
              </div>

              {/* Title */}
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, marginBottom: '0.5rem' }}>
                  Customer Interaction
                  <br />
                  <span style={{ background: 'linear-gradient(90deg, #0078D4, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Knowledge Graph</span>
                </div>
                <div style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
                  Select a PMC from the <strong style={{ color: '#0078D4' }}>Risk-Prioritized PMCs</strong> panel on the left to load its complete account intelligence — AI briefings, health scores, and actionable insights.
                </div>
              </div>

              {/* Feature cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', width: '100%', maxWidth: '580px' }}>
                {[
                  { icon: '🏥', text: 'Health Score Breakdown', color: '#EFF6FF', border: '#BFDBFE', textColor: '#1D4ED8' },
                  { icon: '🤖', text: 'AI Executive Briefing', color: '#FDF4FF', border: '#E9D5FF', textColor: '#7C3AED' },
                  { icon: '⚡', text: 'Next Best Actions', color: '#FFFBEB', border: '#FDE68A', textColor: '#92400E' },
                  { icon: '🕸️', text: 'Knowledge Graph', color: '#F0FDF4', border: '#BBF7D0', textColor: '#14532D' },
                  { icon: '📋', text: 'Role-Based Intel', color: '#FFF7ED', border: '#FED7AA', textColor: '#9A3412' },
                  { icon: '📅', text: 'Active Timeline', color: '#F0F9FF', border: '#BAE6FD', textColor: '#075985' },
                ].map(f => (
                  <div key={f.text} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: f.color, border: `1px solid ${f.border}`, borderRadius: '12px', padding: '0.85rem 0.5rem', fontSize: '0.78rem', fontWeight: 700, color: f.textColor }}>
                    <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                💡 Use the <strong style={{ color: '#64748B' }}>search bar</strong> above or click any account on the left to get started
              </div>
            </div>
          </section>
          )}

        </main>
      </div>
    </>
  );
}

export default App;
