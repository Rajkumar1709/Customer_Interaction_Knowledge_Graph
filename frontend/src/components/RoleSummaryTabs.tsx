import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoleSummaryTabs({ roles }: { roles: any }) {
  const [activeTab, setActiveTab] = useState('sales');

  if (!roles) return null;

  const tabs = [
    { id: 'executive', label: 'Executive' },
    { id: 'sales', label: 'Sales' },
    { id: 'csm', label: 'Customer Success' },
    { id: 'renewals', label: 'Renewals' },
    { id: 'support', label: 'Support' },
    { id: 'implementation', label: 'Implementation' },
    { id: 'product', label: 'Product' }
  ];

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #3B82F6' : '2px solid transparent',
              color: activeTab === tab.id ? '#1D4ED8' : '#64748B', fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div style={{ padding: '1.25rem', minHeight: '100px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.6 }}
          >
            {roles[activeTab] || 'No summary generated for this role.'}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
