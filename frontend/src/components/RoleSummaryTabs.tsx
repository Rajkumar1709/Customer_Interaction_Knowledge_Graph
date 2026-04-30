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
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                padding: '1rem 0.5rem', 
                background: isActive ? '#F1F5F9' : 'transparent', 
                border: 'none', 
                borderBottom: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                color: isActive ? '#0F172A' : '#64748B', 
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer', 
                transition: 'all 0.2s', 
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Content Area */}
      <div style={{ position: 'relative', padding: '2rem 1.5rem', minHeight: '120px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ color: '#334155', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 400 }}
          >
            {roles[activeTab] || 'No summary generated for this role.'}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
