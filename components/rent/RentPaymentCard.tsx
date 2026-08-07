import { Calendar, CheckCircle, Trash2 } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
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

function statusTone(status: PaymentStatus): 'pos' | 'neg' | 'primary' | 'muted' {
  if (status === 'paid') return 'pos';
  if (status === 'late') return 'neg';
  if (status === 'pending' || status === 'partial') return 'primary';
  return 'muted';
}

function StatusChip({ status, label }: { status: PaymentStatus; label: string }) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const tone = statusTone(status);
  const color =
    tone === 'pos'
      ? colors.pos
      : tone === 'neg'
        ? colors.neg
        : tone === 'primary'
          ? colors.primary
          : colors.muted;

  return (
    <View
      className={cn(
        'shrink-0 flex-row items-center gap-1.5 rounded-full px-2.75 py-1.25',
        tone === 'pos' && 'bg-pos-tint',
        tone === 'neg' && 'bg-neg-tint',
        tone === 'primary' && 'bg-primary-tint',
        tone === 'muted' && 'bg-surface-2',
      )}
    >
      {status === 'paid' ? <CheckCircle size={12} color={color} strokeWidth={2} /> : null}
      <Text
        className={cn(
          'text-[11px] font-semibold tracking-[-0.05px]',
          tone === 'pos' && 'text-pos',
          tone === 'neg' && 'text-neg',
          tone === 'primary' && 'text-primary',
          tone === 'muted' && 'text-muted',
        )}
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
  const { colors, elevation } = theme;
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
    <View className="mb-3 flex-row">
      {!isPaid && onMarkPaid ? (
        <Pressable
          className="bg-pos ml-1 w-22 items-center justify-center gap-1 rounded-sm px-2"
          onPress={() => {
            swipeableRef.current?.close();
            onMarkPaid(payment.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('rent.markPaid')}
        >
          <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-center text-[11px] font-medium text-white">{t('rent.markPaid')}</Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          className="bg-neg ml-1 w-22 items-center justify-center gap-1 rounded-sm px-2"
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(payment.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-center text-[11px] font-medium text-white">{t('common.delete')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable
      onPress={handlePress}
      disabled={!handlePress}
      className="border-card-bd bg-surface mb-3 rounded-xl border px-4.5 py-4"
      style={elevation.card}
    >
      <View className="flex-row items-start justify-between gap-2">
        <Text className="text-fg flex-1 text-base font-semibold" numberOfLines={1}>
          {formatPeriod(payment.period_month, payment.period_year, resolvedLanguage).replace(
            /^./,
            (ch) => ch.toLocaleUpperCase(resolvedLanguage === 'en' ? 'en' : 'hr'),
          )}
        </Text>
        <StatusChip status={payment.status} label={t(`rent.${payment.status}`)} />
      </View>

      {propertyName ? (
        <Text className="text-muted mt-1 text-sm" numberOfLines={1}>
          {propertyName}
        </Text>
      ) : null}

      {tenantName ? (
        <Text
          className={cn('text-muted text-[12.5px]', propertyName ? 'mt-0.5' : 'mt-1')}
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
        <View className="mt-3 flex-row items-center gap-1.5">
          <Calendar size={13} color={colors.muted} strokeWidth={2} />
          <Text className="text-muted flex-1 text-[11.5px]" numberOfLines={1}>
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
