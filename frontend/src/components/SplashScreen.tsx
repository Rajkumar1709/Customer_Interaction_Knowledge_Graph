import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const CORAL = '#E8765C';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'zoom'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('zoom'), 2200);
    const t2 = setTimeout(onDone, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {(phase === 'enter' || phase === 'zoom') && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#FFFFFF',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '2rem',
            overflow: 'hidden'
          }}
        >
          {/* Coral circle zoom-out that fills the screen before revealing CSM */}
          {phase === 'zoom' && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 60, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                width: 80, height: 80,
                borderRadius: '50%',
                background: CORAL,
                zIndex: 100,
              }}
            />
          )}

          {/* Logo block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: phase === 'zoom' ? 0 : 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 50 }}
          >
            {/* Three dots: top center, bottom-left, bottom-right */}
            <div style={{ position: 'relative', width: 78, height: 78 }}>
              {/* Top center — exactly between the two bottom dots */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
                style={{ position: 'absolute', left: 26, top: 0, width: 26, height: 26, borderRadius: '50%', background: CORAL }}
              />
              {/* Bottom left */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.4 }}
                style={{ position: 'absolute', left: 0, bottom: 0, width: 26, height: 26, borderRadius: '50%', background: CORAL }}
              />
              {/* Bottom right */}
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.6 }}
                style={{ position: 'absolute', right: 0, bottom: 0, width: 26, height: 26, borderRadius: '50%', background: CORAL }}
              />
            </div>

            {/* REALPAGE wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              style={{ fontSize: '3rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'flex-start', gap: '2px' }}
            >
              REALPAGE
              <span style={{ fontSize: '1rem', paddingTop: '0.3rem', fontWeight: 400 }}>®</span>
            </motion.div>


            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              style={{ fontSize: '0.875rem', color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Customer Interaction Knowledge Graph
            </motion.p>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              style={{ width: '200px', marginTop: '0.5rem' }}
            >
              <div style={{ height: '3px', background: '#F0F0F0', borderRadius: '999px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: 1.4, ease: 'easeInOut' }}
                  style={{ height: '100%', background: CORAL, borderRadius: '999px' }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
