import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect } from 'react';

import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';

export function useDefaultTabHeader() {
  const navigation = useNavigation();

  const updateHeader = useCallback(() => {
    navigation.setOptions({
      headerRight: () => <SettingsHeaderButton />,
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
