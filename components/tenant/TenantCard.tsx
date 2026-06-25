import { differenceInDays, parseISO } from 'date-fns';
import { Calendar, Mail, Phone } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Language, Tenant } from '@/types/app.types';

type ContractStatus = 'active' | 'expiring_soon' | 'expired';

function getContractStatus(tenant: Tenant): ContractStatus {
  if (!tenant.is_active) return 'expired';
  if (!tenant.contract_end) return 'active';

  const daysUntilEnd = differenceInDays(parseISO(tenant.contract_end), new Date());
  if (daysUntilEnd < 0) return 'expired';
  if (daysUntilEnd <= CONTRACT_EXPIRING_DAYS) return 'expiring_soon';
  return 'active';
}

const CONTRACT_VARIANTS = {
  active: 'success',
  expiring_soon: 'warning',
  expired: 'error',
} as const;

const CONTRACT_LABELS = {
  active: 'tenants.active',
  expiring_soon: 'tenants.expiringSoon',
  expired: 'tenants.expired',
} as const;

export interface TenantCardProps {
  tenant: Tenant;
  currency?: string;
  language?: Language;
  onPress?: () => void;
}

export function TenantCard({
  tenant,
  currency = 'EUR',
  language = 'hr',
  onPress,
}: TenantCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const contractStatus = getContractStatus(tenant);
  const fullName = `${tenant.first_name} ${tenant.last_name}`;

  return (
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
            <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {fullName}
            </Text>
            <AppBadge
              label={t(CONTRACT_LABELS[contractStatus])}
              variant={CONTRACT_VARIANTS[contractStatus]}
            />
          </View>

          <View style={styles.metaRow}>
            <Calendar size={14} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(tenant.contract_start, resolvedLanguage)}
              {' — '}
              {tenant.contract_end
                ? formatDate(tenant.contract_end, resolvedLanguage)
                : t('tenants.noContractEnd')}
            </Text>
          </View>

          {tenant.email ? (
            <View style={styles.metaRow}>
              <Mail size={14} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
              <Text
                style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {tenant.email}
              </Text>
            </View>
          ) : null}

          {tenant.phone ? (
            <View style={styles.metaRow}>
              <Phone size={14} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
              <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                {tenant.phone}
              </Text>
            </View>
          ) : null}

          {Number(tenant.deposit_amount) > 0 ? (
            <Text style={[styles.deposit, { color: theme.colors.primary }]}>
              {t('tenants.deposit')}:{' '}
              {formatCurrency(Number(tenant.deposit_amount), currency, resolvedLanguage)}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  content: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    ...Typography.titleMedium,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  deposit: {
    ...Typography.labelLarge,
    marginTop: Spacing.xs,
  },
});
