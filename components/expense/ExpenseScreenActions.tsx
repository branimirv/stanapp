import { useTranslation } from 'react-i18next';

import { FilterIconButton } from '@/components/ui/FilterIconButton';
import { FloatingScreenActions } from '@/components/ui/FloatingScreenActions';

interface ExpenseScreenActionsProps {
  activeFilterCount?: number;
  onFilterPress: () => void;
}

/** Floating filter control (left) for the expenses tab. */
export function ExpenseScreenActions({
  activeFilterCount = 0,
  onFilterPress,
}: ExpenseScreenActionsProps) {
  const { t } = useTranslation();

  const filtersAccessibilityLabel =
    activeFilterCount > 0
      ? t('expenses.filtersWithCount', { count: activeFilterCount })
      : t('expenses.filters');

  return (
    <FloatingScreenActions align="left">
      <FilterIconButton
        activeCount={activeFilterCount}
        onPress={onFilterPress}
        accessibilityLabel={filtersAccessibilityLabel}
      />
    </FloatingScreenActions>
  );
}
