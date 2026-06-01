import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { OAUTH_PROVIDERS } from '../../lib/authProviders';
import ClassroomWardenLogo from '../ClassroomWardenLogo';

export default function AuthModal({ open, onClose, onSuccess, initialMode = 'signup' }) {
  const { signUp, signIn, signInWithOAuth, authMode } = useAuth();
  const [view, setView] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  useEffect(() => {
    if (open) {
      setView(initialMode);
      setError('');
      setMessage('');
    }
  }, [open, initialMode]);

  const reset = () => {
    setError('');
    setMessage('');
  };

  const validate = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (view === 'signup') {
      if (!fullName.trim()) {
        setError('Enter your full name.');
        return false;
      }
      if (!school.trim()) {
        setError('Enter your school or institution name.');
        return false;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleOAuth = async (provider) => {
    reset();
    setOauthLoading(provider);
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start social sign-in.');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();
    if (!validate()) return;
    setLoading(true);
    try {
      if (view === 'signup') {
        await signUp({ email, password, fullName, school });
        onSuccess?.();
        onClose();
      } else {
        await signIn(email, password);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Try again.';
      if (msg.includes('confirm your account')) {
        setMessage(msg);
        setView('signin');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="auth-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="auth-modal"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="auth-modal-header">
            <ClassroomWardenLogo height={36} />
            <div>
              <h2>{view === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
              <p>
                {authMode === 'supabase'
                  ? 'Sign in with Google, GitHub, Apple, Yahoo, or email'
                  : 'Add Supabase env vars to enable cloud sign-in'}
              </p>
            </div>
            <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <div className="landing-auth-oauth auth-modal-oauth-stack">
            {OAUTH_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`landing-oauth-btn ${p.brandClass}`}
                disabled={oauthLoading !== null}
                onClick={() => void handleOAuth(p.id)}
              >
                <span className="landing-oauth-icon" aria-hidden>
                  {p.id === 'apple' ? '' : p.icon}
                </span>
                {oauthLoading === p.id ? 'Redirecting…' : p.label}
              </button>
            ))}
          </div>

          <div className="landing-auth-divider auth-modal-divider">
            <span>or log in with email</span>
          </div>

          <form className="auth-modal-form" onSubmit={handleSubmit}>
            {view === 'signup' && (
              <>
                <label>
                  Full name
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aarav Gupta"
                    autoComplete="name"
                  />
                </label>
                <label>
                  School / institution
                  <input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Oshwal Academy Nairobi"
                    autoComplete="organization"
                  />
                </label>
              </>
            )}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>
            {view === 'signup' && (
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </label>
            )}

            {error && <p className="auth-modal-error">{error}</p>}
            {message && <p className="auth-modal-success">{message}</p>}

            <button type="submit" className="auth-modal-submit" disabled={loading}>
              {loading ? 'Please wait…' : view === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="auth-modal-switch">
            {view === 'signup' ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => { setView('signin'); reset(); }}>
                  Log in
                </button>
              </>
            ) : (
              <>
                New to Classroom Warden?{' '}
                <button type="button" onClick={() => { setView('signup'); reset(); }}>
                  Sign up free
                </button>
              </>
            )}
          </p>

          {!isSupabaseConfigured && (
            <p className="landing-auth-hint">
              Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel to enable real sign-up.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
