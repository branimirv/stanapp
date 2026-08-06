import { differenceInDays, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { colors, elevation, radius } = theme;
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

  let chipBg = colors.posTint;
  let chipFg = colors.pos;
  if (contractStatus === 'expiring_soon') {
    chipBg = colors.chartTint[4];
    chipFg = colors.chart[4];
  } else if (contractStatus === 'expired') {
    chipBg = colors.negTint;
    chipFg = colors.neg;
  }

  return (
    <Pressable
      onPress={onPress ? () => onPress(tenant.id) : undefined}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: radius.xl,
          ...elevation.card,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={fullName}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primaryTint }]}>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 15,
            fontWeight: theme.typography.displayWeight,
            color: colors.primary,
          }}
        >
          {initials}
        </Text>
      </View>

      <View style={styles.body}>
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 15,
            letterSpacing: -0.15,
            color: colors.fg,
          }}
          numberOfLines={1}
        >
          {fullName}
        </Text>

        <View style={[styles.chip, { backgroundColor: chipBg }]}>
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 11,
              letterSpacing: -0.05,
              color: chipFg,
            }}
            numberOfLines={1}
          >
            {t(CONTRACT_LABELS[contractStatus])}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Calendar size={13} color={colors.muted} strokeWidth={2} />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.sans.regular,
              fontSize: 12,
              color: colors.muted,
            }}
            numberOfLines={1}
          >
            {sinceLabel} · {endLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const PropertyTenantCard = memo(PropertyTenantCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
});
