import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Back button for stack screens. Always visible — if there is no history
 * (deep link / cold open), falls back to the main tabs.
 * Naslov `btn-ico` — 38×38 surface2 circle.
 */
export function HeaderBackButton() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      style={[styles.btnIco, { backgroundColor: colors.surface2 }]}
      hitSlop={4}
    >
      <ChevronLeft size={17} color={colors.fg} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btnIco: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
