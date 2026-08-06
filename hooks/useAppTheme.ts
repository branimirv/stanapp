import { useEffect, useMemo, useRef } from 'react';
import { Appearance, Platform, useColorScheme as useSystemColorScheme } from 'react-native';
import { Uniwind } from 'uniwind';

import { useProfile } from '@/hooks/useProfile';
import { THEMES, type AppTheme } from '@/lib/theme';
import { resolveIsDark, useThemeStore } from '@/stores/themeStore';
import type { Theme } from '@/types/app.types';

function syncUniwindTheme(preference: Theme) {
  Uniwind.setTheme(preference === 'system' ? 'system' : preference);
}

/** Paper / pre-Naslov colour aliases used by unmigrated screens. */
type LegacyPaperColors = {
  background: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  surfaceVariant: string;
  outline: string;
  error: string;
  secondary: string;
  secondaryContainer: string;
  primaryContainer: string;
  onSecondary: string;
};

export type AppThemeWithLegacy = Omit<AppTheme, 'colors'> & {
  dark: boolean;
  roundness: number;
  colors: AppTheme['colors'] & LegacyPaperColors;
};

/**
 * Theme orchestrator: preference store, Uniwind sync, profile hydrate.
 * Returns Naslov AppTheme plus temporary Paper colour aliases.
 */
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

  // Apply profile theme only when there is no local preference yet (fresh install /
  // new device). Never overwrite a stored or just-selected theme — that caused
  // light mode to snap back on the first change while the profile query resolved.
  useEffect(() => {
    if (!isHydrated) return;

    if (!profile?.id) {
      syncedProfileId.current = null;
      return;
    }

    if (syncedProfileId.current === profile.id) return;
    syncedProfileId.current = profile.id;

    if (useThemeStore.getState().hasStoredPreference) return;

    void setPreference(profile.theme);
  }, [isHydrated, profile?.id, profile?.theme, setPreference]);

  const isDark = useMemo(
    () => resolveIsDark(preference, systemScheme),
    [preference, systemScheme],
  );

  const theme = useMemo((): AppThemeWithLegacy => {
    const base = THEMES[isDark ? 'dark' : 'light'];
    return {
      ...base,
      dark: isDark,
      roundness: base.radius.md,
      colors: {
        ...base.colors,
        background: base.colors.bg,
        onBackground: base.colors.fg,
        onSurface: base.colors.fg,
        onSurfaceVariant: base.colors.muted,
        surfaceVariant: base.colors.surface2,
        outline: base.colors.bd,
        error: base.colors.neg,
        secondary: base.colors.pos,
        secondaryContainer: base.colors.posTint,
        primaryContainer: base.colors.primaryTint,
        onSecondary: base.colors.onPrimary,
      },
    };
  }, [isDark]);

  useEffect(() => {
    if (!isHydrated) return;
    syncUniwindTheme(preference);
  }, [preference, isHydrated]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.body.style.backgroundColor = theme.colors.bg;
  }, [isDark, theme.colors.bg]);

  // NativeTabs on Android use Material dynamic colors tied to Appearance.
  // Keep them aligned with the in-app theme (which can differ from system).
  useEffect(() => {
    if (Platform.OS !== 'android' || !isHydrated) return;
    if (preference === 'system') {
      Appearance.setColorScheme('unspecified');
      return;
    }
    Appearance.setColorScheme(isDark ? 'dark' : 'light');
  }, [preference, isDark, isHydrated]);

  return {
    preference,
    isDark,
    theme,
    isHydrated,
    setPreference,
  };
}
