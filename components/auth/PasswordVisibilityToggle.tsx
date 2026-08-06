import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

/**
 * Trailing password adornment — 34×34 pill.
 * Dark: solid white + muted icon.
 * Light: white fill + bd border + muted icon (naslov light mockup).
 */
export function PasswordVisibilityToggle({ visible, onToggle }: PasswordVisibilityToggleProps) {
  const { t } = useTranslation();
  const { theme, isDark } = useAppTheme();

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={visible ? t('auth.hidePassword') : t('auth.showPassword')}
      hitSlop={4}
    >
      <View
        style={[
          styles.hit,
          isDark
            ? { backgroundColor: '#FFFFFF' }
            : {
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: theme.colors.bdStrong,
              },
        ]}
      >
        {visible ? (
          <Eye size={16} color={theme.colors.muted} strokeWidth={2} />
        ) : (
          <EyeOff size={16} color={theme.colors.muted} strokeWidth={2} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 34,
    height: 34,
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
