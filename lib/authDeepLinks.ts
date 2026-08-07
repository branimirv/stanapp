import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';

import { routes } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

export type AuthDeepLinkPath = 'invite' | 'reset-password' | null;

export interface AuthDeepLinkResult {
  session: Session | null;
  path: AuthDeepLinkPath;
  error: string | null;
}

function asQueryRecord(
  params: Record<string, string | string[] | undefined> | null | undefined,
): Record<string, string> {
  if (!params) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.length > 0) out[key] = value;
    else if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
      out[key] = value[0];
    }
  }
  return out;
}

/** Hash fragments (`#access_token=…`) are common in Supabase email redirects. */
function parseCallbackUrl(url: string) {
  const normalized = url.includes('#') ? url.replace('#', '?') : url;
  const parsed = Linking.parse(normalized);
  const query = asQueryRecord(parsed.queryParams as Record<string, string | string[] | undefined>);

  const pathCandidate = (parsed.path ?? parsed.hostname ?? '').replace(/^\//, '');
  const path: AuthDeepLinkPath =
    pathCandidate === 'reset-password' || pathCandidate === 'invite'
      ? pathCandidate
      : query.type === 'recovery'
        ? 'reset-password'
        : null;

  return { path, query };
}

/**
 * Establish a Supabase session from an auth redirect URL (PKCE `code` or
 * implicit `access_token` + `refresh_token`).
 */
export async function createSessionFromUrl(url: string): Promise<AuthDeepLinkResult> {
  const { path, query } = parseCallbackUrl(url);

  if (query.error || query.error_description) {
    return {
      session: null,
      path,
      error: query.error_description ?? query.error ?? 'Authentication link failed',
    };
  }

  if (query.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(query.code);
    if (error) {
      return { session: null, path, error: error.message };
    }
    return { session: data.session, path, error: null };
  }

  if (query.access_token && query.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: query.access_token,
      refresh_token: query.refresh_token,
    });
    if (error) {
      return { session: null, path, error: error.message };
    }
    return { session: data.session, path, error: null };
  }

  // Path-only deep links (e.g. stanapp://invite) need no token exchange.
  return { session: null, path, error: null };
}

/** Safe post-login destinations only — blocks open redirects. */
export function resolveAuthReturnTo(returnTo: string | string[] | undefined): string {
  const value = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  if (!value) return routes.tabs.dashboard;
  if (value === routes.invite) return routes.invite;
  if (value.startsWith(routes.tabs.root)) return value;
  return routes.tabs.dashboard;
}

const DEFAULT_POST_AUTH = routes.tabs.dashboard;

let pendingPostAuthRoute: string | null = null;

/** Remember where to go after sign-in (survives Stack remount on auth flip). */
export function setPendingPostAuthRoute(returnTo: string | string[] | undefined) {
  const resolved = resolveAuthReturnTo(returnTo);
  pendingPostAuthRoute = resolved === DEFAULT_POST_AUTH ? null : resolved;
}

export function consumePendingPostAuthRoute(): string {
  const next = pendingPostAuthRoute ?? DEFAULT_POST_AUTH;
  pendingPostAuthRoute = null;
  return next;
}

/**
 * Listen for cold-start + warm auth deep links. Caller routes after success.
 */
export function subscribeToAuthDeepLinks(
  onResult: (url: string, result: AuthDeepLinkResult) => void,
): () => void {
  let cancelled = false;

  const handle = async (url: string | null) => {
    if (!url || cancelled) return;
    try {
      const result = await createSessionFromUrl(url);
      if (!cancelled) onResult(url, result);
    } catch (err) {
      if (!cancelled) {
        onResult(url, {
          session: null,
          path: null,
          error: err instanceof Error ? err.message : 'Authentication link failed',
        });
      }
    }
  };

  void Linking.getInitialURL().then(handle);
  const subscription = Linking.addEventListener('url', ({ url }) => {
    void handle(url);
  });

  return () => {
    cancelled = true;
    subscription.remove();
  };
}
