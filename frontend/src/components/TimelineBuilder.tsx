import { motion } from 'framer-motion';

export default function TimelineBuilder({ timeline }: { timeline: any[] }) {
  if (!timeline || timeline.length === 0) return <div>No recent events.</div>;

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#1E293B', fontSize: '1.1rem' }}>Recent Timeline</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: '#E2E8F0', zIndex: 1 }} />
        
        {timeline.map((event, idx) => {
          let dotColor = '#94A3B8';
          if (event.severity === 'Critical' || event.severity === 'P1') dotColor = '#DC2626';
          else if (event.severity === 'High') dotColor = '#EA580C';
          else if (event.type === 'Implementation') dotColor = '#7C3AED';
          else if (event.type === 'Renewal') dotColor = '#0F766E';
          else dotColor = '#3B82F6';

          return (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: idx * 0.05 }}
              style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 2 }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: `2px solid ${dotColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dotColor }} />
              </div>
              
              <div style={{ flex: 1, background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>{event.title}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{event.date}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {event.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
