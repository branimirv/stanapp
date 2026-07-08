import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { Spacing, Typography } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRentPayment, useRentPaymentMutations } from '@/hooks/useRentPayments';
import { useTenant } from '@/hooks/useTenants';
import { useUiStore } from '@/stores/uiStore';
import { resolveCurrency } from '@/utils/currency';
import { formatCurrency, formatDate, formatPeriod } from '@/utils/formatters';

export default function RentPaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
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

  return (
    <DetailScreenScaffold
      title={t('rent.paymentDetails')}
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={t('rent.notFound')}
      onRetry={loadPayment}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.period, { color: theme.colors.onSurface }]}>
            {formatPeriod(payment.period_month, payment.period_year, language)}
          </Text>
          <AppBadge label={t(`rent.${payment.status}`)} variant={payment.status} />
        </View>

        <Text style={[styles.amount, { color: theme.colors.primary }]}>
          {formatCurrency(payment.amount, currency, language)}
        </Text>

        {property ? (
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={() => router.push(`/property/${property.id}`)}
          >
            {property.name}
          </Text>
        ) : null}

        {tenant ? (
          <Text
            style={[styles.link, { color: theme.colors.primary }]}
            onPress={() => router.push(`/tenant/${tenant.id}`)}
          >
            {tenant.first_name} {tenant.last_name}
          </Text>
        ) : null}

        <Divider style={styles.divider} />

        {payment.payment_date ? (
          <Text style={[styles.row, { color: theme.colors.onSurfaceVariant }]}>
            {t('rent.paymentDate')}: {formatDate(payment.payment_date, language)}
          </Text>
        ) : null}

        {payment.notes ? (
          <>
            <Text style={[styles.section, { color: theme.colors.onSurface }]}>
              {t('common.notes')}
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{payment.notes}</Text>
          </>
        ) : null}

        <View style={styles.actions}>
          {payment.status !== 'paid' ? (
            <AppButton mode="contained" onPress={handleMarkPaid}>
              {t('rent.markPaid')}
            </AppButton>
          ) : null}
          <AppButton mode="outlined" textColor={theme.colors.error} onPress={handleDelete}>
            {t('common.delete')}
          </AppButton>
        </View>
      </ScrollView>
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  period: {
    ...Typography.headlineMedium,
  },
  amount: {
    ...Typography.displayMedium,
  },
  link: {
    ...Typography.bodyMedium,
  },
  divider: {
    marginVertical: Spacing.sm,
  },
  row: {
    ...Typography.bodyMedium,
  },
  section: {
    ...Typography.titleMedium,
    marginTop: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
