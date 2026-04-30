import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, CheckCircle, Info } from 'lucide-react';

export default function ExplainableInsights({ insights, nextBestActions }: { insights: any[], nextBestActions: string[] }) {
  if (!insights) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Action Items */}
      {nextBestActions && nextBestActions.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16A34A', marginBottom: '1rem', fontSize: '1.1rem' }}>
            <CheckCircle size={18} /> Next Best Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {nextBestActions.map((item: any, idx) => {
              const isObj = typeof item === 'object' && item !== null;
              const actionText = isObj ? item.action : item;
              const owner = isObj ? item.owner : null;
              const timeframe = isObj ? item.timeframe : null;
              
              let timeframeColor = '#16A34A';
              let timeframeBg = '#DCFCE7';
              if (timeframe === 'Immediate') {
                timeframeColor = '#DC2626';
                timeframeBg = '#FEE2E2';
              } else if (timeframe === 'Short-term') {
                timeframeColor = '#D97706';
                timeframeBg = '#FEF3C7';
              } else if (timeframe === 'Long-term') {
                timeframeColor = '#2563EB';
                timeframeBg = '#DBEAFE';
              }

              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.1 }}
                  style={{ padding: '1rem', background: '#F0FDF4', borderRadius: '8px', borderLeft: '4px solid #16A34A', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  <div style={{ fontSize: '0.95rem', color: '#14532D', fontWeight: 500, lineHeight: 1.5 }}>
                    {actionText}
                  </div>
                  
                  {(owner || timeframe) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {timeframe && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', color: timeframeColor, background: timeframeBg, textTransform: 'uppercase' }}>
                          ⏱️ {timeframe}
                        </span>
                      )}
                      {owner && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569', background: '#E2E8F0', textTransform: 'uppercase' }}>
                          👤 {owner}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      <div>
        <h3 style={{ color: '#1E293B', fontSize: '1.1rem', marginBottom: '1rem' }}>Explainable AI Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {insights.map((insight, idx) => {
            const isRisk = insight.type === 'Risk';
            const isOpportunity = insight.type === 'Opportunity';
            
            const bgColor = isRisk ? '#FEF2F2' : (isOpportunity ? '#F0FDF4' : '#F8FAFC');
            const borderColor = isRisk ? '#FCA5A5' : (isOpportunity ? '#86EFAC' : '#CBD5E1');
            const iconColor = isRisk ? '#DC2626' : (isOpportunity ? '#16A34A' : '#475569');

            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                style={{ background: 'white', borderRadius: '12px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}
              >
                <div style={{ padding: '0.75rem 1rem', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${borderColor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isRisk ? <AlertTriangle size={16} color={iconColor} /> : (isOpportunity ? <Lightbulb size={16} color={iconColor} /> : <Info size={16} color={iconColor} />)}
                    <span style={{ fontWeight: 700, color: iconColor, fontSize: '0.9rem' }}>{insight.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Confidence</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', background: insight.confidence === 'High' ? '#1D4ED8' : (insight.confidence === 'Medium' ? '#F59E0B' : '#94A3B8'), padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                      {insight.confidence || 'Medium'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#334155' }}>
                    {insight.explanation}
                  </p>
                  
                  <div style={{ background: '#F8FAFC', borderRadius: '6px', padding: '0.75rem', border: '1px dashed #CBD5E1' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Supporting Evidence</div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.85rem' }}>
                      {insight.evidence && insight.evidence.map((ev: string, i: number) => (
                        <li key={i} style={{ marginBottom: '0.2rem' }}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
