import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { acceptPendingInvites } from '@/services/invites';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
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
    await supabase.auth.signOut();
    set({ session: null, user: null, isLoading: false });
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
