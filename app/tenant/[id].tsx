import { differenceInDays, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowDownToLine,
  ChevronRight,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { StackHeaderActions } from '@/components/ui/StackHeaderActions';
import { listPerformanceProps } from '@/constants/list';
import { CONTRACT_EXPIRING_DAYS } from '@/constants/config';
import { useLocale } from '@/hooks/useLocale';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenant, useTenantMutations } from '@/hooks/useTenants';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import type { Language, Tenant } from '@/types/app.types';
import { getInitials } from '@/utils/avatar';
import { resolveCurrency } from '@/utils/currency';
import { formatCurrencyShort, formatDate } from '@/utils/formatters';

const PREVIEW_COUNT = 3;

type ContractStatus = 'active' | 'expiring_soon' | 'expired';

function getContractStatus(tenant: Tenant): ContractStatus {
  if (!tenant.is_active) return 'expired';
  if (!tenant.contract_end) return 'active';

  const daysLeft = differenceInDays(parseISO(tenant.contract_end), new Date());
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= CONTRACT_EXPIRING_DAYS) return 'expiring_soon';
  return 'active';
}

const STATUS_LABELS = {
  active: 'tenants.active',
  expiring_soon: 'tenants.expiringSoon',
  expired: 'tenants.expired',
} as const;

