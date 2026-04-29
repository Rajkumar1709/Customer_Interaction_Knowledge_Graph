import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import AccountSummaryHeader from './AccountSummaryHeader';
import TimelineBuilder from './TimelineBuilder';
import ExplainableInsights from './ExplainableInsights';
import RoleSummaryTabs from './RoleSummaryTabs';
import AccountQAService from './AccountQAService';
import GraphView, { NODE_COLORS } from './GraphView';
import DataGroundedInsightPanel from './DataGroundedInsightPanel';

export default function AccountDashboard({ accountId, onNodeClick, onGraphLoad, selectedGroupId, selectedGroupNode }: any) {
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    axios.get(`/api/accounts/${accountId}/intelligence`)
      .then(res => {
        setIntelligence(res.data);
      })
      .catch(err => console.error("Error fetching intelligence:", err))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
        <Loader2 size={48} className="spin" style={{ marginBottom: '1rem', color: '#3B82F6' }} />
        <h3 style={{ margin: 0, color: '#1E293B' }}>Generating Account 360 AI Briefing...</h3>
        <p style={{ fontSize: '0.9rem' }}>Analyzing recent events, support tickets, and renewals.</p>
        <style>{`
          .spin { animation: spin 1.5s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!intelligence) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Failed to load account intelligence.</div>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem', height: '100%', overflowY: 'auto', alignContent: 'flex-start' }}>
      
      {/* Left Column (Main Context) */}
      <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        <AccountSummaryHeader intelligence={intelligence} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ExplainableInsights insights={intelligence.insights} nextBestActions={intelligence.next_best_actions} />
            <RoleSummaryTabs roles={intelligence.role_summaries} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <TimelineBuilder timeline={intelligence.timeline} />
          </div>
        </div>
      </div>

      {/* Right Column (Graph & Insights) */}
      <div style={{ flex: '1 1 400px', minHeight: '500px', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        
        {/* Banner with Title and Legend */}
        <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#1E293B', whiteSpace: 'nowrap' }}>Knowledge Graph</h3>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.68rem' }}>
            {Object.entries(NODE_COLORS).map(([lbl, col]) => (
              <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#475569' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, display: 'inline-block', flexShrink: 0 }} />
                {lbl}
              </span>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          
          {/* Graph View (Left Side of Split) */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <GraphView 
              accountId={accountId} 
              onNodeClick={onNodeClick} 
              onGraphLoad={onGraphLoad} 
              selectedGroupId={selectedGroupId} 
            />
          </div>
          
          {/* Data-Grounded Insights (Right Side of Split - Fixed) */}
          <div style={{ width: '380px', borderLeft: '1px solid #E2E8F0', background: '#F8FAFC', overflow: 'hidden', flexShrink: 0 }}>
            {selectedGroupNode ? (
              <div style={{ padding: '1rem', height: '100%', boxSizing: 'border-box' }}>
                <DataGroundedInsightPanel selectedGroupNode={selectedGroupNode} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748B' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <h4 style={{ margin: 0, color: '#475569', fontSize: '1.05rem', fontWeight: 600 }}>No Node Selected</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  Select a group node (e.g., Tickets, Escalations, Health Events) from the Knowledge Graph to view data-grounded AI insights and actionable intelligence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Q&A Widget */}
      <AccountQAService accountId={accountId} />
    </div>
  );
}
