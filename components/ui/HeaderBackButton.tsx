import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

/**
 * Back button for screens that sit at the root of a nested stack (details, `new`,
 * settings). React Navigation only renders its native back button on pushed
 * screens, so those first-route screens would otherwise have no way back to the
 * tab or group that opened them. Renders nothing when there is no history to pop.
 */
export function HeaderBackButton() {
  const { t } = useTranslation();

  const canGoBack = router.canGoBack();

  // Keep the header left "slot" width stable even when there's no back action.
  // This prevents the navigation title from shifting horizontally between screens.
  if (!canGoBack) {
    // We intentionally render *no* icon so the header left slot doesn't
    // add extra width; it only needs to exist to keep title layout stable.
    return <View style={styles.hiddenSlot} pointerEvents="none" />;
  }

  return (
    <HeaderIconButton
      icon={ChevronLeft}
      onPress={() => router.back()}
      accessibilityLabel={t('common.back')}
    />
  );
}

const styles = StyleSheet.create({
  hiddenSlot: {
    width: 0,
  },
});
