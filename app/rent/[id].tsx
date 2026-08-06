import { router, useLocalSearchParams } from 'expo-router';
import { Building2, CircleCheck, CircleAlert, User } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { Spacing } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRentPayment, useRentPaymentMutations } from '@/hooks/useRentPayments';
import { useTenant } from '@/hooks/useTenants';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { theme } = useAppTheme();
  const { colors } = theme;

  const valueNode = (
    <Text
      style={{
        fontFamily: Fonts.sans.semibold,
        fontSize: 13,
        color: onPress ? colors.primary : colors.fg,
        textAlign: 'right',
        flexShrink: 1,
      }}
      numberOfLines={2}
    >
      {value}
    </Text>
  );

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
          fontFamily: Fonts.sans.regular,
          fontSize: 13,
          color: colors.muted,
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="link"
          hitSlop={6}
          style={styles.valueHit}
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
  const { colors, elevation, radius } = theme;
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View
            style={[
              styles.well,
              {
                backgroundColor: paid
                  ? colors.posTint
                  : late
                    ? colors.negTint
                    : colors.primaryTint,
              },
            ]}
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
              {t('rent.paymentDetails')}
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
              {periodLabel}
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
              style={styles.linkRow}
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
          {tenantName && tenant ? (
            <Pressable
              onPress={() => router.push(`/tenant/${tenant.id}`)}
              style={styles.linkRow}
              accessibilityRole="link"
              accessibilityLabel={tenantName}
              hitSlop={6}
            >
              <User size={13} color={colors.muted} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: Fonts.sans.regular,
                  fontSize: 13,
                  color: colors.muted,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {tenantName}
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
              onPress={row.onPress}
              isLast={index === detailRows.length - 1}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {!paid ? (
            <Pressable
              onPress={handleMarkPaid}
              accessibilityRole="button"
              accessibilityLabel={t('rent.markPaid')}
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
                {t('rent.markPaid')}
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
    width: 58,
    height: 58,
    borderRadius: 999,
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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
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
  valueHit: {
    flexShrink: 1,
    alignItems: 'flex-end',
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
