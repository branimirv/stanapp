import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';

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
    <HeaderActionsPill>
      <HeaderIconButton
        icon={ChevronLeft}
        onPress={() => router.back()}
        accessibilityLabel={t('common.back')}
      />
    </HeaderActionsPill>
  );
}
