import { supabase } from '@/lib/supabase';
import type {
  MembershipRole,
  PropertyMember,
  PropertyMemberWithProfile,
} from '@/types/app.types';
import { throwQueryError } from '@/utils/errors';

export async function fetchPropertyMembers(
  propertyId: string,
): Promise<PropertyMemberWithProfile[]> {
  const { data: members, error } = await supabase
    .from('property_members')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) throwQueryError(error);
  if (!members?.length) return [];

  const userIds = members.map((member) => member.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  if (profilesError) throwQueryError(profilesError);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return members.map((member) => ({
    ...member,
    profile: profileMap.get(member.user_id) ?? null,
  }));
}

export async function fetchMyMemberships(): Promise<PropertyMember[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('property_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error) throwQueryError(error);
  return data ?? [];
}

export async function fetchMyMembershipForProperty(
  propertyId: string,
): Promise<PropertyMember | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('property_members')
    .select('*')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throwQueryError(error);
  return data;
}

export async function updateMemberRole(
  memberId: string,
  role: MembershipRole,
): Promise<PropertyMember> {
  const { data, error } = await supabase
    .from('property_members')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single();

  if (error) throwQueryError(error);
  return data;
}

export async function revokeMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from('property_members')
    .update({ status: 'revoked' })
    .eq('id', memberId);

  if (error) throwQueryError(error);
}
