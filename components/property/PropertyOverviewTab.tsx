import {
  ArrowDownToLine,
  MapPin,
  Plus,
  Users,
} from 'lucide-react-native';
import { memo, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { PropertyRentCard } from '@/components/property/PropertyRentCard';
import { PropertyStats } from '@/components/property/PropertyStats';
import { SubPropertyList } from '@/components/property/SubPropertyList';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { AppButton } from '@/components/ui/AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type {
  Language,
  Property,
  RentPayment,
  Tenant,
} from '@/types/app.types';
import { formatDate } from '@/utils/formatters';

export interface PropertyOverviewTabProps {
  property: Property;
  childProperties: Property[];
  isRented: boolean;
  canManage: boolean;
  isOwner: boolean;
  currency: string;
  language: Language;
  month: number;
  year: number;
  monthExpenseTotal: number;
  monthIncome: number;
  rentPayment?: RentPayment;
  activeTenants: Tenant[];
  refreshing: boolean;
  onRefresh: () => void;
  onOpenAddress: () => void;
  onShowUsageHistory: () => void;
  onGoToRent: () => void;
  onGoToTenants: () => void;
  onOpenMembers: () => void;
  onSelectTenant: (tenantId: string) => void;
  onRecordPayment: () => void;
  onAddExpense: () => void;
  contentTopInset?: number;
}

function PropertyOverviewTabComponent({
  property,
  childProperties,
  isRented,
  canManage,
  isOwner,
  currency,
  language,
  month,
  year,
  monthExpenseTotal,
  monthIncome,
  rentPayment,
  activeTenants,
  refreshing,
  onRefresh,
  onOpenAddress,
  onShowUsageHistory,
  onGoToRent,
  onGoToTenants,
  onOpenMembers,
  onSelectTenant,
  onRecordPayment,
  onAddExpense,
  contentTopInset = 0,
}: PropertyOverviewTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;
  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const tenantCount = activeTenants.length;
  const isUsageRented = property.usage_status === 'rented';

  const typeLabel = t(`propertyTypes.${property.type}`);

  const eyebrow = useMemo(() => {
    const parts = [typeLabel];
    if (property.floor != null) parts.push(t('properties.floorShort', { floor: property.floor }));
    if (property.area_sqm != null) {
      parts.push(t('properties.areaShort', { area: property.area_sqm }));
    }
    return parts.join(' · ');
  }, [property.area_sqm, property.floor, t, typeLabel]);

  return (
    <ScrollView
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
              isUsageRented ? 'bg-pos-tint' : 'bg-surface-2',
            )}
            accessibilityRole="button"
            accessibilityLabel={t('properties.usageHistory')}
          >
            <Text
              className={cn(
                'text-[11px] font-semibold',
                isUsageRented ? 'text-pos' : 'text-muted',
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
        onPress={onOpenAddress}
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
          month={month}
          year={year}
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
            mode="contained"
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
            onPress={onAddExpense}
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
            mode="contained"
            onPress={onAddExpense}
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
                  onPress={() => onSelectTenant(tenant.id)}
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
          onPress={onOpenMembers}
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
