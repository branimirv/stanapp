import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

interface SettingsHeaderButtonProps {
  style?: StyleProp<ViewStyle>;
}

export function SettingsHeaderButton({ style }: SettingsHeaderButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/settings')}
      style={StyleSheet.flatten([styles.button, style])}
      accessibilityRole="button"
      accessibilityLabel={t('settings.title')}
    >
      {({ pressed }) => (
        <Settings
          size={22}
          color={theme.colors.onSurface}
          strokeWidth={2}
          opacity={pressed ? 0.5 : 1}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 16,
  },
});
