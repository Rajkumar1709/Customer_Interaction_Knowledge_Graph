import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Loader2, Sparkles, Bot, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageBubble = ({ msg }: { msg: any }) => {
  if (msg.role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', background: 'var(--rp-blue)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.95rem', maxWidth: '85%', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', lineHeight: 1.5 }}>
        {msg.content}
      </div>
    );
  }

  // Error message
  if (typeof msg.content === 'string') {
    return (
      <div style={{ alignSelf: 'flex-start', background: '#FEF2F2', color: '#DC2626', padding: '0.75rem 1.25rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.9rem', maxWidth: '85%', border: '1px solid #FCA5A5' }}>
        {msg.content}
      </div>
    );
  }

  // Structured AI Message
  const ai = msg.content;
  return (
    <div style={{ alignSelf: 'flex-start', background: 'white', border: '1px solid #E2E8F0', borderRadius: '18px 18px 18px 4px', fontSize: '0.95rem', maxWidth: '92%', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={14} color="#3B82F6" />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Analysis</span>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {ai.summary && <div style={{ color: '#1E293B', fontWeight: 500, lineHeight: 1.6 }}>{ai.summary}</div>}
        
        {ai.key_risks && ai.key_risks.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#DC2626', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.03em' }}>Key Risks</div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', lineHeight: 1.5 }}>
              {ai.key_risks.map((r: string, i: number) => <li key={i} style={{ marginBottom: '0.3rem' }}>{r}</li>)}
            </ul>
          </div>
        )}

        {ai.opportunities && ai.opportunities.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#059669', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.03em' }}>Opportunities</div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', lineHeight: 1.5 }}>
              {ai.opportunities.map((o: string, i: number) => <li key={i} style={{ marginBottom: '0.3rem' }}>{o}</li>)}
            </ul>
          </div>
        )}

        {ai.recommended_actions && ai.recommended_actions.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2563EB', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.03em' }}>Recommended Actions</div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', lineHeight: 1.5 }}>
              {ai.recommended_actions.map((a: string, i: number) => <li key={i} style={{ marginBottom: '0.3rem' }}>{a}</li>)}
            </ul>
          </div>
        )}

        {ai.supporting_evidence && ai.supporting_evidence.length > 0 && (
          <div style={{ background: '#F1F5F9', padding: '0.875rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '0.03em' }}>Supporting Evidence</div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {ai.supporting_evidence.map((e: string, i: number) => <li key={i} style={{ marginBottom: '0.2rem' }}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AccountQAService({ accountId }: { accountId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', content: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`/api/accounts/${accountId}/qa`, { question: userMsg });
      setChat(prev => [...prev, { role: 'ai', content: res.data.answer }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error retrieving the answer.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ 
              width: '440px', height: '620px', background: '#F8FAFC', borderRadius: '16px', 
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1)', 
              display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '1.25rem',
              border: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            {/* Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--rp-navy) 0%, #152E3B 100%)', 
              padding: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="#60A5FA" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.02em' }}>RealPage Intelligence</h3>
                  <div style={{ fontSize: '0.75rem', color: '#93C5FD', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 4px #34D399' }} /> Account AI Assistant
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <ChevronDown size={20} />
              </button>
            </div>
            
            {/* Chat Area */}
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {chat.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={32} color="#3B82F6" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#1E293B', fontSize: '1.1rem' }}>How can I help?</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>Ask me questions about risks, opportunities, or recent events in this account's graph.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
                    {['Why is this account at risk?', 'What changed recently?', 'Are there expansion opportunities?'].map(suggestion => (
                      <button 
                        key={suggestion} 
                        onClick={() => { setQuery(suggestion); }}
                        style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #E2E8F0', borderRadius: '20px', fontSize: '0.85rem', color: '#3B82F6', cursor: 'pointer', textAlign: 'left', transition: 'border 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {chat.map((msg, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{ display: 'flex', flexDirection: 'column' }}
                    >
                      <MessageBubble msg={msg} />
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white', border: '1px solid #E2E8F0', padding: '0.75rem 1rem', borderRadius: '18px 18px 18px 4px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <Loader2 size={16} className="spin" color="#3B82F6" />
                      <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Analyzing graph...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about this account..."
                style={{ flex: 1, padding: '0.875rem 1rem', borderRadius: '24px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', background: '#F8FAFC', transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                onFocus={(e) => { e.target.style.borderColor = '#3B82F6'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)'; }}
              />
              <button 
                type="submit" 
                disabled={loading || !query.trim()} 
                style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', background: query.trim() ? 'var(--rp-blue)' : '#94A3B8', 
                  color: 'white', border: 'none', cursor: query.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s', boxShadow: query.trim() ? '0 2px 8px rgba(0,120,212,0.3)' : 'none'
                }}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      {!isOpen && (
        <motion.button 
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--rp-blue)', color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,120,212,0.4)', zIndex: 10000
          }}
        >
          <MessageSquare size={28} />
          {/* Unread indicator dot */}
          <div style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, background: '#EF4444', borderRadius: '50%', border: '2px solid white' }} />
        </motion.button>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
