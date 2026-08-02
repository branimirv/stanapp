import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { HEADER_ACTION_SLOT } from '@/constants/header';

/**
 * Back button for screens that sit at the root of a nested stack (details, `new`,
 * settings). React Navigation only renders its native back button on pushed
 * screens, so those first-route screens would otherwise have no way back to the
 * tab or group that opened them. Renders nothing when there is no history to pop.
 */
export function HeaderBackButton() {
  const { t } = useTranslation();

  if (!router.canGoBack()) {
    return null;
  }

  return (
    <GlassSurface
      shape="circle"
      interactive
      style={styles.circle}
      contentStyle={styles.circleOverlay}
    >
      <HeaderIconButton
        icon={ChevronLeft}
        onPress={() => router.back()}
        accessibilityLabel={t('common.back')}
      />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: HEADER_ACTION_SLOT,
    height: HEADER_ACTION_SLOT,
  },
  circleOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
