import type { AuthError } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { deepLinks } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

export interface AuthResult {
  error: AuthError | null;
}

export interface SignUpResult extends AuthResult {
  needsEmailConfirmation: boolean;
}

export interface GoogleSignInResult extends AuthResult {
  cancelled?: boolean;
}

let googleConfigured = false;

function ensureGoogleConfigured() {
  if (googleConfigured) return;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error(
      'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Add it to .env (Google Web OAuth client ID).',
    );
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
  });
  googleConfigured = true;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  const needsEmailConfirmation = !error && data.user !== null && data.session === null;

  return { error, needsEmailConfirmation };
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (Platform.OS === 'web') {
    return {
      error: {
        name: 'AuthError',
        message: 'Google sign-in is not available on web.',
      } as AuthError,
    };
  }

  try {
    ensureGoogleConfigured();

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      return { error: null, cancelled: true };
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      return {
        error: {
          name: 'AuthError',
          message: 'Google sign-in did not return an ID token.',
        } as AuthError,
      };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    return { error };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { error: null, cancelled: true };
    }

    if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) {
      return { error: null, cancelled: true };
    }

    return {
      error: {
        name: 'AuthError',
        message: error instanceof Error ? error.message : 'Google sign-in failed.',
      } as AuthError,
    };
  }
}

export async function signOutGoogle(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId && !googleConfigured) return;
    ensureGoogleConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Best-effort — local Supabase sign-out should still proceed.
  }
}

export async function signOut(): Promise<AuthResult> {
  await signOutGoogle();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: deepLinks.resetPassword,
  });
  return { error };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback);
}
