import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Target, AlertTriangle, CheckCircle2, TrendingDown, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Props {
  selectedGroupNode: any | null;
}

export default function DataGroundedInsightPanel({ selectedGroupNode }: Props) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedGroupNode || !selectedGroupNode.items || selectedGroupNode.items.length === 0) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setAnalysis(null);

    // Call the AI summarization endpoint to clean up the raw data
    axios.post('/api/nodes/analyze', {
      label: selectedGroupNode.label,
      items: selectedGroupNode.items
    })
    .then(res => {
      if (res.data.success) {
        setAnalysis(res.data.analysis);
      }
    })
    .catch(err => console.error("Failed to analyze node:", err))
    .finally(() => setLoading(false));

  }, [selectedGroupNode]);

  if (!selectedGroupNode || !selectedGroupNode.items || selectedGroupNode.items.length === 0) {
    return null;
  }

  const label = selectedGroupNode.label; // e.g., HealthEvent, PME, Ticket

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
    >
      <div style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', background: 'linear-gradient(to right, #F8FAFC, #EFF6FF)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Target size={18} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1E293B', fontWeight: 700 }}>Data-Grounded Insights</h3>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.1rem' }}>
            {label} Analysis
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', padding: '2rem 0' }}>
            <Loader2 size={32} className="spin" style={{ marginBottom: '1rem', color: '#3B82F6' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>Synthesizing Dataset...</div>
            <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '0.4rem', color: '#94A3B8' }}>Extracting core insights and action items.</div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : analysis ? (
          <>
            {/* A. Impact Analysis */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <TrendingDown size={16} style={{ color: '#DC2626' }} />
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A', fontWeight: 700 }}>Impact Analysis</h4>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {analysis.impact_analysis?.map((item: string, i: number) => (
                  <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>
                ))}
              </ul>
            </section>

            {/* B. Issue Context */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FileText size={16} style={{ color: '#0284C7' }} />
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A', fontWeight: 700 }}>Issue Context</h4>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.875rem', borderRadius: '8px' }}>
                <ul style={{ margin: 0, paddingLeft: '1rem', color: '#334155', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {analysis.issue_context?.map((item: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* C. Action Items */}
            <section style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={16} style={{ color: '#059669' }} />
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A', fontWeight: 700 }}>Dataset Action Items</h4>
              </div>
              
              <div style={{ background: analysis.action_items?.length > 0 ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${analysis.action_items?.length > 0 ? '#BBF7D0' : '#E2E8F0'}`, padding: '1rem', borderRadius: '8px' }}>
                {analysis.action_items?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#065F46', fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 500 }}>
                    {analysis.action_items.map((action: string, i: number) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{action}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.85rem' }}>
                    <AlertTriangle size={15} style={{ color: '#94A3B8' }} />
                    <span>No action items available in dataset.</span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                * AI Summarized directly from BigQuery records
              </div>
            </section>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
