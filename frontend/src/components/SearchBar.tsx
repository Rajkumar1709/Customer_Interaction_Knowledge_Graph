import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountSummary {
  id: string;
  name: string;
  health_score: number;
}

interface Filters {
  risky: boolean;
  renewal: boolean;
  implementation: boolean;
}

export default function SearchBar({ onSelect }: { onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AccountSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>({ risky: true, renewal: true, implementation: false });

  const fetchAccounts = useCallback(async (p: number) => {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('page', String(p));
      params.set('limit', '12');
      if (filters.risky) params.set('risky', 'true');
      if (filters.renewal) params.set('renewal', 'true');
      if (filters.implementation) params.set('implementation', 'true');

      const res = await axios.get(`/api/accounts/search?${params}`);
      setResults(res.data.accounts);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
      setPage(res.data.page);
    } catch (err) {
      console.error("Backend offline.", err);
    }
  }, [query, filters]);

  // Reset to page 1 when query or filters change
  useEffect(() => {
    const timeout = setTimeout(() => fetchAccounts(1), 300);
    return () => clearTimeout(timeout);
  }, [fetchAccounts]);

  const toggleFilter = (key: keyof Filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search 1,500+ PMCs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.25rem', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
        />
        <Search size={16} style={{ position: 'absolute', left: '0.7rem', top: '0.75rem', color: '#94A3B8' }} />
      </div>

      {/* Quick Filters — these are FUNCTIONAL now */}
      <div>
        <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quick Filters</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.risky} onChange={() => toggleFilter('risky')} /> Show Risky Accounts
            </label>
          </li>
          <li>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.renewal} onChange={() => toggleFilter('renewal')} /> Renewal &lt; 90 Days
            </label>
          </li>
          <li>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={filters.implementation} onChange={() => toggleFilter('implementation')} /> Stalled Implementation
            </label>
          </li>
        </ul>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        {total} accounts found · Page {page} of {totalPages}
      </div>

      {/* Account List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto', maxHeight: '320px' }}>
        <AnimatePresence mode="popLayout">
          {results.map((acc, idx) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03, type: 'spring', stiffness: 300, damping: 24 }}
              onClick={() => onSelect(acc.id)}
              style={{
                padding: '0.6rem 0.75rem',
                background: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s'
              }}
              whileHover={{ backgroundColor: '#F0F7FF' }}
            >
              <span style={{ fontWeight: 500, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{acc.name}</span>
              <span className={acc.health_score < 50 ? 'badge badge-critical' : 'badge badge-healthy'}>
                {acc.health_score} {acc.health_score < 50 ? 'Risk' : 'Healthy'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => fetchAccounts(page - 1)}
            style={{
              display: 'flex', alignItems: 'center', padding: '0.3rem 0.5rem',
              border: '1px solid #D1D5DB', borderRadius: '4px', background: page <= 1 ? '#F3F4F6' : 'white',
              cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.5 : 1, fontSize: '0.75rem'
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {/* Page number buttons */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pg: number;
            if (totalPages <= 5) pg = i + 1;
            else if (page <= 3) pg = i + 1;
            else if (page >= totalPages - 2) pg = totalPages - 4 + i;
            else pg = page - 2 + i;
            return (
              <button key={pg} onClick={() => fetchAccounts(pg)} style={{
                width: 28, height: 28, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                border: pg === page ? '1px solid #0078D4' : '1px solid #D1D5DB',
                background: pg === page ? '#0078D4' : 'white',
                color: pg === page ? 'white' : '#374151',
                cursor: 'pointer'
              }}>{pg}</button>
            );
          })}

          <button
            disabled={page >= totalPages}
            onClick={() => fetchAccounts(page + 1)}
            style={{
              display: 'flex', alignItems: 'center', padding: '0.3rem 0.5rem',
              border: '1px solid #D1D5DB', borderRadius: '4px', background: page >= totalPages ? '#F3F4F6' : 'white',
              cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.5 : 1, fontSize: '0.75rem'
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
