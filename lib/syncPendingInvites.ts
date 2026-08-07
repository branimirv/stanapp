import type { Session } from '@supabase/supabase-js';

import { acceptPendingInvites } from '@/services/invites';

/** Best-effort invite accept after a session is established (not an auth-store concern). */
export async function syncPendingInvites(session: Session | null) {
  if (!session?.user) return;
  try {
    await acceptPendingInvites();
  } catch {
    // Membership still works on next login / deep link.
  }
}
