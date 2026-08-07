import { format as formatDateFns, parseISO } from 'date-fns';
import { ChevronRight, Plus, Receipt } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ExpenseListRow } from '@/components/expense/ExpenseListRow';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { AppButton } from '@/components/ui/AppButton';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type { Expense, ExpenseCategory, Language } from '@/types/app.types';
import { formatPeriod } from '@/utils/formatters';

type PeriodFilter = 'current_month' | 'all';

const PREVIEW_COUNT = 3;

export interface PropertyExpensesTabProps {
  expenses: Expense[];
  monthExpenses: Expense[];
  monthExpenseTotal: number;
  month: number;
  year: number;
  isLoading: boolean;
  canManage: boolean;
  currency: string;
  language: Language;
  categoryMap: Map<string, ExpenseCategory>;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectExpense: (expenseId: string) => void;
  onMarkExpensePaid: (expenseId: string) => void;
  onAddExpense: () => void;
  /** Clears floating header + tabs; content still peeks under glass. */
  contentTopInset?: number;
}

function capitalizePeriod(label: string, language: Language): string {
  return label.replace(/^./, (ch) =>
    ch.toLocaleUpperCase(language === 'en' ? 'en' : 'hr'),
  );
}

function PropertyExpensesTabComponent({
  expenses,
  monthExpenses,
  monthExpenseTotal,
  month,
  year,
  isLoading,
  canManage,
  currency,
  language,
  categoryMap,
  refreshing,
  onRefresh,
  onSelectExpense,
  onAddExpense,
  contentTopInset = 0,
}: PropertyExpensesTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const insets = useSafeAreaInsets();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('current_month');
  const [expanded, setExpanded] = useState(false);

  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const ctaBottom = Math.max(insets.bottom, 12) + 10;

  const sortedAll = useMemo(() => {
    return [...expenses].sort((a, b) => b.billing_date.localeCompare(a.billing_date));
  }, [expenses]);

  const sourceList = periodFilter === 'current_month' ? monthExpenses : sortedAll;
  const isEmptyList = sourceList.length === 0;
  const listBottomPad =
    canManage && !isEmptyList ? 72 + ctaBottom : Spacing.xxl;

  const visibleExpenses = useMemo(() => {
    if (expanded || sourceList.length <= PREVIEW_COUNT) return sourceList;
    return sourceList.slice(0, PREVIEW_COUNT);
  }, [expanded, sourceList]);

  const hasMore = sourceList.length > PREVIEW_COUNT;
  const headerTotal =
    periodFilter === 'current_month'
      ? monthExpenseTotal
      : sourceList.reduce((sum, item) => sum + Number(item.amount), 0);
  const headerTitle =
    periodFilter === 'current_month'
      ? capitalizePeriod(formatPeriod(month, year, language), language)
      : t('properties.expensePeriodAll');

  const lastExpenseShortDate = useMemo(() => {
    if (expenses.length === 0) return null;
    let latest = expenses[0].billing_date;
    for (const expense of expenses) {
      if (expense.billing_date > latest) latest = expense.billing_date;
    }
    return formatDateFns(parseISO(latest), 'dd.MM.');
  }, [expenses]);

  const handlePeriodChange = useCallback((next: PeriodFilter) => {
    setPeriodFilter(next);
    setExpanded(false);
  }, []);

  if (isLoading) {
    return <SkeletonLoader count={4} style={[styles.content, { paddingTop: listTopPad }]} />;
  }

  return (
    <View style={styles.shell}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: listTopPad, paddingBottom: listBottomPad },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.segsTrack, { backgroundColor: colors.surface2 }]}>
          {(
            [
              { value: 'current_month' as const, label: t('properties.expensePeriodThisMonth') },
              { value: 'all' as const, label: t('properties.expensePeriodAll') },
            ] as const
          ).map((seg) => {
            const on = periodFilter === seg.value;
            return (
              <Pressable
                key={seg.value}
                onPress={() => handlePeriodChange(seg.value)}
                style={[styles.seg, on ? { backgroundColor: colors.surface3 } : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 12,
                    letterSpacing: -0.12,
                    color: on ? colors.fg : colors.muted,
                    textAlign: 'center',
                  }}
                >
                  {seg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isEmptyList ? (
          <>
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
            >
              <View style={[styles.emptyIc, { backgroundColor: colors.primaryTint }]}>
                <Receipt size={25} color={colors.primary} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: displayFontFamily(theme.name),
                  fontSize: 23,
                  letterSpacing: -0.46,
                  color: colors.fg,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {t('empty.noExpenses')}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.sans.regular,
                  fontSize: 12.5,
                  lineHeight: 20,
                  color: colors.muted,
                  textAlign: 'center',
                  maxWidth: 210,
                  marginBottom: canManage ? 22 : 0,
                }}
              >
                {t('empty.noExpensesHint')}
              </Text>
              {canManage ? (
                <Pressable
                  onPress={onAddExpense}
                  accessibilityRole="button"
                  accessibilityLabel={t('expenses.addNew')}
                  style={[styles.emptyCta, { backgroundColor: colors.primary }]}
                >
                  <Plus size={18} color={colors.onPrimary} strokeWidth={2} />
                  <Text
                    style={{
                      fontFamily: Fonts.sans.semibold,
                      fontSize: 14,
                      letterSpacing: -0.14,
                      color: colors.onPrimary,
                    }}
                  >
                    {t('expenses.addNew')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {lastExpenseShortDate ? (
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 10,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: colors.muted,
                  textAlign: 'center',
                  marginTop: 24,
                }}
              >
                {t('expenses.lastExpenseRecorded', { date: lastExpenseShortDate })}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.secHead}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: displayFontFamily(theme.name),
                  fontSize: 19,
                  letterSpacing: -0.4,
                  color: colors.fg,
                }}
                numberOfLines={1}
              >
                {headerTitle}
              </Text>
              <DisplayAmount
                amount={headerTotal}
                currency={currency}
                language={language}
                size={22}
              />
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
            >
              {visibleExpenses.map((expense, index) => (
                <ExpenseListRow
                  key={expense.id}
                  expense={expense}
                  category={categoryMap.get(expense.category_id)}
                  currency={currency}
                  language={language}
                  showDivider={index > 0}
                  onPress={onSelectExpense}
                />
              ))}
            </View>

            {hasMore ? (
              <Pressable
                onPress={() => setExpanded((current) => !current)}
                style={[styles.ghostBtn, { backgroundColor: colors.surface2 }]}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 14,
                    color: colors.fg,
                  }}
                >
                  {expanded ? t('common.showLess') : t('properties.seeAllExpenses')}
                </Text>
                {!expanded ? (
                  <ChevronRight size={16} color={colors.fg} strokeWidth={2} />
                ) : null}
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>

      {canManage && !isEmptyList ? (
        <View
          pointerEvents="box-none"
          style={[styles.ctaWrap, { paddingBottom: ctaBottom }]}
        >
          <AppButton
            mode="contained"
            onPress={onAddExpense}
            className="h-12 w-full"
            accessibilityLabel={t('dashboard.addExpense')}
            style={styles.ctaShadow}
          >
            <View style={styles.ctaInner}>
              <Plus size={18} color={colors.onPrimary} strokeWidth={2.5} />
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: colors.onPrimary,
                }}
              >
                {t('dashboard.addExpense')}
              </Text>
            </View>
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}

export const PropertyExpensesTab = memo(PropertyExpensesTabComponent);

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.gutter,
  },
  segsTrack: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    borderRadius: 999,
    minHeight: 40,
    marginBottom: 18,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 999,
  },
  secHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
    marginBottom: 14,
  },
  emptyCard: {
    paddingTop: 38,
    paddingHorizontal: 20,
    paddingBottom: 34,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyIc: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyCta: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.gutter,
  },
  ctaShadow: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
