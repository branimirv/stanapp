import { Calendar, CheckCircle, Trash2 } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { Colors, Typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import { formatDate, formatPeriod } from '@/utils/formatters';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';

export interface RentPaymentCardProps {
  payment: RentPayment;
  tenantName?: string;
  propertyName?: string;
  currency?: string;
  language?: Language;
  onPress?: (payment: RentPayment) => void;
  onMarkPaid?: (paymentId: string) => void;
  onDelete?: (paymentId: string) => void;
}

function StatusChip({ status, label }: { status: PaymentStatus; label: string }) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  let backgroundColor = colors.surface2;
  let color = colors.muted;

  if (status === 'paid') {
    backgroundColor = colors.posTint;
    color = colors.pos;
  } else if (status === 'late') {
    backgroundColor = colors.negTint;
    color = colors.neg;
  } else if (status === 'pending') {
    backgroundColor = colors.primaryTint;
    color = colors.primary;
  } else if (status === 'partial') {
    backgroundColor = colors.primaryTint;
    color = colors.primary;
  }

  return (
    <View style={[styles.chip, { backgroundColor }]}>
      {status === 'paid' ? (
        <CheckCircle size={12} color={color} strokeWidth={2} />
      ) : null}
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 11,
          letterSpacing: -0.05,
          color,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function RentPaymentCardComponent({
  payment,
  tenantName,
  propertyName,
  currency = 'EUR',
  language = 'hr',
  onPress,
  onMarkPaid,
  onDelete,
}: RentPaymentCardProps) {
  const { theme } = useAppTheme();
  const { colors, elevation, radius } = theme;
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isPaid = payment.status === 'paid';
  const isLate = payment.status === 'late';
  const handlePress = onPress ? () => onPress(payment) : undefined;

  const dateLine = (() => {
    if (!payment.payment_date) return null;
    const date = formatDate(payment.payment_date, resolvedLanguage);
    if (isLate) {
      return t('rent.paidLateDate', { date });
    }
    return `${t('rent.paymentDate')}: ${date}`;
  })();

  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      {!isPaid && onMarkPaid ? (
        <Pressable
          style={[styles.swipeBtn, { backgroundColor: Colors.accent }]}
          onPress={() => {
            swipeableRef.current?.close();
            onMarkPaid(payment.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('rent.markPaid')}
        >
          <CheckCircle size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={[styles.swipeLabel, { color: Colors.textInverse }]}>
            {t('rent.markPaid')}
          </Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          style={[styles.swipeBtn, { backgroundColor: Colors.danger }]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(payment.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={[styles.swipeLabel, { color: Colors.textInverse }]}>
            {t('common.delete')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable
      onPress={handlePress}
      disabled={!handlePress}
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
      <View style={styles.top}>
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.sans.semibold,
            fontSize: Typography.text.rowTitle.size,
            color: colors.fg,
          }}
          numberOfLines={1}
        >
          {formatPeriod(payment.period_month, payment.period_year, resolvedLanguage).replace(
            /^./,
            (ch) => ch.toLocaleUpperCase(resolvedLanguage === 'en' ? 'en' : 'hr'),
          )}
        </Text>
        <StatusChip status={payment.status} label={t(`rent.${payment.status}`)} />
      </View>

      {propertyName ? (
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: Typography.text.caption.size,
            color: colors.muted,
            marginTop: 4,
          }}
          numberOfLines={1}
        >
          {propertyName}
        </Text>
      ) : null}

      {tenantName ? (
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 12.5,
            color: colors.muted,
            marginTop: propertyName ? 2 : 4,
          }}
          numberOfLines={1}
        >
          {tenantName}
        </Text>
      ) : null}

      <DisplayAmount
        amount={Number(payment.amount)}
        currency={payment.currency ?? currency}
        language={resolvedLanguage}
        size={28}
        style={{ marginTop: 12 }}
      />

      {dateLine ? (
        <View style={styles.dateRow}>
          <Calendar size={13} color={colors.muted} strokeWidth={2} />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.sans.regular,
              fontSize: 11.5,
              color: colors.muted,
            }}
            numberOfLines={1}
          >
            {dateLine}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );

  if (!onMarkPaid && !onDelete) {
    return card;
  }

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      {card}
    </Swipeable>
  );
}

export const RentPaymentCard = memo(RentPaymentCardComponent);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
    flexShrink: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  swipeActions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  swipeBtn: {
    marginLeft: 4,
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  swipeLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    textAlign: 'center',
  },
});
