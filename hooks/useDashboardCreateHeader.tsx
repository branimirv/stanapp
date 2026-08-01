import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CreateHeaderButton } from '@/components/ui/CreateHeaderButton';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';

export function useDashboardCreateHeader(onCreatePress: () => void) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const updateHeader = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActionsPill>
          <CreateHeaderButton
            onPress={onCreatePress}
            accessibilityLabel={t('dashboard.quickActions')}
          />
        </HeaderActionsPill>
      ),
    });
  }, [navigation, onCreatePress, t]);

  useLayoutEffect(() => {
    updateHeader();
  }, [updateHeader]);

  useFocusEffect(
    useCallback(() => {
      updateHeader();
    }, [updateHeader]),
  );
}
