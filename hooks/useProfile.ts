import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchProfile, updateProfile as updateProfileService } from '@/services/profile';
import { useAuthStore } from '@/stores/authStore';
import type { Language, ProfileUpdate, Theme } from '@/types/app.types';
import { queryErrorMessage } from '@/utils/errors';

export function useProfile() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: userId ? queryKeys.profile(userId) : ['profile', 'anonymous'],
    queryFn: () => fetchProfile(userId as string),
    enabled: Boolean(userId),
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileUpdate) => {
      if (!userId) throw new Error('Not authenticated');
      return updateProfileService(userId, values);
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.setQueryData(queryKeys.profile(userId), data);
      }
    },
  });

  const updateProfile = useCallback((values: ProfileUpdate) => mutation.mutateAsync(values), [mutation]);

  const updateLanguage = useCallback(
    (language: Language) => mutation.mutateAsync({ language }),
    [mutation],
  );

  const updateCurrency = useCallback(
    (default_currency: string) => mutation.mutateAsync({ default_currency }),
    [mutation],
  );

  const updateTheme = useCallback((theme: Theme) => mutation.mutateAsync({ theme }), [mutation]);

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: queryErrorMessage(query.error),
    refetch: query.refetch,
    updateProfile,
    updateLanguage,
    updateCurrency,
    updateTheme,
  };
}
