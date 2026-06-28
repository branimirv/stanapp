import { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';

import type { AppExpandableSearchHandle } from '@/components/ui/AppExpandableSearch';
import { useSearchableTabHeader } from '@/hooks/useSearchableTabHeader';

export function useExpandableSearchState() {
  const searchRef = useRef<AppExpandableSearchHandle>(null);
  const [search, setSearch] = useState('');
  const [searchHasText, setSearchHasText] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const handleSearchPress = useCallback(() => {
    if (searchExpanded) {
      Keyboard.dismiss();
      setSearchExpanded(false);
      return;
    }

    setSearchExpanded(true);
  }, [searchExpanded]);

  const handleSearchExpandedChange = useCallback((expanded: boolean) => {
    setSearchExpanded(expanded);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleSearchActiveChange = useCallback((hasText: boolean) => {
    setSearchHasText(hasText);
  }, []);

  const dismissSearchIfEmpty = useCallback(() => {
    if (searchRef.current?.isEmpty() ?? true) {
      Keyboard.dismiss();
      setSearchExpanded(false);
    }
  }, []);

  const searchBarControlProps = useMemo(
    () => ({
      ref: searchRef,
      hideTrigger: true as const,
      expanded: searchExpanded,
      onExpandedChange: handleSearchExpandedChange,
      onChangeText: handleSearchChange,
      onActiveChange: handleSearchActiveChange,
    }),
    [handleSearchActiveChange, handleSearchChange, handleSearchExpandedChange, searchExpanded],
  );

  const listKeyboardProps = useMemo(
    () => ({
      keyboardDismissMode: 'on-drag' as const,
      onScrollBeginDrag: dismissSearchIfEmpty,
    }),
    [dismissSearchIfEmpty],
  );

  return {
    search,
    searchExpanded,
    searchHasText,
    handleSearchPress,
    dismissSearchIfEmpty,
    searchBarControlProps,
    listKeyboardProps,
  };
}

export function useExpandableSearch() {
  const searchState = useExpandableSearchState();

  useSearchableTabHeader({
    searchActive: searchState.searchHasText,
    searchExpanded: searchState.searchExpanded,
    onSearchPress: searchState.handleSearchPress,
  });

  return searchState;
}
