import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

import { TabHeaderActions } from '@/components/ui/TabHeaderActions';

interface UseSearchableTabHeaderOptions {
  searchActive: boolean;
  searchExpanded: boolean;
  onSearchPress: () => void;
}

export function useSearchableTabHeader({
  searchActive = false,
  searchExpanded,
  onSearchPress,
}: UseSearchableTabHeaderOptions) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TabHeaderActions
          showSearch
          searchActive={searchActive}
          searchExpanded={searchExpanded}
          onSearchPress={onSearchPress}
        />
      ),
    });
  }, [navigation, onSearchPress, searchActive, searchExpanded]);
}
