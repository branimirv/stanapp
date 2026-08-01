import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banknote, CheckCircle, FileEdit, PieChart } from 'lucide-react-native';
import { AppBadge } from '@/components/ui/AppBadge';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import type { Language, PaymentStatus, RentPayment } from '@/types/app.types';
import { formatCurrency, formatPeriod } from '@/utils/formatters';

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

const STATUS_VARIANTS: Record<PaymentStatus, 'paid' | 'pending' | 'late' | 'partial'> = {
  paid: 'paid',
  pending: 'pending',
  late: 'late',
  partial: 'partial',
};

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

  const periodLabel = formatPeriod(month, year, language);
  const isPaid = payment?.status === 'paid';
  const displayAmount = payment?.amount ?? rentAmount;

  const actions = [
    ...(!isPaid
      ? [
          {
            key: 'markPaid',
            label: t('rent.markPaid'),
            icon: CheckCircle,
            color: Colors.accent,
            onPress: () => {
              onDismiss();
              onMarkPaid();
            },
          },
          {
            key: 'partial',
            label: t('rent.partialPayment'),
            icon: PieChart,
            color: Colors.warning,
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
      color: Colors.primary,
      onPress: () => {
        onDismiss();
        onAddDetails();
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={styles.content}
          className="bg-card"
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} className="bg-border" />

          <Text className="text-center text-lg font-medium">{periodLabel}</Text>

          <View style={styles.summaryRow}>
            <Text className="text-primary text-2xl font-semibold">
              {formatCurrency(displayAmount, currency, language)}
            </Text>
            {payment ? (
              <AppBadge
                label={t(`rent.${payment.status}`)}
                variant={STATUS_VARIANTS[payment.status]}
              />
            ) : (
              <AppBadge label={t('rent.monthEmpty')} variant="pending" />
            )}
          </View>

          <View style={styles.actions}>
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Pressable
                  key={action.key}
                  style={styles.actionRow}
                  className="border-border"
                  onPress={action.onPress}
                  accessibilityRole="button"
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}22` }]}>
                    <Icon size={20} color={action.color} strokeWidth={2} />
                  </View>
                  <Text className="flex-1 text-lg font-medium">{action.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
