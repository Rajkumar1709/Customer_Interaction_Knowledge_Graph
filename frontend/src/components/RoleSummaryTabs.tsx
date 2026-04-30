import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';

// Converts raw dollar strings like "$2,231,068.89" → "$2.2M" anywhere in text
function formatMillions(text: string): string {
  if (!text) return text;
  return text.replace(/\$[\d,]+(?:\.\d+)?/g, (match) => {
    const num = parseFloat(match.replace(/[$,]/g, ''));
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000)     return `$${(num / 1_000).toFixed(1)}K`;
    return match;
  });
}

export default function RoleSummaryTabs({ roles }: { roles: any }) {
  const [activeTab, setActiveTab] = useState('executive');

  if (!roles) return null;

  const tabs = [
    { id: 'executive',       label: 'Executive' },
    { id: 'sales',           label: 'Sales' },
    { id: 'csm',             label: 'Customer Success' },
    { id: 'renewals',        label: 'Renewals' },
    { id: 'support',         label: 'Support' },
    { id: 'implementation',  label: 'Implementation' },
    { id: 'product',         label: 'Product' }
  ];

  const rawContent = roles[activeTab] || 'No summary generated for this role.';
  const content = typeof rawContent === 'string' ? formatMillions(rawContent) : rawContent;

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

      {/* Section Heading */}
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users size={15} style={{ color: '#0078D4' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>Role-Based Intelligence</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>AI-generated per stakeholder</span>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', background: 'white' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                background: isActive ? '#F1F5F9' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                color: isActive ? '#0F172A' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.82rem',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ position: 'relative', padding: '1.5rem', minHeight: '110px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.7, fontWeight: 400 }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
