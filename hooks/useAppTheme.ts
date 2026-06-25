import { useEffect, useMemo, useRef } from 'react';
import { Platform, useColorScheme as useSystemColorScheme } from 'react-native';

import { Colors, darkTheme, lightTheme } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import { resolveIsDark, useThemeStore } from '@/stores/themeStore';

export function useAppTheme() {
  const systemScheme = useSystemColorScheme();
  const { profile } = useProfile();
  const preference = useThemeStore((s) => s.preference);
  const isHydrated = useThemeStore((s) => s.isHydrated);
  const hydrate = useThemeStore((s) => s.hydrate);
  const setPreference = useThemeStore((s) => s.setPreference);
  const syncedProfileId = useRef<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!profile?.id) {
      syncedProfileId.current = null;
      return;
    }

    if (syncedProfileId.current === profile.id) return;

    syncedProfileId.current = profile.id;
    void setPreference(profile.theme);
  }, [profile?.id, profile?.theme, setPreference]);

  const isDark = useMemo(
    () => resolveIsDark(preference, systemScheme),
    [preference, systemScheme],
  );

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.body.style.backgroundColor = isDark ? Colors.backgroundDark : Colors.background;
  }, [isDark]);

  return {
    preference,
    isDark,
    theme,
    isHydrated,
    setPreference,
  };
}
