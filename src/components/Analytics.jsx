import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Legend, Area, AreaChart,
} from 'recharts';

const MONTHLY = [
  { month: 'Nov', avg: 52, peak: 78 },
  { month: 'Dec', avg: 47, peak: 71 },
  { month: 'Jan', avg: 58, peak: 85 },
  { month: 'Feb', avg: 55, peak: 79 },
  { month: 'Mar', avg: 51, peak: 73 },
  { month: 'Apr', avg: 44, peak: 68 },
];

const WEEKLY = [
  { day: 'Mon', morning: 48, afternoon: 62 },
  { day: 'Tue', morning: 55, afternoon: 71 },
  { day: 'Wed', morning: 42, afternoon: 57 },
  { day: 'Thu', morning: 63, afternoon: 68 },
  { day: 'Fri', morning: 71, afternoon: 79 },
];

const AXIS_STYLE = { fill: 'rgba(232,234,240,0.3)', fontSize: 11, fontWeight: 600 };
const GRID_STROKE = 'rgba(255,255,255,0.04)';

// rAF-based count-up hook
function useCountUp(target, duration = 1100, delay = 0) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    let started = false;
    let startTs = null;
    let rafId;

    const run = (ts) => {
      if (!started) {
        startTs = ts;
        started = true;
      }
      const elapsed = ts - startTs;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (t < 1) rafId = requestAnimationFrame(run);
    };

    const tid = setTimeout(() => {
      rafId = requestAnimationFrame(run);
    }, delay);

    return () => {
      clearTimeout(tid);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [target, duration, delay]);

  return count;
}

function CountUpStat({ value, suffix = '', prefix = '', color, delay = 0 }) {
  const n = useCountUp(value, 1100, delay);
  return (
    <div className="summary-value" style={{ color }}>
      {prefix}{n}{suffix}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(6,11,24,0.97)',
      border: '1px solid rgba(0,229,180,0.15)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,180,0.08)',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'rgba(232,234,240,0.4)',
        letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
      }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: '#E8EAF0', marginBottom: 3,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: p.color, boxShadow: `0 0 6px ${p.color}`,
            flexShrink: 0,
          }} />
          <span style={{ color: 'rgba(232,234,240,0.5)', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: p.color }}>{p.value} dB</span>
        </div>
      ))}
    </div>
  );
}

const containerVars = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVars = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const cardGroupVars = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVars = {
  hidden: { opacity: 0, y: 18, scale: 0.94 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export default function Analytics() {
  return (
    <motion.div className="analytics" variants={containerVars} initial="hidden" animate="show">
      <motion.div className="section-header" variants={itemVars}>
        <h2 className="section-title">Monthly Analytics</h2>
        <p className="section-sub">School Year 2025–26 · All classrooms</p>
      </motion.div>

      {/* Summary cards with count-up */}
      <motion.div className="analytics-summary" variants={cardGroupVars} initial="hidden" animate="show">
        {/* Card 1 — numeric */}
        <motion.div className="glass-card summary-card" variants={cardVars}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <span className="summary-icon">📊</span>
          <div className="summary-label">This Month Avg</div>
          <CountUpStat value={44} suffix=" dB" color="#00E5B4" delay={200} />
          <div className="summary-trend" style={{ color: '#2ED573' }}>▼ 7 dB vs last month</div>
        </motion.div>

        {/* Card 2 — text */}
        <motion.div className="glass-card summary-card" variants={cardVars}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <span className="summary-icon">🏆</span>
          <div className="summary-label">Quietest Class</div>
          <div className="summary-value" style={{ color: '#FFD93D' }}>Room 4A</div>
          <div className="summary-trend" style={{ color: 'rgba(232,234,240,0.35)' }}>38 dB average</div>
        </motion.div>

        {/* Card 3 — text */}
        <motion.div className="glass-card summary-card" variants={cardVars}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <span className="summary-icon">📅</span>
          <div className="summary-label">Quietest Day</div>
          <div className="summary-value" style={{ color: '#A78BFA' }}>Wednesday</div>
          <div className="summary-trend" style={{ color: 'rgba(232,234,240,0.35)' }}>42 dB this week</div>
        </motion.div>

        {/* Card 4 — numeric */}
        <motion.div className="glass-card summary-card" variants={cardVars}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}>
          <span className="summary-icon">📈</span>
          <div className="summary-label">Improvement</div>
          <CountUpStat value={18} suffix="%" prefix="+" color="#2ED573" delay={350} />
          <div className="summary-trend" style={{ color: 'rgba(232,234,240,0.35)' }}>vs 6 months ago</div>
        </motion.div>
      </motion.div>

      {/* Bar chart */}
      <motion.div className="glass-card chart-section" variants={itemVars}>
        <div className="chart-header">
          <div className="chart-title">6-Month Noise Averages</div>
          <div className="chart-subtitle">Average and peak dB levels per month across all classes</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={MONTHLY} barGap={4} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="barAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5B4" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#00E5B4" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="barPeak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD93D" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFD93D" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={[20, 100]} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={55} stroke="rgba(255,71,87,0.3)" strokeDasharray="5 4"
              label={{ value: 'Target 55 dB', position: 'insideTopRight', fill: 'rgba(255,71,87,0.5)', fontSize: 10 }} />
            <Bar dataKey="avg"  name="average" fill="url(#barAvg)"  radius={[5,5,0,0]}
              isAnimationActive animationDuration={1000} animationEasing="ease-out" />
            <Bar dataKey="peak" name="peak"    fill="url(#barPeak)" radius={[5,5,0,0]}
              isAnimationActive animationDuration={1000} animationEasing="ease-out" animationBegin={180} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Area chart */}
      <motion.div className="glass-card chart-section" variants={itemVars}>
        <div className="chart-header">
          <div className="chart-title">This Week · Daily Noise Trends</div>
          <div className="chart-subtitle">Morning vs afternoon noise levels by day</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={WEEKLY} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="areaM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5B4" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#00E5B4" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="areaA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={[30, 90]} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0,229,180,0.12)', strokeWidth: 1 }} />
            <ReferenceLine y={65} stroke="rgba(255,71,87,0.28)" strokeDasharray="5 4"
              label={{ value: 'Loud threshold', position: 'insideTopRight', fill: 'rgba(255,71,87,0.45)', fontSize: 10 }} />
            <Area type="monotone" dataKey="morning" name="morning" stroke="#00E5B4" strokeWidth={2.5}
              fill="url(#areaM)" dot={{ fill: '#00E5B4', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: '#00E5B4', filter: 'drop-shadow(0 0 6px #00E5B4)' }}
              isAnimationActive animationDuration={1200} animationEasing="ease-out" />
            <Area type="monotone" dataKey="afternoon" name="afternoon" stroke="#A78BFA" strokeWidth={2.5}
              fill="url(#areaA)" dot={{ fill: '#A78BFA', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: '#A78BFA', filter: 'drop-shadow(0 0 6px #A78BFA)' }}
              isAnimationActive animationDuration={1200} animationEasing="ease-out" animationBegin={220} />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 12, color: 'rgba(232,234,240,0.5)', textTransform: 'capitalize' }}
              iconType="circle" iconSize={8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
