'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { authRedirectUrl } from '../lib/authProviders';
import {
  getLocalSession,
  localSignIn,
  localSignOut,
  localSignUp,
  type LocalSession,
} from '../lib/localAuth';

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  school: string;
}

interface AuthContextValue {
  user: AuthProfile | null;
  session: Session | null;
  loading: boolean;
  authMode: 'supabase' | 'local';
  isConfigured: boolean;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    school: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github' | 'apple' | 'yahoo') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function profileFromSupabaseUser(user: User): AuthProfile {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? '',
    fullName: (meta.full_name as string) || (meta.fullName as string) || 'Educator',
    school: (meta.school as string) || 'My School',
  };
}

function profileFromLocal(session: LocalSession): AuthProfile {
  return {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
    school: session.school,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const authMode = isSupabaseConfigured ? 'supabase' : 'local';

  useEffect(() => {
    if (authMode === 'supabase' && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ? profileFromSupabaseUser(data.session.user) : null);
        setLoading(false);
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ? profileFromSupabaseUser(nextSession.user) : null);
        setLoading(false);
      });

      return () => sub.subscription.unsubscribe();
    }

    const local = getLocalSession();
    setUser(local ? profileFromLocal(local) : null);
    setLoading(false);
    return undefined;
  }, [authMode]);

  const signUp = useCallback(
    async ({
      email,
      password,
      fullName,
      school,
    }: {
      email: string;
      password: string;
      fullName: string;
      school: string;
    }) => {
      if (authMode === 'supabase' && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), school: school.trim() },
            emailRedirectTo: authRedirectUrl(),
          },
        });
        if (error) throw error;
        if (data.session) {
          setSession(data.session);
          if (data.user) setUser(profileFromSupabaseUser(data.user));
          return;
        }
        if (data.user && !data.session) {
          throw new Error('Check your email to confirm your account, then sign in.');
        }
        return;
      }

      const { session: local } = await localSignUp(email, password, fullName, school);
      setUser(profileFromLocal(local));
    },
    [authMode],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (authMode === 'supabase' && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) setUser(profileFromSupabaseUser(data.user));
        if (data.session) setSession(data.session);
        return;
      }

      const { session: local } = await localSignIn(email, password);
      setUser(profileFromLocal(local));
    },
    [authMode],
  );

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github' | 'apple' | 'yahoo') => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (local) or Vercel env vars (production).',
      );
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authRedirectUrl(),
        queryParams: provider === 'yahoo' ? { prompt: 'login' } : undefined,
      },
    } as Parameters<NonNullable<typeof supabase>['auth']['signInWithOAuth']>[0]);
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (authMode === 'supabase' && supabase) {
      await supabase.auth.signOut();
    } else {
      localSignOut();
    }
    setUser(null);
    setSession(null);
  }, [authMode]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      authMode,
      isConfigured: true,
      signUp,
      signIn,
      signInWithOAuth,
      signOut,
    }),
    [user, session, loading, authMode, signUp, signIn, signInWithOAuth, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
