import { Banknote, CheckCircle, FileEdit, PieChart } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';
import { formatPeriod } from '@/utils/formatters';

export interface RentMonthActionSheetProps {
  visible: boolean;
  onDismiss: () => void;
  month: number;
  year: number;
  payment?: RentPayment;
  rentAmount: number;
  currency: string;
  language: Language;
  onMarkPaid: () => void;
  onPartialPayment: () => void;
  onAddDetails: () => void;
}

function StatusChip({ status, label }: { status: PaymentStatus | 'empty'; label: string }) {
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
  } else if (status === 'pending' || status === 'partial') {
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

/**
 * Month actions for Najam — AppBottomSheet + sibling BlurOverlay on the host screen.
 */
export function RentMonthActionSheet({
  visible,
  onDismiss,
  month,
  year,
  payment,
  rentAmount,
  currency,
  language,
  onMarkPaid,
  onPartialPayment,
  onAddDetails,
}: RentMonthActionSheetProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const periodLabel = formatPeriod(month, year, language).replace(/^./, (ch) =>
    ch.toLocaleUpperCase(language === 'en' ? 'en' : 'hr'),
  );
  const isPaid = payment?.status === 'paid';
  const displayAmount = payment?.amount ?? rentAmount;

  const actions = [
    ...(!isPaid
      ? [
          {
            key: 'markPaid',
            label: t('rent.markPaid'),
            icon: CheckCircle,
            tint: { bg: colors.posTint, fg: colors.pos },
            onPress: () => {
              onDismiss();
              onMarkPaid();
            },
          },
          {
            key: 'partial',
            label: t('rent.partialPayment'),
            icon: PieChart,
            tint: { bg: colors.primaryTint, fg: colors.primary },
            onPress: () => {
              onDismiss();
              onPartialPayment();
            },
          },
        ]
      : []),
    {
      key: 'details',
      label: payment ? t('rent.editPayment') : t('rent.addDetails'),
      icon: payment ? FileEdit : Banknote,
      tint: { bg: colors.primaryTint, fg: colors.primary },
      onPress: () => {
        onDismiss();
        onAddDetails();
      },
    },
  ];

  return (
    <AppBottomSheet visible={visible} onDismiss={onDismiss} title={periodLabel}>
      <View style={styles.summary}>
        <DisplayAmount
          amount={Number(displayAmount)}
          currency={currency}
          language={language}
          size={28}
        />
        {payment ? (
          <StatusChip
            status={payment.status}
            label={t(`rent.${payment.status}`)}
          />
        ) : (
          <StatusChip status="empty" label={t('rent.monthEmpty')} />
        )}
      </View>

      <View style={styles.actions}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.key}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={[styles.actionRow, { backgroundColor: colors.surface2 }]}
            >
              <View style={[styles.iconWell, { backgroundColor: action.tint.bg }]}>
                <Icon size={20} color={action.tint.fg} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: colors.fg,
                  flex: 1,
                }}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
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
  actions: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 56,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
