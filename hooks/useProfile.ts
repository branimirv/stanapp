import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Language, Profile, ProfileUpdate, Theme } from '@/types/app.types';

export function useProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (err) {
      setError(err.message);
    } else {
      setProfile(data);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateProfile = useCallback(
    async (values: ProfileUpdate) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error: err } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user.id)
        .select()
        .single();

      if (err) throw err;

      setProfile(data);
      return data;
    },
    [user],
  );

  const updateLanguage = useCallback(
    async (language: Language) => updateProfile({ language }),
    [updateProfile],
  );

  const updateCurrency = useCallback(
    async (default_currency: string) => updateProfile({ default_currency }),
    [updateProfile],
  );

  const updateTheme = useCallback(
    async (theme: Theme) => updateProfile({ theme }),
    [updateProfile],
  );

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile,
    updateLanguage,
    updateCurrency,
    updateTheme,
  };
}
