import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, FileText, Heart } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface InsightResponse {
  risk_score: number;
  risk_band: string;
  top_drivers: string[];
  summary_text: string;
  recommended_actions: string[];
  account_plan?: {
    classification: string;
    primary_solution: string;
    secondary_solution: string;
    health_events_open: number;
    health_events_closed: number;
    has_cancellation: boolean;
    pme_open: number;
    last_meeting: string | null;
  };
}

export default function InsightPanel({ accountId }: { accountId: string }) {
  const [data, setData] = useState<InsightResponse | null>(null);

  useEffect(() => {
    setData(null); // Reset when account changes
    
    // Fetch directly from the Node.js Express backend API
    axios.get(`http://localhost:8000/api/accounts/${accountId}/insights`)
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching insights:", err));
  }, [accountId]);

  if (!data) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Analyzing AI Intelligence...
    </motion.div>
  );

  const isCritical = data.risk_score < 50;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* ── Account Plan Banner ── */}
      {data.account_plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          style={{ background: data.account_plan.classification === 'Core' ? '#EFF6FF' : '#FEF2F2', borderRadius: '12px', border: `1.5px solid ${data.account_plan.classification === 'Core' ? '#BFDBFE' : '#FCA5A5'}`, overflow: 'hidden' }}
        >
          <div style={{ padding: '0.6rem 1rem', background: data.account_plan.classification === 'Core' ? '#DBEAFE' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={14} style={{ color: data.account_plan.classification === 'Core' ? '#1D4ED8' : '#DC2626' }} />
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: data.account_plan.classification === 'Core' ? '#1D4ED8' : '#DC2626' }}>Account Plan</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: '12px', background: data.account_plan.classification === 'Core' ? '#1D4ED8' : '#DC2626', color: 'white' }}>
              {data.account_plan.classification === 'Core' ? '✅ Core' : '⚠️ Non-Core'}
            </span>
          </div>
          <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#64748B' }}>Primary Solution</span>
              <span style={{ fontWeight: 600, color: '#1E293B' }}>{data.account_plan.primary_solution}</span>
            </div>
            {data.account_plan.secondary_solution && data.account_plan.secondary_solution !== 'N/A' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748B' }}>Secondary</span>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>{data.account_plan.secondary_solution}</span>
              </div>
            )}
          </div>
          {/* Health Events + Placeholder pills */}
          <div style={{ padding: '0.5rem 1rem 0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {data.account_plan.health_events_open > 0 && (
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #FDE68A' }}>
                🏥 {data.account_plan.health_events_open} Open Health Event{data.account_plan.health_events_open > 1 ? 's' : ''}
              </span>
            )}
            {data.account_plan.health_events_closed > 0 && (
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', background: '#D1FAE5', color: '#065F46', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #6EE7B7' }}>
                ✅ {data.account_plan.health_events_closed} Resolved Health Event{data.account_plan.health_events_closed > 1 ? 's' : ''}
              </span>
            )}
            {data.account_plan.pme_open > 0 && (
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', background: '#FFFBEB', color: '#92400E', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #FDE68A' }}>
                🚨 {data.account_plan.pme_open} Open PME
              </span>
            )}
            {data.account_plan.has_cancellation && (
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #FCA5A5' }}>
                ⚠️ Cancellation on Record
              </span>
            )}
            {data.account_plan.last_meeting && (
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 600, border: '1px solid #BFDBFE' }}>
                📅 Last Meeting: {data.account_plan.last_meeting}
              </span>
            )}
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', background: '#F1F5F9', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 500, border: '1px solid #E2E8F0' }}>NPS — Coming Soon</span>
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', background: '#F1F5F9', color: '#94A3B8', fontSize: '0.72rem', fontWeight: 500, border: '1px solid #E2E8F0' }}>Customer Reference — Coming Soon</span>
          </div>
        </motion.div>
      )}

      {/* Score Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        style={{ textAlign: 'center', padding: '1.5rem', background: isCritical ? '#FEF2F2' : '#F0FDF4', borderRadius: '12px', border: `2px solid ${isCritical ? 'var(--rp-red-600)' : 'var(--rp-green-600)'}` }}
      >
        <h3 style={{ color: isCritical ? 'var(--rp-red-600)' : 'var(--rp-green-600)', marginBottom: '0.5rem' }}>Health Score</h3>
        <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: isCritical ? 'var(--rp-red-600)' : 'var(--rp-green-600)' }}>
          {data.risk_score}
        </div>
        <div style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>{data.risk_band}</div>
      </motion.div>

      {/* AI Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rp-blue-900)', marginBottom: '0.75rem' }}>
          <Info size={18} /> AI Account Summary
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          {data.summary_text}
        </p>
      </motion.div>

      {/* Risk Drivers */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isCritical ? 'var(--rp-red-600)' : 'var(--rp-green-600)', marginBottom: '0.75rem' }}>
          <AlertTriangle size={18} /> {isCritical ? 'Top Risk Drivers' : 'Stability Factors'}
        </h4>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
          {data.top_drivers.map((driver, idx) => <li key={idx} style={{ marginBottom: '0.25rem' }}>{driver}</li>)}
        </ul>
      </motion.div>

      {/* Recommended Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rp-green-600)', marginBottom: '0.75rem' }}>
          <CheckCircle size={18} /> Recommended Actions
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <AnimatePresence>
          {data.recommended_actions.map((action, idx) => (
            <motion.div 
              key={idx} 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + (idx * 0.1) }}
              whileHover={{ x: 5 }}
              style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: `1px solid var(--glass-border)`, borderLeft: `4px solid var(--rp-green-600)`, fontSize: '0.9rem' }}
            >
              {action}
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
