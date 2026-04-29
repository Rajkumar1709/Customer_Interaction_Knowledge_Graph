import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
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

interface Props {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onSelect: (id: string) => void;
}

function trafficDot(score: number) {
  if (score < 40)  return { color: '#DC2626', label: 'High Risk' };
  if (score <= 70) return { color: '#D97706', label: 'Moderate' };
  return               { color: '#059669', label: 'Low Risk' };
}

const CHIPS = [
  { key: 'risky',          emoji: '🔴', label: 'Risky Accounts' },
  { key: 'renewal',        emoji: '🔄', label: 'Renewal < 90d' },
  { key: 'implementation', emoji: '⚙️',  label: 'Stalled Impl.' },
] as const;

export default function TopNavSearch({ filters, onFiltersChange, onSelect }: Props) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<AccountSummary[]>([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);
  const dropdownRef             = useRef<HTMLDivElement>(null);

  // ── Typeahead fetch ───────────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/accounts/search`, {
        params: { q, limit: 8 },
      });
      setResults(res.data.accounts || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchSuggestions(query), 280);
    return () => clearTimeout(t);
  }, [query, fetchSuggestions]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (acc: AccountSummary) => {
    onSelect(acc.id);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const toggleFilter = (key: keyof Filters) =>
    onFiltersChange({ ...filters, [key]: !filters[key] });

  const clearQuery = () => { setQuery(''); setResults([]); setOpen(false); };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>

      {/* ── Search Input ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: focused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
          border: focused ? '1px solid rgba(255,255,255,0.55)' : '1px solid rgba(255,255,255,0.22)',
          borderRadius: '20px',
          padding: '0 0.75rem',
          gap: '0.5rem',
          transition: 'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(255,255,255,0.12)' : 'none',
        }}>
          <Search size={14} style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { setFocused(true); if (query && results.length) setOpen(true); }}
            onBlur={() => setFocused(false)}
            placeholder="Search PMCs, accounts, or entities…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '0.82rem',
              padding: '0.48rem 0',
              fontFamily: 'Inter, sans-serif',
              minWidth: 0,
            }}
          />
          {loading && (
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
          )}
          {query && !loading && (
            <button onClick={clearQuery} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(255,255,255,0.55)' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Typeahead Dropdown ──────────────────────────────────────────── */}
        <AnimatePresence>
          {open && results.length > 0 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'white',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                zIndex: 9999,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F1F5F9' }}>
                Matching Accounts
              </div>
              {results.map((acc, idx) => {
                const dot = trafficDot(acc.health_score);
                return (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => handleSelect(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      cursor: 'pointer',
                      borderBottom: idx < results.length - 1 ? '1px solid #F8FAFC' : 'none',
                      transition: 'background 0.12s',
                    }}
                    whileHover={{ backgroundColor: '#F0F7FF' }}
                  >
                    {/* Traffic dot */}
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot.color, flexShrink: 0 }} />
                    {/* Name */}
                    <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 500, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {acc.name}
                    </span>
                    {/* Score pill */}
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '10px',
                      background: `${dot.color}18`,
                      color: dot.color,
                      border: `1px solid ${dot.color}40`,
                      flexShrink: 0,
                    }}>
                      {acc.health_score}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          {open && query && !loading && results.length === 0 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'white',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                zIndex: 9999,
                padding: '1rem',
                textAlign: 'center',
                fontSize: '0.82rem',
                color: '#94A3B8',
              }}
            >
              No accounts found for "{query}"
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Filter Chips ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
        {CHIPS.map(chip => {
          const active = filters[chip.key];
          return (
            <motion.button
              key={chip.key}
              onClick={() => toggleFilter(chip.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.32rem 0.65rem',
                borderRadius: '14px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s',
                border: active ? '1px solid #60A5FA' : '1px solid rgba(255,255,255,0.28)',
                background: active ? '#0078D4' : 'rgba(255,255,255,0.10)',
                color: active ? 'white' : 'rgba(255,255,255,0.80)',
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '0.75rem' }}>{chip.emoji}</span>
              {chip.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
