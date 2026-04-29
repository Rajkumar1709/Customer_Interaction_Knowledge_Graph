import { motion } from 'framer-motion';

const LABEL_META: Record<string, { color: string; icon: string; description: string }> = {
  Account:        { color: '#00529B', icon: '🏢', description: 'Property Management Company registered with RealPage. Showing live profile data from Salesforce.' },
  Ticket:         { color: '#D32F2F', icon: '🎫', description: 'Open support case requiring resolution. Sourced from SFDC_Case.' },
  BillingIssue:   { color: '#B45309', icon: '💳', description: 'Unresolved billing anomaly impacting account health.' },
  Implementation: { color: '#7C3AED', icon: '⚙️',  description: 'Active product onboarding or migration. Sourced from SFDC_Order__c.' },
  Renewal:        { color: '#0F766E', icon: '🔄', description: 'Upcoming contract renewal opportunity. Sourced from SFDC_Opportunity.' },
  AccountPlan:    { color: '#1D4ED8', icon: '📋', description: 'Account Plan — Core vs. Non-Core classification, primary solutions, and ARR.' },
  HealthEvent:    { color: '#9333EA', icon: '🏥', description: 'Client Health Event — risk signal logged by the CSM. Sourced from SFDC_ClientHealthEvents__c.' },
  RenewalChatter: { color: '#059669', icon: '💬', description: 'Chatter between client and Renewal Specialist from Salesforce.' },
  Cancellation:   { color: '#1E293B', icon: '🚫', description: 'Cancellation record. Strong churn signal. Sourced from SFDC_Cancellation.' },
  PME:            { color: '#D97706', icon: '🚨', description: 'Problem Management Escalation. Sourced from SFDC_ProblemManagementEscalation.' },
  CustomerMeeting:{ color: '#2563EB', icon: '📅', description: 'Customer Activity / Meeting record. Tracks QBRs, check-ins, and intervention calls.' },
};

const Row = ({ label, value, highlight }: { label: string; value: any; highlight?: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.55rem 0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.84rem', gap: '0.5rem' }}>
    <span style={{ color: '#64748B', flexShrink: 0 }}>{label}</span>
    <span style={{ fontWeight: 600, color: highlight || '#1E293B', textAlign: 'right', wordBreak: 'break-word', maxWidth: '60%' }}>{String(value ?? 'N/A')}</span>
  </div>
);

const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
    {children}
  </div>
);

const TextBox = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div>
    <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>{label}</div>
    <div style={{ fontSize: '0.84rem', color: '#1E293B', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: 1.65, maxHeight: '160px', overflowY: 'auto' }}>{value || '—'}</div>
  </div>
);

interface Props { node: any; onClose: () => void; }

