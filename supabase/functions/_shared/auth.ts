import { createClient, type SupabaseClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { jsonResponse } from './http.ts';

export interface AuthedContext {
  supabaseUrl: string;
  supabaseAnonKey: string;
  userClient: SupabaseClient;
  user: User;
}

export function requireEnv(
  ...keys: string[]
): { values: Record<string, string> } | { response: Response } {
  const values: Record<string, string> = {};
  for (const key of keys) {
    const value = Deno.env.get(key);
    if (!value) {
      return { response: jsonResponse({ error: 'Server misconfigured' }, 500) };
    }
    values[key] = value;
  }
  return { values };
}

export async function requireUser(req: Request): Promise<AuthedContext | Response> {
  const env = requireEnv('SUPABASE_URL', 'SUPABASE_ANON_KEY');
  if ('response' in env) return env.response;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization' }, 401);
  }

  const userClient = createClient(env.values.SUPABASE_URL, env.values.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  return {
    supabaseUrl: env.values.SUPABASE_URL,
    supabaseAnonKey: env.values.SUPABASE_ANON_KEY,
    userClient,
    user,
  };
}
