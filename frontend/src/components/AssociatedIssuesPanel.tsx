import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch } from 'lucide-react';

// ── Same color mapping as GraphView legend ──────────────────────────────────
const NODE_COLORS: Record<string, string> = {
  Ticket:          '#D32F2F',
  BillingIssue:    '#B45309',
  Implementation:  '#7C3AED',
  Renewal:         '#0F766E',
  HealthEvent:     '#9333EA',
  PME:             '#D97706',
  Cancellation:    '#1E293B',
  CustomerMeeting: '#2563EB',
  RenewalChatter:  '#059669',
  AccountPlan:     '#1D4ED8',
};

const NODE_BG: Record<string, string> = {
  Ticket:          '#FFF1F1',
  BillingIssue:    '#FFF7ED',
  Implementation:  '#F5F3FF',
  Renewal:         '#F0FDFA',
  HealthEvent:     '#FAF5FF',
  PME:             '#FFFBEB',
  Cancellation:    '#F1F5F9',
  CustomerMeeting: '#EFF6FF',
  RenewalChatter:  '#ECFDF5',
  AccountPlan:     '#EFF6FF',
};

const NODE_BORDER: Record<string, string> = {
  Ticket:          '#FCA5A5',
  BillingIssue:    '#FCD34D',
  Implementation:  '#C4B5FD',
  Renewal:         '#99F6E4',
  HealthEvent:     '#E9D5FF',
  PME:             '#FDE68A',
  Cancellation:    '#CBD5E1',
  CustomerMeeting: '#BFDBFE',
  RenewalChatter:  '#A7F3D0',
  AccountPlan:     '#93C5FD',
};

const NODE_ICONS: Record<string, string> = {
  Ticket:          '🎫',
  BillingIssue:    '💳',
  Implementation:  '⚙️',
  Renewal:         '🔄',
  HealthEvent:     '🏥',
  PME:             '🚨',
  Cancellation:    '🚫',
  CustomerMeeting: '📅',
  RenewalChatter:  '💬',
  AccountPlan:     '📋',
};

/**
 * Returns a concise display label for a node based on its type + properties.
 */
function getNodeTitle(node: any): string {
  const p = node.properties || {};
  switch (node.label) {
    case 'Ticket':          return p.case_number ? `Case #${p.case_number}` : (p.subject || 'Ticket');
    case 'BillingIssue':    return p.name || p.type || 'Billing Issue';
    case 'Implementation':  return p.product || 'Implementation';
    case 'Renewal':         return p.name || 'Renewal';
    case 'HealthEvent':     return p.title || 'Health Event';
    case 'PME':             return p.number || 'PME';
    case 'Cancellation':    return p.reason ? `Cancel: ${p.reason.slice(0, 30)}…` : 'Cancellation';
    case 'CustomerMeeting': return p.meeting_type || p.name || 'Customer Meeting';
    case 'RenewalChatter':  return p.subject || 'Renewal Chatter';
    case 'AccountPlan':     return p.classification ? `Account Plan — ${p.classification}` : 'Account Plan';
    default:                return p.name || node.label;
  }
}

/**
 * Returns a concise subtitle/status badge for the card.
 */
function getNodeSub(node: any): string | null {
  const p = node.properties || {};
  switch (node.label) {
    case 'Ticket':          return p.severity ? `${p.severity} · ${p.status || ''}` : p.status || null;
    case 'BillingIssue':    return p.status || null;
    case 'Implementation':  return p.phase ? `${p.phase} · ${p.status || ''}` : p.status || null;
    case 'Renewal':         return p.stage || null;
    case 'HealthEvent':     return p.status ? `${p.status} · ${p.issue_type || ''}` : p.issue_type || null;
    case 'PME':             return p.status ? `${p.status} · ${p.priority || ''}` : null;
    case 'Cancellation':    return p.status || null;
    case 'CustomerMeeting': return p.date || null;
    case 'RenewalChatter':  return p.date || null;
    case 'AccountPlan':     return p.primary_solution || null;
    default:                return null;
  }
}

interface Props {
  selectedGroupNode: any | null; // group node clicked in graph — carries .items[]
  onIssueClick: (node: any) => void;
}

