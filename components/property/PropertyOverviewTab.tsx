import {
  ArrowDownToLine,
  MapPin,
  Plus,
  Users,
} from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PropertyRentCard } from '@/components/property/PropertyRentCard';
import { PropertyStats } from '@/components/property/PropertyStats';
import { SubPropertyList } from '@/components/property/SubPropertyList';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { AppButton } from '@/components/ui/AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useExpenses } from '@/hooks/useExpenses';
import { useChildProperties, useProperty } from '@/hooks/useProperties';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import { displayFontFamily } from '@/lib/fonts';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/uiStore';
import type { Language } from '@/types/app.types';
import { getCurrentMonthRange, isDateInRange } from '@/utils/dateRange';
import { formatDate } from '@/utils/formatters';
import { openAddressInMaps } from '@/utils/maps';

export interface PropertyOverviewTabProps {
  propertyId: string;
  canManage: boolean;
  isOwner: boolean;
  currency: string;
  language: Language;
  contentTopInset?: number;
  onGoToRent: () => void;
  onGoToTenants: () => void;
  onShowUsageHistory: () => void;
  onRecordPayment: () => void;
}

function PropertyOverviewTabComponent({
  propertyId,
  canManage,
  isOwner,
  currency,
  language,
  contentTopInset = 0,
  onGoToRent,
  onGoToTenants,
  onShowUsageHistory,
  onRecordPayment,
}: PropertyOverviewTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const showToast = useUiStore((s) => s.showToast);
  const [refreshing, setRefreshing] = useState(false);

  const { property, refetch: refetchProperty } = useProperty(propertyId);
  const childProperties = useChildProperties(propertyId);
  const { tenants, refetch: refetchTenants } = useTenants({ propertyId });
  const { expenses, refetch: refetchExpenses } = useExpenses({ propertyId });
  const { rentPayments, refetch: refetchRent } = useRentPayments({ propertyId });

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchProperty(),
      refetchTenants(),
      refetchExpenses(),
      refetchRent(),
    ]);
  }, [refetchExpenses, refetchProperty, refetchRent, refetchTenants]);

  useRefetchOnFocus(refetchAll);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  }, [refetchAll]);

  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);

  const activeTenants = useMemo(
    () => tenants.filter((tenant) => tenant.is_active),
    [tenants],
  );

  const currentMonthExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        isDateInRange(expense.billing_date, currentMonthRange.start, currentMonthRange.end),
      ),
    [currentMonthRange.end, currentMonthRange.start, expenses],
  );

  const monthExpenseTotal = useMemo(
    () => currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [currentMonthExpenses],
  );

  const monthIncome = useMemo(
    () =>
      rentPayments
        .filter(
          (payment) =>
            payment.status === 'paid' &&
            payment.period_month === currentMonthRange.month &&
            payment.period_year === currentMonthRange.year,
        )
        .reduce((sum, payment) => sum + payment.amount, 0),
    [currentMonthRange.month, currentMonthRange.year, rentPayments],
  );

  const rentPayment = useMemo(
    () =>
      rentPayments.find(
        (payment) =>
          payment.period_month === currentMonthRange.month &&
          payment.period_year === currentMonthRange.year,
      ),
    [currentMonthRange.month, currentMonthRange.year, rentPayments],
  );

  const handleOpenAddress = useCallback(async () => {
    if (!property?.address) return;
    const opened = await openAddressInMaps(property.address);
    if (!opened) {
      showToast({ message: t('properties.openInMapsFailed'), type: 'error' });
    }
  }, [property?.address, showToast, t]);

  const handleSelectTenant = useCallback((tenantId: string) => {
    router.push(routes.tenant.detail(tenantId));
  }, []);

  const handleAddExpense = useCallback(() => {
    router.push({ pathname: routes.expense.new, params: { propertyId } });
  }, [propertyId]);

  const handleOpenMembers = useCallback(() => {
    router.push(routes.property.members(propertyId));
  }, [propertyId]);

  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const isRented = property?.usage_status === 'rented';
  const tenantCount = activeTenants.length;
  const typeLabel = property ? t(`propertyTypes.${property.type}`) : '';

  const eyebrow = useMemo(() => {
    if (!property) return '';
    const parts = [typeLabel];
    if (property.floor != null) parts.push(t('properties.floorShort', { floor: property.floor }));
    if (property.area_sqm != null) {
      parts.push(t('properties.areaShort', { area: property.area_sqm }));
    }
    return parts.join(' · ');
  }, [property, t, typeLabel]);

  if (!property) {
    return null;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: listTopPad,
        paddingHorizontal: theme.spacing.gutter,
        paddingBottom: theme.spacing.scrollBottom,
      }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-3">
        <View className="mb-2.5 flex-row items-center gap-2.5">
          <Text
            className="text-muted flex-1 text-[11px] font-semibold tracking-[1.54px] uppercase"
            numberOfLines={1}
          >
            {eyebrow}
          </Text>
          <Pressable
            onPress={onShowUsageHistory}
            className={cn(
              'rounded-full px-2.75 py-1.25',
              isRented ? 'bg-pos-tint' : 'bg-surface-2',
            )}
            accessibilityRole="button"
            accessibilityLabel={t('properties.usageHistory')}
          >
            <Text
              className={cn(
                'text-[11px] font-semibold',
                isRented ? 'text-pos' : 'text-muted',
              )}
            >
              {t(`usageStatus.${property.usage_status}`)}
            </Text>
          </Pressable>
        </View>
        <Text
          className="text-fg text-[40px] tracking-[-1px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            lineHeight: 40,
          }}
          accessibilityRole="header"
        >
          {property.name}
        </Text>
      </View>

      <Pressable
        className="mb-4 flex-row items-center gap-1.5"
        onPress={handleOpenAddress}
        accessibilityRole="button"
        accessibilityLabel={t('properties.openInMaps')}
      >
        <MapPin size={14} color={colors.muted} strokeWidth={2} />
        <Text className="text-muted flex-1 text-[13.5px]" numberOfLines={2}>
          {property.address}
        </Text>
      </Pressable>

      {isRented ? (
        <PropertyRentCard
          rentAmount={Number(property.rent_amount)}
          currency={currency}
          language={language}
          month={currentMonthRange.month}
          year={currentMonthRange.year}
          payment={rentPayment}
          onStatusPress={onGoToRent}
        />
      ) : null}

      <PropertyStats
        totalIncome={monthIncome}
        totalExpenses={monthExpenseTotal}
        tenantCount={tenantCount}
        currency={currency}
        language={language}
      />

      {isRented && canManage ? (
        <View className="mb-5.5 flex-row items-center gap-2.25">
          <AppButton
            variant="default"
            onPress={onRecordPayment}
            className="h-11 flex-1"
            accessibilityLabel={t('properties.recordPayment')}
          >
            <View className="flex-row items-center gap-2">
              <ArrowDownToLine size={18} color={colors.onPrimary} strokeWidth={2} />
              <Text className="text-on-primary text-sm font-semibold">
                {t('properties.recordPayment')}
              </Text>
            </View>
          </AppButton>
          <Pressable
            onPress={handleAddExpense}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.addNew')}
            className="bg-surface-2 h-11 w-11 items-center justify-center rounded-full"
            hitSlop={4}
          >
            <Plus size={20} color={colors.fg} strokeWidth={2} />
          </Pressable>
        </View>
      ) : canManage ? (
        <View className="mb-5.5 flex-row items-center gap-2.25">
          <AppButton
            variant="default"
            onPress={handleAddExpense}
            className="h-11 flex-1"
            accessibilityLabel={t('expenses.addNew')}
          >
            {t('expenses.addNew')}
          </AppButton>
        </View>
      ) : null}

      {isRented ? (
        <View className="mb-4.5">
          <Pressable onPress={onGoToTenants} accessibilityRole="button">
            <Text
              className="text-fg mb-2.75 text-[22px] tracking-[-0.55px]"
              style={{ fontFamily: displayFontFamily(theme.name) }}
            >
              {t('tenants.title')}
            </Text>
          </Pressable>

          {activeTenants.length === 0 ? (
            <Text className="text-muted text-[13px]">{t('empty.noTenantsHint')}</Text>
          ) : (
            <View
              className="border-card-bd bg-surface rounded-xl border px-4.5 py-1"
              style={elevation.card}
            >
              {activeTenants.map((tenant, index) => (
                <Pressable
                  key={tenant.id}
                  onPress={() => handleSelectTenant(tenant.id)}
                  className={cn(
                    'flex-row items-center gap-3.25 py-3.25',
                    index > 0 && 'border-bd border-t',
                  )}
                  style={
                    index > 0
                      ? { borderTopWidth: StyleSheet.hairlineWidth }
                      : undefined
                  }
                  accessibilityRole="button"
                >
                  <View className="bg-surface-2 h-9.5 w-9.5 items-center justify-center rounded-full">
                    <Users size={18} color={colors.muted} strokeWidth={2} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-fg text-[15px] font-semibold" numberOfLines={1}>
                      {`${tenant.first_name} ${tenant.last_name}`.trim()}
                    </Text>
                    <Text className="text-muted mt-0.75 text-[11px] font-semibold tracking-[0.8px] uppercase">
                      {t('properties.tenantSince', {
                        date: formatDate(tenant.contract_start, language),
                      })}
                    </Text>
                  </View>
                  <View className="bg-pos-tint rounded-full px-2.75 py-1.25">
                    <Text className="text-pos text-[11px] font-semibold">
                      {t('tenants.statusOk')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {property.notes ? (
        <View className="border-card-bd bg-surface mb-4 rounded-xl border p-4">
          <Text className="text-muted text-[13px]">{property.notes}</Text>
        </View>
      ) : null}

      {childProperties.length > 0 ? <SubPropertyList properties={childProperties} /> : null}

      {isOwner ? (
        <Pressable
          onPress={handleOpenMembers}
          className="bg-surface-2 mt-2 flex-row items-center gap-3 rounded-xl px-3.5 py-3.5"
          accessibilityRole="button"
          accessibilityLabel={t('members.title')}
        >
          <View className="bg-surface-3 h-9.5 w-9.5 items-center justify-center rounded-full">
            <Users size={18} color={colors.muted} strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-fg text-[15px] font-semibold">{t('members.title')}</Text>
            <Text className="text-muted mt-0.5 text-xs">{t('members.overviewHint')}</Text>
          </View>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

export const PropertyOverviewTab = memo(PropertyOverviewTabComponent);
