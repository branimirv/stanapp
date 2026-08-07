import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Building2,
  CircleAlert,
  CircleCheck,
  Pencil,
  Repeat,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { StackHeaderActions } from '@/components/ui/StackHeaderActions';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpense, useExpenseMutations } from '@/hooks/useExpenses';
import { useLocale } from '@/hooks/useLocale';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { cancelExpenseReminders } from '@/lib/notifications';
import { displayFontFamily } from '@/lib/fonts';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import { resolveCurrency } from '@/utils/currency';
import { getCategoryLabel } from '@/utils/expense';
import { formatDate, isOverdue } from '@/utils/formatters';

function DetailRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={cn(
        'flex-row items-start justify-between gap-3 py-3.5',
        !isLast && 'border-bd border-b',
      )}
      style={!isLast ? { borderBottomWidth: StyleSheet.hairlineWidth } : undefined}
    >
      <Text className="text-muted flex-1 text-[13px]">{label}</Text>
      <Text className="text-fg max-w-[55%] text-right text-[13px] font-semibold" numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const { expense, isLoading, error, refetch: loadExpense } = useExpense(id);
  const { property } = useProperty(expense?.property_id ?? undefined);

  const { profile } = useProfile();
  const { language } = useLocale();
  const { categories } = useExpenseCategories();
  const { markAsPaid, remove } = useExpenseMutations();

  const currency = resolveCurrency(profile, property, expense?.currency);
  const category = useMemo(
    () => categories.find((c) => c.id === expense?.category_id),
    [categories, expense?.category_id],
  );

  const handleMarkPaid = () => {
    if (!expense) return;

    showConfirmDialog({
      title: t('confirm.markPaidTitle'),
      message: t('confirm.markPaidMessage'),
      confirmLabel: t('expenses.markPaid'),
      onConfirm: async () => {
        try {
          await markAsPaid(expense.id);
          await cancelExpenseReminders(expense.id);
          showToast({ message: t('expenses.markedPaid'), type: 'success' });
          await loadExpense();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('expenses.markPaidFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  const handleDelete = () => {
    if (!expense) return;

    showConfirmDialog({
      title: t('confirm.deleteExpenseTitle'),
      message: t('confirm.deleteExpenseMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
      onConfirm: async () => {
        try {
          await cancelExpenseReminders(expense.id);
          await remove(expense.id);
          showToast({ message: t('expenses.deleteSuccess'), type: 'success' });
          router.back();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('expenses.deleteFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  if (isLoading || error || !expense) {
    return (
      <DetailScreenScaffold
        title={t('expenses.expenseDetails')}
        hideHeaderTitle
        isLoading={isLoading}
        isReady={Boolean(expense)}
        error={error}
        notFoundMessage={t('expenses.notFound')}
        onRetry={loadExpense}
      >
        {null}
      </DetailScreenScaffold>
    );
  }

  const paid = Boolean(expense.paid_at);
  const overdue = isOverdue(expense.due_date, expense.paid_at);
  const categoryLabel =
    getCategoryLabel(category, t) || expense.notes?.trim() || t('expenses.expense');
  const statusA11y = paid
    ? t('expenses.paid')
    : overdue
      ? t('expenses.overdue')
      : t('expenses.unpaid');
  const wellA11y = expense.is_recurring
    ? `${statusA11y}, ${t('expenses.recurring')}`
    : statusA11y;

  const detailRows: { label: string; value: string }[] = [
    {
      label: t('expenses.billingDate'),
      value: formatDate(expense.billing_date, language),
    },
  ];
  if (expense.due_date) {
    detailRows.push({
      label: t('expenses.dueDate'),
      value: formatDate(expense.due_date, language),
    });
  }
  if (expense.paid_at) {
    detailRows.push({
      label: t('expenses.paidAt'),
      value: formatDate(expense.paid_at.slice(0, 10), language),
    });
  }
  if (expense.notes?.trim()) {
    detailRows.push({
      label: t('common.notes'),
      value: expense.notes.trim(),
    });
  }

  return (
    <DetailScreenScaffold
      title={categoryLabel}
      hideHeaderTitle
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={t('expenses.notFound')}
      onRetry={loadExpense}
      headerRight={() => (
        <StackHeaderActions>
          <HeaderIconButton
            icon={Pencil}
            onPress={() => router.push(routes.expense.edit(expense.id))}
            accessibilityLabel={t('common.edit')}
          />
        </StackHeaderActions>
      )}
    >
      <ScrollView
        contentContainerClassName="px-gutter pb-12"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4.5 flex-row items-start gap-3.5">
          <View
            className={cn(
              'relative h-14.5 w-14.5 items-center justify-center rounded-full',
              paid ? 'bg-pos-tint' : 'bg-neg-tint',
            )}
            accessibilityRole="image"
            accessibilityLabel={wellA11y}
          >
            {paid ? (
              <CircleCheck size={22} color={colors.pos} strokeWidth={2} />
            ) : (
              <CircleAlert size={22} color={colors.neg} strokeWidth={2} />
            )}
            {expense.is_recurring ? (
              <View className="border-bd bg-surface absolute -right-0.5 -bottom-0.5 h-4.5 w-4.5 items-center justify-center rounded-full border-2">
                <Repeat size={9} color={colors.muted} strokeWidth={2.75} />
              </View>
            ) : null}
          </View>

          <View className="min-w-0 flex-1 justify-center pt-1">
            <Text className="text-muted mb-2 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
              {t('expenses.expenseDetails')}
            </Text>
            <Text
              className="text-fg text-[28px] tracking-[-0.6px]"
              style={{
                fontFamily: displayFontFamily(theme.name),
                lineHeight: 32,
              }}
              numberOfLines={2}
            >
              {categoryLabel}
            </Text>
          </View>
        </View>

        <View
          className="border-card-bd bg-surface mb-5.5 rounded-xl border px-4.5 pt-4.5 pb-4"
          style={elevation.card}
        >
          <Text className="text-muted mb-2.5 text-[10px] font-semibold tracking-[0.8px] uppercase">
            {t('expenses.amount')}
          </Text>
          <DisplayAmount
            amount={Number(expense.amount)}
            currency={currency}
            language={language}
            size={34}
            lineHeight={34}
            letterSpacing={-0.7}
          />
          {property ? (
            <Pressable
              onPress={() => router.push(routes.property.detail(property.id))}
              className="mt-3.5 flex-row items-center gap-1.5"
              accessibilityRole="link"
              accessibilityLabel={property.name}
              hitSlop={6}
            >
              <Building2 size={13} color={colors.muted} strokeWidth={2} />
              <Text className="text-muted flex-1 text-[13px]" numberOfLines={1}>
                {property.name}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Text
          className="text-fg mb-2.75 text-[22px] tracking-[-0.55px]"
          style={{ fontFamily: displayFontFamily(theme.name) }}
        >
          {t('common.details')}
        </Text>
        <View
          className="border-card-bd bg-surface mb-5 rounded-xl border px-4.5 pt-1 pb-1.5"
          style={elevation.card}
        >
          {detailRows.map((row, index) => (
            <DetailRow
              key={row.label}
              label={row.label}
              value={row.value}
              isLast={index === detailRows.length - 1}
            />
          ))}
        </View>

        {expense.receipt_photo_url ? (
          <>
            <Text
              className="text-fg mt-2 mb-2.75 text-[22px] tracking-[-0.55px]"
              style={{ fontFamily: displayFontFamily(theme.name) }}
            >
              {t('expenses.receipt')}
            </Text>
            <View
              className="border-card-bd bg-surface mb-5 overflow-hidden rounded-xl border"
              style={elevation.card}
            >
              <Image
                source={{ uri: expense.receipt_photo_url }}
                className="h-55 w-full"
                contentFit="cover"
              />
            </View>
          </>
        ) : null}

        <View className="mt-1 gap-2.5">
          {!paid ? (
            <Pressable
              onPress={handleMarkPaid}
              accessibilityRole="button"
              accessibilityLabel={t('expenses.markPaid')}
              className="bg-primary h-12 items-center justify-center rounded-full"
            >
              <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
                {t('expenses.markPaid')}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={t('common.delete')}
            className="bg-surface-2 h-12 items-center justify-center rounded-full"
          >
            <Text className="text-neg text-sm font-semibold">{t('common.delete')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </DetailScreenScaffold>
  );
}
