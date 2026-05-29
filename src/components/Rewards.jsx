import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useCalmSound } from '../hooks/useCalmSound';

const ACHIEVEMENTS = [
  { id: 'silence_master', icon: '🏆', name: 'Silence Master', desc: 'Maintain below 40 dB for 7 days', holder: 'Room 8A', progress: 100, unlocked: true,  color: '#FFD700' },
  { id: 'quiet_guardian', icon: '🛡️', name: 'Quiet Guardian',  desc: '10+ day noise streak',           holder: 'Room 8C', progress: 100, unlocked: true,  color: '#00E5B4' },
  { id: 'noise_reducer',  icon: '📉', name: 'Noise Reducer',   desc: 'Improve 10+ dB vs last month',   holder: 'Room 8A', progress: 100, unlocked: true,  color: '#2ED573' },
  { id: 'peaceful_week',  icon: '☮️', name: 'Peaceful Pioneer', desc: 'Full week with zero LOUD events', holder: 'Room 8D', progress: 80,  unlocked: false, color: '#A78BFA' },
  { id: 'group_hero',     icon: '🤝', name: 'Group Study Hero', desc: 'All classes below 50 dB same day', holder: null,     progress: 45,  unlocked: false, color: '#00CFFF' },
  { id: 'champion',       icon: '👑', name: 'School Champion',  desc: '#1 quietest class for 30 days',  holder: null,      progress: 23,  unlocked: false, color: '#FFD93D' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Room 8A', emoji: '💼', teacher: 'Mr. Wakaba',   points: 950,  badge: '🥇' },
  { rank: 2, name: 'Room 8C', emoji: '📐', teacher: 'Ms. Sharon',   points: 880,  badge: '🥈' },
  { rank: 3, name: 'Room 8D', emoji: '🇫🇷', teacher: 'Mr. Kopiyo',  points: 790,  badge: '🥉' },
  { rank: 4, name: 'Room 8B', emoji: '🧪', teacher: 'Mr. Nicholas', points: 720,  badge: null },
  { rank: 5, name: 'Room 7A', emoji: '🔬', teacher: 'Mr. Meshak',   points: 640,  badge: null },
  { rank: 6, name: 'Room 7C', emoji: '🧠', teacher: 'Ms. Vannesa',  points: 600,  badge: null },
  { rank: 7, name: 'Room 7B', emoji: '⚡', teacher: 'Mr. Nick',     points: 510,  badge: null },
  { rank: 8, name: 'Room 9A', emoji: '🇮🇳', teacher: 'Ms. Preeti',  points: 320,  badge: null },
];

const MONTHLY_REWARDS = [
  { place: 1, reward: 'Extra 30-min break on Friday', icon: '🎉', color: '#FFD700', cls: 'Room 8A' },
  { place: 2, reward: 'Class Excellence Certificate',  icon: '📜', color: '#C0C0C0', cls: 'Room 8C' },
  { place: 3, reward: 'Star Sticker Board',            icon: '⭐', color: '#CD7F32', cls: 'Room 8D' },
];

const containerVars = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const itemVars = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function fireCelebration() {
  const opts = { particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#00E5B4', '#FFD93D', '#A78BFA', '#FF4757', '#00CFFF'] };
  confetti({ ...opts, angle: 60,  origin: { x: 0.1 } });
  confetti({ ...opts, angle: 120, origin: { x: 0.9 } });
  setTimeout(() => confetti({ ...opts, particleCount: 60, origin: { y: 0.4 } }), 250);
}

function BadgeCard({ ach, onUnlock }) {
  const { playTap } = useCalmSound();

  return (
    <motion.div
      className={`glass-card reward-badge-card${ach.unlocked ? ' unlocked' : ''}`}
      style={{ '--badge-color': ach.color, borderColor: ach.unlocked ? ach.color + '44' : undefined }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      layout>
      <div className="reward-badge-icon" style={{
        background: ach.unlocked ? ach.color + '20' : 'rgba(255,255,255,0.04)',
        boxShadow: ach.unlocked ? `0 0 24px ${ach.color}44` : 'none',
      }}>
        {ach.icon}
        {ach.unlocked && <div className="reward-unlocked-ring" style={{ borderColor: ach.color }} />}
      </div>
      <div className="reward-badge-name" style={{ color: ach.unlocked ? ach.color : '#E8EAF0' }}>{ach.name}</div>
      <div className="reward-badge-desc">{ach.desc}</div>
      {ach.holder && <div className="reward-badge-holder">🏫 {ach.holder}</div>}
      <div className="reward-progress-track">
        <motion.div className="reward-progress-fill"
          initial={{ width: 0 }} animate={{ width: `${ach.progress}%` }}
          transition={{ delay: 0.3, duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ background: `linear-gradient(90deg, ${ach.color}88, ${ach.color})` }} />
      </div>
      <div className="reward-progress-label" style={{ color: ach.unlocked ? ach.color : 'rgba(232,234,240,0.35)' }}>
        {ach.unlocked ? '✓ Unlocked' : `${ach.progress}% complete`}
      </div>
      {!ach.unlocked && ach.progress >= 80 && (
        <motion.button className="reward-demo-btn" onClick={() => { playTap(); onUnlock(); }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          Preview Unlock 🎊
        </motion.button>
      )}
    </motion.div>
  );
}

export default function Rewards() {
  const [achievements, setAchievements] = useState(ACHIEVEMENTS);
  const [unlocking, setUnlocking] = useState(null);
  const { playTap, playSuccess } = useCalmSound();

  const handleUnlock = (id) => {
    fireCelebration();
    playSuccess();
    setUnlocking(id);
    setTimeout(() => {
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, unlocked: true, progress: 100 } : a));
      setUnlocking(null);
    }, 1800);
  };

  return (
    <motion.div className="rewards-page" variants={containerVars} initial="hidden" animate="show">
      <motion.div className="section-header" variants={itemVars}>
        <h2 className="section-title">Rewards & Achievements</h2>
        <p className="section-sub">Earn badges, climb the leaderboard, win monthly prizes</p>
      </motion.div>

      {/* Monthly rewards */}
      <motion.div className="glass-card rewards-monthly" variants={itemVars}>
        <div className="rewards-monthly-title">🎁 May 2026 Monthly Rewards</div>
        <div className="rewards-monthly-grid">
          {MONTHLY_REWARDS.map((r) => (
            <motion.div key={r.place} className="rewards-monthly-card"
              style={{ borderColor: r.color + '44', background: r.color + '0A' }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}>
              <div className="rewards-monthly-icon">{r.icon}</div>
              <div className="rewards-monthly-place" style={{ color: r.color }}>#{r.place} Place</div>
              <div className="rewards-monthly-class">{r.cls}</div>
              <div className="rewards-monthly-reward">{r.reward}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievement badges */}
      <motion.div variants={itemVars}>
        <div className="rewards-section-label">Achievement Badges</div>
        <div className="rewards-badges-grid">
          {achievements.map(ach => (
            <BadgeCard key={ach.id} ach={ach} onUnlock={() => handleUnlock(ach.id)} />
          ))}
        </div>
      </motion.div>

      {/* Points leaderboard */}
      <motion.div className="glass-card rewards-lb" variants={itemVars}>
        <div className="chart-header">
          <div className="chart-title">🏅 Points Leaderboard</div>
          <div className="chart-subtitle">Earned through consistent quietness &amp; streaks</div>
        </div>
        <div className="rewards-lb-list">
          {LEADERBOARD.map((row, i) => (
            <motion.div key={row.rank} className="rewards-lb-row"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className="rewards-lb-rank" style={{ color: i < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : 'rgba(232,234,240,0.3)' }}>
                {row.badge || row.rank}
              </div>
              <span className="rewards-lb-emoji">{row.emoji}</span>
              <div className="rewards-lb-info">
                <div className="rewards-lb-name">{row.name}</div>
                <div className="rewards-lb-teacher">{row.teacher}</div>
              </div>
              <div className="rewards-lb-points">
                <span style={{ color: '#FFD93D', fontWeight: 700, fontSize: 18 }}>{row.points}</span>
                <span style={{ color: 'rgba(232,234,240,0.35)', fontSize: 11, marginLeft: 4 }}>pts</span>
              </div>
              <div className="noise-bar-track" style={{ width: 80 }}>
                <motion.div className="noise-bar-fill"
                  initial={{ width: 0 }} animate={{ width: `${(row.points / 950) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ background: 'linear-gradient(90deg, #FFD93D77, #FFD93D)' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
