import { differenceInDays, parseISO } from 'date-fns';
import { Calendar, Mail, MessageSquare, Phone } from 'lucide-react-native';
import { memo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppBadge } from '@/components/ui/AppBadge';
import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getAvatarColor, getInitials } from '@/utils/avatar';
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
  onPress?: (tenantId: string) => void;
}

function openUrl(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

function TenantCardComponent({
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
  const avatarColor = getAvatarColor(fullName);
  const initials = getInitials(tenant.first_name, tenant.last_name);
  const handlePress = onPress ? () => onPress(tenant.id) : undefined;

  return (
    <Pressable onPress={handlePress} disabled={!handlePress}>
      <Card
        mode="elevated"
        style={[
          styles.card,
          { backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface },
        ]}
      >
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: `${avatarColor}22` }]}>
              <Text style={[styles.initials, { color: avatarColor }]}>{initials}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>
                {fullName}
              </Text>
              <AppBadge
                label={t(CONTRACT_LABELS[contractStatus])}
                variant={CONTRACT_VARIANTS[contractStatus]}
              />
            </View>
            <View style={styles.contactActions}>
              {tenant.phone ? (
                <Pressable
                  onPress={() => openUrl(`tel:${tenant.phone}`)}
                  style={[styles.contactButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  accessibilityRole="button"
                  accessibilityLabel={t('tenants.callTenant')}
                >
                  <Phone size={16} color={theme.colors.primary} strokeWidth={2} />
                </Pressable>
              ) : null}
              {tenant.email ? (
                <Pressable
                  onPress={() => openUrl(`mailto:${tenant.email}`)}
                  style={[styles.contactButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  accessibilityRole="button"
                  accessibilityLabel={t('tenants.emailTenant')}
                >
                  <Mail size={16} color={theme.colors.primary} strokeWidth={2} />
                </Pressable>
              ) : null}
              {tenant.phone ? (
                <Pressable
                  onPress={() => openUrl(`sms:${tenant.phone}`)}
                  style={[styles.contactButton, { backgroundColor: theme.colors.surfaceVariant }]}
                  accessibilityRole="button"
                  accessibilityLabel={t('tenants.messageTenant')}
                >
                  <MessageSquare size={16} color={theme.colors.primary} strokeWidth={2} />
                </Pressable>
              ) : null}
            </View>
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

export const TenantCard = memo(TenantCardComponent);

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
    gap: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...Typography.titleMedium,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    ...Typography.titleMedium,
  },
  contactActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
