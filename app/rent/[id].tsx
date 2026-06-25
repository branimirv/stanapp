import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Spacing, Typography } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import { useRentPayments } from '@/hooks/useRentPayments';
import { supabase } from '@/lib/supabase';
import { useUiStore } from '@/stores/uiStore';
import type { Property, RentPayment, Tenant } from '@/types/app.types';
import { resolveCurrency } from '@/utils/currency';
import { formatCurrency, formatDate, formatPeriod } from '@/utils/formatters';

export default function RentPaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);

  const [payment, setPayment] = useState<RentPayment | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profile } = useProfile();
  const { markAsPaid, remove } = useRentPayments();

  const language = profile?.language ?? (i18n.language as 'en' | 'hr');
  const currency = resolveCurrency(profile, property, payment?.currency);

  const loadPayment = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('rent_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (err) {
      setError(err.message);
      setPayment(null);
      setIsLoading(false);
      return;
    }

    setPayment(data);

    const [{ data: propertyData }, { data: tenantData }] = await Promise.all([
      supabase.from('properties').select('*').eq('id', data.property_id).single(),
      supabase.from('tenants').select('*').eq('id', data.tenant_id).single(),
    ]);

    setProperty(propertyData ?? null);
    setTenant(tenantData ?? null);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

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

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('rent.paymentDetails') }} />
        <SkeletonLoader count={5} style={styles.loader} />
      </>
    );
  }

  if (error || !payment) {
    return (
      <>
        <Stack.Screen options={{ title: t('rent.paymentDetails') }} />
        <ErrorState message={error ?? t('rent.notFound')} onRetry={loadPayment} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('rent.paymentDetails') }} />

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
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
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
