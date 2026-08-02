import { differenceInDays, parseISO } from 'date-fns';
import { Calendar, Mail, MessageSquare, Phone } from 'lucide-react-native';
import { memo } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppBadge } from '@/components/ui/AppBadge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
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
  const { isDark, theme } = useAppTheme();
  const { t, i18n } = useTranslation();
  const resolvedLanguage = language ?? (i18n.language === 'en' ? 'en' : 'hr');
  const contractStatus = getContractStatus(tenant);
  const fullName = `${tenant.first_name} ${tenant.last_name}`;
  const avatarColor = getAvatarColor(fullName);
  const initials = getInitials(tenant.first_name, tenant.last_name);
  const handlePress = onPress ? () => onPress(tenant.id) : undefined;
  const actionIconColor = theme.colors.primary;
  const metaIconColor = theme.colors.onSurfaceVariant;
  const actionButtonBg = isDark ? Colors.surfaceVariantDark : Colors.surfaceVariant;

  return (
    <Pressable onPress={handlePress} disabled={!handlePress}>
      <Card
        className="mb-2 gap-2 rounded-xl p-4"
        style={{ backgroundColor: isDark ? Colors.surfaceDark : Colors.surface }}
      >
        <View className="flex-row items-center gap-2">
          <View
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: `${avatarColor}22` }}
          >
            <Text className="text-lg font-bold" style={{ color: avatarColor }}>
              {initials}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-lg font-medium" numberOfLines={1}>
              {fullName}
            </Text>
            <AppBadge
              label={t(CONTRACT_LABELS[contractStatus])}
              variant={CONTRACT_VARIANTS[contractStatus]}
            />
          </View>
          <View className="flex-row gap-1">
            {tenant.phone ? (
              <Pressable
                onPress={() => openUrl(`tel:${tenant.phone}`)}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: actionButtonBg }}
                accessibilityRole="button"
                accessibilityLabel={t('tenants.callTenant')}
              >
                <Phone size={16} color={actionIconColor} strokeWidth={2} />
              </Pressable>
            ) : null}
            {tenant.email ? (
              <Pressable
                onPress={() => openUrl(`mailto:${tenant.email}`)}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: actionButtonBg }}
                accessibilityRole="button"
                accessibilityLabel={t('tenants.emailTenant')}
              >
                <Mail size={16} color={actionIconColor} strokeWidth={2} />
              </Pressable>
            ) : null}
            {tenant.phone ? (
              <Pressable
                onPress={() => openUrl(`sms:${tenant.phone}`)}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: actionButtonBg }}
                accessibilityRole="button"
                accessibilityLabel={t('tenants.messageTenant')}
              >
                <MessageSquare size={16} color={actionIconColor} strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center gap-1">
          <Calendar size={14} color={metaIconColor} strokeWidth={2} />
          <Text className="text-muted-foreground flex-1 text-sm">
            {formatDate(tenant.contract_start, resolvedLanguage)}
            {' — '}
            {tenant.contract_end
              ? formatDate(tenant.contract_end, resolvedLanguage)
              : t('tenants.noContractEnd')}
          </Text>
        </View>

        {tenant.email ? (
          <View className="flex-row items-center gap-1">
            <Mail size={14} color={metaIconColor} strokeWidth={2} />
            <Text className="text-muted-foreground flex-1 text-sm" numberOfLines={1}>
              {tenant.email}
            </Text>
          </View>
        ) : null}

        {tenant.phone ? (
          <View className="flex-row items-center gap-1">
            <Phone size={14} color={metaIconColor} strokeWidth={2} />
            <Text className="text-muted-foreground flex-1 text-sm">{tenant.phone}</Text>
          </View>
        ) : null}

        {Number(tenant.deposit_amount) > 0 ? (
          <Text className="text-primary mt-1 text-sm font-semibold">
            {t('tenants.deposit')}:{' '}
            {formatCurrency(Number(tenant.deposit_amount), currency, resolvedLanguage)}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

export const TenantCard = memo(TenantCardComponent);
