import { useMemo, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { PeriodFilter } from '@/components/reports/PeriodFilter';
import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppPicker, type PickerOption } from '@/components/ui/AppPicker';
import { useEarliestReportActivity } from '@/hooks/useEarliestReportActivity';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import type { ReportCategoryTypeFilter, ReportPeriod } from '@/types/app.types';

export interface ReportFiltersSheetProps {
  visible: boolean;
  onDismiss: () => void;
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  /** Used to re-seed custom period Od when property pills change. */
  propertyFilter: string;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categoryTypeFilter: ReportCategoryTypeFilter;
  onCategoryTypeFilterChange: (value: ReportCategoryTypeFilter) => void;
  categoryOptions: PickerOption[];
  onClearFilters: () => void;
}

interface FilterChipOption<T extends string> {
  label: string;
  value: T;
}

function FilterChipRow<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.chipRow, style]}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: on ? colors.primaryTint : colors.surface2,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 12.5,
                letterSpacing: -0.12,
                color: on ? colors.primary : colors.muted,
              }}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FilterGroup({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.group, style]}>
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 11,
          lineHeight: 14,
          letterSpacing: 1.54,
          textTransform: 'uppercase',
          color: colors.muted,
          marginBottom: 10,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

/** Naslov report filters — BlurOverlay must be a sibling on the host screen. */
export function ReportFiltersSheet({
  visible,
  onDismiss,
  period,
  onPeriodChange,
  propertyFilter,
  categoryFilter,
  onCategoryFilterChange,
  categoryTypeFilter,
  onCategoryTypeFilterChange,
  categoryOptions,
  onClearFilters,
}: ReportFiltersSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { earliestActivityDate } = useEarliestReportActivity(propertyFilter);

  const activeCount = useMemo(() => {
    let count = 0;
    if (period.preset !== 'last_6_months') count += 1;
    if (categoryFilter !== 'all') count += 1;
    if (categoryTypeFilter !== 'all') count += 1;
    return count;
  }, [categoryFilter, categoryTypeFilter, period.preset]);

  const typeOptions: FilterChipOption<ReportCategoryTypeFilter>[] = [
    { label: t('reports.typeAll'), value: 'all' },
    { label: t('reports.typeRegular'), value: 'regular' },
    { label: t('reports.typeIrregular'), value: 'irregular' },
  ];

  const handleClear = () => {
    onClearFilters();
    onDismiss();
  };

  const doneLabel =
    activeCount > 0 ? `${t('common.done')} ${activeCount}` : t('common.done');

  return (
    <AppBottomSheet visible={visible} onDismiss={onDismiss} title={t('reports.filters')}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <FilterGroup label={t('reports.periodFilter')}>
          <PeriodFilter
            value={period}
            onChange={onPeriodChange}
            propertyFilter={propertyFilter}
            earliestActivityDate={earliestActivityDate}
          />
        </FilterGroup>

        <FilterGroup label={t('reports.filterCategory')}>
          <AppPicker
            options={categoryOptions}
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
            placeholder={t('reports.allCategories')}
          />
        </FilterGroup>

        <FilterGroup label={t('reports.filterType')} style={styles.groupTight}>
          <FilterChipRow
            options={typeOptions}
            value={categoryTypeFilter}
            onChange={onCategoryTypeFilterChange}
          />
        </FilterGroup>

        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 11.5,
            lineHeight: 18,
            color: colors.muted,
            marginBottom: 22,
          }}
        >
          {t('reports.expenseFilterHint')}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={t('common.clearFilters')}
          style={[styles.footerBtn, styles.clearBtn, { backgroundColor: colors.surface2 }]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              letterSpacing: -0.14,
              color: colors.fg,
            }}
            numberOfLines={1}
          >
            {t('common.clearFilters')}
          </Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={doneLabel}
          style={[styles.footerBtn, styles.doneBtn, { backgroundColor: colors.primary }]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              letterSpacing: -0.14,
              color: colors.onPrimary,
            }}
          >
            {doneLabel}
          </Text>
        </Pressable>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  group: {
    marginBottom: 18,
  },
  groupTight: {
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 9,
  },
  footerBtn: {
    height: 44,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  clearBtn: {
    flex: 1,
  },
  doneBtn: {
    flex: 2,
  },
});
