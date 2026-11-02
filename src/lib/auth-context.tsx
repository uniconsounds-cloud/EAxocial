'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  role: 'trader' | 'creator' | 'pro' | 'admin';
  terminal_token: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'juntarasate@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      if (!isSupabaseConfigured()) {
        const isAdm = currentUser.email === ADMIN_EMAIL;
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          username: (currentUser.email || 'trader').split('@')[0],
          display_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || (currentUser.email || 'trader').split('@')[0],
          avatar_url: currentUser.user_metadata?.avatar_url,
          role: isAdm ? 'admin' : 'trader',
          terminal_token: 'EAX_' + currentUser.id.slice(0, 12),
        });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
        // If profile doesn't exist yet, insert one
        const isAdm = currentUser.email === ADMIN_EMAIL;
        const newProfile: Partial<Profile> = {
          id: currentUser.id,
          email: currentUser.email || '',
          username: (currentUser.email || 'trader').split('@')[0] + '_' + Math.floor(Math.random() * 1000),
          display_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || (currentUser.email || 'trader').split('@')[0],
          avatar_url: currentUser.user_metadata?.avatar_url,
          role: isAdm ? 'admin' : 'trader',
          terminal_token: 'EAX_' + Math.random().toString(36).substring(2, 14).toUpperCase(),
        };

        const { data: inserted } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .maybeSingle();

        if (inserted) {
          setProfile(inserted as Profile);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured()) {
          // Check local storage for simulated session
          const localUser = localStorage.getItem('eaxocial_mock_user');
          if (localUser) {
            const parsed = JSON.parse(localUser);
            if (mounted) {
              setUser(parsed);
              await fetchProfile(parsed);
            }
          }
          if (mounted) setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const isAdmin = useMemo(() => {
    if (user?.email === ADMIN_EMAIL) return true;
    if (profile?.role === 'admin') return true;
    return false;
  }, [user, profile]);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      // Demo mock login for admin / testing
      const mockAdmin: User = {
        id: 'usr_admin_123',
        app_metadata: {},
        user_metadata: { full_name: 'Suphakorn (Admin)', avatar_url: '' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: ADMIN_EMAIL,
      };
      localStorage.setItem('eaxocial_mock_user', JSON.stringify(mockAdmin));
      setUser(mockAdmin);
      await fetchProfile(mockAdmin);
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/dashboard`,
      },
    });
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 8),
        app_metadata: {},
        user_metadata: { full_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email,
      };
      localStorage.setItem('eaxocial_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      await fetchProfile(mockUser);
      return {};
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) return { error: error.message };
    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user);
    }
    return {};
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured()) {
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 8),
        app_metadata: {},
        user_metadata: { full_name: name || email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email,
      };
      localStorage.setItem('eaxocial_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      await fetchProfile(mockUser);
      return {};
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name || email.split('@')[0],
        },
      },
    });

    if (error) return { error: error.message };
    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user);
    }
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('eaxocial_mock_user');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
