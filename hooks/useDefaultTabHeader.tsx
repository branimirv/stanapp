import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect } from 'react';

import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';

export function useDefaultTabHeader() {
  const navigation = useNavigation();

  const updateHeader = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActionsPill>
          <SettingsHeaderButton />
        </HeaderActionsPill>
      ),
    });
  }, [navigation]);

  useLayoutEffect(() => {
    updateHeader();
  }, [updateHeader]);

  useFocusEffect(
    useCallback(() => {
      updateHeader();
    }, [updateHeader]),
  );
}
