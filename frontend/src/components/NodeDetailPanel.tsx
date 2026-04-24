import { motion } from 'framer-motion';

const LABEL_META: Record<string, { color: string; icon: string; description: string }> = {
  Account:          { color: '#00529B', icon: '🏢', description: 'Property Management Company registered with RealPage.' },
  Portfolio:        { color: '#334155', icon: '🗂️', description: 'Aggregated portfolio summary. Showing total managed properties and how many are currently affected by active issues.' },
  Property:         { color: '#00875A', icon: '🏠', description: 'Individual property surfaced because it has a direct active issue attached.' },
  Product:          { color: '#0EA5E9', icon: '📦', description: 'RealPage platform product licensed by this account.' },
  Ticket:           { color: '#D32F2F', icon: '🎫', description: 'Open support case requiring resolution.' },
  BillingIssue:     { color: '#B45309', icon: '💳', description: 'Unresolved billing anomaly impacting account health.' },
  Implementation:   { color: '#7C3AED', icon: '⚙️',  description: 'Active product onboarding or migration engagement.' },
  Renewal:          { color: '#0F766E', icon: '🔄', description: 'Upcoming contract renewal touchpoint.' },
  // ── New VP Health Score Framework nodes ────────────────────────────
  AccountPlan:      { color: '#1D4ED8', icon: '📋', description: 'Account Plan showing Core vs. Non-Core classification, primary solutions, and ARR.' },
  HealthEvent:      { color: '#9333EA', icon: '🏥', description: 'Client Health Event — open or closed within the last 12 months. Tracks status updates and CSM weekly notes.' },
  RenewalChatter:   { color: '#059669', icon: '💬', description: 'Chatter / emails between the client and Renewal Specialist from the Renewal Opportunity in Salesforce.' },
  Cancellation:     { color: '#DC2626', icon: '⚠️', description: 'Cancellation record with reason logged in last 12 months. Strong churn signal.' },
  PME:              { color: '#D97706', icon: '🚨', description: 'Problem Management Escalation — a tracked escalation case sourced from Cases > P2 and PME > Open Activities & Activity History.' },
  CustomerMeeting:  { color: '#2563EB', icon: '📅', description: 'Customer Activity / Meeting record. Tracks QBRs, check-ins, and intervention calls.' },
};

