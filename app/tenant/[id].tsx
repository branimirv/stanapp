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
import { Spacing } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenant, useTenantMutations } from '@/hooks/useTenants';
import { displayFontFamily, Fonts } from '@/lib/fonts';
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
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.lrow,
        !isLast ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.bd } : null,
      ]}
    >
      <Text
        style={{
          flex: 1,
          fontFamily: Fonts.sans.regular,
          fontSize: 13,
          color: colors.muted,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 13,
          color: colors.fg,
          textAlign: 'right',
          maxWidth: '55%',
        }}
        numberOfLines={2}
      >
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
      style={styles.qa}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.qaCircle, { backgroundColor: colors.surface2 }]}>
        <Icon size={20} color={colors.primary} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.muted,
          textAlign: 'center',
        }}
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
  const { colors, elevation, radius } = theme;
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

  let chipBg = colors.posTint;
  let chipFg = colors.pos;
  if (contractStatus === 'expiring_soon') {
    chipBg = colors.chartTint[4];
    chipFg = colors.chart[4];
  } else if (contractStatus === 'expired') {
    chipBg = colors.negTint;
    chipFg = colors.neg;
  }

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
          <View style={styles.headerContent}>
            <View style={styles.hero}>
              <View style={[styles.avatar, { backgroundColor: colors.primaryTint }]}>
                <Text
                  style={{
                    fontFamily: displayFontFamily(theme.name),
                    fontSize: 21,
                    fontWeight: theme.typography.displayWeight,
                    color: colors.primary,
                  }}
                >
                  {initials}
                </Text>
              </View>
              <View style={styles.heroBody}>
                <Text
                  style={{
                    fontFamily: displayFontFamily(theme.name),
                    fontSize: 26,
                    lineHeight: 30,
                    letterSpacing: -0.55,
                    color: colors.fg,
                  }}
                  numberOfLines={2}
                >
                  {fullName}
                </Text>
                <View style={styles.heroMeta}>
                  <View style={[styles.chip, { backgroundColor: chipBg }]}>
                    <Text
                      style={{
                        fontFamily: Fonts.sans.semibold,
                        fontSize: 11,
                        letterSpacing: -0.05,
                        color: chipFg,
                      }}
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
                      <Text
                        style={{
                          fontFamily: Fonts.sans.regular,
                          fontSize: 12,
                          color: colors.muted,
                        }}
                        numberOfLines={1}
                      >
                        {propertyLabel}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>

            {quickActions.length > 0 ? (
              <View style={styles.qaRow}>
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
              style={{
                fontFamily: displayFontFamily(theme.name),
                fontSize: 22,
                letterSpacing: -0.55,
                color: colors.fg,
                marginBottom: 11,
              }}
            >
              {t('tenants.contract')}
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBd,
                  borderRadius: radius.xl,
                  ...elevation.card,
                },
              ]}
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
              style={{
                fontFamily: displayFontFamily(theme.name),
                fontSize: 22,
                letterSpacing: -0.55,
                color: colors.fg,
                marginTop: 8,
                marginBottom: 11,
              }}
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
              style={styles.emptyState}
            />
          )
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {hasMorePayments ? (
              <Pressable
                onPress={() => setPaymentsExpanded((current) => !current)}
                style={[styles.ghostBtn, { backgroundColor: colors.surface2 }]}
                accessibilityRole="button"
                accessibilityState={{ expanded: paymentsExpanded }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 14,
                    color: colors.fg,
                  }}
                >
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
                style={[styles.ghostBtn, { backgroundColor: colors.surface2 }]}
                accessibilityRole="button"
                accessibilityLabel={t('tenants.deactivate')}
              >
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 14,
                    color: colors.fg,
                  }}
                >
                  {t('tenants.deactivate')}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleDelete}
              style={[styles.ghostBtn, { backgroundColor: colors.surface2 }]}
              accessibilityRole="button"
              accessibilityLabel={t('tenants.removeTenant')}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 14,
                  color: colors.neg,
                }}
              >
                {t('tenants.removeTenant')}
              </Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.content}
      />
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.xxl,
  },
  headerContent: {
    marginBottom: 4,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    flex: 1,
    minWidth: 0,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
  },
  qa: {
    flex: 1,
    alignItems: 'center',
    gap: 9,
  },
  qaCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
    marginBottom: 20,
  },
  lrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 13,
    paddingVertical: 13,
  },
  emptyState: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 8,
    gap: 10,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 18,
  },
});
