import { useCallback, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useBootstrap, type BootState } from '@/hooks/useBootstrap';
import { onAuthStateChange } from '@/lib/auth';
import { consumePendingPostAuthRoute } from '@/lib/authDeepLinks';
import {
  clearPostAuthTransition,
  hasPostAuthTransition,
  takePostAuthTransition,
} from '@/lib/postAuthTransition';
import { prefetchHomeDataBounded } from '@/lib/prefetchHomeData';
import { deepLinkPaths, routes } from '@/lib/routes';
import { syncPendingInvites } from '@/lib/syncPendingInvites';
import { useAuthStore } from '@/stores/authStore';
import { useBootOverlayStore } from '@/stores/bootOverlayStore';
import { useUiStore } from '@/stores/uiStore';

/** Routes that signed-out users may stay on (no boot eject to login). */
const PUBLIC_ROOT_SEGMENTS = new Set(['(auth)', deepLinkPaths.invite, deepLinkPaths.resetPassword]);

/** Floor so a warm prefetch doesn't make BootScreen flash and vanish. */
const POST_AUTH_MIN_MS = 450;

/** Let the signed-in stack paint under the Modal before we dismiss it. */
const POST_AUTH_SETTLE_MS = 64;

export interface AuthSessionGate {
  boot: BootState & { retry: () => void };
  bootVisible: boolean;
  isAuthenticated: boolean;
  onBootLaidOut: () => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Keeps the auth store in sync, routes after bootstrap, and owns boot overlay
 * visibility (cold start + interactive post-login handoff).
 */
export function useAuthSessionGate(): AuthSessionGate {
  const setSession = useAuthStore((state) => state.setSession);
  const isAuthenticated = useAuthStore((state) => Boolean(state.session));
  const boot = useBootstrap();
  const router = useRouter();
  const segments = useSegments();
  const bootVisible = useBootOverlayStore((state) => state.visible);
  const showBoot = useBootOverlayStore((state) => state.show);
  const hideBoot = useBootOverlayStore((state) => state.hide);

  const coldBootReleasedRef = useRef(false);
  const postAuthGenerationRef = useRef(0);

  /** BootScreen has painted, so the native layer can go. */
  const onBootLaidOut = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const finishPostAuthHandoff = useCallback(
    async (nextSession: Session, toastMessage: string | null, startedAt: number) => {
      const generation = ++postAuthGenerationRef.current;

      await prefetchHomeDataBounded(nextSession.user.id);

      const elapsed = Date.now() - startedAt;
      if (elapsed < POST_AUTH_MIN_MS) {
        await sleep(POST_AUTH_MIN_MS - elapsed);
      }

      if (generation !== postAuthGenerationRef.current) return;

      // Apply session only after prefetch so NativeTabs mount onto a warm cache.
      setSession(nextSession);
      void syncPendingInvites(nextSession);

      await sleep(POST_AUTH_SETTLE_MS);
      if (generation !== postAuthGenerationRef.current) return;
      if (!useAuthStore.getState().session) return;

      hideBoot();
      if (toastMessage) {
        useUiStore.getState().showToast({ message: toastMessage, type: 'success' });
      }
    },
    [hideBoot, setSession],
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, nextSession) => {
      const hadSession = Boolean(useAuthStore.getState().session);
      const signingIn = Boolean(nextSession) && !hadSession;
      const signingOut = !nextSession && hadSession;

      // Prefetch under the Modal *before* setSession — NativeTabs paint above
      // a sibling View, so delaying the remount keeps the handoff covered.
      if (coldBootReleasedRef.current && signingIn && nextSession && hasPostAuthTransition()) {
        const transition = takePostAuthTransition();
        showBoot();
        useUiStore.getState().hideToast();
        void finishPostAuthHandoff(
          nextSession,
          transition?.toastMessage ?? null,
          Date.now(),
        );
        return;
      }

      if (signingOut) {
        postAuthGenerationRef.current += 1;
        clearPostAuthTransition();
        if (coldBootReleasedRef.current) {
          hideBoot();
        }
      }

      setSession(nextSession);
      void syncPendingInvites(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [finishPostAuthHandoff, hideBoot, setSession, showBoot]);

  /** Cold-start route once ready, then release the overlay (once). */
  const bootAuthenticated = boot.status === 'ready' && boot.authenticated;

  useEffect(() => {
    if (coldBootReleasedRef.current) return;
    if (boot.status === 'loading') return;

    const root = segments[0];
    const inAuthGroup = root === '(auth)';
    const isPublicRoot = typeof root === 'string' && PUBLIC_ROOT_SEGMENTS.has(root);

    if (boot.status === 'ready' && bootAuthenticated && inAuthGroup) {
      router.replace(consumePendingPostAuthRoute() as typeof routes.tabs.dashboard);
    } else if (boot.status === 'ready' && !bootAuthenticated && !isPublicRoot) {
      router.replace(routes.auth.login);
    } else if (boot.status === 'error') {
      // Restore failed — do not pretend they are signed out. The error panel
      // offers a retry; keep the overlay up.
      return;
    }

    // One frame of overlap so the routed screen is mounted underneath before
    // the boot screen fades; otherwise you see the app's background flash.
    const id = setTimeout(() => {
      coldBootReleasedRef.current = true;
      hideBoot();
    }, 32);
    return () => clearTimeout(id);
  }, [boot.status, bootAuthenticated, segments, router, hideBoot]);

  return {
    boot,
    bootVisible,
    isAuthenticated,
    onBootLaidOut,
  };
}
