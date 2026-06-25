import { Moon, Sun } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { THEMES } from '@/constants/config';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Theme } from '@/types/app.types';

const THEME_LABELS: Record<Theme, string> = {
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
  system: 'settings.themeSystem',
};

interface ThemeSwitcherProps {
  onPersist?: (theme: Theme) => Promise<void>;
  showSegmentedControl?: boolean;
}

export function ThemeSwitcher({ onPersist, showSegmentedControl = true }: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { preference, isDark, setPreference } = useAppTheme();

  const handleChange = async (nextTheme: Theme) => {
    await setPreference(nextTheme);
    await onPersist?.(nextTheme);
  };

  const handleToggle = async (enabled: boolean) => {
    await handleChange(enabled ? 'dark' : 'light');
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchRow}>
        <View style={styles.switchLabel}>
          {isDark ? (
            <Moon size={20} color={theme.colors.onSurface} strokeWidth={2} />
          ) : (
            <Sun size={20} color={theme.colors.onSurface} strokeWidth={2} />
          )}
          <Text style={{ color: theme.colors.onSurface }}>{t('settings.darkMode')}</Text>
        </View>
        <Switch value={isDark} onValueChange={handleToggle} />
      </View>

      {showSegmentedControl ? (
        <AppSegmentedControl<Theme>
          segments={THEMES.map((value) => ({
            value,
            label: t(THEME_LABELS[value]),
          }))}
          value={preference}
          onValueChange={handleChange}
        />
      ) : null}
    </View>
  );
}

interface ThemeToggleButtonProps {
  onPersist?: (theme: Theme) => Promise<void>;
}

export function ThemeToggleButton({ onPersist }: ThemeToggleButtonProps) {
  const theme = useTheme();
  const { isDark, setPreference } = useAppTheme();

  const toggle = async () => {
    const next: Theme = isDark ? 'light' : 'dark';
    await setPreference(next);
    await onPersist?.(next);
  };

  return (
    <Pressable
      onPress={toggle}
      style={styles.toggleButton}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {({ pressed }) =>
        isDark ? (
          <Sun
            size={22}
            color={theme.colors.onSurface}
            strokeWidth={2}
            opacity={pressed ? 0.5 : 1}
          />
        ) : (
          <Moon
            size={22}
            color={theme.colors.onSurface}
            strokeWidth={2}
            opacity={pressed ? 0.5 : 1}
          />
        )
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleButton: {
    padding: Spacing.sm,
  },
});
