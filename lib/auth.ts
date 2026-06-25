import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthResult {
  error: AuthError | null;
}

export interface SignUpResult extends AuthResult {
  needsEmailConfirmation: boolean;
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

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'stanapp://reset-password',
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