interface Props {
  node: any;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, onClose }: Props) {
  const meta = LABEL_META[node.label] || { color: '#999', icon: '●', description: '' };
  const props = node.properties || {};

  const severityColor = props.severity === 'P1' ? '#D32F2F' : props.severity === 'P2' ? '#B45309' : '#00875A';

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Node Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{meta.icon}</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: meta.color }}>{node.label}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Entity ID: {node.id}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#64748B' }}
        >
          ← Back to Account
        </button>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.85rem', color: '#64748B', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', borderLeft: `3px solid ${meta.color}` }}>
        {meta.description}
      </p>

      {/* Dynamic Properties */}
      <div>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Attributes
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(props).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
              <span style={{
                fontWeight: 600,
                color: key === 'severity' ? severityColor : key === 'status' && String(val).includes('Risk') ? '#D32F2F' : '#1E293B'
              }}>
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── AccountPlan Card ── */}
      {node.label === 'AccountPlan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              padding: '0.35rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem',
              background: props.classification === 'Core' ? '#DBEAFE' : '#FEE2E2',
              color: props.classification === 'Core' ? '#1D4ED8' : '#DC2626',
              border: `1px solid ${props.classification === 'Core' ? '#93C5FD' : '#FCA5A5'}`
            }}>{props.classification === 'Core' ? '✅ Core Account' : '⚠️ Non-Core Account'}</span>
          </div>
          <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '0.5rem 0.75rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Solutions</div>
            <div style={{ padding: '0.6rem 0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Primary</span>
              <span style={{ fontWeight: 600, color: '#1E293B' }}>{props.primary_solution}</span>
            </div>
            {props.secondary_solution && props.secondary_solution !== 'N/A' && (
              <div style={{ padding: '0.6rem 0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>Secondary</span>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>{props.secondary_solution}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, padding: '0.75rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.2rem' }}>ARR</div>
              <div style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>${(props.arr || 0).toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.2rem' }}>CSM Owner</div>
              <div style={{ fontWeight: 600, color: '#1D4ED8', fontSize: '0.8rem' }}>{props.csm_owner}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, padding: '0.6rem 0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center', fontSize: '0.8rem' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.7rem' }}>Customer Reference</div>
              <div style={{ fontWeight: 600, color: '#94A3B8', marginTop: '0.1rem' }}>Coming Soon</div>
            </div>
          </div>
        </div>
      )}

      {/* ── HealthEvent Card ── */}
      {node.label === 'HealthEvent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{
            alignSelf: 'flex-start', padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem',
            background: props.status === 'Open' ? '#FEF3C7' : '#D1FAE5',
            color: props.status === 'Open' ? '#92400E' : '#065F46',
            border: `1px solid ${props.status === 'Open' ? '#FDE68A' : '#6EE7B7'}`
          }}>{props.status === 'Open' ? '🟡 Open Health Event' : '✅ Closed (Resolved)'}</span>
          <div style={{ fontSize: '0.85rem', color: '#1E293B', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: 1.6 }}>
            {props.description}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>📅 Event Date: <strong>{props.date}</strong></div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9333EA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Weekly Update</div>
            <div style={{ fontSize: '0.85rem', color: '#1E293B', padding: '0.75rem', background: '#FAF5FF', borderRadius: '8px', border: '1px solid #E9D5FF', lineHeight: 1.6 }}>
              {props.week_update}
            </div>
          </div>
        </div>
      )}

      {/* ── RenewalChatter Card ── */}
      {node.label === 'RenewalChatter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', overflow: 'hidden' }}>
            <div style={{ padding: '0.5rem 0.75rem', background: '#DCFCE7', borderBottom: '1px solid #BBF7D0', fontSize: '0.72rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💬 Renewal Chatter</div>
            <div style={{ padding: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B', marginBottom: '0.4rem' }}>{props.subject}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <span>👤 From: <strong>{props.from}</strong></span>&nbsp;&nbsp;
                <span>➡️ To: <strong>{props.to}</strong></span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>📅 {props.date}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Message Preview</div>
            <div style={{ fontSize: '0.85rem', color: '#1E293B', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #059669', lineHeight: 1.6, fontStyle: 'italic' }}>
              “{props.snippet}”
            </div>
          </div>
        </div>
      )}

      {/* ── PME Card ── */}
      {node.label === 'PME' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem',
              background: props.status === 'Open' ? '#FEF3C7' : '#D1FAE5',
              color: props.status === 'Open' ? '#92400E' : '#065F46',
              border: `1px solid ${props.status === 'Open' ? '#FDE68A' : '#6EE7B7'}`
            }}>{props.status === 'Open' ? '🟡 Open' : '✅ Closed'}</span>
            <span style={{
              padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem',
              background: props.escalation_level === 'P1' ? '#FEE2E2' : '#FEF3C7',
              color: props.escalation_level === 'P1' ? '#DC2626' : '#92400E',
              border: `1px solid ${props.escalation_level === 'P1' ? '#FCA5A5' : '#FDE68A'}`
            }}>{props.escalation_level} Escalation</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1E293B' }}>{props.title}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, padding: '0.6rem 0.75rem', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '0.8rem' }}>
              <div style={{ color: '#92400E', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Assigned To</div>
              <div style={{ fontWeight: 600, color: '#1E293B' }}>{props.assigned_to}</div>
            </div>
            <div style={{ flex: 1, padding: '0.6rem 0.75rem', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '0.8rem' }}>
              <div style={{ color: '#92400E', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Created</div>
              <div style={{ fontWeight: 600, color: '#1E293B' }}>{props.created_date}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', padding: '0.5rem 0.75rem', background: '#F8FAFC', borderRadius: '6px', borderLeft: '3px solid #D97706' }}>
            Source: Cases &gt; P2 and PME &gt; Open Activities &amp; Activity History
          </div>
        </div>
      )}

      {/* ── Cancellation Card ── */}
      {node.label === 'Cancellation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FCA5A5', borderLeft: '4px solid #DC2626' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Reason for Cancellation</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#7F1D1D' }}>{props.reason}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, padding: '0.6rem 0.75rem', background: '#FFF7ED', borderRadius: '8px', border: '1px solid #FED7AA', fontSize: '0.8rem' }}>
              <div style={{ color: '#9A3412', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Product</div>
              <div style={{ fontWeight: 600, color: '#1E293B' }}>{props.product}</div>
            </div>
            <div style={{ flex: 1, padding: '0.6rem 0.75rem', background: '#FFF7ED', borderRadius: '8px', border: '1px solid #FED7AA', fontSize: '0.8rem' }}>
              <div style={{ color: '#9A3412', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Date</div>
              <div style={{ fontWeight: 600, color: '#1E293B' }}>{props.date}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', padding: '0.5rem 0.75rem', background: '#F8FAFC', borderRadius: '6px', borderLeft: '3px solid #DC2626' }}>
            Source: Cancellations &gt; Reason for Cancellation (last 12 months)
          </div>
        </div>
      )}

      {/* ── CustomerMeeting Card ── */}
      {node.label === 'CustomerMeeting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>{props.title}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem 0.75rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '0.8rem', flex: 1, textAlign: 'center' }}>
              <div style={{ color: '#1D4ED8', fontSize: '0.72rem', marginBottom: '0.15rem' }}>Date</div>
              <div style={{ fontWeight: 600, color: '#1E293B' }}>{props.date}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Attendees</div>
            <div style={{ fontSize: '0.85rem', color: '#1E293B', padding: '0.6rem 0.75rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>{props.attendees}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Meeting Notes</div>
            <div style={{ fontSize: '0.85rem', color: '#1E293B', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #2563EB', lineHeight: 1.6 }}>{props.notes}</div>
          </div>
        </div>
      )}

      {/* ── Original Contextual Actions ── */}
      {node.label === 'Ticket' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#D32F2F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          🚨 Escalate This Ticket
        </motion.button>
      )}
      {node.label === 'BillingIssue' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#B45309', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          💳 Flag for Billing Review
        </motion.button>
      )}
      {node.label === 'Renewal' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#00529B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          🔄 Schedule Renewal Call
        </motion.button>
      )}
      {node.label === 'Implementation' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          ⚙️ Unblock Implementation
        </motion.button>
      )}
      {/* ── New Contextual Actions ── */}
      {node.label === 'PME' && props.status === 'Open' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#D97706', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          🚨 Open PME in Salesforce
        </motion.button>
      )}
      {node.label === 'HealthEvent' && props.status === 'Open' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#9333EA', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          🏥 Log Weekly Health Update
        </motion.button>
      )}
      {node.label === 'RenewalChatter' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          💬 Open Chatter Thread
        </motion.button>
      )}
      {node.label === 'CustomerMeeting' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem 1rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}
        >
          📅 Schedule Follow-up Meeting
        </motion.button>
      )}
    </motion.div>
  );
}
