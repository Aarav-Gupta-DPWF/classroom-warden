import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

const R = 108;
const CX = 150;
const CY = 150;
const CIRC = 2 * Math.PI * R;
const ARC = CIRC * 0.75;
const ROT = 135;

function dbToPercent(db) {
  return Math.max(0, Math.min(100, (db - 20) / 72 * 100));
}

function compassToXY(angleDeg, r = R) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

function getState(db) {
  if (db < 45) return { color: '#2ED573', glow: 'rgba(46,213,115,0.45)',  label: 'QUIET',    bg: 'rgba(46,213,115,0.06)' };
  if (db < 65) return { color: '#FFA502', glow: 'rgba(255,165,2,0.45)',   label: 'MODERATE', bg: 'rgba(255,165,2,0.06)' };
  return           { color: '#FF4757', glow: 'rgba(255,71,87,0.45)',   label: 'LOUD',     bg: 'rgba(255,71,87,0.06)' };
}

function useNoiseSim() {
  const [db, setDb] = useState(42);
  const [wave, setWave] = useState(() => Array(44).fill(42));
  const sim = useRef({ cur: 42, target: 42, spike: 0, ttimer: 0, stimer: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      const s = sim.current;
      s.ttimer++;
      if (s.ttimer > 55 + Math.random() * 90) {
        s.ttimer = 0;
        s.target = 26 + Math.random() * 58;
      }
      s.stimer++;
      if (s.stimer > 130 + Math.random() * 220) {
        s.stimer = 0;
        s.spike = 12 + Math.random() * 22;
      }
      s.spike *= 0.87;
      const diff = s.target - s.cur;
      s.cur += diff * 0.055 + (Math.random() - 0.5) * 1.8;
      s.cur = Math.max(18, Math.min(90, s.cur));
      const val = Math.min(93, s.cur + s.spike);
      setDb(val);
      setWave((prev) => [...prev.slice(1), val]);
    }, 55);
    return () => clearInterval(id);
  }, []);

  return { db, wave };
}

const TICKS = Array.from({ length: 19 }, (_, i) => {
  const pct = i / 18;
  const angle = 225 + 270 * pct;
  const isMaj = i % 3 === 0;
  const p1 = compassToXY(angle, isMaj ? 119 : 124);
  const p2 = compassToXY(angle, 134);
  return { ...p1, x2: p2.x, y2: p2.y, isMaj };
});

// Static particle configs so they don't regenerate on re-render
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  angle: i * 18,
  delay: (i / 20) * 2.8,
  dur: 2.4 + (i % 4) * 0.55,
  size: 2 + (i % 3),
}));

