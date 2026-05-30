import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ConstellationBg from '../components/landing/ConstellationBg';
import ShieldLogo from '../components/landing/ShieldLogo';
import AuthModal from '../components/landing/AuthModal';
import { MotionButton } from '../components/motion';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import '../styles/Landing.css';

const MODULES = [
  {
    id: 'console',
    title: 'Warden Console',
    desc: 'Live noise intelligence, class dashboards, and teacher rankings in one command view.',
    tag: 'Core',
  },
  {
    id: 'pulse',
    title: 'School Pulse',
    desc: 'Real-time metrics, streak tracking, and monthly intelligence reports.',
    tag: 'Analytics',
  },
  {
    id: 'rewards',
    title: 'Rewards Engine',
    desc: 'Achievement badges, points leaderboards, and calm celebration flows.',
    tag: 'Engagement',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  useEffect(() => {
    if (location.state?.auth === 'required') {
      openAuth('signin');
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const goConsole = () => {
    if (user) {
      navigate('/');
      return;
    }
    openAuth('signup');
  };

  const handleAuthSuccess = () => navigate('/');

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing">
      <ConstellationBg />
      <div className="landing-glow-left" />
      <div className="landing-vignette" />

      <header className="landing-nav">
        <a href="/welcome" className="landing-brand">
          <ShieldLogo />
          <span>Classroom Warden</span>
        </a>
        <nav className="landing-links">
          <button type="button" onClick={() => scrollTo('modules')}>Modules</button>
          <button type="button" onClick={goConsole}>Console</button>
          <button type="button" onClick={() => scrollTo('pulse')}>Pulse</button>
        </nav>
        <div className="landing-nav-actions">
          {user ? (
            <MotionButton className="landing-btn-signin" onClick={() => navigate('/')}>
              Open Console
            </MotionButton>
          ) : (
            <MotionButton
              className="landing-btn-signin"
              playSoundOnClick={false}
              onClick={() => openAuth('signin')}
            >
              Sign In
            </MotionButton>
          )}
        </div>
      </header>

      <main className="landing-hero">
        <motion.div
          className="landing-hero-inner"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Live operations system · v2.6
            <span className="landing-badge-spark">✦</span>
          </div>

          <h1 className="landing-headline">
            <span className="landing-gradient-text">Intelligent Operations.</span>
            <br />
            Safer Learning Environments.
          </h1>

          <p className="landing-sub">
            Classroom Warden unifies automated scheduling, real-time school metrics and
            administrative tracking into a single command-grade console — built for the modern
            institution.
          </p>

          <div className="landing-cta-row">
            <div className="landing-cta-glow-wrap">
              <div className="landing-cta-glow" />
              <MotionButton className="landing-btn-primary" playSoundOnClick={false} onClick={goConsole}>
                Launch Warden Console →
              </MotionButton>
            </div>
            <MotionButton
              className="landing-btn-secondary"
              playSoundOnClick={false}
              onClick={() => scrollTo('modules')}
            >
              Explore Modules
            </MotionButton>
          </div>

          {!isSupabaseConfigured && (
            <p className="landing-env-hint">
              Using local accounts on this device. Add <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> for production sign-up.
            </p>
          )}
        </motion.div>
      </main>

      <section id="modules" className="landing-section">
        <h2 className="landing-section-title">Modules</h2>
        <div className="landing-modules-grid">
          {MODULES.map((m, i) => (
            <motion.article
              key={m.id}
              className="landing-module-card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <span className="landing-module-tag">{m.tag}</span>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="pulse" className="landing-section landing-pulse">
        <h2 className="landing-section-title">School Pulse</h2>
        <p className="landing-pulse-copy">
          Monitor decibel levels, celebrate quiet streaks, and export monthly reports — all with
          calm motion and audio designed for focused classrooms.
        </p>
        {!user && (
          <MotionButton className="landing-btn-primary landing-btn-inline" playSoundOnClick={false} onClick={() => openAuth('signup')}>
            Sign up free →
          </MotionButton>
        )}
      </section>

      <footer className="landing-footer">
        <ShieldLogo size={18} />
        <span>© {new Date().getFullYear()} Classroom Warden</span>
      </footer>

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
