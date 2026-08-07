import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import type { Language, Property } from '@/types/app.types';
import { getMonthRange, isDateInRange } from '@/utils/dateRange';
import { exportPropertyStatementPDF } from '@/utils/statement';
import { getCategoryEffectiveType, getCategoryLabel } from '@/utils/expense';
import { formatCurrency, formatPeriod } from '@/utils/formatters';

export interface StatementSheetProps {
  visible: boolean;
  onDismiss: () => void;
  property: Property;
  currency: string;
  language: Language;
  onExportSuccess?: () => void;
  onExportError?: (message: string) => void;
}

/**
 * Property statement export — AppBottomSheet + sibling BlurOverlay on the host screen.
 * Fetches tenants/expenses/rent/categories/profile when visible (RQ cache-shared with tabs).
 */
export function StatementSheet({
  visible,
  onDismiss,
  property,
  currency,
  language,
  onExportSuccess,
  onExportError,
}: StatementSheetProps) {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [exporting, setExporting] = useState(false);

  const { tenants } = useTenants({ propertyId: property.id, enabled: visible });
  const { expenses } = useExpenses({ propertyId: property.id }, { enabled: visible });
  const { rentPayments } = useRentPayments({ propertyId: property.id }, { enabled: visible });
  const { categories } = useExpenseCategories({ enabled: visible });
  const { profile } = useProfile({ enabled: visible });

  const landlordName = profile?.full_name ?? t('statement.landlord');

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
          category !== undefined &&
          getCategoryEffectiveType(category) === 'regular' &&
          isDateInRange(expense.billing_date, monthRange.start, monthRange.end)
        );
      })
      .map((expense) => {
        const category = categoryMap.get(expense.category_id)!;
        return {
          label: getCategoryLabel(category, t),
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
    <AppBottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={t('statement.title')}
      scrollable
    >
      <View className="gap-4">
        <View className="flex-row items-center justify-center gap-4">
          <Pressable
            onPress={() => shiftMonth(-1)}
            className="p-1"
            accessibilityRole="button"
            accessibilityLabel={t('common.previous')}
          >
            <ChevronLeft size={24} className="text-foreground" strokeWidth={2} />
          </Pressable>
          <Text className="min-w-35 text-center text-base font-medium">
            {formatPeriod(month, year, language)}
          </Text>
          <Pressable
            onPress={() => shiftMonth(1)}
            className="p-1"
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
          >
            <ChevronRight size={24} className="text-foreground" strokeWidth={2} />
          </Pressable>
        </View>

        <View className="border-border gap-2 rounded-xl border p-4">
          <Text className="text-muted-foreground text-xs font-medium">
            {t('statement.billTo')}
          </Text>
          <Text className="mb-2 text-base font-medium">{tenantName}</Text>

          <View className="flex-row items-center justify-between gap-2">
            <Text>{t('statement.rent')}</Text>
            <Text>{formatCurrency(rentAmount, currency, language)}</Text>
          </View>

          {regularExpenses.map((line) => (
            <View key={line.label} className="flex-row items-center justify-between gap-2">
              <Text>{line.label}</Text>
              <Text>{formatCurrency(line.amount, currency, language)}</Text>
            </View>
          ))}

          {regularExpenses.length === 0 ? (
            <Text className="text-muted-foreground text-xs italic">
              {t('statement.noRegularExpenses')}
            </Text>
          ) : null}

          <View className="border-border mt-1 flex-row items-center justify-between gap-2 border-t pt-2">
            <Text className="text-base font-medium">{t('statement.totalDue')}</Text>
            <Text className="text-primary text-lg font-semibold">
              {formatCurrency(totalDue, currency, language)}
            </Text>
          </View>
        </View>

        <AppButton variant="default" loading={exporting} onPress={handleExport}>
          {t('statement.generate')}
        </AppButton>
      </View>
    </AppBottomSheet>
  );
}