function Particles({ db, color }) {
  const intensity = Math.max(0, Math.min(1, (db - 32) / 52));
  if (intensity < 0.03) return null;
  return (
    <div className="particles-wrap" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div key={i} className="p-arm" style={{ '--pa': `${p.angle}deg` }}>
          <div className="p-dot" style={{
            '--pd': `${p.dur}s`,
            '--pdel': `${p.delay}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: color,
            boxShadow: `0 0 ${p.size + 3}px ${color}`,
            opacity: intensity * 0.78,
          }} />
        </div>
      ))}
    </div>
  );
}

function Gauge({ db }) {
  const pct = dbToPercent(db);
  const st = getState(db);
  const fill = ARC * (pct / 100);
  const dot = compassToXY(225 + 270 * (pct / 100));
  const isLoud = db >= 65;

  // Needle rotation: compass angle to point in gauge direction
  const needleRot = 225 + 270 * (pct / 100);

  return (
    <svg viewBox="0 0 300 300" width="280" height="280" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={st.color} stopOpacity="0.14" />
          <stop offset="100%" stopColor={st.color} stopOpacity="0" />
        </radialGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow3">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={st.color} />
          <stop offset="100%" stopColor={st.color} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Ambient glow blob */}
      <circle cx={CX} cy={CY} r="138" fill="url(#cg)"
        style={{ transition: 'fill 0.5s ease' }} />

      {/* Loud pulse rings */}
      {isLoud && <>
        <circle cx={CX} cy={CY} r="140" fill="none" stroke={st.color} strokeWidth="1.2"
          style={{ animation: 'pulse-ring 2s ease-out infinite', transformOrigin: `${CX}px ${CY}px` }} />
        <circle cx={CX} cy={CY} r="140" fill="none" stroke={st.color} strokeWidth="1.2"
          style={{ animation: 'pulse-ring 2s ease-out 1s infinite', transformOrigin: `${CX}px ${CY}px` }} />
        <circle cx={CX} cy={CY} r="140" fill="none" stroke={st.color} strokeWidth="0.8"
          style={{ animation: 'pulse-ring 2s ease-out 0.5s infinite', transformOrigin: `${CX}px ${CY}px` }} />
      </>}

      {/* Outer decorative ring */}
      <circle cx={CX} cy={CY} r="138" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />

      {/* Tick marks */}
      {TICKS.map((t, i) => (
        <line key={i} x1={t.x} y1={t.y} x2={t.x2} y2={t.y2}
          stroke={t.isMaj ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}
          strokeWidth={t.isMaj ? 2 : 1} strokeLinecap="round" />
      ))}

      {/* dB zone labels */}
      {[{ pct: 0.05, text: '20' }, { pct: 0.5, text: '55' }, { pct: 0.97, text: '92' }].map((l) => {
        const pos = compassToXY(225 + 270 * l.pct, 148);
        return (
          <text key={l.text} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="system-ui" fontWeight="700">
            {l.text}
          </text>
        );
      })}

      {/* Background arc */}
      <circle cx={CX} cy={CY} r={R} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth="18"
        strokeDasharray={`${ARC} ${CIRC - ARC}`}
        style={{ transform: `rotate(${ROT}deg)`, transformOrigin: `${CX}px ${CY}px` }}
      />

      {/* Subtle zone color arcs */}
      {[
        { pctLen: 0.34, rot: ROT,               color: 'rgba(46,213,115,0.1)' },
        { pctLen: 0.26, rot: ROT + 270 * 0.34,  color: 'rgba(255,165,2,0.1)' },
        { pctLen: 0.40, rot: ROT + 270 * 0.60,  color: 'rgba(255,71,87,0.1)' },
      ].map((z, i) => (
        <circle key={i} cx={CX} cy={CY} r={R} fill="none"
          stroke={z.color} strokeWidth="18"
          strokeDasharray={`${ARC * z.pctLen} ${CIRC - ARC * z.pctLen}`}
          style={{ transform: `rotate(${z.rot}deg)`, transformOrigin: `${CX}px ${CY}px` }}
        />
      ))}

      {/* Active fill arc */}
      <circle cx={CX} cy={CY} r={R} fill="none"
        stroke={st.color} strokeWidth="18" strokeLinecap="round"
        strokeDasharray={`${Math.max(0, fill - 2)} ${CIRC - Math.max(0, fill - 2)}`}
        style={{
          transform: `rotate(${ROT}deg)`,
          transformOrigin: `${CX}px ${CY}px`,
          transition: 'stroke-dasharray 0.28s ease, stroke 0.45s ease',
          filter: `drop-shadow(0 0 8px ${st.color}) drop-shadow(0 0 16px ${st.color}44)`,
        }}
      />

      {/* Inner decorative ring */}
      <circle cx={CX} cy={CY} r="84" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Center disc */}
      <circle cx={CX} cy={CY} r="79" fill="rgba(6,11,24,0.93)" />

      {/* ── Needle ── smooth spring rotation */}
      <g style={{
        transform: `rotate(${needleRot}deg)`,
        transformOrigin: `${CX}px ${CY}px`,
        transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Needle shadow/glow */}
        <line x1={CX} y1={CY} x2={CX} y2={CY - 84}
          stroke={st.color} strokeWidth="6" strokeLinecap="round" opacity="0.12"
          filter="url(#glow2)"
        />
        {/* Needle body */}
        <line x1={CX} y1={CY + 10} x2={CX} y2={CY - 82}
          stroke="url(#needleGrad)" strokeWidth="2.5" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${st.color})` }}
        />
        {/* Needle tip */}
        <circle cx={CX} cy={CY - 82} r="3.5" fill={st.color} filter="url(#glow3)" />
      </g>

      {/* Needle hub ring */}
      <circle cx={CX} cy={CY} r="10" fill="rgba(6,11,24,0.98)"
        stroke={st.color} strokeWidth="1.5"
        style={{ transition: 'stroke 0.45s ease' }} />
      {/* Hub center dot — pulses */}
      <circle cx={CX} cy={CY} r="4" fill={st.color}
        style={{
          transition: 'fill 0.45s ease',
          animation: 'pulse-dot 1.8s ease-in-out infinite',
          filter: `drop-shadow(0 0 5px ${st.color})`,
        }} />

      {/* Center readout text */}
      <text x={CX} y={CY - 26} textAnchor="middle"
        fill="rgba(255,255,255,0.22)" fontSize="9.5"
        fontFamily="system-ui" letterSpacing="2.5" fontWeight="700">
        DECIBELS
      </text>

      <text x={CX} y={CY + 16} textAnchor="middle"
        fill={st.color} fontSize="44" fontFamily="system-ui" fontWeight="800" letterSpacing="-2"
        style={{ transition: 'fill 0.45s ease' }}>
        {Math.round(db)}
      </text>

      <text x={CX} y={CY + 38} textAnchor="middle"
        fill={st.color} fontSize="9.5" fontFamily="system-ui" fontWeight="800" letterSpacing="3.5"
        style={{ transition: 'fill 0.45s ease' }}>
        {st.label}
      </text>

      {/* Arc glow dot at current position */}
      {pct > 1 && (
        <>
          <circle cx={dot.x} cy={dot.y} r="16" fill={st.glow}
            style={{ transition: 'fill 0.45s ease' }} />
          <circle cx={dot.x} cy={dot.y} r="7" fill={st.color} filter="url(#glow2)"
            style={{
              transition: 'fill 0.45s ease',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }} />
          <circle cx={dot.x} cy={dot.y} r="3.5" fill="white" opacity="0.95" />
        </>
      )}
    </svg>
  );
}

