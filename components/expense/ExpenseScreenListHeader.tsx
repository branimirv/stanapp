import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  ExpenseActiveFilterChips,
  type ExpenseFiltersStateProps,
} from '@/components/expense/ExpenseFilters';
import { ExpenseSummaryBays } from '@/components/expense/ExpenseSummaryBays';
import { AppExpandableSearch } from '@/components/ui/AppExpandableSearch';
import { FLOATING_ACTIONS_ROW_HEIGHT } from '@/components/ui/FloatingScreenActions';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ExpandableSearchBarControlProps } from '@/hooks/useExpandableSearch';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Language, Property } from '@/types/app.types';

type ExpenseScreenListHeaderProps = {
  eyebrowText: string;
  searchBarControlProps: ExpandableSearchBarControlProps;
  hasAnyExpenses: boolean;
  properties: Property[];
  propertyFilter: string;
  onPropertyPill: (propertyId: string) => void;
  filterStateProps: ExpenseFiltersStateProps;
  thisMonthTotal: number;
  sixMonthAverage: number;
  currency: string;
  language: Language;
  isEmptyList: boolean;
};

/** Title, search, property pills, active chips, and summary bays for Troškovi. */
export function ExpenseScreenListHeader({
  eyebrowText,
  searchBarControlProps,
  hasAnyExpenses,
  properties,
  propertyFilter,
  onPropertyPill,
  filterStateProps,
  thisMonthTotal,
  sixMonthAverage,
  currency,
  language,
  isEmptyList,
}: ExpenseScreenListHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  return (
    <View>
      <View style={{ height: FLOATING_ACTIONS_ROW_HEIGHT }} />

      <View className="mb-3.5">
        <Text className="text-muted mb-2.5 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
          {eyebrowText}
        </Text>
        <Text
          className="text-fg text-[34px] tracking-[-0.85px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            lineHeight: 34,
          }}
        >
          {t('expenses.title')}
        </Text>
      </View>

      <AppExpandableSearch
        {...searchBarControlProps}
        placeholder={t('expenses.searchPlaceholder')}
        className="mb-2"
      />

      {hasAnyExpenses ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2.5 grow-0"
            style={{ marginHorizontal: -theme.spacing.gutter }}
            contentContainerClassName="flex-row items-center gap-2"
            contentContainerStyle={{ paddingHorizontal: theme.spacing.gutter }}
          >
            <Pressable
              onPress={() => onPropertyPill('all')}
              className={cn(
                'h-8.5 max-w-45 items-center justify-center rounded-full px-3.5',
                propertyFilter === 'all' ? 'bg-primary-tint' : 'bg-surface-2',
              )}
              accessibilityRole="button"
              accessibilityState={{ selected: propertyFilter === 'all' }}
            >
              <Text
                className={cn(
                  'text-[13px] font-semibold',
                  propertyFilter === 'all' ? 'text-primary' : 'text-muted',
                )}
              >
                {t('reports.allProperties')}
              </Text>
            </Pressable>
            {properties.map((property) => {
              const on = propertyFilter === property.id;
              return (
                <Pressable
                  key={property.id}
                  onPress={() => onPropertyPill(property.id)}
                  className={cn(
                    'h-8.5 max-w-45 items-center justify-center rounded-full px-3.5',
                    on ? 'bg-primary-tint' : 'bg-surface-2',
                  )}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text
                    className={cn('text-[13px] font-semibold', on ? 'text-primary' : 'text-muted')}
                    numberOfLines={1}
                  >
                    {property.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ExpenseActiveFilterChips {...filterStateProps} />
        </>
      ) : null}

      <ExpenseSummaryBays
        thisMonthLabel={t('expenses.thisMonthBay')}
        thisMonthTotal={thisMonthTotal}
        averageLabel={t('expenses.avgSixMonthsBay')}
        sixMonthAverage={sixMonthAverage}
        currency={currency}
        language={language}
        className={cn(isEmptyList ? 'mb-6.5' : 'mb-3.5')}
      />
    </View>
  );
}
