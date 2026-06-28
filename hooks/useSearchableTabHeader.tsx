import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect } from 'react';

import { TabHeaderActions } from '@/components/ui/TabHeaderActions';

interface UseSearchableTabHeaderOptions {
  showCreate?: boolean;
  onCreatePress?: () => void;
  searchActive: boolean;
  searchExpanded: boolean;
  onSearchPress: () => void;
}

export function useSearchableTabHeader({
  showCreate,
  onCreatePress,
  searchActive = false,
  searchExpanded,
  onSearchPress,
}: UseSearchableTabHeaderOptions) {
  const navigation = useNavigation();

  const updateHeader = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <TabHeaderActions
          showCreate={showCreate}
          onCreatePress={onCreatePress}
          showSearch
          searchActive={searchActive}
          searchExpanded={searchExpanded}
          onSearchPress={onSearchPress}
        />
      ),
    });
  }, [navigation, onCreatePress, onSearchPress, searchActive, searchExpanded, showCreate]);

  useLayoutEffect(() => {
    updateHeader();
  }, [updateHeader]);

  useFocusEffect(
    useCallback(() => {
      updateHeader();
    }, [updateHeader]),
  );
}
