import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { HEADER_ICON_SIZE } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Back button for stack screens. Always visible — if there is no history
 * (deep link / cold open), falls back to the main tabs.
 * Naslov `btn-ico` — liquid-glass circle over edge-to-edge content.
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
    <HeaderBtnIco onPress={handlePress} accessibilityLabel={t('common.back')}>
      <ChevronLeft size={HEADER_ICON_SIZE} color={colors.fg} strokeWidth={2} />
    </HeaderBtnIco>
  );
}
