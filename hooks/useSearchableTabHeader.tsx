import { CreateHeaderButton } from '@/components/ui/CreateHeaderButton';
import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';
import { HeaderActionsPill } from '@/components/ui/HeaderActionsPill';
import { SearchHeaderButton } from '@/components/ui/SearchHeaderButton';

interface SearchableTabActionsProps {
  showCreate?: boolean;
  onCreatePress?: () => void;
  searchActive: boolean;
  searchExpanded: boolean;
  onSearchPress: () => void;
}

/** Floating search + create (create last) for tab roots (no native header bar). */
export function SearchableTabActions({
  showCreate,
  onCreatePress,
  searchActive = false,
  searchExpanded,
  onSearchPress,
}: SearchableTabActionsProps) {
  const hasCreate = Boolean(showCreate && onCreatePress);

  return (
    <FloatingScreenActions align="right">
      <HeaderActionsPill>
        <SearchHeaderButton
          active={searchActive}
          expanded={searchExpanded}
          onPress={onSearchPress}
        />
        {hasCreate ? <CreateHeaderButton onPress={onCreatePress!} /> : null}
      </HeaderActionsPill>
    </FloatingScreenActions>
  );
}