export default function NodeDetailPanel({ node, onClose }: Props) {
  const meta = LABEL_META[node.label] || { color: '#999', icon: '●', description: '' };
  const p = node.properties || {};
  const sevColor = (s: string) => s?.startsWith('P1') ? '#DC2626' : s?.startsWith('P2') ? '#EA580C' : s?.startsWith('P3') ? '#D97706' : '#059669';

  return (
    <motion.div key={node.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{meta.icon}</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: meta.color }}>{node.label}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Entity ID: {node.id}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', color: '#64748B' }}>← Back</button>
      </div>

      <p style={{ fontSize: '0.84rem', color: '#64748B', padding: '0.65rem 0.75rem', background: '#F8FAFC', borderRadius: '8px', borderLeft: `3px solid ${meta.color}`, margin: 0 }}>
        {meta.description}
      </p>

      {/* ═══════════════════════════════════════════════════════
          ACCOUNT (PMC) CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'Account' && (
        <>
          <Section title="Identity" color="#00529B">
            <Row label="Company Name" value={p.name} />
            <Row label="OMS Account ID" value={p.oms_id} />
            <Row label="Location" value={p.location} />
            <Row label="Territory" value={p.territory} />
            <Row label="Business Type" value={p.business_type} />
          </Section>
          <Section title="Financial Overview" color="#059669">
            <Row label="Total ACV" value={p.total_acv} highlight="#059669" />
            <Row label="Total Units" value={p.total_units} />
            <Row label="Total Properties" value={p.total_properties} />
            <Row label="Account Tier" value={p.tier} />
          </Section>
          <Section title="Risk & Classification" color="#DC2626">
            <Row label="Core Classification" value={p.core} highlight={p.core === 'Non-Core' ? '#DC2626' : '#059669'} />
            <Row label="Risk Level" value={p.risk_level} highlight={p.risk_level === 'High' ? '#DC2626' : '#1E293B'} />
          </Section>
          <Section title="Solutions" color="#1D4ED8">
            <Row label="Primary Solution" value={p.primary_solution} />
            <Row label="Secondary Solution" value={p.secondary_solution} />
          </Section>
          <Section title="CSM Owner" color="#7C3AED">
            <Row label="Name" value={p.csm} />
            <Row label="Email" value={p.csm_email} />
          </Section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          TICKET CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'Ticket' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: '#FEE2E2', color: sevColor(p.severity), border: `1px solid ${sevColor(p.severity)}40` }}>{p.severity || 'Unknown'}</span>
            <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}>{p.status}</span>
            {p.out_of_sls === '⚠️ Yes' && <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>⚠️ SLA Breached</span>}
          </div>
          <Section title="Case Details" color="#D32F2F">
            <Row label="Case Number" value={p.case_number} />
            <Row label="Product" value={p.product} />
            <Row label="Area" value={p.area} />
            <Row label="Sub-Area" value={p.sub_area} />
            <Row label="Channel" value={p.channel} />
            <Row label="Reason" value={p.reason} />
          </Section>
          <TextBox label="Subject" value={p.subject} color="#D32F2F" />
          <TextBox label="Description" value={p.description} color="#D32F2F" />
          <Section title="Timeline & SLA" color="#D97706">
            <Row label="Days Open" value={p.days_open} highlight={Number(String(p.days_open).split(' ')[0]) > 10 ? '#DC2626' : '#1E293B'} />
            <Row label="SLS Status" value={p.sls_status} />
            <Row label="Out of SLS" value={p.out_of_sls} highlight={p.out_of_sls === '⚠️ Yes' ? '#DC2626' : '#059669'} />
            <Row label="Reopen Count" value={p.reopen_count} />
            <Row label="Created" value={p.created} />
            <Row label="Escalated to Dev" value={p.escalated_to_dev} />
            <Row label="Escalated to T2" value={p.escalated_to_t2} />
          </Section>
          <Section title="Escalation" color="#7C3AED">
            <Row label="Escalation Status" value={p.escalation_status} />
            <Row label="Linked PME" value={p.linked_pme} />
          </Section>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '0.75rem', background: '#D32F2F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            🚨 Escalate This Ticket
          </motion.button>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          HEALTH EVENT CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'HealthEvent' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: p.status === 'Open' ? '#FEF3C7' : '#D1FAE5', color: p.status === 'Open' ? '#92400E' : '#065F46', border: `1px solid ${p.status === 'Open' ? '#FDE68A' : '#6EE7B7'}` }}>{p.status === 'Open' ? '🟡 Open' : '✅ Closed'}</span>
            <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem', background: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF' }}>{p.severity || 'N/A'}</span>
          </div>
          {p.title && p.title !== 'Health Event' && (
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B', padding: '0.5rem 0.75rem', background: '#FAF5FF', borderRadius: '8px', border: '1px solid #E9D5FF' }}>{p.title}</div>
          )}
          <Section title="Risk Signals" color="#9333EA">
            <Row label="Issue Type" value={p.issue_type} />
            <Row label="Root Cause" value={p.root_cause} />
            <Row label="Sub Status" value={p.sub_status} />
            <Row label="Sites at Risk" value={p.sites_at_risk} highlight={Number(p.sites_at_risk) > 0 ? '#DC2626' : '#1E293B'} />
            <Row label="Units at Risk" value={p.units_at_risk} highlight={Number(p.units_at_risk) > 0 ? '#DC2626' : '#1E293B'} />
            <Row label="Impacted ACV" value={p.impacted_acv} highlight="#DC2626" />
            <Row label="Estimated ACV at Risk" value={p.estimated_acv_risk} highlight="#EA580C" />
          </Section>
          <Section title="Timeline" color="#9333EA">
            <Row label="Reported On" value={p.reported_on} />
            <Row label="Target Completion" value={p.target_completion} />
          </Section>
          <TextBox label="Description" value={p.description} color="#9333EA" />
          <TextBox label="CSM Action Plan" value={p.action_plan} color="#9333EA" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '0.75rem', background: '#9333EA', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            🏥 Log Weekly Health Update
          </motion.button>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          PME CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'PME' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: p.status === 'Open' ? '#FEF3C7' : '#D1FAE5', color: p.status === 'Open' ? '#92400E' : '#065F46', border: `1px solid ${p.status === 'Open' ? '#FDE68A' : '#6EE7B7'}` }}>{p.status}</span>
            <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: '#FEF3C7', color: sevColor(p.priority), border: `1px solid ${sevColor(p.priority)}40` }}>{p.priority}</span>
            {p.recurring === '⚠️ Yes — Recurring Issue' && <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>🔁 Recurring</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>{p.number}</div>
          <Section title="Escalation Details" color="#D97706">
            <Row label="PME Owner" value={p.pme_owner} />
            <Row label="Functional Area" value={p.functional_area} />
            <Row label="Product" value={p.product} />
            <Row label="Days Open" value={p.days_open} highlight={Number(String(p.days_open).split(' ')[0]) > 10 ? '#DC2626' : '#1E293B'} />
            <Row label="Escalation Days" value={p.escalation_days} />
          </Section>
          <Section title="Timeline" color="#D97706">
            <Row label="Created" value={p.created_date} />
            <Row label="Due Date" value={p.due_date} />
            <Row label="Date Closed" value={p.date_closed} />
          </Section>
          <Section title="Impact" color="#DC2626">
            <Row label="Business Impact" value={p.business_impact} />
            <Row label="Customer Impact" value={p.customer_impact} />
            <Row label="Error Message" value={p.error_message} />
          </Section>
          <TextBox label="Summary" value={p.summary} color="#D97706" />
          <TextBox label="Description" value={p.description} color="#D97706" />
          {p.resolution_summary && p.resolution_summary !== 'Not yet resolved.' && (
            <TextBox label="Resolution Summary" value={p.resolution_summary} color="#059669" />
          )}
          {(p.tfs_azure_id || p.tfs_legacy_id !== 'N/A') && (
            <div style={{ background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', overflow: 'hidden' }}>
              <div style={{ padding: '0.5rem 0.75rem', background: '#DBEAFE', borderBottom: '1px solid #BFDBFE', fontSize: '0.72rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>Azure DevOps / TFS</div>
              <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <Row label="ADO ID" value={p.tfs_azure_id || 'N/A'} />
                <Row label="ADO State" value={p.tfs_status} />
                <Row label="ADO Priority" value={p.tfs_priority} />
                <Row label="Legacy TFS ID" value={p.tfs_legacy_id} />
                {p.tfs_link && (
                  <a href={p.tfs_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none', marginTop: '0.25rem' }}>🔗 Open in Azure DevOps →</a>
                )}
              </div>
            </div>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '0.75rem', background: '#D97706', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            🚨 Open PME in Salesforce
          </motion.button>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          CANCELLATION CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'Cancellation' && (
        <>
          <div style={{ padding: '0.75rem', background: '#1E293B', borderRadius: '8px', color: 'white' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Reason for Cancellation</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.reason || 'No reason logged.'}</div>
          </div>
          <Section title="Cancellation Details" color="#1E293B">
            <Row label="Status" value={p.status} />
            <Row label="Products Cancelled" value={p.products} />
            <Row label="Unique Products" value={p.unique_products} />
            <Row label="Sites Affected" value={p.unique_sites} />
            <Row label="Submitted Date" value={p.submitted_date} />
            <Row label="Effective Date" value={p.effective_date} />
            <Row label="PMC Name" value={p.pmc_name} />
          </Section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          RENEWAL CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'Renewal' && (
        <>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F766E' }}>{p.name}</div>
          <Section title="Deal Overview" color="#0F766E">
            <Row label="Stage" value={p.stage} />
            <Row label="Close Date" value={p.close_date} />
            <Row label="Probability" value={p.probability} highlight={Number(String(p.probability).replace('%','')) < 50 ? '#DC2626' : '#059669'} />
            <Row label="Expected Revenue" value={p.expected_rev} highlight="#059669" />
            <Row label="Forecast Category" value={p.forecast} />
          </Section>
          <Section title="Intelligence" color="#0F766E">
            <Row label="Primary Competitor" value={p.competitor} highlight={p.competitor !== 'None identified' ? '#DC2626' : '#059669'} />
            <Row label="Lost Reason" value={p.lost_reason} />
          </Section>
          {p.next_step && p.next_step !== 'No next step logged.' && (
            <TextBox label="Next Step" value={p.next_step} color="#0F766E" />
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '0.75rem', background: '#0F766E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            🔄 Schedule Renewal Call
          </motion.button>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          IMPLEMENTATION CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'Implementation' && (
        <>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#7C3AED' }}>{p.product}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: '#EDE9FE', color: '#7C3AED', border: '1px solid #C4B5FD' }}>{p.phase}</span>
            {p.sla_violation?.includes('Yes') && <span style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>⚠️ SLA Breach</span>}
          </div>
          <Section title="Implementation Details" color="#7C3AED">
            <Row label="Product Family" value={p.product_family} />
            <Row label="Status" value={p.status} />
            <Row label="Days in Phase" value={p.days_in_phase} />
            <Row label="Total Days Running" value={p.days_running} />
            <Row label="SLA Violation" value={p.sla_violation} highlight={p.sla_violation?.includes('Yes') ? '#DC2626' : '#059669'} />
            <Row label="Backlog Reason" value={p.backlog_reason} />
          </Section>
          <Section title="Timeline" color="#7C3AED">
            <Row label="Start Date" value={p.start_date} />
            <Row label="Target Go-Live" value={p.target_go_live} />
            <Row label="Order Created" value={p.created} />
          </Section>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '0.75rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            ⚙️ Unblock Implementation
          </motion.button>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          ACCOUNT PLAN CARD
      ═══════════════════════════════════════════════════════ */}
      {node.label === 'AccountPlan' && (
        <>
          <span style={{ alignSelf: 'flex-start', padding: '0.35rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem',
            background: p.classification === 'Core' ? '#DBEAFE' : '#FEE2E2',
            color: p.classification === 'Core' ? '#1D4ED8' : '#DC2626',
            border: `1px solid ${p.classification === 'Core' ? '#93C5FD' : '#FCA5A5'}` }}>
            {p.classification === 'Core' ? '✅ Core Account' : '⚠️ Non-Core Account'}
          </span>
          <Section title="Solutions" color="#1D4ED8">
            <Row label="Primary Solution" value={p.primary_solution} />
            <Row label="Secondary Solution" value={p.secondary_solution} />
          </Section>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, padding: '0.75rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.2rem' }}>ARR</div>
              <div style={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>${Number(p.arr || 0).toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.2rem' }}>CSM Owner</div>
              <div style={{ fontWeight: 600, color: '#1D4ED8', fontSize: '0.8rem' }}>{p.csm_owner}</div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          GENERIC FALLBACK (CustomerMeeting, BillingIssue etc.)
      ═══════════════════════════════════════════════════════ */}
      {!['Account','Ticket','HealthEvent','PME','Cancellation','Renewal','Implementation','AccountPlan'].includes(node.label) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(p).map(([key, val]) => (
            <Row key={key} label={key.replace(/_/g, ' ')} value={val as any} />
          ))}
        </div>
      )}

      {/* CustomerMeeting action */}
      {node.label === 'CustomerMeeting' && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
          📅 Schedule Follow-up Meeting
        </motion.button>
      )}
      {node.label === 'BillingIssue' && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ padding: '0.75rem', background: '#B45309', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
          💳 Flag for Billing Review
        </motion.button>
      )}
    </motion.div>
  );
}
