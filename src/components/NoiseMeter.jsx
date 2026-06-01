import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const R = 108, CX = 150, CY = 150;
const CIRC = 2 * Math.PI * R;
const ARC = CIRC * 0.75;
const ROT = 135;

/** How quickly the display catches up to the mic (lower = smoother / slower). */
const DB_SMOOTHING = 0.045;
const WAVE_SMOOTHING = 0.06;
const UI_UPDATE_MS = 120;

function dbToPercent(db) { return Math.max(0, Math.min(100, (db - 20) / 72 * 100)); }
function compassToXY(angleDeg, r = R) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

function getThresholds() {
  try {
    const s = JSON.parse(localStorage.getItem('cw-settings') || '{}');
    return { quiet: s.quietThreshold || 45, moderate: s.moderateThreshold || 65 };
  } catch { return { quiet: 45, moderate: 65 }; }
}

function getState(db) {
  const { quiet, moderate } = getThresholds();
  if (db < quiet)    return { color: '#2ED573', glow: 'rgba(46,213,115,0.45)',  label: 'QUIET',    bg: 'rgba(46,213,115,0.06)' };
  if (db < moderate) return { color: '#FFA502', glow: 'rgba(255,165,2,0.45)',   label: 'MODERATE', bg: 'rgba(255,165,2,0.06)' };
  return                    { color: '#FF4757', glow: 'rgba(255,71,87,0.45)',   label: 'LOUD',     bg: 'rgba(255,71,87,0.06)' };
}

function smoothToward(current, target, factor) {
  return current + (target - current) * factor;
}

// ── Real microphone hook ──
function useMicAudio() {
  const [micStatus, setMicStatus] = useState('idle');
  const [audioData, setAudioData] = useState({ db: 28, wave: Array(44).fill(28) });
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const smoothRef = useRef({ db: 28, wave: Array(44).fill(28) });
  const lastPushRef = useRef(0);

  const start = useCallback(async () => {
    setMicStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.92;
      ctx.createMediaStreamSource(stream).connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      setMicStatus('active');

      const floatBuf = new Float32Array(analyser.fftSize);
      const byteBuf  = new Uint8Array(analyser.frequencyBinCount);

      const loop = (now) => {
        analyser.getFloatTimeDomainData(floatBuf);
        analyser.getByteFrequencyData(byteBuf);

        let sum = 0;
        for (let i = 0; i < floatBuf.length; i++) sum += floatBuf[i] ** 2;
        const rms = Math.sqrt(sum / floatBuf.length);
        const dbFS = rms > 1e-8 ? 20 * Math.log10(rms) : -80;

        const sensitivity = parseFloat(
          (() => { try { return JSON.parse(localStorage.getItem('cw-settings') || '{}').micSensitivity || 1.0; } catch { return 1.0; } })()
        );
        const mapped = Math.max(20, Math.min(88, (dbFS + 80) * (68 / 80) + 20));
        const rawDb = Math.max(20, Math.min(88, mapped * sensitivity));
        const rawWave = Array.from(byteBuf.slice(0, 44)).map(v => 20 + (v / 255) * 68);

        const s = smoothRef.current;
        s.db = smoothToward(s.db, rawDb, DB_SMOOTHING);
        s.wave = s.wave.map((v, i) => smoothToward(v, rawWave[i], WAVE_SMOOTHING));

        if (now - lastPushRef.current >= UI_UPDATE_MS) {
          lastPushRef.current = now;
          setAudioData({ db: s.db, wave: [...s.wave] });
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setMicStatus('denied');
    }
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ctxRef.current) ctxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [start]);

  return { ...audioData, micStatus, retry: start };
}

// ── Simulation fallback (slow, calm drift) ──
function useNoiseSim() {
  const [db, setDb] = useState(42);
  const [wave, setWave] = useState(() => Array(44).fill(42));
  const sim = useRef({ cur: 42, target: 42, spike: 0, ttimer: 0, stimer: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      const s = sim.current;
      if (++s.ttimer > 140 + Math.random() * 180) { s.ttimer = 0; s.target = 26 + Math.random() * 58; }
      if (++s.stimer > 280 + Math.random() * 320) { s.stimer = 0; s.spike = 8 + Math.random() * 14; }
      s.spike *= 0.92;
      s.cur += (s.target - s.cur) * 0.022 + (Math.random() - 0.5) * 0.6;
      s.cur = Math.max(18, Math.min(90, s.cur));
      const val = Math.min(93, s.cur + s.spike);
      setDb(val);
      setWave(prev => [...prev.slice(1), val]);
    }, 140);
    return () => clearInterval(id);
  }, []);
  return { db, wave };
}

const TICKS = Array.from({ length: 19 }, (_, i) => {
  const pct = i / 18, angle = 225 + 270 * pct, isMaj = i % 3 === 0;
  const p1 = compassToXY(angle, isMaj ? 119 : 124), p2 = compassToXY(angle, 134);
  return { ...p1, x2: p2.x, y2: p2.y, isMaj };
});

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  angle: i * 18, delay: (i / 20) * 2.8, dur: 3.6 + (i % 4) * 0.8, size: 2 + (i % 3),
}));

