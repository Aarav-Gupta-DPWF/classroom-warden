import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CLASSES = [
  { id: 1, name: 'Room 8A', emoji: '💼', teacher: 'Mr. Wakaba',   subject: 'Business Studies', streak: 7,  baseDb: 38 },
  { id: 2, name: 'Room 8B', emoji: '🧪', teacher: 'Mr. Nicholas', subject: 'Chemistry',         streak: 3,  baseDb: 47 },
  { id: 3, name: 'Room 8C', emoji: '📐', teacher: 'Ms. Sharon',   subject: 'Maths',             streak: 12, baseDb: 42 },
  { id: 4, name: 'Room 7A', emoji: '🔬', teacher: 'Mr. Meshak',   subject: 'Biology',           streak: 5,  baseDb: 54 },
  { id: 5, name: 'Room 7B', emoji: '⚡', teacher: 'Mr. Nick',     subject: 'Physics',           streak: 1,  baseDb: 63 },
  { id: 6, name: 'Room 9A', emoji: '🇮🇳', teacher: 'Ms. Preeti',  subject: 'Hindi',             streak: 0,  baseDb: 71 },
  { id: 7, name: 'Room 8D', emoji: '🇫🇷', teacher: 'Mr. Kopiyo',  subject: 'French',            streak: 8,  baseDb: 50 },
  { id: 8, name: 'Room 7C', emoji: '🧠', teacher: 'Ms. Vannesa',  subject: 'PSHE',              streak: 4,  baseDb: 55 },
];

const WAKABA_ID = 1;

// Initial order: Wakaba at #1, rest in a fixed starting order
const INITIAL_ORDER = [1, 3, 7, 2, 4, 8, 5, 6];

// Produce next order: toggle Wakaba #1↔#2 and do one adjacent swap in positions 2–7
function nextOrder(current) {
  const order = [...current];
  const wakabaIdx = order.indexOf(WAKABA_ID);

  // Toggle Wakaba between slot 0 and slot 1
  if (wakabaIdx === 0) {
    [order[0], order[1]] = [order[1], order[0]];
  } else {
    [order[0], order[1]] = [order[1], order[0]];
  }

  // One adjacent swap anywhere in slots 2–6
  const i = 2 + Math.floor(Math.random() * 5);
  [order[i], order[i + 1]] = [order[i + 1], order[i]];

  return order;
}

function getNoise(db) {
  if (db < 45) return { color: '#2ED573', label: 'QUIET',    glow: 'rgba(46,213,115,0.3)' };
  if (db < 65) return { color: '#FFA502', label: 'MODERATE', glow: 'rgba(255,165,2,0.3)' };
  return           { color: '#FF4757', label: 'LOUD',     glow: 'rgba(255,71,87,0.3)' };
}

const BADGE_CLS  = ['r1', 'r2', 'r3', 'rn', 'rn', 'rn', 'rn', 'rn'];
const RANK_LABEL = ['🥇', '🥈', '🥉', '4',  '5',  '6',  '7',  '8'];

const containerVars = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const cardVars = {
  hidden: { opacity: 0, y: 28, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] } },
};
const headerVars = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function AnimatedBar({ pct, color, delay = 0 }) {
  return (
    <div className="noise-bar-track">
      <motion.div
        className="noise-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, delay, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ background: `linear-gradient(90deg, ${color}77, ${color})` }}
      />
    </div>
  );
}

