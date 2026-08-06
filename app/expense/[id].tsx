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
import { Spacing } from '@/constants/theme';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useExpense, useExpenseMutations } from '@/hooks/useExpenses';
import { useLocale } from '@/hooks/useLocale';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { cancelExpenseReminders } from '@/lib/notifications';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.lrow,
        !isLast
          ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.bd }
          : null,
      ]}
    >
      <Text
        style={{
          flex: 1,
          fontFamily: Fonts.sans.regular,
          fontSize: 13,
          color: colors.muted,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 13,
          color: colors.fg,
          textAlign: 'right',
          maxWidth: '55%',
        }}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
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
            onPress={() => router.push(`/expense/edit/${expense.id}`)}
            accessibilityLabel={t('common.edit')}
          />
        </StackHeaderActions>
      )}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View
            style={[
              styles.well,
              { backgroundColor: paid ? colors.posTint : colors.negTint },
            ]}
            accessibilityRole="image"
            accessibilityLabel={wellA11y}
          >
            {paid ? (
              <CircleCheck size={22} color={colors.pos} strokeWidth={2} />
            ) : (
              <CircleAlert size={22} color={colors.neg} strokeWidth={2} />
            )}
            {expense.is_recurring ? (
              <View
                style={[
                  styles.recurring,
                  { backgroundColor: colors.surface, borderColor: colors.bd },
                ]}
              >
                <Repeat size={9} color={colors.muted} strokeWidth={2.75} />
              </View>
            ) : null}
          </View>

          <View style={styles.heroBody}>
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 11,
                lineHeight: 14,
                letterSpacing: 1.54,
                textTransform: 'uppercase',
                color: colors.muted,
                marginBottom: 8,
              }}
            >
              {t('expenses.expenseDetails')}
            </Text>
            <Text
              style={{
                fontFamily: displayFontFamily(theme.name),
                fontSize: 28,
                lineHeight: 32,
                letterSpacing: -0.6,
                color: colors.fg,
              }}
              numberOfLines={2}
            >
              {categoryLabel}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.amountCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBd,
              borderRadius: radius.xl,
              ...elevation.card,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 10,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: colors.muted,
              marginBottom: 10,
            }}
          >
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
              onPress={() => router.push(`/property/${property.id}`)}
              style={styles.propertyLink}
              accessibilityRole="link"
              accessibilityLabel={property.name}
              hitSlop={6}
            >
              <Building2 size={13} color={colors.muted} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: Fonts.sans.regular,
                  fontSize: 13,
                  color: colors.muted,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {property.name}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 22,
            letterSpacing: -0.55,
            color: colors.fg,
            marginBottom: 11,
          }}
        >
          {t('common.details')}
        </Text>
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
              style={{
                fontFamily: displayFontFamily(theme.name),
                fontSize: 22,
                letterSpacing: -0.55,
                color: colors.fg,
                marginTop: 8,
                marginBottom: 11,
              }}
            >
              {t('expenses.receipt')}
            </Text>
            <View
              style={[
                styles.receiptCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
            >
              <Image
                source={{ uri: expense.receipt_photo_url }}
                style={styles.receipt}
                contentFit="cover"
              />
            </View>
          </>
        ) : null}

        <View style={styles.actions}>
          {!paid ? (
            <Pressable
              onPress={handleMarkPaid}
              accessibilityRole="button"
              accessibilityLabel={t('expenses.markPaid')}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: colors.onPrimary,
                }}
              >
                {t('expenses.markPaid')}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={t('common.delete')}
            style={[styles.ghostBtn, { backgroundColor: colors.surface2 }]}
          >
            <Text
              style={{
                fontFamily: Fonts.sans.semibold,
                fontSize: 14,
                color: colors.neg,
              }}
            >
              {t('common.delete')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  well: {
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurring: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingTop: 4,
  },
  amountCard: {
    borderWidth: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 16,
    marginBottom: 22,
  },
  propertyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  card: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
    marginBottom: 20,
  },
  lrow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
  },
  receiptCard: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  receipt: {
    width: '100%',
    height: 220,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtn: {
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
