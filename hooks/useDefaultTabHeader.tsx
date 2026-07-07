import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect } from 'react';

import { HeaderSettingsActions } from '@/components/ui/HeaderSettingsActions';

export function useDefaultTabHeader() {
  const navigation = useNavigation();

  const updateHeader = useCallback(() => {
    navigation.setOptions({
      headerRight: () => <HeaderSettingsActions />,
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
