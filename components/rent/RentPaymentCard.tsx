import { Calendar, CheckCircle, Trash2 } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, formatDate, formatPeriod } from '@/utils/formatters';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';

const STATUS_VARIANTS: Record<PaymentStatus, 'paid' | 'pending' | 'late' | 'partial'> = {
  paid: 'paid',
  pending: 'pending',
  late: 'late',
  partial: 'partial',
};

export interface RentPaymentCardProps {
  payment: RentPayment;
  tenantName?: string;
  propertyName?: string;
  currency?: string;
  language?: Language;
  onPress?: () => void;
  onMarkPaid?: () => void;
  onDelete?: () => void;
}

export function RentPaymentCard({
  payment,
  tenantName,
  propertyName,
  currency = 'EUR',
  language = 'hr',
  onPress,
  onMarkPaid,
  onDelete,
}: RentPaymentCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isPaid = payment.status === 'paid';

  const renderRightActions = () => (
    <View style={styles.actions}>
      {!isPaid && onMarkPaid ? (
        <Pressable
          style={[styles.action, styles.paidAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onMarkPaid();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('rent.markPaid')}
        >
          <CheckCircle size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.actionLabel}>{t('rent.markPaid')}</Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          style={[styles.action, styles.deleteAction]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text style={styles.actionLabel}>{t('common.delete')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card
        mode="elevated"
        style={[
          styles.card,
          { backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface },
        ]}
      >
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.period, { color: theme.colors.onSurface }]}>
              {formatPeriod(payment.period_month, payment.period_year, resolvedLanguage)}
            </Text>
            <AppBadge
              label={t(`rent.${payment.status}`)}
              variant={STATUS_VARIANTS[payment.status]}
            />
          </View>

          {propertyName ? (
            <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
              {propertyName}
            </Text>
          ) : null}

          {tenantName ? (
            <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
              {tenantName}
            </Text>
          ) : null}

          <Text style={[styles.amount, { color: theme.colors.primary }]}>
            {formatCurrency(Number(payment.amount), payment.currency ?? currency, resolvedLanguage)}
          </Text>

          {payment.payment_date ? (
            <View style={styles.dateRow}>
              <Calendar size={14} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
              <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                {t('rent.paymentDate')}: {formatDate(payment.payment_date, resolvedLanguage)}
              </Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  content: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  period: {
    ...Typography.titleMedium,
    flex: 1,
  },
  meta: {
    ...Typography.bodyMedium,
  },
  amount: {
    ...Typography.headlineMedium,
    marginTop: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  dateText: {
    ...Typography.bodySmall,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  action: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: 12,
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  paidAction: {
    backgroundColor: Colors.accent,
  },
  deleteAction: {
    backgroundColor: Colors.danger,
  },
  actionLabel: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    textAlign: 'center',
  },
});
