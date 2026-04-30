import { FileText, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Converts raw dollar amounts like "$1,033,864" → "$1.0M" anywhere in a string
function formatMillions(text: string): string {
  if (typeof text !== 'string') return text;
  return text.replace(/\$[\d,]+(?:\.\d+)?/g, (match) => {
    const num = parseFloat(match.replace(/[$,]/g, ''));
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000)     return `$${(num / 1_000).toFixed(1)}K`;
    return match;
  });
}

export default function AccountSummaryHeader({ intelligence }: { intelligence: any }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!intelligence) return null;

  const { account_plan, briefing, risk_score, risk_band } = intelligence;
  let themeConfig = { bg: '#F0FDF4', border: '#16A34A', text: '#16A34A', darkText: '#14532D' }; // Healthy
  if (risk_score < 50) {
    themeConfig = { bg: '#FEF2F2', border: '#DC2626', text: '#DC2626', darkText: '#991B1B' }; // Critical
  } else if (risk_score < 75) {
    themeConfig = { bg: '#FFFBEB', border: '#D97706', text: '#D97706', darkText: '#92400E' }; // Moderate / Stable
  }

  // Helper function to gracefully format nested objects
  const renderValue = (val: any): React.ReactNode => {
    if (Array.isArray(val)) {
      return (
        <ul style={{ margin: '0 0 0.5rem 1.5rem', padding: 0 }}>
          {val.map((v, i) => (
            <li key={i} style={{ marginBottom: '0.2rem' }}>{renderValue(v)}</li>
          ))}
        </ul>
      );
    } else if (typeof val === 'object' && val !== null) {
      return (
        <div style={{ margin: '0.25rem 0 0.5rem 0.5rem', paddingLeft: '0.75rem', borderLeft: '2px solid #CBD5E1' }}>
          {Object.entries(val).map(([k, v]) => (
            <div key={k} style={{ marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600, color: '#475569', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</span> {renderValue(v)}
            </div>
          ))}
        </div>
      );
    }
    return String(formatMillions(String(val)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      
      {/* Top Metrics Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          style={{ position: 'relative', flex: '0 0 auto', padding: '1.5rem', background: themeConfig.bg, borderRadius: '12px', border: `2px solid ${themeConfig.border}`, minWidth: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: themeConfig.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Health Score
            <div 
              onMouseEnter={() => setShowTooltip(true)} 
              onMouseLeave={() => setShowTooltip(false)}
              style={{ cursor: 'help', display: 'flex' }}
            >
              <Info size={14} />
              {showTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '0.5rem',
                  background: '#1E293B',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  width: '220px',
                  zIndex: 50,
                  textTransform: 'none',
                  letterSpacing: 'normal',
                  lineHeight: 1.4,
                  fontWeight: 400,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  Health Score is calculated: 65% Business impact (tickets, escalations, cancellations) and 35% Interaction sentiment.
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, color: themeConfig.text, margin: '0.5rem 0' }}>{risk_score}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: themeConfig.darkText }}>{risk_band}</div>
        </motion.div>

        {account_plan && (
          <div style={{ flex: '1 1 300px', background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: account_plan.classification === 'Core' ? '#1D4ED8' : '#DC2626' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>Account Plan</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: account_plan.classification === 'Core' ? '#1D4ED8' : '#DC2626', color: 'white' }}>
                {account_plan.classification === 'Core' ? '✅ Core' : '⚠️ Non-Core'}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '0.5rem' }}>
              <div style={{ flex: '1 1 120px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.2rem' }}>Primary Solution</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', wordBreak: 'break-word' }}>{account_plan.primary_solution}</div>
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.2rem' }}>Secondary Solution</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', wordBreak: 'break-word' }}>{account_plan.secondary_solution || 'None'}</div>
              </div>
            </div>

            {/* Products Used */}
            {account_plan.products && account_plan.products.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Products Used</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {account_plan.products.map((p: string, i: number) => (
                    <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: '20px', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}



            {account_plan.score_breakdown && account_plan.score_breakdown.length > 0 && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Health Score Breakdown</div>
                {account_plan.score_breakdown.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
                    <span>{item.factor}</span>
                    <span style={{ fontWeight: 700, color: item.impact.startsWith('-') ? '#DC2626' : '#16A34A' }}>{item.impact} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Briefing */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(to right, #F8FAFC, #EFF6FF)', borderRadius: '12px', border: '1px solid #BFDBFE', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0, 120, 212, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ background: '#3B82F6', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>AI GENERATED</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B' }}>Executive Briefing</h3>
        </div>
        <div style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#334155' }}>
          {typeof briefing === 'string' ? (
            <p style={{ margin: 0 }}>{formatMillions(briefing)}</p>
          ) : typeof briefing === 'object' && briefing !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(briefing).map(([key, value]) => (
                <div key={key}>
                  <strong style={{ textTransform: 'capitalize', color: '#1E293B', marginRight: '0.5rem', display: 'inline-block' }}>
                    {key.replace(/_/g, ' ')}:
                  </strong> 
                  <div style={{ display: 'block', marginTop: '0.25rem' }}>
                    {renderValue(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0 }}>No briefing available.</p>
          )}
        </div>
      </motion.div>

    </div>
  );
}
