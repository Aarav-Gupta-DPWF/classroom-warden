import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SmoothCard, StaggerContainer } from './motion';
import { childItemVariants, containerStaggerVariants } from '../utils/motionVariants';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, LineChart, Line, Legend,
} from 'recharts';

const CLASSES = [
  { id: 1, name: 'Room 8A', emoji: '💼', teacher: 'Mr. Wakaba',   subject: 'Business Studies', streak: 7,  baseDb: 38, points: 950 },
  { id: 2, name: 'Room 8B', emoji: '🧪', teacher: 'Mr. Nicholas', subject: 'Chemistry',         streak: 3,  baseDb: 47, points: 720 },
  { id: 3, name: 'Room 8C', emoji: '📐', teacher: 'Ms. Sharon',   subject: 'Maths',             streak: 12, baseDb: 42, points: 880 },
  { id: 4, name: 'Room 7A', emoji: '🔬', teacher: 'Mr. Meshak',   subject: 'Biology',           streak: 5,  baseDb: 54, points: 640 },
  { id: 5, name: 'Room 7B', emoji: '⚡', teacher: 'Mr. Nick',     subject: 'Physics',           streak: 1,  baseDb: 63, points: 510 },
  { id: 6, name: 'Room 9A', emoji: '🇮🇳', teacher: 'Ms. Preeti',  subject: 'Hindi',             streak: 0,  baseDb: 71, points: 320 },
  { id: 7, name: 'Room 8D', emoji: '🇫🇷', teacher: 'Mr. Kopiyo',  subject: 'French',            streak: 8,  baseDb: 50, points: 790 },
  { id: 8, name: 'Room 7C', emoji: '🧠', teacher: 'Ms. Vannesa',  subject: 'PSHE',              streak: 4,  baseDb: 55, points: 600 },
];

const WEEKLY_TREND = [
  { day: 'Mon', avg: 52, target: 55 },
  { day: 'Tue', avg: 58, target: 55 },
  { day: 'Wed', avg: 44, target: 55 },
  { day: 'Thu', avg: 61, target: 55 },
  { day: 'Fri', avg: 48, target: 55 },
];

const AXIS_STYLE = { fill: 'rgba(232,234,240,0.3)', fontSize: 11, fontWeight: 600 };
const GRID      = 'rgba(255,255,255,0.04)';

function useCountUp(target, duration = 1100, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let id, rafId;
    id = setTimeout(() => {
      let startTs = null;
      const step = ts => {
        if (!startTs) startTs = ts;
        const t = Math.min((ts - startTs) / duration, 1);
        setN(Math.round((1 - Math.pow(1 - t, 3)) * target));
        if (t < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(id); cancelAnimationFrame(rafId); };
  }, [target, duration, delay]);
  return n;
}

function StatCard({ icon, label, value, suffix = '', color, delay, sub }) {
  const n = useCountUp(typeof value === 'number' ? value : 0, 1100, delay);
  return (
    <SmoothCard className="glass-card dash-stat-card">
      <span className="dash-stat-icon">{icon}</span>
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value" style={{ color }}>
        {typeof value === 'number' ? `${n}${suffix}` : value}
      </div>
      {sub && <div className="dash-stat-sub">{sub}</div>}
    </SmoothCard>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(6,11,24,0.97)', border: '1px solid rgba(0,229,180,0.15)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#E8EAF0', marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'rgba(232,234,240,0.5)', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: p.color }}>{p.value} dB</span>
        </div>
      ))}
    </div>
  );
}

const containerVars = containerStaggerVariants;
const itemVars = childItemVariants;

const sorted = [...CLASSES].sort((a, b) => a.baseDb - b.baseDb);
const chartData = CLASSES.map(c => ({ name: c.name.replace('Room ', ''), db: c.baseDb, color: c.baseDb < 45 ? '#2ED573' : c.baseDb < 65 ? '#FFA502' : '#FF4757' }));

