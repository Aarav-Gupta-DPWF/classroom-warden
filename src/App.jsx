import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NoiseMeter from './components/NoiseMeter';
import Leaderboard from './components/Leaderboard';
import Analytics from './components/Analytics';
import './App.css';

const TABS = [
  { id: 0, label: 'Live Monitor', emoji: '⚡' },
  { id: 1, label: 'Leaderboard', emoji: '🏆' },
  { id: 2, label: 'Analytics', emoji: '📊' },
];

function LogoIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00E5B4" />
          <stop offset="1" stopColor="#00CFFF" />
        </linearGradient>
        <linearGradient id="lg2" x1="46" y1="0" x2="0" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00E5B4" stopOpacity="0.6" />
          <stop offset="1" stopColor="#00CFFF" stopOpacity="0.3" />
        </linearGradient>
        <filter id="lf">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Corner L-brackets — targeting / precision aesthetic */}
      <path d="M4 14 L4 4 L14 4" stroke="url(#lg1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 4 L42 4 L42 14" stroke="url(#lg1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 32 L4 42 L14 42" stroke="url(#lg1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 42 L42 42 L42 32" stroke="url(#lg1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Slowly rotating outer dashed ring */}
      <circle cx="23" cy="23" r="18" stroke="rgba(0,229,180,0.22)"
        strokeWidth="1" strokeDasharray="5 3.2" className="logo-spin" />

      {/* Faster counter-rotating inner scan ring */}
      <circle cx="23" cy="23" r="13" stroke="rgba(0,207,255,0.15)"
        strokeWidth="0.7" strokeDasharray="3 5" className="logo-scan" />

      {/* Hex body */}
      <path d="M23 8 L34.2 14.5 L34.2 31.5 L23 38 L11.8 31.5 L11.8 14.5 Z"
        fill="rgba(0,229,180,0.06)"
        stroke="url(#lg2)"
        strokeWidth="1.6"/>

      {/* EQ bars — all anchored at bottom y=30 */}
      <g filter="url(#lf)">
        <rect x="15"   y="24" width="2.4" height="6"  rx="1.2" fill="#00E5B4"  className="logo-b1"/>
        <rect x="19"   y="20" width="2.4" height="10" rx="1.2" fill="#00CFFF"  className="logo-b2"/>
        <rect x="23"   y="16" width="2.4" height="14" rx="1.2" fill="#00E5B4"  className="logo-b3"/>
        <rect x="27"   y="20" width="2.4" height="10" rx="1.2" fill="#00CFFF"  className="logo-b2"/>
        <rect x="31"   y="24" width="2.4" height="6"  rx="1.2" fill="#00E5B4"  className="logo-b1"/>
      </g>

      {/* Pulsing center dot */}
      <circle cx="23" cy="23" r="1.8" fill="#00E5B4" filter="url(#lf)" className="logo-center"/>
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const prevTabRef = useRef(0);

  const handleTab = (id) => {
    prevTabRef.current = activeTab;
    setActiveTab(id);
  };

  const dir = activeTab > prevTabRef.current ? 1 : -1;

  return (
    <div className="app-shell">
      <div className="ambient-top" />
      <div className="ambient-br" />

      <motion.header
        className="app-header"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="header-inner">
          <motion.div
            className="logo-group"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="logo-icon">
              <LogoIcon />
            </span>
            <div>
              <h1 className="app-title">Classroom Warden</h1>
              <p className="app-subtitle">Live Noise Intelligence</p>
            </div>
          </motion.div>

          <motion.div
            className="live-badge"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="live-dot" />
            LIVE
          </motion.div>
        </div>
      </motion.header>

      <motion.nav
        className="tab-nav"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="tab-list">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => handleTab(tab.id)}
              whileTap={{ scale: 0.96 }}
            >
              <span className="tab-emoji">{tab.emoji}</span>
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  className="tab-indicator"
                  layoutId="tab-pill"
                  transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <main className="app-main">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={activeTab}
            custom={dir}
            variants={{
              enter: (d) => ({ opacity: 0, x: d * 48, scale: 0.982, y: 8 }),
              center: { opacity: 1, x: 0, scale: 1, y: 0 },
              exit: (d) => ({ opacity: 0, x: d * -48, scale: 0.982, y: -8 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ width: '100%' }}
          >
            {activeTab === 0 && <NoiseMeter />}
            {activeTab === 1 && <Leaderboard />}
            {activeTab === 2 && <Analytics />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
