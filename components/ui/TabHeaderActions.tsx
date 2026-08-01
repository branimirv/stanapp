import { CreateHeaderButton } from '@/components/ui/CreateHeaderButton';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { SearchHeaderButton } from '@/components/ui/SearchHeaderButton';

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
  const hasCreate = Boolean(showCreate && onCreatePress);
  const hasSearch = Boolean(showSearch && onSearchPress);
  if (!hasCreate && !hasSearch) return null;

  return (
    <HeaderActionsPill>
      {hasCreate ? <CreateHeaderButton onPress={onCreatePress!} /> : null}
      {hasSearch ? (
        <SearchHeaderButton
          active={searchActive}
          expanded={searchExpanded}
          onPress={onSearchPress!}
        />
      ) : null}
    </HeaderActionsPill>
  );
}