function Particles({ db, color }) {
  const intensity = Math.max(0, Math.min(1, (db - 32) / 52));
  if (intensity < 0.03) return null;
  return (
    <div className="particles-wrap" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div key={i} className="p-arm" style={{ '--pa': `${p.angle}deg` }}>
          <div className="p-dot" style={{
            '--pd': `${p.dur}s`, '--pdel': `${p.delay}s`,
            width: `${p.size}px`, height: `${p.size}px`,
            background: color, boxShadow: `0 0 ${p.size + 3}px ${color}`, opacity: intensity * 0.78,
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
  const needleRot = 225 + 270 * (pct / 100);

  return (
    <svg viewBox="0 0 300 300" width="280" height="280" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={st.color} stopOpacity="0.14" />
          <stop offset="100%" stopColor={st.color} stopOpacity="0" />
        </radialGradient>
        <filter id="glow2"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glow3"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={st.color} />
          <stop offset="100%" stopColor={st.color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <circle cx={CX} cy={CY} r="138" fill="url(#cg)" style={{ transition: 'fill 1.2s ease' }} />
      {isLoud && [0, 1, 0.5].map((delay, i) => (
        <circle key={i} cx={CX} cy={CY} r="140" fill="none" stroke={st.color}
          strokeWidth={i === 2 ? 0.8 : 1.2}
          style={{ animation: `pulse-ring 3.5s ease-out ${delay}s infinite`, transformOrigin: `${CX}px ${CY}px` }} />
      ))}
      <circle cx={CX} cy={CY} r="138" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
      {TICKS.map((t, i) => (
        <line key={i} x1={t.x} y1={t.y} x2={t.x2} y2={t.y2}
          stroke={t.isMaj ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}
          strokeWidth={t.isMaj ? 2 : 1} strokeLinecap="round" />
      ))}
      {[{ pct: 0.05, text: '20' }, { pct: 0.5, text: '55' }, { pct: 0.97, text: '92' }].map((l) => {
        const pos = compassToXY(225 + 270 * l.pct, 148);
        return <text key={l.text} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="system-ui" fontWeight="700">{l.text}</text>;
      })}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18"
        strokeDasharray={`${ARC} ${CIRC - ARC}`}
        style={{ transform: `rotate(${ROT}deg)`, transformOrigin: `${CX}px ${CY}px` }} />
      {[
        { pctLen: 0.34, rot: ROT,              color: 'rgba(46,213,115,0.1)' },
        { pctLen: 0.26, rot: ROT + 270 * 0.34, color: 'rgba(255,165,2,0.1)' },
        { pctLen: 0.40, rot: ROT + 270 * 0.60, color: 'rgba(255,71,87,0.1)' },
      ].map((z, i) => (
        <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={z.color} strokeWidth="18"
          strokeDasharray={`${ARC * z.pctLen} ${CIRC - ARC * z.pctLen}`}
          style={{ transform: `rotate(${z.rot}deg)`, transformOrigin: `${CX}px ${CY}px` }} />
      ))}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={st.color} strokeWidth="18" strokeLinecap="round"
        strokeDasharray={`${Math.max(0, fill - 2)} ${CIRC - Math.max(0, fill - 2)}`}
        style={{
          transform: `rotate(${ROT}deg)`, transformOrigin: `${CX}px ${CY}px`,
          transition: 'stroke-dasharray 1.1s cubic-bezier(0.4, 0, 0.2, 1), stroke 1s ease',
          filter: `drop-shadow(0 0 8px ${st.color}) drop-shadow(0 0 16px ${st.color}44)`,
        }} />
      <circle cx={CX} cy={CY} r="84" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <circle cx={CX} cy={CY} r="79" fill="rgba(6,11,24,0.93)" />
      <g style={{
        transform: `rotate(${needleRot}deg)`,
        transformOrigin: `${CX}px ${CY}px`,
        transition: 'transform 1.2s cubic-bezier(0.33, 1, 0.38, 1)',
      }}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - 84} stroke={st.color} strokeWidth="6" strokeLinecap="round" opacity="0.12" filter="url(#glow2)" />
        <line x1={CX} y1={CY + 10} x2={CX} y2={CY - 82} stroke="url(#needleGrad)" strokeWidth="2.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${st.color})` }} />
        <circle cx={CX} cy={CY - 82} r="3.5" fill={st.color} filter="url(#glow3)" />
      </g>
      <circle cx={CX} cy={CY} r="10" fill="rgba(6,11,24,0.98)" stroke={st.color} strokeWidth="1.5" style={{ transition: 'stroke 1s ease' }} />
      <circle cx={CX} cy={CY} r="4" fill={st.color} style={{ transition: 'fill 1s ease', animation: 'pulse-dot 2.8s ease-in-out infinite', filter: `drop-shadow(0 0 5px ${st.color})` }} />
      <text x={CX} y={CY - 26} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="9.5" fontFamily="system-ui" letterSpacing="2.5" fontWeight="700">DECIBELS</text>
      <text x={CX} y={CY + 16} textAnchor="middle" fill={st.color} fontSize="44" fontFamily="system-ui" fontWeight="800" letterSpacing="-2" style={{ transition: 'fill 1s ease' }}>{Math.round(db)}</text>
      <text x={CX} y={CY + 38} textAnchor="middle" fill={st.color} fontSize="9.5" fontFamily="system-ui" fontWeight="800" letterSpacing="3.5" style={{ transition: 'fill 1s ease' }}>{getState(db).label}</text>
      {pct > 1 && <>
        <circle cx={dot.x} cy={dot.y} r="16" fill={st.glow} style={{ transition: 'fill 1s ease' }} />
        <circle cx={dot.x} cy={dot.y} r="7" fill={st.color} filter="url(#glow2)" style={{ transition: 'fill 1s ease', animation: 'pulse-dot 2.4s ease-in-out infinite' }} />
        <circle cx={dot.x} cy={dot.y} r="3.5" fill="white" opacity="0.95" />
      </>}
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
            height: `${h}px`, background: st.color,
            opacity: 0.12 + age * 0.88,
            boxShadow: i >= wave.length - 4 ? `0 0 6px ${st.color}` : 'none',
            transition: 'height 0.45s cubic-bezier(0.4, 0, 0.2, 1), background 0.8s ease, opacity 0.5s ease',
          }} />
        );
      })}
    </div>
  );
}

