import { motion } from 'framer-motion';

export default function TimelineBuilder({ timeline }: { timeline: any[] }) {
  if (!timeline || timeline.length === 0) return <div>No recent events.</div>;

  // Helper to format "N days ago"
  const getRelativeDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const eventDate = new Date(dateStr);
    if (isNaN(eventDate.getTime())) return dateStr;
    
    // Environment current date context
    const today = new Date('2026-04-30T00:00:00Z');
    const diffTime = today.getTime() - eventDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays > 0) return `${diffDays} days ago`;
    if (diffDays < 0) return `In ${Math.abs(diffDays)} days`;
    return dateStr;
  };

  // Sort timeline: recent first
  const sortedTimeline = [...timeline].sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime();
    const timeB = new Date(b.date || 0).getTime();
    // Handle invalid dates by pushing them to the bottom
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;
    return timeB - timeA;
  });

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#1E293B', fontSize: '1.1rem' }}>Recent Timeline</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: '#E2E8F0', zIndex: 1 }} />
        
        {sortedTimeline.map((event, idx) => {
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
              
              <div style={{ flex: 1, background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem', flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{event.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    {event.status && (() => {
                      const s = String(event.status).toLowerCase();
                      const isOpen = s === 'open' || s === 'new' || s === 'in progress' || s === 'active' || s === 'submitted';
                      const isClosed = s === 'closed' || s === 'resolved' || s === 'completed' || s === 'cancelled';
                      const bg = isOpen ? '#FEF3C7' : isClosed ? '#DCFCE7' : '#E2E8F0';
                      const color = isOpen ? '#92400E' : isClosed ? '#14532D' : '#475569';
                      const dot = isOpen ? '#F59E0B' : isClosed ? '#16A34A' : '#94A3B8';
                      return (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '10px', background: bg, color }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, display: 'inline-block' }} />
                          {event.status}
                        </span>
                      );
                    })()}
                    <span style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>{getRelativeDate(event.date)}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.5 }}>
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
