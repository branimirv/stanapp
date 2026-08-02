import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  acceptPendingInvites,
  fetchOwnedPendingInvites,
  fetchPropertyInvites,
  inviteToProperties,
  revokeInvite,
  type InviteToPropertiesInput,
} from '@/services/invites';
import {
  fetchMyMembershipForProperty,
  fetchMyMemberships,
  fetchPropertyMembers,
  revokeMember,
  updateMemberRole,
} from '@/services/members';
import { useAuthStore } from '@/stores/authStore';
import type { MembershipRole } from '@/types/app.types';

export function useMyMemberships() {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: queryKeys.members.mine(),
    queryFn: fetchMyMemberships,
    enabled: Boolean(user),
  });

  return {
    memberships: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

export function useMyMembership(propertyId: string | undefined) {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: propertyId
      ? queryKeys.members.forProperty(propertyId)
      : queryKeys.members.forProperty('none'),
    queryFn: () => fetchMyMembershipForProperty(propertyId as string),
    enabled: Boolean(user && propertyId),
  });

  const role = query.data?.role ?? null;
  const isOwner = role === 'owner';
  const canManage = role === 'owner' || role === 'manager';
  const isTenant = role === 'tenant';

  return {
    membership: query.data ?? null,
    role,
    isOwner,
    canManage,
    isTenant,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

export function usePropertyMembers(propertyId: string | undefined) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: propertyId ? queryKeys.members.list(propertyId) : queryKeys.members.list('none'),
    queryFn: () => fetchPropertyMembers(propertyId as string),
    enabled: Boolean(user && propertyId),
  });

  const invalidate = useCallback(() => {
    if (!propertyId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.members.list(propertyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.members.mine() });
    queryClient.invalidateQueries({ queryKey: queryKeys.members.forProperty(propertyId) });
  }, [propertyId, queryClient]);

  const revokeMutation = useMutation({
    mutationFn: (memberId: string) => revokeMember(memberId),
    onSuccess: invalidate,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: MembershipRole }) =>
      updateMemberRole(memberId, role),
    onSuccess: invalidate,
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    revoke: (memberId: string) => revokeMutation.mutateAsync(memberId),
    updateRole: (memberId: string, role: MembershipRole) =>
      updateRoleMutation.mutateAsync({ memberId, role }),
  };
}

function useInviteMutations(onRevokeSuccess?: () => void) {
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (input: InviteToPropertiesInput) => inviteToProperties(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.all });
      for (const id of variables.propertyIds) {
        queryClient.invalidateQueries({ queryKey: queryKeys.invites.list(id) });
      }
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.all });
      onRevokeSuccess?.();
    },
  });

  return {
    invite: (input: InviteToPropertiesInput) => inviteMutation.mutateAsync(input),
    isInviting: inviteMutation.isPending,
    revoke: (inviteId: string) => revokeMutation.mutateAsync(inviteId),
  };
}

export function usePropertyInvites(propertyId: string | undefined) {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: propertyId ? queryKeys.invites.list(propertyId) : queryKeys.invites.list('none'),
    queryFn: () => fetchPropertyInvites(propertyId as string),
    enabled: Boolean(user && propertyId),
  });

  const mutations = useInviteMutations();

  return {
    invites: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    ...mutations,
  };
}

export function useOwnedPendingInvites() {
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: queryKeys.invites.ownedPending(),
    queryFn: fetchOwnedPendingInvites,
    enabled: Boolean(user),
  });

  const mutations = useInviteMutations();

  return {
    invites: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    ...mutations,
  };
}

export function useAcceptInvites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptPendingInvites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
