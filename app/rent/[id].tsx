import { router, useLocalSearchParams } from 'expo-router';
import { Building2, CircleCheck, CircleAlert, User } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useLocale } from '@/hooks/useLocale';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRentPayment, useRentPaymentMutations } from '@/hooks/useRentPayments';
import { useTenant } from '@/hooks/useTenants';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import { resolveCurrency } from '@/utils/currency';
import { formatDate, formatPeriod } from '@/utils/formatters';

function DetailRow({
  label,
  value,
  isLast,
  onPress,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  onPress?: () => void;
}) {
  const valueNode = (
    <Text
      className={cn(
        'shrink text-right text-[13px] font-semibold',
        onPress ? 'text-primary' : 'text-fg',
      )}
      numberOfLines={2}
    >
      {value}
    </Text>
  );

  return (
    <View
      className={cn(
        'flex-row items-start justify-between gap-3 py-3.5',
        !isLast && 'border-bd border-b',
      )}
      style={!isLast ? { borderBottomWidth: StyleSheet.hairlineWidth } : undefined}
    >
      <Text className="text-muted mr-3 shrink-0 text-[13px]">{label}</Text>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="link"
          hitSlop={6}
          className="shrink items-end"
        >
          {valueNode}
        </Pressable>
      ) : (
        valueNode
      )}
    </View>
  );
}

export default function RentPaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const { rentPayment: payment, isLoading, error, refetch: loadPayment } = useRentPayment(id);
  const { property } = useProperty(payment?.property_id ?? undefined);
  const { tenant } = useTenant(payment?.tenant_id ?? undefined);

  const { profile } = useProfile();
  const { markAsPaid, remove } = useRentPaymentMutations();

  const { language } = useLocale();
  const currency = resolveCurrency(profile, property, payment?.currency);

  const handleMarkPaid = () => {
    if (!payment) return;

    showConfirmDialog({
      title: t('confirm.markPaymentPaidTitle'),
      message: t('confirm.markPaymentPaidMessage'),
      confirmLabel: t('rent.markPaid'),
      onConfirm: async () => {
        try {
          await markAsPaid(payment.id);
          showToast({ message: t('rent.markedPaid'), type: 'success' });
          await loadPayment();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('rent.markPaidFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  const handleDelete = () => {
    if (!payment) return;

    showConfirmDialog({
      title: t('confirm.deletePaymentTitle'),
      message: t('confirm.deletePaymentMessage'),
      confirmLabel: t('common.delete'),
      destructive: true,
      onConfirm: async () => {
        try {
          await remove(payment.id);
          showToast({ message: t('rent.deleteSuccess'), type: 'success' });
          router.back();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('rent.deleteFailed'),
            type: 'error',
          });
        }
      },
    });
  };

  if (isLoading || error || !payment) {
    return (
      <DetailScreenScaffold
        title={t('rent.paymentDetails')}
        hideHeaderTitle
        isLoading={isLoading}
        isReady={Boolean(payment)}
        error={error}
        notFoundMessage={t('rent.notFound')}
        onRetry={loadPayment}
      >
        {null}
      </DetailScreenScaffold>
    );
  }

  const paid = payment.status === 'paid';
  const late = payment.status === 'late';
  const periodLabel = formatPeriod(payment.period_month, payment.period_year, language);
  const tenantName = tenant
    ? `${tenant.first_name} ${tenant.last_name}`.trim()
    : null;

  const detailRows: {
    label: string;
    value: string;
    onPress?: () => void;
  }[] = [
    {
      label: t('rent.status'),
      value: t(`rent.${payment.status}`),
    },
  ];

  if (payment.payment_date) {
    detailRows.push({
      label: t('rent.paymentDate'),
      value: formatDate(payment.payment_date, language),
    });
  }

  if (payment.notes?.trim()) {
    detailRows.push({
      label: t('common.notes'),
      value: payment.notes.trim(),
    });
  }

  return (
    <DetailScreenScaffold
      title={periodLabel}
      hideHeaderTitle
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={t('rent.notFound')}
      onRetry={loadPayment}
    >
      <ScrollView
        contentContainerClassName="px-gutter pb-12"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4.5 flex-row items-start gap-3.5">
          <View
            className={cn(
              'h-14.5 w-14.5 items-center justify-center rounded-full',
              paid ? 'bg-pos-tint' : late ? 'bg-neg-tint' : 'bg-primary-tint',
            )}
            accessibilityRole="image"
            accessibilityLabel={t(`rent.${payment.status}`)}
          >
            {paid ? (
              <CircleCheck size={22} color={colors.pos} strokeWidth={2} />
            ) : (
              <CircleAlert
                size={22}
                color={late ? colors.neg : colors.primary}
                strokeWidth={2}
              />
            )}
          </View>

          <View className="min-w-0 flex-1 justify-center pt-1">
            <Text className="text-muted mb-2 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
              {t('rent.paymentDetails')}
            </Text>
            <Text
              className="text-fg text-[28px] tracking-[-0.6px]"
              style={{
                fontFamily: displayFontFamily(theme.name),
                lineHeight: 32,
              }}
              numberOfLines={2}
            >
              {periodLabel}
            </Text>
          </View>
        </View>

        <View
          className="border-card-bd bg-surface mb-5.5 rounded-xl border px-4.5 pt-4.5 pb-4"
          style={elevation.card}
        >
          <Text className="text-muted mb-2.5 text-[10px] font-semibold tracking-[0.8px] uppercase">
            {t('rent.amount')}
          </Text>
          <DisplayAmount
            amount={Number(payment.amount)}
            currency={currency}
            language={language}
            size={34}
            lineHeight={34}
            letterSpacing={-0.7}
          />
          {property ? (
            <Pressable
              onPress={() => router.push(`/property/${property.id}`)}
              className="mt-3 flex-row items-center gap-1.5"
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
          {tenantName && tenant ? (
            <Pressable
              onPress={() => router.push(`/tenant/${tenant.id}`)}
              className="mt-3 flex-row items-center gap-1.5"
              accessibilityRole="link"
              accessibilityLabel={tenantName}
              hitSlop={6}
            >
              <User size={13} color={colors.muted} strokeWidth={2} />
              <Text className="text-muted flex-1 text-[13px]" numberOfLines={1}>
                {tenantName}
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
              onPress={row.onPress}
              isLast={index === detailRows.length - 1}
            />
          ))}
        </View>

        <View className="mt-1 gap-2.5">
          {!paid ? (
            <Pressable
              onPress={handleMarkPaid}
              accessibilityRole="button"
              accessibilityLabel={t('rent.markPaid')}
              className="bg-primary h-12 items-center justify-center rounded-full"
            >
              <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
                {t('rent.markPaid')}
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
