import { Mail, MessageCircle, Phone } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TenantContractRow } from '@/components/tenant/TenantContractRow';
import { TenantQuickAction } from '@/components/tenant/TenantQuickAction';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Language, Property, Tenant } from '@/types/app.types';
import { getInitials } from '@/utils/avatar';
import { formatCurrencyShort, formatDate } from '@/utils/formatters';
import { CONTRACT_STATUS_LABELS, getContractStatus } from '@/utils/tenant';

type TenantDetailHeaderProps = {
  tenant: Tenant;
  property: Property | null | undefined;
  currency: string;
  language: Language;
  paymentsLoading: boolean;
  onPropertyPress: () => void;
  onCall: () => void;
  onMessage: () => void;
  onEmail: () => void;
};

/** List header: avatar, status, property link, quick actions, contract card, payments title. */
export function TenantDetailHeader({
  tenant,
  property,
  currency,
  language,
  paymentsLoading,
  onPropertyPress,
  onCall,
  onMessage,
  onEmail,
}: TenantDetailHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;

  const fullName = `${tenant.first_name} ${tenant.last_name}`;
  const initials = getInitials(tenant.first_name, tenant.last_name);
  const contractStatus = getContractStatus(tenant);
  const propertyLabel =
    property == null
      ? null
      : property.floor != null
        ? `${property.name} · ${t('properties.floor')} ${property.floor}`
        : property.name;

  const chipClass =
    contractStatus === 'active'
      ? 'bg-pos-tint'
      : contractStatus === 'expired'
        ? 'bg-neg-tint'
        : undefined;
  const chipFg =
    contractStatus === 'active'
      ? colors.pos
      : contractStatus === 'expired'
        ? colors.neg
        : colors.chart[4];
  const chipBgStyle =
    contractStatus === 'expiring_soon' ? { backgroundColor: colors.chartTint[4] } : undefined;

  const quickActions = [
    tenant.phone
      ? {
          key: 'call',
          icon: Phone,
          label: t('tenants.qaCall'),
          accessibilityLabel: t('tenants.callTenant'),
          onPress: onCall,
        }
      : null,
    tenant.phone
      ? {
          key: 'message',
          icon: MessageCircle,
          label: t('tenants.qaMessage'),
          accessibilityLabel: t('tenants.messageTenant'),
          onPress: onMessage,
        }
      : null,
    tenant.email
      ? {
          key: 'email',
          icon: Mail,
          label: t('tenants.qaEmail'),
          accessibilityLabel: t('tenants.emailTenant'),
          onPress: onEmail,
        }
      : null,
  ].filter(Boolean) as {
    key: string;
    icon: typeof Phone;
    label: string;
    accessibilityLabel: string;
    onPress: () => void;
  }[];

  return (
    <View className="mb-1">
      <View className="mb-4.5 flex-row items-start gap-3.5">
        <View className="bg-primary-tint h-14.5 w-14.5 items-center justify-center rounded-full">
          <Text
            className="text-primary text-[21px]"
            style={{
              fontFamily: displayFontFamily(theme.name),
              fontWeight: theme.typography.displayWeight,
            }}
          >
            {initials}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="text-fg text-[26px] tracking-[-0.55px]"
            style={{
              fontFamily: displayFontFamily(theme.name),
              lineHeight: 30,
            }}
            numberOfLines={2}
          >
            {fullName}
          </Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View className={cn('rounded-full px-2 py-1', chipClass)} style={chipBgStyle}>
              <Text
                className="text-[11px] font-semibold tracking-[-0.05px]"
                style={{ color: chipFg }}
              >
                {t(CONTRACT_STATUS_LABELS[contractStatus])}
              </Text>
            </View>
            {propertyLabel ? (
              <Pressable
                onPress={onPropertyPress}
                hitSlop={6}
                accessibilityRole="link"
                accessibilityLabel={propertyLabel}
              >
                <Text className="text-muted text-xs" numberOfLines={1}>
                  {propertyLabel}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {quickActions.length > 0 ? (
        <View className="mb-5.5 flex-row gap-1.5">
          {quickActions.map((action) => (
            <TenantQuickAction
              key={action.key}
              icon={action.icon}
              label={action.label}
              onPress={action.onPress}
              accessibilityLabel={action.accessibilityLabel}
            />
          ))}
        </View>
      ) : null}

      <Text
        className="text-fg mb-2.75 text-[22px] tracking-[-0.55px]"
        style={{ fontFamily: displayFontFamily(theme.name) }}
      >
        {t('tenants.contract')}
      </Text>
      <View
        className="border-card-bd bg-surface mb-5 rounded-xl border px-4.5 pt-1 pb-1.5"
        style={elevation.card}
      >
        <TenantContractRow
          label={t('tenants.contractStart')}
          value={formatDate(tenant.contract_start, language)}
        />
        <TenantContractRow
          label={t('tenants.contractEnd')}
          value={
            tenant.contract_end
              ? formatDate(tenant.contract_end, language)
              : t('tenants.noContractEnd')
          }
        />
        <TenantContractRow
          label={t('properties.monthlyRent')}
          value={formatCurrencyShort(Number(property?.rent_amount ?? 0), currency, language)}
        />
        <TenantContractRow
          label={t('tenants.depositAmount')}
          value={formatCurrencyShort(Number(tenant.deposit_amount), currency, language)}
          isLast={!tenant.notes}
        />
        {tenant.notes ? (
          <TenantContractRow label={t('common.notes')} value={tenant.notes} isLast />
        ) : null}
      </View>

      <Text
        className="text-fg mt-2 mb-2.75 text-[22px] tracking-[-0.55px]"
        style={{ fontFamily: displayFontFamily(theme.name) }}
      >
        {t('tenants.recentPayments')}
      </Text>

      {paymentsLoading ? <SkeletonLoader count={2} /> : null}
    </View>
  );
}
