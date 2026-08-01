import { Pressable, StyleSheet, View } from 'react-native';
import { User } from 'lucide-react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { Language, RentPayment } from '@/types/app.types';
import {
  formatCurrencyShort,
  formatMonthName,
  formatMonthNameShort,
} from '@/utils/formatters';

export interface PropertyRentCardProps {
  rentAmount: number;
  currency: string;
  language: Language;
  month: number;
  year: number;
  payment?: RentPayment;
  tenantName?: string;
  onStatusPress: () => void;
  onTenantPress?: () => void;
  onMarkPaid?: () => void;
}

export function PropertyRentCard({
  rentAmount,
  currency,
  language,
  month,
  year,
  payment,
  tenantName,
  onStatusPress,
  onTenantPress,
  onMarkPaid,
}: PropertyRentCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const isPaid = payment?.status === 'paid';
  const statusLabel = payment ? t(`rent.${payment.status}`) : t('rent.monthEmpty');
  const statusVariant = payment?.status ?? 'pending';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [styles.header, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onStatusPress}
        accessibilityRole="button"
        accessibilityLabel={`${t('properties.currentRentStatus', {
          month: formatMonthName(month, year, language),
        })}: ${statusLabel}`}
      >
        <Text style={[styles.rentLabel, { color: theme.colors.onSurfaceVariant }]}>
          {t('properties.rentLabel')}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.rentValue, { color: theme.colors.onSurface }]}>
            {formatCurrencyShort(rentAmount, currency, language)}
            <Text style={[styles.rentUnit, { color: theme.colors.onSurfaceVariant }]}>
              {' '}
              {t('properties.perMonthSuffix')}
            </Text>
          </Text>
          <AppBadge
            label={`${formatMonthNameShort(month, year, language)} · ${statusLabel}`}
            variant={statusVariant}
            style={styles.statusBadge}
          />
        </View>
      </Pressable>

      {tenantName ? (
        <>
          <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          <Pressable
            style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
            onPress={onTenantPress}
            disabled={!onTenantPress}
            accessibilityRole="button"
            accessibilityLabel={tenantName}
          >
            <View style={styles.tenant}>
              <User size={16} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
              <Text
                style={[styles.tenantName, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {tenantName}
              </Text>
            </View>
          </Pressable>
        </>
      ) : null}

      {onMarkPaid && !isPaid ? (
        <>
          <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          <AppButton mode="text" onPress={onMarkPaid}>
            {t('rent.markPaid')}
          </AppButton>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  header: {
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rentLabel: {
    ...Typography.bodySmall,
  },
  rentValue: {
    ...Typography.headlineMedium,
  },
  rentUnit: {
    ...Typography.bodyMedium,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  statusBadge: {
    flexShrink: 1,
  },
  tenant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
  },
  tenantName: {
    ...Typography.bodyMedium,
  },
});
