import { create } from 'zustand';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { acceptPendingInvites } from '@/services/invites';
import { queryClient } from '@/lib/queryClient';
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

async function syncPendingInvites(session: Session | null) {
  if (!session?.user) return;
  try {
    await acceptPendingInvites();
  } catch {
    // Invite accept is best-effort; membership still works on next login/deep link.
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
    void syncPendingInvites(session);
  },

  setLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    // Clear local auth first so Stack.Protected can leave the app shell
    // immediately — waiting on the network kept users stuck on NativeTabs.
    set({ session: null, user: null, isLoading: false });
    queryClient.clear();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return { error };
  },

  initialize: async () => {
    set({ isLoading: true });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    });
    void syncPendingInvites(session);
  },
}));
