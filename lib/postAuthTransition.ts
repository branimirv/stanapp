/**
 * Coordinates the branded BootScreen handoff after interactive sign-in.
 *
 * Login / Google mark a pending transition *before* awaiting sign-in so the
 * overlay can cover the UI immediately (and NativeTabs never flash). The auth
 * listener then prefetches home data before applying the session.
 */

import { useBootOverlayStore } from '@/stores/bootOverlayStore';

export interface PostAuthTransition {
  toastMessage: string | null;
}

let pending: PostAuthTransition | null = null;

export function markPostAuthTransition(options: { toastMessage?: string } = {}): void {
  pending = { toastMessage: options.toastMessage ?? null };
  // Cover immediately — NativeTabs paint above a sibling View, so we must be
  // up before setSession remounts the signed-in stack.
  useBootOverlayStore.getState().show();
}

export function clearPostAuthTransition(): void {
  const hadPending = pending != null;
  pending = null;
  if (hadPending) {
    useBootOverlayStore.getState().hide();
  }
}

export function takePostAuthTransition(): PostAuthTransition | null {
  const next = pending;
  pending = null;
  return next;
}

export function hasPostAuthTransition(): boolean {
  return pending != null;
}

export function peekPostAuthTransition(): PostAuthTransition | null {
  return pending;
}
