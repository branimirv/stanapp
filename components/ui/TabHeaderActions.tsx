import { CreateHeaderButton } from '@/components/ui/CreateHeaderButton';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { SearchHeaderButton } from '@/components/ui/SearchHeaderButton';
import { SettingsHeaderButton } from '@/components/ui/SettingsHeaderButton';

interface TabHeaderActionsProps {
  showCreate?: boolean;
  onCreatePress?: () => void;
  showSearch?: boolean;
  searchActive?: boolean;
  searchExpanded?: boolean;
  onSearchPress?: () => void;
}

export function TabHeaderActions({
  showCreate,
  onCreatePress,
  showSearch,
  searchActive,
  searchExpanded,
  onSearchPress,
}: TabHeaderActionsProps) {
  return (
    <HeaderActionsPill>
      {showCreate && onCreatePress ? (
        <CreateHeaderButton onPress={onCreatePress} />
      ) : null}
      {showSearch && onSearchPress ? (
        <SearchHeaderButton
          active={searchActive}
          expanded={searchExpanded}
          onPress={onSearchPress}
        />
      ) : null}
      <SettingsHeaderButton />
    </HeaderActionsPill>
  );
}