export default function Leaderboard() {
  // Live dB simulation
  const [scores, setScores] = useState(() =>
    CLASSES.map((c) => ({ id: c.id, db: c.baseDb + (Math.random() - 0.5) * 6 }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setScores((prev) =>
        prev.map((s) => {
          const cls = CLASSES.find((c) => c.id === s.id);
          const drift = (cls.baseDb - s.db) * 0.06 + (Math.random() - 0.5) * 3.2;
          return { ...s, db: Math.max(22, Math.min(88, s.db + drift)) };
        })
      );
    }, 600);
    return () => clearInterval(id);
  }, []);

  // Rank order — shifts every 8–9 s with smooth adjacent swaps
  const [rankOrder, setRankOrder] = useState(INITIAL_ORDER);
  const reshuffleRef = useRef(null);

  useEffect(() => {
    const schedule = () => {
      const delay = 8000 + Math.random() * 1000;
      reshuffleRef.current = setTimeout(() => {
        setRankOrder((prev) => nextOrder(prev));
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(reshuffleRef.current);
  }, []);

  const ranked = useMemo(
    () => rankOrder.map((id) => scores.find((s) => s.id === id)),
    [rankOrder, scores]
  );

  // Rank-change arrows
  const prevRankRef = useRef({});
  const [arrows, setArrows] = useState({});

  useEffect(() => {
    const prev = prevRankRef.current;
    const next = {};
    rankOrder.forEach((id, i) => {
      const rank = i + 1;
      if (prev[id] !== undefined && prev[id] !== rank) {
        next[id] = prev[id] > rank ? 'up' : 'down';
      }
    });
    setArrows(next);
    rankOrder.forEach((id, i) => { prevRankRef.current[id] = i + 1; });
    const t = setTimeout(() => setArrows({}), 3000);
    return () => clearTimeout(t);
  }, [rankOrder]);

  return (
    <div className="leaderboard">
      <motion.div className="lb-header-row" variants={headerVars} initial="hidden" animate="show">
        <div className="section-header" style={{ margin: 0 }}>
          <h2 className="section-title">Class Rankings</h2>
          <p className="section-sub">Ranked by noise level · Lower is better</p>
        </div>
        <div className="update-pill">
          <span className="update-dot" />
          LIVE UPDATE
        </div>
      </motion.div>

      <motion.div className="lb-cards" variants={containerVars} initial="hidden" animate="show">
        <AnimatePresence>
          {ranked.map((score, idx) => {
            const cls = CLASSES.find((c) => c.id === score.id);
            const noise = getNoise(score.db);
            const barPct = Math.max(4, Math.min(100, ((score.db - 20) / 70) * 100));
            const arrow = arrows[score.id];

            return (
              <motion.div
                key={score.id}
                layout
                variants={cardVars}
                className={`glass-card lb-card rank-${idx + 1}`}
                transition={{ layout: { type: 'spring', stiffness: 180, damping: 28 } }}
                whileHover={{
                  borderColor: idx === 0 ? 'rgba(255,215,0,0.45)' : 'rgba(0,229,180,0.22)',
                  transition: { duration: 0.2 },
                }}
              >
                <div className={`rank-badge ${BADGE_CLS[idx]}`}>
                  {RANK_LABEL[idx]}
                </div>

                <div className="lb-info">
                  <div className="lb-class-row">
                    <span className="lb-emoji">{cls.emoji}</span>
                    <span className="lb-class-name">{cls.name}</span>
                  </div>
                  <div className="lb-teacher">{cls.teacher} · {cls.subject}</div>

                  <AnimatedBar pct={barPct} color={noise.color} delay={0.1 + idx * 0.07} />

                  <div className="lb-footer">
                    {cls.streak > 0 ? (
                      <div className="streak-badge">
                        <span className="streak-icon">🔥</span>
                        {cls.streak} day streak
                      </div>
                    ) : (
                      <div className="streak-badge" style={{ color: 'rgba(232,234,240,0.22)' }}>
                        No streak
                      </div>
                    )}
                  </div>
                </div>

                <div className="lb-score-col">
                  <div className="lb-db-value" style={{ color: noise.color }}>
                    {Math.round(score.db)}
                    <span style={{ fontSize: '13px', fontWeight: 500, marginLeft: 2, opacity: 0.55 }}>dB</span>
                  </div>
                  <div className="lb-status" style={{ color: noise.color }}>{noise.label}</div>
                  <AnimatePresence>
                    {arrow && (
                      <motion.div
                        className="rank-arrow"
                        style={{ color: arrow === 'up' ? '#2ED573' : '#FF4757' }}
                        initial={{ opacity: 0, y: arrow === 'up' ? 6 : -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {arrow === 'up' ? '▲' : '▼'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
