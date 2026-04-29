import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountSummaryHeader({ intelligence }: { intelligence: any }) {
  if (!intelligence) return null;

  const { account_plan, briefing, risk_score, risk_band } = intelligence;
  const isCritical = risk_score < 50;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      
      {/* Top Metrics Row */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          style={{ flex: '0 0 auto', padding: '1.5rem', background: isCritical ? '#FEF2F2' : '#F0FDF4', borderRadius: '12px', border: `2px solid ${isCritical ? '#DC2626' : '#16A34A'}`, minWidth: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isCritical ? '#DC2626' : '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Score</div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: isCritical ? '#DC2626' : '#16A34A', margin: '0.5rem 0' }}>{risk_score}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isCritical ? '#991B1B' : '#14532D' }}>{risk_band}</div>
        </motion.div>

        {account_plan && (
          <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: account_plan.classification === 'Core' ? '#1D4ED8' : '#DC2626' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>Account Plan</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: account_plan.classification === 'Core' ? '#1D4ED8' : '#DC2626', color: 'white' }}>
                {account_plan.classification === 'Core' ? '✅ Core' : '⚠️ Non-Core'}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.2rem' }}>Primary Solution</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>{account_plan.primary_solution}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.2rem' }}>Secondary Solution</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>{account_plan.secondary_solution || 'None'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.2rem' }}>Last Meeting</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>{account_plan.last_meeting || 'No recent meetings'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              {account_plan.health_events_open > 0 && <span className="kpi-pill warning">🏥 {account_plan.health_events_open} Open Health Event{account_plan.health_events_open > 1 ? 's' : ''}</span>}
              {account_plan.pme_open > 0 && <span className="kpi-pill critical">🚨 {account_plan.pme_open} Open PME</span>}
              {account_plan.has_cancellation && <span className="kpi-pill critical">⚠️ Cancellation Recorded</span>}
            </div>
          </div>
        )}
      </div>

      {/* AI Briefing */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(to right, #F8FAFC, #EFF6FF)', borderRadius: '12px', border: '1px solid #BFDBFE', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0, 120, 212, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ background: '#3B82F6', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>AI GENERATED</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B' }}>Executive Briefing</h3>
        </div>
        <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#334155' }}>
          {briefing || 'No briefing available.'}
        </p>
      </motion.div>

    </div>
  );
}
