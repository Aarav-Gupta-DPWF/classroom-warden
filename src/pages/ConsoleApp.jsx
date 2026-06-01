import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageTransition, MotionButton } from '../components/motion';
import { calmSpring } from '../utils/motionVariants';
import NoiseMeter from '../components/NoiseMeter';
import Leaderboard from '../components/Leaderboard';
import Analytics from '../components/Analytics';
import Dashboard from '../components/Dashboard';
import Rewards from '../components/Rewards';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import Contact from '../components/Contact';
import AudioConsentGate from '../components/AudioConsentGate';
import WardenEngineBadge from '../components/WardenEngineBadge';
import TrafficLightLogo from '../components/TrafficLightLogo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

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

export default function ConsoleApp() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const prevTabRef = useRef(0);
  const handleTab = (id) => {
    prevTabRef.current = activeTab;
    setActiveTab(id);
  };

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
              <TrafficLightLogo height={58} />
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
            <WardenEngineBadge />
            {user && (
              <button
                type="button"
                className="console-user-pill"
                onClick={() => void signOut().then(() => navigate('/welcome'))}
                title="Sign out"
              >
                <span className="console-user-avatar" aria-hidden>
                  {user.fullName.trim().charAt(0).toUpperCase()}
                </span>
                <span className="console-user-name">{user.fullName.split(' ')[0]}</span>
                <span className="console-user-action">Sign out</span>
              </button>
            )}
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
            <MotionButton key={tab.id}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => handleTab(tab.id)}>
              <span className="tab-emoji">{tab.emoji}</span>
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div className="tab-indicator" layoutId="tab-pill"
                  transition={calmSpring} />
              )}
            </MotionButton>
          ))}
        </div>
      </motion.nav>

      <main className="app-main transform-gpu">
        <AnimatePresence mode="wait">
          <PageTransition key={activeTab}>
            {activeTab === 0 && <NoiseMeter />}
            {activeTab === 1 && <Leaderboard />}
            {activeTab === 2 && <Analytics />}
            {activeTab === 3 && <Dashboard />}
            {activeTab === 4 && <Rewards />}
            {activeTab === 5 && <Reports />}
            {activeTab === 6 && <Settings />}
            {activeTab === 7 && <Contact />}
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}