export default function AssociatedIssuesPanel({ selectedGroupNode, onIssueClick }: Props) {

  // ── Issue list comes directly from the group node's .items array ─────────
  // No link-traversal needed — GraphView pre-groups them for us.
  const issueNodes: any[] = selectedGroupNode?.items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Panel Header ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--glass-border)',
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
      }}>
        <GitBranch size={15} style={{ color: 'var(--rp-blue)' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--rp-blue)', lineHeight: 1 }}>
          Issues Associated
          {selectedGroupNode && (
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.35rem', fontSize: '0.78rem' }}>
              — {selectedGroupNode.label}
            </span>
          )}
        </span>
        {issueNodes.length > 0 && (
          <span style={{
            marginLeft: 'auto',
            background: '#0078D4',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            flexShrink: 0,
          }}>
            {issueNodes.length}
          </span>
        )}
      </div>

      {/* ── Panel Body ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem' }}>
        <AnimatePresence mode="wait">

          {/* State 1: No group node selected yet */}
          {!selectedGroupNode && (
            <motion.div
              key="empty-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '1rem', height: '100%',
                minHeight: '200px', textAlign: 'center', padding: '1.25rem',
              }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="3" y="3" width="54" height="54" rx="14" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2"/>
                <circle cx="30" cy="16" r="5" fill="#3B82F6"/>
                <circle cx="16" cy="38" r="5" fill="#93C5FD"/>
                <circle cx="44" cy="38" r="5" fill="#93C5FD"/>
                <line x1="30" y1="21" x2="16" y2="33" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="3 2"/>
                <line x1="30" y1="21" x2="44" y2="33" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="3 2"/>
                <rect x="12" y="36" width="8" height="4" rx="2" fill="#60A5FA"/>
                <rect x="40" y="36" width="8" height="4" rx="2" fill="#60A5FA"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.35rem' }}>No Node Selected</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: '175px', lineHeight: 1.7 }}>
                  Click any node in the <strong style={{ color: '#0078D4' }}>Network Explorer</strong> to see its linked issues here.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Tickets', 'PMEs', 'Health Events'].map(t => (
                  <span key={t} style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.18rem 0.5rem', borderRadius: '9px', background: '#EFF6FF', color: '#0078D4', border: '1px solid #BFDBFE' }}>{t}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* State 2: Group node selected but it has no items */}
          {selectedGroupNode && issueNodes.length === 0 && (
            <motion.div
              key="empty-no-issues"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '1rem', height: '100%',
                minHeight: '200px', textAlign: 'center', padding: '1.25rem',
              }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect x="3" y="3" width="50" height="50" rx="13" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="2"/>
                <path d="M28 12 L40 18 L40 28 C40 35 28 42 28 42 C28 42 16 35 16 28 L16 18 Z" fill="#BBF7D0" stroke="#86EFAC" strokeWidth="1.5"/>
                <path d="M22 28 L26 32 L34 23" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065F46', marginBottom: '0.35rem' }}>All Clear</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: '175px', lineHeight: 1.7 }}>
                  No issues associated with this{' '}
                  <strong style={{ color: '#059669' }}>{selectedGroupNode.label}</strong>.
                </div>
              </div>
              <div style={{ padding: '0.45rem 0.75rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '0.75rem', color: '#047857', fontWeight: 500 }}>
                ✅ No linked Tickets, PMEs, or Health Events
              </div>
            </motion.div>
          )}

          {/* State 3: Issue cards */}
          {selectedGroupNode && issueNodes.length > 0 && (
            <motion.div
              key={`issues-${selectedGroupNode.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              {issueNodes.map((issue, idx) => {
                const color  = NODE_COLORS[issue.label]  || '#64748B';
                const bg     = NODE_BG[issue.label]      || '#F8FAFC';
                const border = NODE_BORDER[issue.label]  || '#E2E8F0';
                const icon   = NODE_ICONS[issue.label]   || '●';
                const title  = getNodeTitle(issue);
                const sub    = getNodeSub(issue);

                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.045, type: 'spring', stiffness: 280, damping: 24 }}
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onIssueClick(issue)}
                    style={{
                      background:   bg,
                      border:       `1px solid ${border}`,
                      borderLeft:   `4px solid ${color}`,
                      borderRadius: '8px',
                      padding:      '0.65rem 0.75rem',
                      cursor:       'pointer',
                      display:      'flex',
                      flexDirection:'column',
                      gap:          '0.3rem',
                      transition:   'box-shadow 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 2px 10px ${color}30`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    {/* Label row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.88rem' }}>{icon}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {issue.label}
                      </span>
                      <span style={{ marginLeft: 'auto', color, fontSize: '0.75rem', opacity: 0.7 }}>›</span>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.3, wordBreak: 'break-word' }}>
                      {title}
                    </div>

                    {/* Subtitle / status badge */}
                    {sub && (
                      <div style={{
                        fontSize: '0.72rem', color: '#64748B',
                        background: 'rgba(255,255,255,0.7)', padding: '0.15rem 0.45rem',
                        borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)',
                        alignSelf: 'flex-start', maxWidth: '100%',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {sub}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
