import type { SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { createAdminClient } from '../_shared/admin.ts';
import { requireUser } from '../_shared/auth.ts';
import { handleCorsOptions } from '../_shared/cors.ts';
import { clientErrorMessage, jsonResponse, requirePost } from '../_shared/http.ts';

type MembershipRole = 'owner' | 'manager' | 'tenant';

interface InviteBody {
  email?: string;
  role?: MembershipRole;
  propertyIds?: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES: MembershipRole[] = ['owner', 'manager', 'tenant'];

Deno.serve(async (req) => {
  const cors = handleCorsOptions(req);
  if (cors) return cors;

  const methodError = requirePost(req);
  if (methodError) return methodError;

  try {
    const authed = await requireUser(req);
    if (authed instanceof Response) return authed;

    const { userClient, user, supabaseUrl } = authed;

    let body: InviteBody;
    try {
      body = (await req.json()) as InviteBody;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const email = body.email?.trim().toLowerCase() ?? '';
    const role = body.role;
    const propertyIds = Array.from(new Set(body.propertyIds ?? []));

    if (!email || !EMAIL_RE.test(email)) {
      return jsonResponse({ error: 'Valid email is required' }, 400);
    }
    if (!role || !ROLES.includes(role)) {
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
      return jsonResponse(
        { error: clientErrorMessage(ownershipError, 'Could not verify ownership') },
        400,
      );
    }

    const ownedIds = new Set((ownedRows ?? []).map((row) => row.property_id as string));
    const unauthorized = propertyIds.filter((id) => !ownedIds.has(id));
    if (unauthorized.length > 0) {
      return jsonResponse({ error: 'You must be an owner of every selected property' }, 403);
    }

    const admin = createAdminClient(supabaseUrl);
    if ('response' in admin) return admin.response;

    const existingUser = await findUserByEmail(admin.client, email);

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
      return jsonResponse(
        { error: clientErrorMessage(insertError, 'Could not create invites') },
        400,
      );
    }

    let authInviteSent = false;
    if (!existingUser) {
      const { error: inviteError } = await admin.client.auth.admin.inviteUserByEmail(email, {
        // Must match `deepLinks.invite` in lib/routes.ts and supabase/config.toml.
        redirectTo: 'stanapp://invite',
      });

      if (inviteError) {
        await userClient.from('property_invites').delete().eq('batch_id', batchId);
        return jsonResponse(
          { error: clientErrorMessage(inviteError, 'Could not send invite email') },
          400,
        );
      }

      authInviteSent = true;
    }

    return jsonResponse({
      batchId,
      invitedCount: propertyIds.length,
      authInviteSent,
    });
  } catch (error) {
    return jsonResponse(
      { error: clientErrorMessage(error, 'Unexpected error') },
      500,
    );
  }
});

/** Prefer RPC lookup over paging Auth Admin listUsers. */
async function findUserByEmail(
  adminClient: SupabaseClient,
  email: string,
): Promise<Pick<User, 'id'> | null> {
  const { data, error } = await adminClient.rpc('auth_user_id_by_email', {
    p_email: email,
  });

  if (error) throw error;
  if (typeof data === 'string' && data.length > 0) {
    return { id: data };
  }
  return null;
}
