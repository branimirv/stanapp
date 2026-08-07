import { Banknote, CheckCircle, FileEdit, PieChart } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@/components/ui/AppBottomSheet';
import { DisplayAmount } from '@/components/ui/DisplayAmount';
import { useAppTheme } from '@/hooks/useAppTheme';
import { cn } from '@/lib/utils';
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

  let iconColor = colors.muted;
  let toneClass = 'bg-surface-2';
  let textClass = 'text-muted';

  if (status === 'paid') {
    iconColor = colors.pos;
    toneClass = 'bg-pos-tint';
    textClass = 'text-pos';
  } else if (status === 'late') {
    iconColor = colors.neg;
    toneClass = 'bg-neg-tint';
    textClass = 'text-neg';
  } else if (status === 'pending' || status === 'partial') {
    iconColor = colors.primary;
    toneClass = 'bg-primary-tint';
    textClass = 'text-primary';
  }

  return (
    <View className={cn('shrink-0 flex-row items-center gap-1.5 rounded-full px-2.75 py-1.25', toneClass)}>
      {status === 'paid' ? (
        <CheckCircle size={12} color={iconColor} strokeWidth={2} />
      ) : null}
      <Text
        className={cn('text-[11px] font-semibold tracking-[-0.05px]', textClass)}
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
            well: 'bg-pos-tint' as const,
            fg: colors.pos,
            onPress: () => {
              onDismiss();
              onMarkPaid();
            },
          },
          {
            key: 'partial',
            label: t('rent.partialPayment'),
            icon: PieChart,
            well: 'bg-primary-tint' as const,
            fg: colors.primary,
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
      well: 'bg-primary-tint' as const,
      fg: colors.primary,
      onPress: () => {
        onDismiss();
        onAddDetails();
      },
    },
  ];

  return (
    <AppBottomSheet visible={visible} onDismiss={onDismiss} title={periodLabel}>
      <View className="mb-4 flex-row items-center justify-between gap-3">
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

      <View className="gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.key}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              className="bg-surface-2 h-14 flex-row items-center gap-3.5 rounded-full px-3.5"
            >
              <View
                className={cn(
                  'h-10 w-10 items-center justify-center rounded-full',
                  action.well,
                )}
              >
                <Icon size={20} color={action.fg} strokeWidth={2} />
              </View>
              <Text className="text-fg flex-1 text-[15px] font-semibold tracking-[-0.15px]">
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </AppBottomSheet>
  );
}
