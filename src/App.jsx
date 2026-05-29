import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NoiseMeter from './components/NoiseMeter';
import Leaderboard from './components/Leaderboard';
import Analytics from './components/Analytics';
import Dashboard from './components/Dashboard';
import Rewards from './components/Rewards';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Contact from './components/Contact';
import AudioConsentGate from './components/AudioConsentGate';
import { useCalmSound } from './hooks/useCalmSound';
import './App.css';

const TABS = [
  { id: 0, label: 'Live Monitor', emoji: '⚡' },
  { id: 1, label: 'Leaderboard',  emoji: '🏆' },
  { id: 2, label: 'Analytics',    emoji: '📊' },
  { id: 3, label: 'Dashboard',    emoji: '🏫' },
  { id: 4, label: 'Rewards',      emoji: '🎖️' },
  { id: 5, label: 'Reports',      emoji: '📋' },
  { id: 6, label: 'Settings',     emoji: '⚙️' },
  { id: 7, label: 'Contact',      emoji: '📬' },
];

// ── Traffic-light + AI logo ──
function LogoIcon() {
  return (
    <svg width="28" height="58" viewBox="0 0 28 58" fill="none">
      <defs>
        <filter id="tlgr"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="tlgy"><feGaussianBlur stdDeviation="3"   result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="tlgg"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="tlHousing" x1="0" y1="0" x2="0" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D1929"/>
          <stop offset="1" stopColor="#070D18"/>
        </linearGradient>
      </defs>

      {/* Housing */}
      <rect x="2" y="1" width="24" height="56" rx="12" fill="url(#tlHousing)" stroke="rgba(0,229,180,0.22)" strokeWidth="1.2"/>

      {/* Corner brackets */}
      <path d="M2 9 L2 1 L10 1"  stroke="rgba(0,229,180,0.55)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 1 L26 1 L26 9" stroke="rgba(0,229,180,0.55)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 49 L2 57 L10 57" stroke="rgba(0,229,180,0.55)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 57 L26 57 L26 49" stroke="rgba(0,229,180,0.55)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Scan line */}
      <rect x="2" y="28" width="24" height="0.8" fill="rgba(0,229,180,0.12)" className="tl-scan"/>

      {/* Red light */}
      <circle cx="14" cy="12" r="7"   fill="rgba(255,71,87,0.12)"  stroke="rgba(255,71,87,0.25)"  strokeWidth="0.5"/>
      <circle cx="14" cy="12" r="5.2" fill="#FF4757" className="tl-red"    filter="url(#tlgr)"/>

      {/* Yellow light */}
      <circle cx="14" cy="29" r="7"   fill="rgba(255,217,61,0.12)" stroke="rgba(255,217,61,0.25)" strokeWidth="0.5"/>
      <circle cx="14" cy="29" r="5.2" fill="#FFD93D" className="tl-yellow" filter="url(#tlgy)"/>

      {/* Green light */}
      <circle cx="14" cy="46" r="7"   fill="rgba(46,213,115,0.12)" stroke="rgba(46,213,115,0.25)" strokeWidth="0.5"/>
      <circle cx="14" cy="46" r="5.2" fill="#2ED573" className="tl-green"  filter="url(#tlgg)"/>

      {/* Left circuit traces */}
      <line x1="0" y1="12" x2="2" y2="12" stroke="rgba(255,71,87,0.5)"    strokeWidth="0.9"/>
      <circle cx="-1" cy="12" r="1.2" fill="rgba(255,71,87,0.6)"    className="tl-dot-r"/>
      <line x1="0" y1="29" x2="2" y2="29" stroke="rgba(255,217,61,0.5)"   strokeWidth="0.9"/>
      <circle cx="-1" cy="29" r="1.2" fill="rgba(255,217,61,0.6)"   className="tl-dot-y"/>
      <line x1="0" y1="46" x2="2" y2="46" stroke="rgba(46,213,115,0.5)"   strokeWidth="0.9"/>
      <circle cx="-1" cy="46" r="1.2" fill="rgba(46,213,115,0.6)"   className="tl-dot-g"/>

      {/* Right circuit traces */}
      <line x1="26" y1="12" x2="29" y2="12" stroke="rgba(255,71,87,0.5)"  strokeWidth="0.9"/>
      <circle cx="30" cy="12" r="1.2" fill="rgba(255,71,87,0.6)"    className="tl-dot-r"/>
      <line x1="26" y1="29" x2="29" y2="29" stroke="rgba(255,217,61,0.5)" strokeWidth="0.9"/>
      <circle cx="30" cy="29" r="1.2" fill="rgba(255,217,61,0.6)"   className="tl-dot-y"/>
      <line x1="26" y1="46" x2="29" y2="46" stroke="rgba(46,213,115,0.5)" strokeWidth="0.9"/>
      <circle cx="30" cy="46" r="1.2" fill="rgba(46,213,115,0.6)"   className="tl-dot-g"/>
    </svg>
  );
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="header-clock">
      <span className="header-clock-time">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span className="header-clock-date">
        {time.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
      </span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const prevTabRef = useRef(0);
  const { playTap } = useCalmSound();

  const handleTab = (id) => {
    playTap();
    prevTabRef.current = activeTab;
    setActiveTab(id);
  };

  const dir = activeTab > prevTabRef.current ? 1 : -1;

  return (
    <div className="app-shell">
      <AudioConsentGate />
      <div className="ambient-top" />
      <div className="ambient-br" />

      <motion.header className="app-header"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <div className="header-inner">
          <motion.div className="logo-group"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <span className="logo-icon">
              <LogoIcon />
            </span>
            <div>
              <h1 className="app-title">Classroom Warden</h1>
              <p className="app-subtitle">Live Noise Intelligence</p>
            </div>
          </motion.div>

          <motion.div className="header-right"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <LiveClock />
            <div className="live-badge">
              <span className="live-dot" />
              LIVE
            </div>
          </motion.div>
        </div>
      </motion.header>

      <motion.nav className="tab-nav"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
        <div className="tab-list">
          {TABS.map((tab) => (
            <motion.button key={tab.id}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => handleTab(tab.id)}
              whileTap={{ scale: 0.96 }}>
              <span className="tab-emoji">{tab.emoji}</span>
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div className="tab-indicator" layoutId="tab-pill"
                  transition={{ type: 'spring', stiffness: 480, damping: 38 }} />
              )}
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <main className="app-main">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={activeTab} custom={dir}
            variants={{
              enter:  (d) => ({ opacity: 0, x: d * 40, scale: 0.984, y: 6 }),
              center: { opacity: 1, x: 0, scale: 1, y: 0 },
              exit:   (d) => ({ opacity: 0, x: d * -40, scale: 0.984, y: -6 }),
            }}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ width: '100%' }}>
            {activeTab === 0 && <NoiseMeter />}
            {activeTab === 1 && <Leaderboard />}
            {activeTab === 2 && <Analytics />}
            {activeTab === 3 && <Dashboard />}
            {activeTab === 4 && <Rewards />}
            {activeTab === 5 && <Reports />}
            {activeTab === 6 && <Settings />}
            {activeTab === 7 && <Contact />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
