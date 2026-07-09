import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

const PROVIDERS = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c3.42-3.15 5.388-7.79 5.388-13.32z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
    ),
  },
  {
    id: 'yahoo',
    label: 'Continue with Yahoo',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <rect width="18" height="18" rx="4" fill="#6001D2" />
        <text x="9" y="12.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="system-ui,sans-serif">
          Y!
        </text>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
        <path d="M9 0C4.03 0 0 4.03 0 9c0 3.98 2.58 7.35 6.16 8.54-.45-.83-.86-2.1-.86-4.22 0-1.62.58-2.94 1.53-3.96-.15-.37-.66-1.88.15-3.92 0 0 1.25-.4 4.1 1.51 1.19-.33 2.47-.5 3.74-.5 1.27 0 2.55.17 3.74.5 2.85-1.91 4.1-1.51 4.1-1.51.81 2.04.3 3.55.15 3.92.95 1.02 1.53 2.34 1.53 3.96 0 2.12-.31 3.39-.86 4.22C15.42 16.35 18 12.98 18 9c0-4.97-4.03-9-9-9z" />
      </svg>
    ),
  },
];

export default function SocialAuthButtons({ onError }) {
  const { signInWithOAuth, authMode } = useAuth();
  const [loadingId, setLoadingId] = useState(null);
  const oauthReady = authMode === 'supabase' && isSupabaseConfigured;

  const handleOAuth = async (providerId) => {
    if (!oauthReady) {
      onError?.(
        'Social sign-in needs Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then enable providers in your Supabase dashboard.',
      );
      return;
    }
    setLoadingId(providerId);
    onError?.('');
    try {
      await signInWithOAuth(providerId);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Could not start sign-in. Try again.');
      setLoadingId(null);
    }
  };

  return (
    <div className="auth-social">
      {!oauthReady && (
        <p className="auth-social-hint">
          Social login is off until Supabase env vars are set. Email sign-up still works locally.
        </p>
      )}
      <div className="auth-social-buttons">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="auth-social-btn"
            disabled={!oauthReady || loadingId !== null}
            onClick={() => handleOAuth(p.id)}
          >
            <span className="auth-social-icon">{p.icon}</span>
            <span>{loadingId === p.id ? 'Redirecting…' : p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
