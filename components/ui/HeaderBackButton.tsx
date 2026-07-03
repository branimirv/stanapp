import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { HeaderLeftInset } from '@/components/ui/HeaderEdgeInset';

/**
 * Back button for screens that sit at the root of a nested stack (details, `new`,
 * settings). React Navigation only renders its native back button on pushed
 * screens, so those first-route screens would otherwise have no way back to the
 * tab or group that opened them. Renders nothing when there is no history to pop.
 */
export function HeaderBackButton() {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!router.canGoBack()) {
    return null;
  }

  return (
    <HeaderLeftInset>
      <HeaderActionsPill>
        <Pressable
          onPress={() => router.back()}
          style={styles.button}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          {({ pressed }) => (
            <ChevronLeft
              size={22}
              color={theme.colors.onSurface}
              strokeWidth={2}
              opacity={pressed ? 0.5 : 1}
            />
          )}
        </Pressable>
      </HeaderActionsPill>
    </HeaderLeftInset>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