function Waveform({ wave, db }) {
  const st = getState(db);
  return (
    <div className="waveform">
      {wave.map((v, i) => {
        const h = Math.max(3, ((v - 18) / 75) * 54);
        const age = i / (wave.length - 1);
        return (
          <div key={i} className="wave-bar" style={{
            height: `${h}px`,
            background: st.color,
            opacity: 0.12 + age * 0.88,
            boxShadow: i >= wave.length - 4 ? `0 0 6px ${st.color}` : 'none',
            transition: 'height 0.07s ease, background 0.4s ease',
          }} />
        );
      })}
    </div>
  );
}

const containerVars = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVars = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function NoiseMeter() {
  const { db, wave } = useNoiseSim();
  const st = getState(db);

  const dataRef = useRef({ samples: [42], peak: 42 });
  useEffect(() => {
    dataRef.current.samples.push(db);
    if (dataRef.current.samples.length > 300) dataRef.current.samples.shift();
    if (db > dataRef.current.peak) dataRef.current.peak = db;
  }, [db]);

  const avg = Math.round(
    dataRef.current.samples.reduce((a, b) => a + b, 0) / dataRef.current.samples.length
  );

  return (
    <motion.div className="noise-meter" variants={containerVars} initial="hidden" animate="show">
      <motion.div className="section-header" variants={itemVars} style={{ width: '100%', textAlign: 'center' }}>
        <h2 className="section-title">Live Noise Monitor</h2>
        <p className="section-sub">Room 4B · Ms. Johnson's Class · Science Period</p>
      </motion.div>

      <motion.div className="gauge-wrapper" variants={itemVars}>
        {/* Outer container holds both the SVG gauge and the floating particles */}
        <div className="gauge-outer">
          <Particles db={db} color={st.color} />
          <Gauge db={db} />
        </div>
        <Waveform wave={wave} db={db} />
      </motion.div>

      <motion.div className="stats-row" variants={itemVars}>
        {[
          { label: 'Current',      value: `${Math.round(db)} dB`,                      color: st.color },
          { label: 'Average',      value: `${avg} dB`,                                  color: '#00E5B4' },
          { label: 'Session Peak', value: `${Math.round(dataRef.current.peak)} dB`,     color: '#FFD93D' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="glass-card stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="threshold-legend" variants={itemVars}>
        {[
          { label: 'Quiet',    range: '< 45 dB',  color: '#2ED573' },
          { label: 'Moderate', range: '45–65 dB', color: '#FFA502' },
          { label: 'Loud',     range: '> 65 dB',  color: '#FF4757' },
        ].map((t, i) => (
          <motion.div
            key={t.label}
            className="threshold-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="threshold-dot"
              style={{ background: t.color, boxShadow: `0 0 7px ${t.color}` }} />
            <span className="threshold-label" style={{ color: t.color }}>{t.label}</span>
            <span className="threshold-range">{t.range}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
