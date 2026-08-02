import { Image } from 'expo-image';
import { ChevronRight, MapPin, Receipt, Users } from 'lucide-react-native';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { PropertyRentCard } from '@/components/property/PropertyRentCard';
import { PropertyStats } from '@/components/property/PropertyStats';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { SubPropertyList } from '@/components/property/SubPropertyList';
import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import type {
  Expense,
  ExpenseCategory,
  Language,
  Property,
  RentPayment,
  Tenant,
} from '@/types/app.types';
import { formatCurrency, formatMonthName, formatPeriod } from '@/utils/formatters';

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
  monthExpenses: Expense[];
  monthExpenseTotal: number;
  monthIncome: number;
  categoryMap: Map<string, ExpenseCategory>;
  rentPayment?: RentPayment;
  activeTenant?: Tenant;
  hasAnyExpenses: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenAddress: () => void;
  onShowUsageHistory: () => void;
  onGoToRent: () => void;
  onViewAllExpenses: () => void;
  onOpenMembers: () => void;
  onMarkRentPaid?: () => void;
  onSelectTenant: (tenantId: string) => void;
  onSelectExpense: (expenseId: string) => void;
  onMarkExpensePaid: (expenseId: string) => void;
  /** Top inset so list content clears floating header + tabs; photo bleeds under. */
  contentTopInset?: number;
}

function keyExtractor(expense: Expense) {
  return expense.id;
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
  monthExpenses,
  monthExpenseTotal,
  monthIncome,
  categoryMap,
  rentPayment,
  activeTenant,
  hasAnyExpenses,
  refreshing,
  onRefresh,
  onOpenAddress,
  onShowUsageHistory,
  onGoToRent,
  onViewAllExpenses,
  onOpenMembers,
  onMarkRentPaid,
  onSelectTenant,
  onSelectExpense,
  onMarkExpensePaid,
  contentTopInset = 0,
}: PropertyOverviewTabProps) {
  const { t } = useTranslation();
  const hasPhoto = Boolean(property.photo_url);
  const photoHeight = 200 + contentTopInset;
  // Photo bleeds under chrome; otherwise clear the floating tabs with a bit of air.
  const listTopPad = hasPhoto
    ? contentTopInset || Spacing.sm
    : (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;

  const propertyMeta = useMemo(() => {
    const parts: string[] = [];
    if (property.floor != null) parts.push(t('properties.floorShort', { floor: property.floor }));
    if (property.area_sqm != null) {
      parts.push(t('properties.areaShort', { area: property.area_sqm }));
    }
    return parts.join(' · ');
  }, [property.area_sqm, property.floor, t]);

  const handleTenantPress = useCallback(() => {
    if (activeTenant) onSelectTenant(activeTenant.id);
  }, [activeTenant, onSelectTenant]);

  const renderExpense = useCallback(
    ({ item }: { item: Expense }) => (
      <ExpenseCard
        expense={item}
        category={categoryMap.get(item.category_id)}
        currency={currency}
        language={language}
        onPress={onSelectExpense}
        onMarkPaid={canManage && !item.paid_at ? onMarkExpensePaid : undefined}
      />
    ),
    [canManage, categoryMap, currency, language, onMarkExpensePaid, onSelectExpense],
  );

  const header = (
    <View className="gap-5">
      {hasPhoto ? (
        <Image
          source={{ uri: property.photo_url! }}
          style={[
            styles.photo,
            {
              height: photoHeight,
              marginTop: -contentTopInset,
            },
          ]}
          contentFit="cover"
        />
      ) : null}

      <View className="gap-3">
        <View className="flex-row flex-wrap gap-2">
          <PropertyTypeBadge type={property.type} />
          <UsageStatusBadge status={property.usage_status} onPress={onShowUsageHistory} />
        </View>

        <Pressable
          className="min-h-11 flex-row items-center gap-2"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={onOpenAddress}
          accessibilityRole="button"
          accessibilityLabel={t('properties.openInMaps')}
        >
          <Icon as={MapPin} size={18} className="text-foreground" strokeWidth={2} />
          <Text className="text-foreground flex-1 text-base font-semibold" numberOfLines={2}>
            {property.address}
          </Text>
        </Pressable>
        {propertyMeta ? (
          <Text className="text-muted-foreground text-xs">{propertyMeta}</Text>
        ) : null}
      </View>

      {isRented ? (
        <PropertyRentCard
          rentAmount={property.rent_amount}
          currency={currency}
          language={language}
          month={month}
          year={year}
          payment={rentPayment}
          tenantName={
            activeTenant ? `${activeTenant.first_name} ${activeTenant.last_name}` : undefined
          }
          onStatusPress={onGoToRent}
          onTenantPress={activeTenant ? handleTenantPress : undefined}
          onMarkPaid={onMarkRentPaid}
        />
      ) : null}

      {property.notes ? (
        <View className="bg-muted/60 rounded-3xl px-4 py-3">
          <Text className="text-muted-foreground text-sm">{property.notes}</Text>
        </View>
      ) : null}

      {isOwner ? (
        <Pressable
          className="bg-card min-h-14 flex-row items-center gap-3 rounded-3xl px-4 py-3.5 shadow-sm shadow-black/5"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          onPress={onOpenMembers}
          accessibilityRole="button"
          accessibilityLabel={t('members.title')}
        >
          <Icon as={Users} size={20} className="text-muted-foreground" strokeWidth={1.75} />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-foreground text-[15px] font-semibold">{t('members.title')}</Text>
            <Text className="text-muted-foreground text-xs">{t('members.overviewHint')}</Text>
          </View>
          <Icon as={ChevronRight} size={18} className="text-muted-foreground" strokeWidth={2} />
        </Pressable>
      ) : null}

      <PropertyStats
        totalIncome={monthIncome}
        totalExpenses={monthExpenseTotal}
        currency={currency}
        language={language}
        periodLabel={formatPeriod(month, year, language)}
      />

      <View className="mt-1 flex-row items-end justify-between gap-2">
        <Text className="text-foreground flex-1 text-base font-bold">
          {t('properties.thisMonthExpenses', { month: formatMonthName(month, year, language) })}
        </Text>
        <Text className="text-muted-foreground text-sm font-medium">
          {formatCurrency(monthExpenseTotal, currency, language)}
        </Text>
      </View>
    </View>
  );

  const footer = (
    <View className="gap-4 pt-2">
      {hasAnyExpenses ? (
        <Text
          className="text-primary text-center text-sm font-semibold"
          onPress={onViewAllExpenses}
        >
          {t('properties.viewAllExpenses')}
        </Text>
      ) : null}

      {childProperties.length > 0 ? <SubPropertyList properties={childProperties} /> : null}
    </View>
  );

  return (
    <FlatList
      data={monthExpenses}
      keyExtractor={keyExtractor}
      renderItem={renderExpense}
      contentContainerStyle={[styles.content, { paddingTop: listTopPad }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <EmptyState
          icon={Receipt}
          title={t('properties.noExpensesThisMonth')}
          subtitle={t('empty.noExpensesHint')}
        />
      }
    />
  );
}

export const PropertyOverviewTab = memo(PropertyOverviewTabComponent);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
    gap: Spacing.md,
  },
  photo: {
    width: '100%',
    marginHorizontal: -Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
});
