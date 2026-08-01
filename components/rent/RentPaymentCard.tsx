import { Calendar, CheckCircle, Trash2 } from 'lucide-react-native';
import { memo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { AppBadge } from '@/components/ui/AppBadge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
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
  onPress?: (payment: RentPayment) => void;
  onMarkPaid?: (paymentId: string) => void;
  onDelete?: (paymentId: string) => void;
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
  const { isDark } = useAppTheme();
  const { t, i18n } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const isPaid = payment.status === 'paid';
  const handlePress = onPress ? () => onPress(payment) : undefined;

  const renderRightActions = () => (
    <View className="mb-2 flex-row">
      {!isPaid && onMarkPaid ? (
        <Pressable
          className="ml-1 w-22 items-center justify-center gap-1 rounded-xl px-2"
          style={{ backgroundColor: Colors.accent }}
          onPress={() => {
            swipeableRef.current?.close();
            onMarkPaid(payment.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('rent.markPaid')}
        >
          <CheckCircle size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text
            className="text-center text-[11px] font-medium"
            style={{ color: Colors.textInverse }}
          >
            {t('rent.markPaid')}
          </Text>
        </Pressable>
      ) : null}
      {onDelete ? (
        <Pressable
          className="ml-1 w-22 items-center justify-center gap-1 rounded-xl px-2"
          style={{ backgroundColor: Colors.danger }}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete(payment.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Trash2 size={20} color={Colors.textInverse} strokeWidth={2} />
          <Text
            className="text-center text-[11px] font-medium"
            style={{ color: Colors.textInverse }}
          >
            {t('common.delete')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const card = (
    <Pressable onPress={handlePress} disabled={!handlePress}>
      <Card
        className="mb-2 gap-1 rounded-xl p-4"
        style={{ backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }}
      >
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-lg font-medium">
            {formatPeriod(payment.period_month, payment.period_year, resolvedLanguage)}
          </Text>
          <AppBadge
            label={t(`rent.${payment.status}`)}
            variant={STATUS_VARIANTS[payment.status]}
          />
        </View>

        {propertyName ? (
          <Text className="text-muted-foreground text-sm">{propertyName}</Text>
        ) : null}

        {tenantName ? (
          <Text className="text-muted-foreground text-sm">{tenantName}</Text>
        ) : null}

        <Text className="text-primary mt-1 text-2xl font-semibold">
          {formatCurrency(Number(payment.amount), payment.currency ?? currency, resolvedLanguage)}
        </Text>

        {payment.payment_date ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Calendar size={14} className="text-muted-foreground" strokeWidth={2} />
            <Text className="text-muted-foreground text-xs">
              {t('rent.paymentDate')}: {formatDate(payment.payment_date, resolvedLanguage)}
            </Text>
          </View>
        ) : null}
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

export const RentPaymentCard = memo(RentPaymentCardComponent);
