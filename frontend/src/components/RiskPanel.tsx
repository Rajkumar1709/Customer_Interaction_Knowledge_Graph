import { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingDown, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

type Band = 'high' | 'mod' | 'low';

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
  selectedAccountId: string;
  onSelect: (id: string) => void;
}

// ── Traffic-light helpers ─────────────────────────────────────────────────────
function getSignal(score: number): { color: string; bg: string; border: string; label: string; emoji: string } {
  if (score < 40)  return { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', label: 'High Risk',  emoji: '🔴' };
  if (score <= 70) return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Moderate',   emoji: '🟡' };
  return               { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', label: 'Low Risk',   emoji: '🟢' };
}

// ── Loading skeleton row ──────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem' }}>
      <div className="shimmer" style={{ width: 10, height: 10, borderRadius: '50%' }} />
      <div className="shimmer" style={{ flex: 1, height: 12, borderRadius: 4 }} />
      <div className="shimmer" style={{ width: 32, height: 18, borderRadius: 8 }} />
    </div>
  );
}

export default function RiskPanel({ filters, selectedAccountId, onSelect }: Props) {
  const [accounts, setAccounts]     = useState<AccountSummary[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  // Multi-select band filter — empty Set means "show all"
  const [activeBands, setActiveBands] = useState<Set<Band>>(new Set());

  const toggleBand = (band: Band) =>
    setActiveBands(prev => {
      const next = new Set(prev);
      next.has(band) ? next.delete(band) : next.add(band);
      return next;
    });

  const clearBands = () => setActiveBands(new Set());

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', page: '1' });
      if (filters.risky)          params.set('risky', 'true');
      if (filters.renewal)        params.set('renewal', 'true');
      if (filters.implementation) params.set('implementation', 'true');

      const res = await axios.get(`http://localhost:8000/api/accounts/search?${params}`);
      const sorted: AccountSummary[] = (res.data.accounts || [])
        .slice()
        .sort((a: AccountSummary, b: AccountSummary) => a.health_score - b.health_score); // lowest = highest risk first
      setAccounts(sorted);
      setTotal(res.data.total ?? sorted.length);
    } catch (err) {
      console.error('[RiskPanel] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // Count by band (always from the full list)
  const highCount = accounts.filter(a => a.health_score < 40).length;
  const modCount  = accounts.filter(a => a.health_score >= 40 && a.health_score <= 70).length;
  const lowCount  = accounts.filter(a => a.health_score > 70).length;

  // Client-side filter — zero extra requests
  const visibleAccounts = useMemo(() => {
    if (activeBands.size === 0) return accounts;
    return accounts.filter(a => {
      if (activeBands.has('high') && a.health_score < 40)                          return true;
      if (activeBands.has('mod')  && a.health_score >= 40 && a.health_score <= 70) return true;
      if (activeBands.has('low')  && a.health_score > 70)                          return true;
      return false;
    });
  }, [accounts, activeBands]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Panel Header ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--glass-border)',
        background: '#F8FAFC',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <TrendingDown size={14} style={{ color: '#DC2626' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B' }}>
            Top Accounts by Risk
          </span>
          {!loading && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {activeBands.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearBands}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Clear band filters"
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                >
                  <X size={10} style={{ color: '#0078D4' }} />
                </motion.button>
              )}
              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94A3B8' }}>
                {activeBands.size > 0 ? `${visibleAccounts.length} of ${accounts.length}` : `${accounts.length} of ${total}`}
              </span>
            </div>
          )}
        </div>

        {/* Clickable band filter pills */}
        {!loading && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {([
              { band: 'high' as Band, label: `${highCount} High`, color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', activeBg: '#DC2626' },
              { band: 'mod'  as Band, label: `${modCount} Mod`,   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', activeBg: '#D97706' },
              { band: 'low'  as Band, label: `${lowCount} Low`,   color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', activeBg: '#059669' },
            ]).map(b => {
              const isActive = activeBands.has(b.band);
              return (
                <motion.button
                  key={b.band}
                  onClick={() => toggleBand(b.band)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  title={isActive ? `Remove ${b.band} filter` : `Show only ${b.band}-risk accounts`}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.18s',
                    // Active: filled with band color; Inactive: tinted background
                    color:      isActive ? 'white'    : b.color,
                    background: isActive ? b.activeBg : b.bg,
                    border:     isActive ? `1px solid ${b.activeBg}` : `1px solid ${b.border}`,
                    boxShadow:  isActive ? `0 0 0 2px ${b.color}40` : 'none',
                  }}
                >
                  {b.label}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Account List ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0' }}>
        {loading ? (
          // Skeleton
          <div>
            {Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : visibleAccounts.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', lineHeight: 1.6 }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem', opacity: 0.5 }}>🔍</div>
            No accounts in the selected risk band{activeBands.size > 1 ? 's' : ''}.
            <br />
            <button onClick={clearBands} style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#0078D4', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>Clear filters</button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleAccounts.map((acc, idx) => {
              const sig      = getSignal(acc.health_score);
              const selected = acc.id === selectedAccountId;

              return (
                <motion.div
                  key={acc.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.015, 0.4), type: 'spring', stiffness: 340, damping: 26 }}
                  onClick={() => onSelect(acc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.5rem 0.875rem',
                    cursor: 'pointer',
                    borderLeft: selected ? `3px solid #0078D4` : '3px solid transparent',
                    background: selected ? '#EFF6FF' : 'transparent',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  whileHover={selected ? {} : { backgroundColor: '#F8FAFC' }}
                >
                  {/* Rank number */}
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: '#CBD5E1',
                    width: '1.5rem',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>

                  {/* Traffic-light dot */}
                  <span style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: sig.color,
                    flexShrink: 0,
                    boxShadow: `0 0 0 2px ${sig.color}30`,
                  }} />

                  {/* Account name */}
                  <span style={{
                    flex: 1,
                    fontSize: '0.8rem',
                    fontWeight: selected ? 600 : 500,
                    color: selected ? '#0078D4' : '#1E293B',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {acc.name}
                  </span>

                  {/* Score badge */}
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '0.18rem 0.42rem',
                    borderRadius: '9px',
                    color: sig.color,
                    background: sig.bg,
                    border: `1px solid ${sig.border}`,
                    flexShrink: 0,
                    minWidth: '2rem',
                    textAlign: 'center',
                  }}>
                    {acc.health_score}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