export default function Dashboard() {
  const schoolAvg = Math.round(CLASSES.reduce((a, c) => a + c.baseDb, 0) / CLASSES.length);
  const quietest  = sorted[0];
  const loudest   = sorted[sorted.length - 1];

  return (
    <motion.div className="dashboard transform-gpu" variants={containerVars} initial="initial" animate="animate">
      <motion.div className="section-header" variants={itemVars}>
        <h2 className="section-title">School Dashboard</h2>
        <p className="section-sub">Oshwal Academy Nairobi Junior High · Overview</p>
      </motion.div>

      {/* Overview stats */}
      <StaggerContainer className="dash-stats-grid">
        <StatCard icon="🏫" label="Total Classes"   value={8}           color="#00E5B4"  delay={100} sub="Active this week" />
        <StatCard icon="📊" label="School Average"  value={schoolAvg}   suffix=" dB"    color="#A78BFA" delay={180} sub="vs 58 dB last month" />
        <StatCard icon="🥇" label="Quietest Class"  value={quietest.name} color="#2ED573" delay={0}  sub={`${quietest.baseDb} dB avg · ${quietest.teacher}`} />
        <StatCard icon="📢" label="Loudest Class"   value={loudest.name}  color="#FF4757" delay={0}  sub={`${loudest.baseDb} dB avg · ${loudest.teacher}`} />
      </StaggerContainer>

      {/* Class comparison bar chart */}
      <motion.div variants={itemVars}>
      <SmoothCard className="glass-card chart-section">
        <div className="chart-header">
          <div className="chart-title">Class Noise Comparison</div>
          <div className="chart-subtitle">Average dB levels across all 8 classrooms</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              {chartData.map((d, i) => (
                <linearGradient key={i} id={`bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={d.color} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={d.color} stopOpacity="0.3" />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke={GRID} vertical={false} />
            <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={[20, 90]} />
            <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={55} stroke="rgba(255,71,87,0.3)" strokeDasharray="5 4"
              label={{ value: 'Target', position: 'insideTopRight', fill: 'rgba(255,71,87,0.45)', fontSize: 10 }} />
            <Bar dataKey="db" name="noise level" fill="url(#bar-0)"
              radius={[5, 5, 0, 0]} isAnimationActive animationDuration={1000}
              cell={chartData.map((d, i) => <cell key={i} fill={`url(#bar-${i})`} />)} />
          </BarChart>
        </ResponsiveContainer>
      </SmoothCard>
      </motion.div>

      {/* Weekly trend */}
      <motion.div variants={itemVars}>
      <SmoothCard className="glass-card chart-section">
        <div className="chart-header">
          <div className="chart-title">This Week · School Average Trend</div>
          <div className="chart-subtitle">Daily average noise vs. 55 dB target</div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={WEEKLY_TREND} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 6" stroke={GRID} vertical={false} />
            <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={[30, 75]} />
            <Tooltip content={<ChartTip />} />
            <ReferenceLine y={55} stroke="rgba(255,71,87,0.28)" strokeDasharray="5 4" />
            <Line type="monotone" dataKey="avg" name="avg" stroke="#00E5B4" strokeWidth={2.5}
              dot={{ fill: '#00E5B4', r: 5, strokeWidth: 0 }}
              activeDot={{ r: 8, fill: '#00E5B4', filter: 'drop-shadow(0 0 6px #00E5B4)' }}
              isAnimationActive animationDuration={1200} />
          </LineChart>
        </ResponsiveContainer>
      </SmoothCard>
      </motion.div>

      {/* Teacher rankings */}
      <motion.div variants={itemVars}>
      <SmoothCard className="glass-card dash-rankings">
        <div className="chart-header">
          <div className="chart-title">Teacher Performance Rankings</div>
          <div className="chart-subtitle">Sorted by classroom noise management</div>
        </div>
        <div className="dash-rank-list">
          {sorted.map((cls, i) => {
            const pct = Math.max(4, Math.min(100, ((cls.baseDb - 20) / 70) * 100));
            const color = cls.baseDb < 45 ? '#2ED573' : cls.baseDb < 65 ? '#FFA502' : '#FF4757';
            return (
              <motion.div key={cls.id} className="dash-rank-row"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                <div className="dash-rank-num" style={{ color: i < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : 'rgba(232,234,240,0.3)' }}>
                  {i + 1}
                </div>
                <div className="dash-rank-emoji">{cls.emoji}</div>
                <div className="dash-rank-info">
                  <div className="dash-rank-name">{cls.teacher}</div>
                  <div className="dash-rank-sub">{cls.name} · {cls.subject}</div>
                  <div className="noise-bar-track" style={{ marginTop: 5 }}>
                    <motion.div className="noise-bar-fill"
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                      style={{ background: `linear-gradient(90deg, ${color}77, ${color})` }} />
                  </div>
                </div>
                <div className="dash-rank-db" style={{ color }}>{cls.baseDb} dB</div>
              </motion.div>
            );
          })}
        </div>
      </SmoothCard>
      </motion.div>
    </motion.div>
  );
}
