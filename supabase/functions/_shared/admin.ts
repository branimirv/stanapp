import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { requireEnv } from './auth.ts';
import { jsonResponse } from './http.ts';

export function createAdminClient(
  supabaseUrl: string,
): { client: SupabaseClient } | { response: Response } {
  const env = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  if ('response' in env) return env.response;

  return {
    client: createClient(supabaseUrl, env.values.SUPABASE_SERVICE_ROLE_KEY),
  };
}
