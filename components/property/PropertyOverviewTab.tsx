import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { PropertyRentCard } from '@/components/property/PropertyRentCard';
import { PropertyStats } from '@/components/property/PropertyStats';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { SubPropertyList } from '@/components/property/SubPropertyList';
import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { listPerformanceProps } from '@/constants/list';
import { Spacing, Typography } from '@/constants/theme';
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
  onMarkRentPaid?: () => void;
  onSelectTenant: (tenantId: string) => void;
  onSelectExpense: (expenseId: string) => void;
  onMarkExpensePaid: (expenseId: string) => void;
  onAddExpense: () => void;
}

function keyExtractor(expense: Expense) {
  return expense.id;
}

function PropertyOverviewTabComponent({
  property,
  childProperties,
  isRented,
  canManage,
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
  onMarkRentPaid,
  onSelectTenant,
  onSelectExpense,
  onMarkExpensePaid,
  onAddExpense,
}: PropertyOverviewTabProps) {
  const { t } = useTranslation();
  const theme = useTheme();

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
    <>
      {property.photo_url ? (
        <Image source={{ uri: property.photo_url }} style={styles.photo} contentFit="cover" />
      ) : null}

      <View style={styles.badgeRow}>
        <PropertyTypeBadge type={property.type} />
        <UsageStatusBadge status={property.usage_status} onPress={onShowUsageHistory} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.addressRow, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onOpenAddress}
        accessibilityRole="button"
        accessibilityLabel={t('properties.openInMaps')}
      >
        <MapPin size={18} color={theme.colors.primary} strokeWidth={2} />
        <Text style={[styles.address, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {property.address}
        </Text>
      </Pressable>
      {propertyMeta ? (
        <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>{propertyMeta}</Text>
      ) : null}

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
        <Text style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
          {property.notes}
        </Text>
      ) : null}

      <PropertyStats
        totalIncome={monthIncome}
        totalExpenses={monthExpenseTotal}
        currency={currency}
        language={language}
        periodLabel={formatPeriod(month, year, language)}
      />

      <View style={styles.expensesSectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('properties.thisMonthExpenses', { month: formatMonthName(month, year, language) })}
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {formatCurrency(monthExpenseTotal, currency, language)}
        </Text>
      </View>
    </>
  );

  const footer = (
    <>
      {hasAnyExpenses ? (
        <Text
          style={[styles.viewAllLink, { color: theme.colors.primary }]}
          onPress={onViewAllExpenses}
        >
          {t('properties.viewAllExpenses')}
        </Text>
      ) : null}

      {childProperties.length > 0 ? (
        <View style={styles.subPropertiesSection}>
          <SubPropertyList properties={childProperties} />
        </View>
      ) : null}
    </>
  );

  return (
    <FlatList
      data={monthExpenses}
      keyExtractor={keyExtractor}
      renderItem={renderExpense}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      {...listPerformanceProps}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        <EmptyState
          title={t('properties.noExpensesThisMonth')}
          ctaLabel={canManage ? t('expenses.addNew') : undefined}
          onCtaPress={canManage ? onAddExpense : undefined}
        />
      }
    />
  );
}

export const PropertyOverviewTab = memo(PropertyOverviewTabComponent);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 56,
    gap: Spacing.sm,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 44,
  },
  address: {
    ...Typography.titleMedium,
    flex: 1,
  },
  meta: {
    ...Typography.bodySmall,
    marginBottom: Spacing.xs,
  },
  notes: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  expensesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  viewAllLink: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  subPropertiesSection: {
    marginTop: Spacing.md,
  },
});
