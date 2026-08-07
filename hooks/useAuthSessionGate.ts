import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useBootstrap, type BootState } from '@/hooks/useBootstrap';
import { onAuthStateChange } from '@/lib/auth';
import { consumePendingPostAuthRoute } from '@/lib/authDeepLinks';
import { routes } from '@/lib/routes';
import { syncPendingInvites } from '@/lib/syncPendingInvites';
import { useAuthStore } from '@/stores/authStore';

/** Routes that signed-out users may stay on (no boot eject to login). */
const PUBLIC_ROOT_SEGMENTS = new Set(['(auth)', 'invite', 'reset-password']);

export interface AuthSessionGate {
  boot: BootState & { retry: () => void };
  bootVisible: boolean;
  isAuthenticated: boolean;
  onBootLaidOut: () => void;
}

/**
 * Keeps the auth store in sync, routes after bootstrap, and owns boot overlay
 * visibility. Does not change auth behavior — extracted from root layout.
 */
export function useAuthSessionGate(): AuthSessionGate {
  const setSession = useAuthStore((state) => state.setSession);
  const isAuthenticated = useAuthStore((state) => Boolean(state.session));
  const boot = useBootstrap();
  const router = useRouter();
  const segments = useSegments();
  const [bootVisible, setBootVisible] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      void syncPendingInvites(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  /** BootScreen has painted, so the native layer can go. */
  const onBootLaidOut = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  /** Route once ready, then release the overlay. */
  useEffect(() => {
    if (boot.status === 'loading') return;

    const root = segments[0];
    const inAuthGroup = root === '(auth)';
    const isPublicRoot = typeof root === 'string' && PUBLIC_ROOT_SEGMENTS.has(root);

    if (boot.status === 'ready' && boot.authenticated && inAuthGroup) {
      router.replace(consumePendingPostAuthRoute() as typeof routes.tabs.dashboard);
    } else if (boot.status === 'ready' && !boot.authenticated && !isPublicRoot) {
      router.replace(routes.auth.login);
    } else if (boot.status === 'error') {
      // Restore failed — do not pretend they are signed out. The error panel
      // offers a retry; keep the overlay up.
      return;
    }

    // One frame of overlap so the routed screen is mounted underneath before
    // the boot screen fades; otherwise you see the app's background flash.
    const id = setTimeout(() => setBootVisible(false), 32);
    return () => clearTimeout(id);
  }, [
    boot.status,
    boot.status === 'ready' ? boot.authenticated : false,
    segments,
    router,
  ]);

  return {
    boot,
    bootVisible,
    isAuthenticated,
    onBootLaidOut,
  };
}