function openUrl(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

function ContractRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between gap-3.25 py-3.25',
        !isLast && 'border-bd border-b',
      )}
      style={!isLast ? { borderBottomWidth: StyleSheet.hairlineWidth } : undefined}
    >
      <Text className="text-muted flex-1 text-[13px]">{label}</Text>
      <Text className="text-fg max-w-[55%] text-right text-[13px] font-semibold" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onPress,
  accessibilityLabel,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2.25"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View className="bg-surface-2 h-12 w-12 items-center justify-center rounded-full">
        <Icon size={20} color={colors.primary} strokeWidth={2} />
      </View>
      <Text
        className="text-muted text-center text-[10px] font-semibold tracking-[0.8px] uppercase"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function TenantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const showToast = useUiStore((s) => s.showToast);
  const showConfirmDialog = useUiStore((s) => s.showConfirmDialog);
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);

  const { tenant, isLoading, error, refetch: loadTenant } = useTenant(id);
  const { property } = useProperty(tenant?.property_id ?? undefined);

  const { profile } = useProfile();
  const { language } = useLocale();
  const currency = resolveCurrency(profile, property);

  const { update, remove } = useTenantMutations();
  const { rentPayments, isLoading: paymentsLoading } = useRentPayments({
    tenantId: id,
  });

  const sortedPayments = useMemo(() => {
    return [...rentPayments].sort((a, b) => {
      if (a.period_year !== b.period_year) return b.period_year - a.period_year;
      return b.period_month - a.period_month;
    });
  }, [rentPayments]);

  const visiblePayments = useMemo(() => {
    if (paymentsExpanded || sortedPayments.length <= PREVIEW_COUNT) {
      return sortedPayments;
    }
    return sortedPayments.slice(0, PREVIEW_COUNT);
  }, [paymentsExpanded, sortedPayments]);

  const hasMorePayments = sortedPayments.length > PREVIEW_COUNT;

  const handleDeactivate = useCallback(() => {
    if (!tenant) return;

    showConfirmDialog({
      title: t('confirm.deactivateTenantTitle'),
      message: t('confirm.deactivateTenantMessage'),
      confirmLabel: t('tenants.deactivate'),
      destructive: true,
      onConfirm: async () => {
        try {
          await update(tenant.id, { is_active: false });
          showToast({ message: t('tenants.saveSuccess'), type: 'success' });
          await loadTenant();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('tenants.saveFailed'),
            type: 'error',
          });
        }
      },
    });
  }, [loadTenant, showConfirmDialog, showToast, t, tenant, update]);

  const handleDelete = useCallback(() => {
    if (!tenant) return;

    showConfirmDialog({
      title: t('confirm.deleteTenantTitle'),
      message: t('confirm.deleteTenantMessage'),
      confirmLabel: t('common.remove'),
      destructive: true,
      icon: 'userMinus',
      onConfirm: async () => {
        try {
          await remove(tenant.id);
          showToast({ message: t('tenants.deleteSuccess'), type: 'success' });
          router.back();
        } catch (err) {
          showToast({
            message: err instanceof Error ? err.message : t('tenants.deleteFailed'),
            type: 'error',
          });
        }
      },
    });
  }, [remove, showConfirmDialog, showToast, t, tenant]);

  if (isLoading || error || !tenant) {
    return (
      <DetailScreenScaffold
        title={t('tenants.tenantDetails')}
        isLoading={isLoading}
        isReady={Boolean(tenant)}
        error={error}
        notFoundMessage={t('tenants.notFound')}
        onRetry={loadTenant}
      >
        {null}
      </DetailScreenScaffold>
    );
  }

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
          onPress: () => openUrl(`tel:${tenant.phone}`),
        }
      : null,
    tenant.phone
      ? {
          key: 'message',
          icon: MessageCircle,
          label: t('tenants.qaMessage'),
          accessibilityLabel: t('tenants.messageTenant'),
          onPress: () => openUrl(`sms:${tenant.phone}`),
        }
      : null,
    tenant.email
      ? {
          key: 'email',
          icon: Mail,
          label: t('tenants.qaEmail'),
          accessibilityLabel: t('tenants.emailTenant'),
          onPress: () => openUrl(`mailto:${tenant.email}`),
        }
      : null,
  ].filter(Boolean) as {
    key: string;
    icon: LucideIcon;
    label: string;
    accessibilityLabel: string;
    onPress: () => void;
  }[];

  return (
    <DetailScreenScaffold
      title={fullName}
      hideHeaderTitle
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={t('tenants.notFound')}
      onRetry={loadTenant}
      headerRight={() => (
        <StackHeaderActions>
          <HeaderIconButton
            icon={Pencil}
            onPress={() => router.push(`/tenant/edit/${tenant.id}`)}
            accessibilityLabel={t('common.edit')}
          />
        </StackHeaderActions>
      )}
    >
      <FlatList
        data={paymentsLoading ? [] : visiblePayments}
        keyExtractor={(payment) => payment.id}
        {...listPerformanceProps}
        renderItem={({ item: payment }) => (
          <RentPaymentCard
            payment={payment}
            currency={currency}
            language={language as Language}
          />
        )}
        ListHeaderComponent={
          <View className="mb-1">
            <View className="mb-4.5 flex-row items-start gap-3.5">
              <View className="bg-primary-tint h-[58px] w-[58px] items-center justify-center rounded-full">
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
                      {t(STATUS_LABELS[contractStatus])}
                    </Text>
                  </View>
                  {propertyLabel ? (
                    <Pressable
                      onPress={() => router.push(`/property/${property!.id}`)}
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
                  <QuickAction
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
              <ContractRow
                label={t('tenants.contractStart')}
                value={formatDate(tenant.contract_start, language)}
              />
              <ContractRow
                label={t('tenants.contractEnd')}
                value={
                  tenant.contract_end
                    ? formatDate(tenant.contract_end, language)
                    : t('tenants.noContractEnd')
                }
              />
              <ContractRow
                label={t('properties.monthlyRent')}
                value={formatCurrencyShort(
                  Number(property?.rent_amount ?? 0),
                  currency,
                  language,
                )}
              />
              <ContractRow
                label={t('tenants.depositAmount')}
                value={formatCurrencyShort(Number(tenant.deposit_amount), currency, language)}
                isLast={!tenant.notes}
              />
              {tenant.notes ? (
                <ContractRow label={t('common.notes')} value={tenant.notes} isLast />
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
        }
        ListEmptyComponent={
          paymentsLoading ? null : (
            <EmptyState
              icon={ArrowDownToLine}
              title={t('empty.noRentPayments')}
              subtitle={t('empty.noRentPaymentsHint')}
              ctaLabel={t('rent.addPayment')}
              ctaIcon={Plus}
              onCtaPress={() =>
                router.push({
                  pathname: '/rent/new',
                  params: { propertyId: tenant.property_id, tenantId: tenant.id },
                })
              }
              className="mb-4"
            />
          )
        }
        ListFooterComponent={
          <View className="mt-2 gap-2.5">
            {hasMorePayments ? (
              <Pressable
                onPress={() => setPaymentsExpanded((current) => !current)}
                className="bg-surface-2 min-h-12 flex-row items-center justify-center gap-1.5 rounded-full px-4.5"
                accessibilityRole="button"
                accessibilityState={{ expanded: paymentsExpanded }}
              >
                <Text className="text-fg text-sm font-semibold">
                  {paymentsExpanded ? t('common.showLess') : t('tenants.seeAllPayments')}
                </Text>
                {!paymentsExpanded ? (
                  <ChevronRight size={16} color={colors.fg} strokeWidth={2} />
                ) : null}
              </Pressable>
            ) : null}

            {tenant.is_active ? (
              <Pressable
                onPress={handleDeactivate}
                className="bg-surface-2 min-h-12 flex-row items-center justify-center gap-1.5 rounded-full px-4.5"
                accessibilityRole="button"
                accessibilityLabel={t('tenants.deactivate')}
              >
                <Text className="text-fg text-sm font-semibold">{t('tenants.deactivate')}</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleDelete}
              className="bg-surface-2 min-h-12 flex-row items-center justify-center gap-1.5 rounded-full px-4.5"
              accessibilityRole="button"
              accessibilityLabel={t('tenants.removeTenant')}
            >
              <Text className="text-neg text-sm font-semibold">{t('tenants.removeTenant')}</Text>
            </Pressable>
          </View>
        }
        contentContainerClassName="px-gutter pb-12"
      />
    </DetailScreenScaffold>
  );
}
