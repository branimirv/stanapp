/**
 * hooks/useBootstrap.ts
 *
 * Everything that must finish before the app can render a real screen.
 *
 * Returns a discriminated state, not a bare boolean, so the caller can tell
 * "still working" from "finished, go to tabs" from "finished, go to auth"
 * from "failed". A boolean here is what produces the classic bug where a
 * failed session restore silently drops the user into the authed shell.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage, throwQueryError } from '@/utils/errors';

/**
 * Minimum time the boot screen stays up.
 *
 * On a warm start everything resolves in ~80ms, and a splash that appears
 * and vanishes inside one frame reads as a glitch rather than a brand
 * moment. 1100ms is roughly one and a half cycles of the window animation —
 * long enough that at least the lower floors visibly light.
 *
 * This is a floor, not a delay: if real work takes longer, we wait for it.
 */
const MIN_VISIBLE_MS = 1100;

/**
 * Hard ceiling on session restore. Supabase's getSession() reads local
 * storage and can also hit the network to refresh an expired token — on a
 * dead connection that hangs. We would rather show the auth screen than a
 * splash that never ends.
 */
const SESSION_TIMEOUT_MS = 6000;

export type BootState =
  | { status: 'loading' }
  | { status: 'ready'; authenticated: boolean }
  | { status: 'error'; error: Error; authenticated: false };

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export function useBootstrap(): BootState & { retry: () => void } {
  const [state, setState] = useState<BootState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const startedAt = useRef(Date.now());

  // Fonts. `fontError` is deliberately NOT fatal — see below.
  // Aliases match Typography.fontFamily (Inter / Fraunces).
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces: Fraunces_500Medium,
    Fraunces_600SemiBold,
  });

  const retry = useCallback(() => {
    startedAt.current = Date.now();
    setState({ status: 'loading' });
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // expo-font resolves `fontsLoaded` true on success and sets fontError on
    // failure; either way it has stopped working, so we can proceed. Missing
    // fonts degrade to the system face — ugly, but shipping a permanently
    // stuck splash over a font 404 is worse.
    if (!fontsLoaded && !fontError) return;

    (async () => {
      let authenticated = false;
      let failure: Error | null = null;

      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          SESSION_TIMEOUT_MS,
          'getSession',
        );
        if (error) throwQueryError(error);
        authenticated = !!data.session;
        // Sync into the auth store so Stack.Protected keeps working.
        // On failure we deliberately do NOT setSession(null) — that would
        // make a failed restore look identical to signed out.
        if (!cancelled) {
          useAuthStore.getState().setSession(data.session);
        }
      } catch (e) {
        // A failed restore is not the same as "signed out" — surface it so
        // the caller can offer a retry instead of silently bouncing the user
        // to the login form and making them think they were logged out.
        failure = e instanceof Error ? e : new Error(getErrorMessage(e, 'Session restore failed'));
      }

      // Hold the floor.
      const elapsed = Date.now() - startedAt.current;
      if (elapsed < MIN_VISIBLE_MS) {
        await new Promise((r) => setTimeout(r, MIN_VISIBLE_MS - elapsed));
      }

      if (cancelled) return;

      setState(
        failure
          ? { status: 'error', error: failure, authenticated: false }
          : { status: 'ready', authenticated },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [fontsLoaded, fontError, attempt]);

  return { ...state, retry };
}
