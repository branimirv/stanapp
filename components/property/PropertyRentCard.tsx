import { Pressable, View } from 'react-native';
import { User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
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
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const isPaid = payment?.status === 'paid';
  const statusLabel = payment ? t(`rent.${payment.status}`) : t('rent.monthEmpty');
  const statusVariant = payment?.status ?? 'pending';

  return (
    <View className="bg-card border-border gap-0 rounded-3xl border px-4 py-2.5 shadow-sm shadow-black/5">
      <Pressable
        className="gap-0.5 py-2"
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        onPress={onStatusPress}
        accessibilityRole="button"
        accessibilityLabel={`${t('properties.currentRentStatus', {
          month: formatMonthName(month, year, language),
        })}: ${statusLabel}`}
      >
        <Text className="text-muted-foreground text-xs">{t('properties.rentLabel')}</Text>
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-xl font-semibold">
            {formatCurrencyShort(rentAmount, currency, language)}
            <Text className="text-muted-foreground text-sm"> {t('properties.perMonthSuffix')}</Text>
          </Text>
          <AppBadge
            label={`${formatMonthNameShort(month, year, language)} · ${statusLabel}`}
            variant={statusVariant}
            className="shrink"
          />
        </View>
      </Pressable>

      {tenantName ? (
        <>
          <Separator className="-mx-4 w-auto" />
          <Pressable
            className="min-h-11 flex-row items-center justify-between gap-2 py-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            onPress={onTenantPress}
            disabled={!onTenantPress}
            accessibilityRole="button"
            accessibilityLabel={tenantName}
          >
            <View className="shrink flex-row items-center gap-2">
              <User size={16} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
              <Text className="text-sm" numberOfLines={1}>
                {tenantName}
              </Text>
            </View>
          </Pressable>
        </>
      ) : null}

      {onMarkPaid && !isPaid ? (
        <>
          <Separator className="-mx-4 w-auto" />
          <AppButton mode="text" onPress={onMarkPaid}>
            {t('rent.markPaid')}
          </AppButton>
        </>
      ) : null}
    </View>
  );
}
