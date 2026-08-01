import { Moon, Sun } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { THEMES } from '@/constants/config';
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
  const { preference, isDark, setPreference } = useAppTheme();

  const handleChange = async (nextTheme: Theme) => {
    await setPreference(nextTheme);
    await onPersist?.(nextTheme);
  };

  const handleToggle = async (enabled: boolean) => {
    await handleChange(enabled ? 'dark' : 'light');
  };

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {isDark ? (
            <Moon size={20} className="text-foreground" strokeWidth={2} color="#FFFFFF" />
          ) : (
            <Sun size={20} strokeWidth={2} color="#0F172A" />
          )}
          <Text>{t('settings.darkMode')}</Text>
        </View>
        <Switch checked={isDark} onCheckedChange={handleToggle} />
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
  const { isDark, setPreference } = useAppTheme();

  const toggle = async () => {
    const next: Theme = isDark ? 'light' : 'dark';
    await setPreference(next);
    await onPersist?.(next);
  };

  return (
    <Pressable
      onPress={toggle}
      className="p-2"
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {({ pressed }) =>
        isDark ? (
          <Sun size={22} color="#FFFFFF" strokeWidth={2} opacity={pressed ? 0.5 : 1} />
        ) : (
          <Moon size={22} color="#0F172A" strokeWidth={2} opacity={pressed ? 0.5 : 1} />
        )
      }
    </Pressable>
  );
}
