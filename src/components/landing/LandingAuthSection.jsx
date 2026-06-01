import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import ClassroomWardenLogo from '../ClassroomWardenLogo';

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Continue with Google', icon: 'G', brandClass: 'oauth-google' },
  { id: 'github', label: 'Continue with GitHub', icon: '⌘', brandClass: 'oauth-github' },
  { id: 'yahoo', label: 'Continue with Yahoo', icon: 'Y', brandClass: 'oauth-yahoo' },
];

export default function LandingAuthSection({ onSuccess }) {
  const { signUp, signIn, signInWithOAuth, authMode } = useAuth();
  const [view, setView] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

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
        if (authMode === 'supabase' && isSupabaseConfigured) {
          setMessage('Account created! Check your email to confirm, then sign in.');
          setView('signin');
        } else {
          onSuccess?.();
        }
      } else {
        await signIn(email, password);
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="access" className="landing-auth-section">
      <motion.div
        className="landing-auth-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="landing-auth-card-header">
          <ClassroomWardenLogo height={44} className="landing-auth-logo" />
          <div>
            <h2>Sign in to Classroom Warden</h2>
            <p>Use your school account or email — same access on every device when Supabase is connected.</p>
          </div>
        </div>

        <div className="landing-auth-oauth">
          {OAUTH_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`landing-oauth-btn ${p.brandClass}`}
              disabled={oauthLoading !== null}
              onClick={() => void handleOAuth(p.id)}
            >
              <span className="landing-oauth-icon" aria-hidden>
                {p.icon}
              </span>
              {oauthLoading === p.id ? 'Redirecting…' : p.label}
            </button>
          ))}
        </div>

        <div className="landing-auth-divider">
          <span>or sign in with email</span>
        </div>

        <div className="landing-auth-tabs">
          <button
            type="button"
            className={view === 'signin' ? 'active' : ''}
            onClick={() => {
              setView('signin');
              reset();
            }}
          >
            Log in
          </button>
          <button
            type="button"
            className={view === 'signup' ? 'active' : ''}
            onClick={() => {
              setView('signup');
              reset();
            }}
          >
            Sign up
          </button>
        </div>

        <form className="landing-auth-form" onSubmit={handleSubmit}>
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

          {error && <p className="landing-auth-error">{error}</p>}
          {message && <p className="landing-auth-success">{message}</p>}

          <button type="submit" className="landing-auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : view === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        {!isSupabaseConfigured && (
          <p className="landing-auth-hint">
            Social sign-in needs Supabase env vars on Vercel. Email sign-up works on this device until then.
          </p>
        )}
      </motion.div>
    </section>
  );
}
