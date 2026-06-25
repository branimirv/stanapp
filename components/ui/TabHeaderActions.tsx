import { StyleSheet, View } from 'react-native';

import { SearchHeaderButton } from '@/components/ui/SearchHeaderButton';
import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';

interface TabHeaderActionsProps {
  showSearch?: boolean;
  searchActive?: boolean;
  searchExpanded?: boolean;
  onSearchPress?: () => void;
}

export function TabHeaderActions({
  showSearch,
  searchActive,
  searchExpanded,
  onSearchPress,
}: TabHeaderActionsProps) {
  return (
    <View style={styles.container}>
      {showSearch && onSearchPress ? (
        <SearchHeaderButton
          active={searchActive}
          expanded={searchExpanded}
          onPress={onSearchPress}
        />
      ) : null}
      <SettingsHeaderButton style={styles.settings} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settings: {
    marginRight: 8,
  },
});
