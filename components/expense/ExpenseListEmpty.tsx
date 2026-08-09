import { Plus, Receipt } from 'lucide-react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';

type ExpenseListEmptyProps = {
  search: string;
  activeFilterCount: number;
  /** Property pill is outside the sheet filter count — still a scoped empty. */
  isPropertyScoped?: boolean;
  lastExpenseShortDate: string | null;
  onCreatePress: () => void;
};

/** Empty / no-results state for the Troškovi list. */
export function ExpenseListEmpty({
  search,
  activeFilterCount,
  isPropertyScoped = false,
  lastExpenseShortDate,
  onCreatePress,
}: ExpenseListEmptyProps) {
  const { t } = useTranslation();
  const hasQuery = Boolean(search) || activeFilterCount > 0 || isPropertyScoped;

  return (
    <>
      <EmptyState
        icon={Receipt}
        title={hasQuery ? t('empty.noResults') : t('empty.noExpenses')}
        subtitle={hasQuery ? t('empty.noResultsHint') : t('empty.noExpensesHint')}
        ctaLabel={!hasQuery ? t('expenses.addNew') : undefined}
        ctaIcon={Plus}
        onCtaPress={!hasQuery ? onCreatePress : undefined}
      />
      {lastExpenseShortDate ? (
        <Text className="text-muted mt-6 text-center text-[10px] font-semibold tracking-[0.8px] uppercase">
          {t('expenses.lastExpenseRecorded', { date: lastExpenseShortDate })}
        </Text>
      ) : null}
    </>
  );
}
