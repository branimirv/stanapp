import { supabase } from '@/lib/supabase';
import type { MembershipRole, PropertyInvite } from '@/types/app.types';
import { throwQueryError } from '@/utils/errors';

export interface InviteToPropertiesInput {
  email: string;
  role: MembershipRole;
  propertyIds: string[];
}

export interface InviteToPropertiesResult {
  batchId: string;
  invitedCount: number;
  authInviteSent: boolean;
}

export async function inviteToProperties(
  input: InviteToPropertiesInput,
): Promise<InviteToPropertiesResult> {
  const { data, error } = await supabase.functions.invoke<
    InviteToPropertiesResult & { error?: string }
  >('invite-to-properties', {
    body: {
      email: input.email.trim().toLowerCase(),
      role: input.role,
      propertyIds: input.propertyIds,
    },
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const body = (await context.json()) as { error?: string };
        if (body.error) throw new Error(body.error);
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== error.message) {
          throw parseError;
        }
      }
    }
    throwQueryError(error);
  }
  if (!data) throw new Error('Invite failed');
  if (data.error) throw new Error(data.error);
  return data;
}

export async function acceptPendingInvites(): Promise<number> {
  const { data, error } = await supabase.rpc('accept_pending_invites_for_user');
  if (error) throwQueryError(error);
  return data ?? 0;
}

export async function fetchPropertyInvites(propertyId: string): Promise<PropertyInvite[]> {
  const { data, error } = await supabase
    .from('property_invites')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throwQueryError(error);
  return data ?? [];
}

export type OwnedPendingInvite = PropertyInvite & {
  property: { id: string; name: string } | null;
};

/** Pending invites for properties the current user owns (RLS-scoped). */
export async function fetchOwnedPendingInvites(): Promise<OwnedPendingInvite[]> {
  const { data, error } = await supabase
    .from('property_invites')
    .select('*, property:properties(id, name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throwQueryError(error);
  return (data ?? []) as OwnedPendingInvite[];
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('property_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId);

  if (error) throwQueryError(error);
}
