import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type MembershipRole = 'owner' | 'manager' | 'tenant';

interface InviteBody {
  email?: string;
  role?: MembershipRole;
  propertyIds?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ error: 'Server misconfigured' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = (await req.json()) as InviteBody;
    const email = body.email?.trim().toLowerCase() ?? '';
    const role = body.role;
    const propertyIds = Array.from(new Set(body.propertyIds ?? []));

    if (!email || !email.includes('@')) {
      return jsonResponse({ error: 'Valid email is required' }, 400);
    }
    if (!role || !['owner', 'manager', 'tenant'].includes(role)) {
      return jsonResponse({ error: 'Valid role is required' }, 400);
    }
    if (propertyIds.length === 0) {
      return jsonResponse({ error: 'At least one property is required' }, 400);
    }

    if (user.email?.toLowerCase() === email) {
      return jsonResponse({ error: 'You cannot invite yourself' }, 400);
    }

    const { data: ownedRows, error: ownershipError } = await userClient
      .from('property_members')
      .select('property_id')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .eq('status', 'active')
      .in('property_id', propertyIds);

    if (ownershipError) {
      return jsonResponse({ error: ownershipError.message }, 400);
    }

    const ownedIds = new Set((ownedRows ?? []).map((row) => row.property_id));
    const unauthorized = propertyIds.filter((id) => !ownedIds.has(id));
    if (unauthorized.length > 0) {
      return jsonResponse({ error: 'You must be an owner of every selected property' }, 403);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const existingUser = await findUserByEmail(adminClient, email);

    const batchId = crypto.randomUUID();
    const inviteRows = propertyIds.map((propertyId) => ({
      batch_id: batchId,
      property_id: propertyId,
      email,
      role,
      invited_by: user.id,
      status: 'pending' as const,
    }));

    const { error: insertError } = await userClient.from('property_invites').insert(inviteRows);
    if (insertError) {
      return jsonResponse({ error: insertError.message }, 400);
    }

    let authInviteSent = false;
    if (!existingUser) {
      const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: 'stanapp://invite',
      });

      if (inviteError) {
        await userClient.from('property_invites').delete().eq('batch_id', batchId);
        return jsonResponse({ error: inviteError.message }, 400);
      }

      authInviteSent = true;
    }

    return jsonResponse({
      batchId,
      invitedCount: propertyIds.length,
      authInviteSent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonResponse({ error: message }, 500);
  }
});

async function findUserByEmail(adminClient: SupabaseClient, email: string) {
  let page = 1;
  const perPage = 1000;

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (match) return match;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
