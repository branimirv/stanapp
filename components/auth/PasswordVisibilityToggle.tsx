import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';

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
        className={cn(
          'h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-full bg-white',
          !isDark && 'border-bd-strong border',
        )}
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
