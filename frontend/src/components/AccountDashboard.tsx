import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AccountSummaryHeader from './AccountSummaryHeader';
import TimelineBuilder from './TimelineBuilder';
import ExplainableInsights from './ExplainableInsights';
import RoleSummaryTabs from './RoleSummaryTabs';
import AccountQAService from './AccountQAService';
import GraphView from './GraphView';

export default function AccountDashboard({ accountId, onNodeClick, onGraphLoad, selectedGroupId }: any) {
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    axios.get(`http://localhost:8000/api/accounts/${accountId}/intelligence`)
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
    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      
      {/* Left Column (Main Context) */}
      <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
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

      {/* Right Column (Graph) */}
      <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>Knowledge Graph</h3>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphView 
            accountId={accountId} 
            onNodeClick={onNodeClick} 
            onGraphLoad={onGraphLoad} 
            selectedGroupId={selectedGroupId} 
          />
        </div>
      </div>
      
      {/* Floating Q&A Widget */}
      <AccountQAService accountId={accountId} />
    </div>
  );
}
