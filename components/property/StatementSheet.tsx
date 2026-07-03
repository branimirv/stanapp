import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { Spacing, Typography } from '@/constants/theme';
import type { Expense, ExpenseCategory, Language, Property, RentPayment, Tenant } from '@/types/app.types';
import { getMonthRange, isDateInRange } from '@/utils/dateRange';
import { exportPropertyStatementPDF } from '@/utils/statement';
import { formatCurrency, formatPeriod } from '@/utils/formatters';

export interface StatementSheetProps {
  visible: boolean;
  onDismiss: () => void;
  property: Property;
  tenants: Tenant[];
  expenses: Expense[];
  rentPayments: RentPayment[];
  categories: ExpenseCategory[];
  landlordName: string;
  currency: string;
  language: Language;
  onExportSuccess?: () => void;
  onExportError?: (message: string) => void;
}

export function StatementSheet({
  visible,
  onDismiss,
  property,
  tenants,
  expenses,
  rentPayments,
  categories,
  landlordName,
  currency,
  language,
  onExportSuccess,
  onExportError,
}: StatementSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [exporting, setExporting] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const monthRange = useMemo(() => getMonthRange(month, year), [month, year]);

  const activeTenant = useMemo(
    () => tenants.find((tenant) => tenant.is_active) ?? tenants[0],
    [tenants],
  );

  const tenantName = activeTenant
    ? `${activeTenant.first_name} ${activeTenant.last_name}`.trim()
    : t('properties.noTenant');

  const regularExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const category = categoryMap.get(expense.category_id);
        return (
          category?.type === 'regular' &&
          isDateInRange(expense.billing_date, monthRange.start, monthRange.end)
        );
      })
      .map((expense) => {
        const category = categoryMap.get(expense.category_id)!;
        return {
          label: t(`categories.${category.key}`),
          amount: expense.amount,
        };
      });
  }, [categoryMap, expenses, monthRange.end, monthRange.start, t]);

  const rentPayment = rentPayments.find(
    (payment) => payment.period_month === month && payment.period_year === year,
  );

  const rentAmount = rentPayment?.amount ?? property.rent_amount;
  const expensesTotal = regularExpenses.reduce((sum, line) => sum + line.amount, 0);
  const totalDue = rentAmount + expensesTotal;

  const shiftMonth = (delta: number) => {
    const date = new Date(year, month - 1 + delta, 1);
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPropertyStatementPDF({
        property,
        tenantName,
        landlordName,
        rentAmount,
        regularExpenses,
        month,
        year,
        currency,
        language,
        t,
      });
      onExportSuccess?.();
      onDismiss();
    } catch (err) {
      onExportError?.(err instanceof Error ? err.message : t('statement.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />

          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('statement.title')}
          </Text>

          <View style={styles.periodPicker}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              style={styles.periodButton}
              accessibilityRole="button"
              accessibilityLabel={t('common.previous')}
            >
              <ChevronLeft size={24} color={theme.colors.onSurface} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.periodLabel, { color: theme.colors.onSurface }]}>
              {formatPeriod(month, year, language)}
            </Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              style={styles.periodButton}
              accessibilityRole="button"
              accessibilityLabel={t('common.next')}
            >
              <ChevronRight size={24} color={theme.colors.onSurface} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={[styles.preview, { borderColor: theme.colors.outline }]}>
            <Text style={[styles.previewLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('statement.billTo')}
            </Text>
            <Text style={[styles.previewValue, { color: theme.colors.onSurface }]}>
              {tenantName}
            </Text>

            <View style={styles.lineItem}>
              <Text style={{ color: theme.colors.onSurface }}>{t('statement.rent')}</Text>
              <Text style={{ color: theme.colors.onSurface }}>
                {formatCurrency(rentAmount, currency, language)}
              </Text>
            </View>

            {regularExpenses.map((line) => (
              <View key={line.label} style={styles.lineItem}>
                <Text style={{ color: theme.colors.onSurface }}>{line.label}</Text>
                <Text style={{ color: theme.colors.onSurface }}>
                  {formatCurrency(line.amount, currency, language)}
                </Text>
              </View>
            ))}

            {regularExpenses.length === 0 ? (
              <Text style={[styles.emptyHint, { color: theme.colors.onSurfaceVariant }]}>
                {t('statement.noRegularExpenses')}
              </Text>
            ) : null}

            <View style={[styles.lineItem, styles.totalRow, { borderTopColor: theme.colors.outline }]}>
              <Text style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
                {t('statement.totalDue')}
              </Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                {formatCurrency(totalDue, currency, language)}
              </Text>
            </View>
          </View>

          <AppButton mode="contained" loading={exporting} onPress={handleExport}>
            {t('statement.generate')}
          </AppButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleMedium,
    textAlign: 'center',
  },
  periodPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  periodButton: {
    padding: Spacing.xs,
  },
  periodLabel: {
    ...Typography.titleMedium,
    minWidth: 140,
    textAlign: 'center',
  },
  preview: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  previewLabel: {
    ...Typography.labelMedium,
  },
  previewValue: {
    ...Typography.titleMedium,
    marginBottom: Spacing.sm,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyHint: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    ...Typography.titleMedium,
  },
  totalValue: {
    ...Typography.titleLarge,
  },
});
