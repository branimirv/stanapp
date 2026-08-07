import { differenceInDays, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Language, Tenant } from '@/types/app.types';
import { getInitials } from '@/utils/avatar';
import { formatDate } from '@/utils/formatters';

type ContractStatus = 'active' | 'expiring_soon' | 'expired';

function getContractStatus(tenant: Tenant): ContractStatus {
  if (!tenant.is_active) return 'expired';
  if (!tenant.contract_end) return 'active';

  const daysUntilEnd = differenceInDays(parseISO(tenant.contract_end), new Date());
  if (daysUntilEnd < 0) return 'expired';
  if (daysUntilEnd <= CONTRACT_EXPIRING_DAYS) return 'expiring_soon';
  return 'active';
}

const CONTRACT_LABELS = {
  active: 'tenants.active',
  expiring_soon: 'tenants.expiringSoon',
  expired: 'tenants.expired',
} as const;

export interface PropertyTenantCardProps {
  tenant: Tenant;
  language?: Language;
  onPress?: (tenantId: string) => void;
}

function PropertyTenantCardComponent({
  tenant,
  language = 'hr',
  onPress,
}: PropertyTenantCardProps) {
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const contractStatus = getContractStatus(tenant);
  const fullName = `${tenant.first_name} ${tenant.last_name}`;
  const initials = getInitials(tenant.first_name, tenant.last_name);
  const sinceLabel = t('properties.tenantSince', {
    date: formatDate(tenant.contract_start, resolvedLanguage),
  });
  const endLabel = tenant.contract_end
    ? formatDate(tenant.contract_end, resolvedLanguage)
    : t('tenants.noContractEnd');

  const chipFg =
    contractStatus === 'expiring_soon'
      ? colors.chart[4]
      : contractStatus === 'expired'
        ? colors.neg
        : colors.pos;

  return (
    <Pressable
      onPress={onPress ? () => onPress(tenant.id) : undefined}
      disabled={!onPress}
      className="border-card-bd bg-surface mb-3 flex-row items-start gap-3.5 rounded-xl border p-4.5"
      style={elevation.card}
      accessibilityRole="button"
      accessibilityLabel={fullName}
    >
      <View className="bg-primary-tint h-11 w-11 items-center justify-center rounded-full">
        <Text
          className="text-primary text-[15px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontWeight: theme.typography.displayWeight,
          }}
        >
          {initials}
        </Text>
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-fg text-[15px] font-semibold tracking-[-0.15px]" numberOfLines={1}>
          {fullName}
        </Text>

        <View
          className={cn(
            'mt-2 self-start rounded-full px-2 py-1',
            contractStatus === 'expired' && 'bg-neg-tint',
            contractStatus === 'active' && 'bg-pos-tint',
          )}
          style={
            contractStatus === 'expiring_soon'
              ? { backgroundColor: colors.chartTint[4] }
              : undefined
          }
        >
          <Text
            className="text-[11px] font-semibold tracking-[-0.05px]"
            style={{ color: chipFg }}
            numberOfLines={1}
          >
            {t(CONTRACT_LABELS[contractStatus])}
          </Text>
        </View>

        <View className="mt-2.5 flex-row items-center gap-1.5">
          <Calendar size={13} color={colors.muted} strokeWidth={2} />
          <Text className="text-muted flex-1 text-xs" numberOfLines={1}>
            {sinceLabel} · {endLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const PropertyTenantCard = memo(PropertyTenantCardComponent);