const STATUS_CONFIG = {
  idle:       { color: 'rgba(232,234,240,0.3)', icon: '🎙️', text: 'Initialising...' },
  requesting: { color: '#FFD93D',               icon: '🎙️', text: 'Requesting mic...' },
  active:     { color: '#2ED573',               icon: '🎤', text: 'Microphone Active' },
  denied:     { color: '#FF4757',               icon: '🚫', text: 'Mic Denied — Simulation' },
};

const containerVars = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVars = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function NoiseMeter() {
  const mic = useMicAudio();
  const sim = useNoiseSim();

  const useMic = mic.micStatus === 'active';
  const db   = useMic ? mic.db   : sim.db;
  const wave = useMic ? mic.wave : sim.wave;
  const st   = getState(db);

  const dataRef = useRef({ samples: [42], peak: 42 });
  useEffect(() => {
    dataRef.current.samples.push(db);
    if (dataRef.current.samples.length > 300) dataRef.current.samples.shift();
    if (db > dataRef.current.peak) dataRef.current.peak = db;
  }, [db]);

  const avg = Math.round(
    dataRef.current.samples.reduce((a, b) => a + b, 0) / dataRef.current.samples.length
  );

  const statusCfg = STATUS_CONFIG[mic.micStatus] || STATUS_CONFIG.idle;

  return (
    <motion.div className="noise-meter" variants={containerVars} initial="hidden" animate="show">
      <motion.div className="section-header" variants={itemVars} style={{ width: '100%', textAlign: 'center' }}>
        <h2 className="section-title">Live Noise Monitor</h2>
        <p className="section-sub">Oshwal Academy Nairobi Junior High · Real-time analysis</p>
      </motion.div>

      <motion.div variants={itemVars}>
        <div className="mic-status-pill" style={{ borderColor: statusCfg.color, color: statusCfg.color }}>
          <span className="mic-status-icon">{statusCfg.icon}</span>
          <span>{statusCfg.text}</span>
          {mic.micStatus === 'active' && <span className="mic-live-dot" style={{ background: '#2ED573' }} />}
          {mic.micStatus === 'denied' && (
            <button className="mic-retry-btn" onClick={mic.retry}>Retry</button>
          )}
        </div>
      </motion.div>

      <motion.div className="gauge-wrapper" variants={itemVars}>
        <div className="gauge-outer">
          <Particles db={db} color={st.color} />
          <Gauge db={db} />
        </div>
        <Waveform wave={wave} db={db} />
      </motion.div>

      <motion.div className="stats-row" variants={itemVars}>
        {[
          { label: 'Current',      value: `${Math.round(db)} dB`,                  color: st.color  },
          { label: 'Average',      value: `${avg} dB`,                              color: '#00E5B4' },
          { label: 'Session Peak', value: `${Math.round(dataRef.current.peak)} dB`, color: '#FFD93D' },
        ].map((s, i) => (
          <motion.div key={s.label} className="glass-card stat-card"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, transition: 'color 1s ease' }}>{s.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="threshold-legend" variants={itemVars}>
        {[
          { label: 'Quiet',    range: '< 45 dB',  color: '#2ED573' },
          { label: 'Moderate', range: '45–65 dB', color: '#FFA502' },
          { label: 'Loud',     range: '> 65 dB',  color: '#FF4757' },
        ].map((t, i) => (
          <motion.div key={t.label} className="threshold-item"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.07, duration: 0.4, ease: 'easeOut' }}>
            <div className="threshold-dot" style={{ background: t.color, boxShadow: `0 0 7px ${t.color}` }} />
            <span className="threshold-label" style={{ color: t.color }}>{t.label}</span>
            <span className="threshold-range">{t.range}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
