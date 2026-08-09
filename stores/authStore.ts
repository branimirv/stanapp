import { create } from 'zustand';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { signOutGoogle } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { Sentry } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<{ error: AuthError | null }>;
  initialize: () => Promise<void>;
}

function syncSentryUser(session: Session | null) {
  const user = session?.user;
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
    return;
  }
  Sentry.setUser(null);
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,

  setSession: (session) => {
    syncSentryUser(session);
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    // Clear local auth first so Stack.Protected can leave the app shell
    // immediately — waiting on the network kept users stuck on NativeTabs.
    syncSentryUser(null);
    set({ session: null, user: null, isLoading: false });
    queryClient.clear();
    void signOutGoogle();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return { error };
  },

  initialize: async () => {
    set({ isLoading: true });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    syncSentryUser(session);
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
  },
}));
