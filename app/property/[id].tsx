import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { FAB, IconButton, Text, useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { TabBar, TabView, type Route } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { PropertyStats } from '@/components/property/PropertyStats';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { SubPropertyList } from '@/components/property/SubPropertyList';
import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { TenantCard } from '@/components/tenant/TenantCard';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { MonthlyGrid } from '@/components/rent/MonthlyGrid';
import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useExpenses } from '@/hooks/useExpenses';
import { useProfile } from '@/hooks/useProfile';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { supabase } from '@/lib/supabase';
import { usePropertyStore } from '@/stores/propertyStore';
import { useUiStore } from '@/stores/uiStore';
import type { Property } from '@/types/app.types';
import { resolveCurrency } from '@/utils/currency';
import { formatCurrency, formatDate, formatPeriod } from '@/utils/formatters';

type TabKey = 'overview' | 'tenants' | 'expenses' | 'rent';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const showToast = useUiStore((s) => s.showToast);
  const getChildProperties = usePropertyStore((s) => s.getChildProperties);
  const getPropertyById = usePropertyStore((s) => s.getPropertyById);

  const [property, setProperty] = useState<Property | null>(null);
  const [parentProperty, setParentProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { profile } = useProfile();
  const language = profile?.language ?? (i18n.language as 'en' | 'hr');
  const currency = resolveCurrency(profile, property);

  const isRented = property?.usage_status === 'rented';

  const { tenants, isLoading: tenantsLoading, refetch: refetchTenants } = useTenants({
    propertyId: id,
  });
  const {
    expenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
    markAsPaid,
  } = useExpenses({ propertyId: id });
  const {
    rentPayments,
    isLoading: rentLoading,
    refetch: refetchRent,
  } = useRentPayments({ propertyId: id });
  const { categories } = useExpenseCategories();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const loadProperty = useCallback(async () => {
    if (!id) return;

    setError(null);
    const cached = getPropertyById(id);
    if (cached) setProperty(cached);

    const { data, error: err } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (err) {
      setError(err.message);
      setProperty(null);
    } else {
      setProperty(data);
      if (data.parent_property_id) {
        const parent =
          getPropertyById(data.parent_property_id) ??
          (
            await supabase
              .from('properties')
              .select('*')
              .eq('id', data.parent_property_id)
              .single()
          ).data;
        setParentProperty(parent ?? null);
      } else {
        setParentProperty(null);
      }
    }

    setIsLoading(false);
  }, [getPropertyById, id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const refetchTabData = useCallback(async () => {
    await Promise.all([refetchTenants(), refetchExpenses(), refetchRent()]);
  }, [refetchExpenses, refetchRent, refetchTenants]);

  useRefetchOnFocus(refetchTabData);

  const routes = useMemo<Route[]>(() => {
    const base: Route[] = [{ key: 'overview', title: t('properties.overview') }];
    if (isRented) base.push({ key: 'tenants', title: t('properties.tenantsTab') });
    base.push({ key: 'expenses', title: t('properties.expensesTab') });
    if (isRented) base.push({ key: 'rent', title: t('properties.rentTab') });
    return base;
  }, [isRented, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProperty(), refetchTenants(), refetchExpenses(), refetchRent()]);
    setRefreshing(false);
  }, [loadProperty, refetchExpenses, refetchRent, refetchTenants]);

  const totalIncome = rentPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses
    .filter((e) => e.paid_at)
    .reduce((sum, e) => sum + e.amount, 0);

  const expensesByMonth = useMemo(() => {
    const groups = new Map<string, typeof expenses>();
    for (const expense of expenses) {
      const key = expense.billing_date.slice(0, 7);
      const list = groups.get(key) ?? [];
      list.push(expense);
      groups.set(key, list);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          title: formatPeriod(month ?? 1, year ?? 2000, language),
          data: items,
          total: items.reduce((sum, e) => sum + e.amount, 0),
        };
      });
  }, [expenses, language]);

  const handleMarkPaid = useCallback(
    async (expenseId: string) => {
      try {
        await markAsPaid(expenseId);
        showToast({ message: t('expenses.markedPaid'), type: 'success' });
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : t('expenses.markPaidFailed'),
          type: 'error',
        });
      }
    },
    [markAsPaid, showToast, t],
  );

  const renderOverview = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {property?.photo_url ? (
        <Image source={{ uri: property.photo_url }} style={styles.photo} contentFit="cover" />
      ) : null}

      <View style={styles.badgeRow}>
        <PropertyTypeBadge type={property!.type} />
        <UsageStatusBadge status={property!.usage_status} />
      </View>

      <Text style={[styles.propertyName, { color: theme.colors.onSurface }]}>
        {property!.name}
      </Text>
      <Text style={[styles.address, { color: theme.colors.onSurfaceVariant }]}>
        {property!.address}
      </Text>

      {property!.floor != null ? (
        <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          {t('properties.floor')}: {property!.floor}
        </Text>
      ) : null}

      {property!.area_sqm != null ? (
        <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          {t('properties.area')}: {property!.area_sqm} m²
        </Text>
      ) : null}

      {isRented ? (
        <Text style={[styles.rentAmount, { color: theme.colors.primary }]}>
          {t('properties.monthlyRent')}: {formatCurrency(property!.rent_amount, currency, language)}
        </Text>
      ) : null}

      {property!.notes ? (
        <Text style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}>
          {property!.notes}
        </Text>
      ) : null}

      <PropertyStats
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        currency={currency}
        language={language}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {t('properties.subProperties')}
      </Text>
      <SubPropertyList properties={getChildProperties(property!.id)} />
    </ScrollView>
  );

  const renderTenants = () => {
    if (tenantsLoading) return <SkeletonLoader count={3} style={styles.tabContent} />;
    if (tenants.length === 0) {
      return (
        <EmptyState
          title={t('empty.noTenants')}
          subtitle={t('empty.noTenantsHint')}
          ctaLabel={t('tenants.addNew')}
          onCtaPress={() => router.push({ pathname: '/tenant/new', params: { propertyId: id! } })}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {tenants.map((tenant) => (
          <TenantCard
            key={tenant.id}
            tenant={tenant}
            currency={currency}
            language={language}
            onPress={() => router.push(`/tenant/${tenant.id}`)}
          />
        ))}
      </ScrollView>
    );
  };

  const renderExpenses = () => {
    if (expensesLoading) return <SkeletonLoader count={4} style={styles.tabContent} />;

    if (expenses.length === 0) {
      return (
        <EmptyState
          title={t('empty.noExpenses')}
          subtitle={t('empty.noExpensesHint')}
          ctaLabel={t('expenses.addNew')}
          onCtaPress={() =>
            router.push({ pathname: '/expense/new', params: { propertyId: id! } })
          }
        />
      );
    }

    return (
      <SectionList
        sections={expensesByMonth}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {section.title}
            </Text>
            <Text style={{ color: theme.colors.primary }}>
              {formatCurrency(section.total, currency, language)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ExpenseCard
            expense={item}
            category={categoryMap.get(item.category_id)}
            currency={currency}
            language={language}
            onMarkPaid={handleMarkPaid}
          />
        )}
      />
    );
  };

  const renderRent = () => {
    if (rentLoading) return <SkeletonLoader count={3} style={styles.tabContent} />;

    const currentYear = new Date().getFullYear();

    return (
      <ScrollView
        contentContainerStyle={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <MonthlyGrid
          payments={rentPayments}
          year={currentYear}
          language={language}
          onMonthPress={(month, payment) => {
            if (payment) {
              router.push(`/rent/${payment.id}`);
            } else {
              router.push({
                pathname: '/rent/new',
                params: { propertyId: id!, periodMonth: String(month), periodYear: String(currentYear) },
              });
            }
          }}
        />

        {rentPayments.length === 0 ? (
          <EmptyState
            title={t('empty.noRentPayments')}
            subtitle={t('empty.noRentPaymentsHint')}
            ctaLabel={t('rent.addPayment')}
            onCtaPress={() => router.push({ pathname: '/rent/new', params: { propertyId: id! } })}
          />
        ) : (
          rentPayments.map((payment) => {
            const tenant = tenants.find((item) => item.id === payment.tenant_id);
            return (
              <RentPaymentCard
                key={payment.id}
                payment={payment}
                tenantName={
                  tenant ? `${tenant.first_name} ${tenant.last_name}` : undefined
                }
                currency={currency}
                language={language}
              />
            );
          })
        )}
      </ScrollView>
    );
  };

  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key as TabKey) {
      case 'overview':
        return renderOverview();
      case 'tenants':
        return renderTenants();
      case 'expenses':
        return renderExpenses();
      case 'rent':
        return renderRent();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('common.loading') }} />
        <SkeletonLoader count={6} style={styles.loader} />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Stack.Screen options={{ title: t('properties.propertyDetails') }} />
        <ErrorState
          message={error ?? t('properties.notFound')}
          onRetry={loadProperty}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: property.name,
          headerRight: () => (
            <IconButton
              icon="pencil"
              onPress={() => router.push(`/property/edit/${property.id}`)}
              accessibilityLabel={t('common.edit')}
            />
          ),
        }}
      />

      {parentProperty ? (
        <View
          style={[
            styles.parentBanner,
            { backgroundColor: theme.dark ? Colors.surfaceVariantDark : Colors.primaryLight },
          ]}
        >
          <Text
            style={{ color: theme.colors.primary }}
            onPress={() => router.push(`/property/${parentProperty.id}`)}
          >
            {t('properties.linkedTo', { name: parentProperty.name })}
          </Text>
        </View>
      ) : null}

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled
            style={{ backgroundColor: theme.colors.surface }}
            indicatorStyle={{ backgroundColor: theme.colors.primary }}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.onSurfaceVariant}
          />
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={Colors.textInverse}
        onPress={() => {
          const currentRoute = routes[index]?.key as TabKey;
          if (currentRoute === 'tenants') {
            router.push({ pathname: '/tenant/new', params: { propertyId: id! } });
          } else if (currentRoute === 'rent') {
            router.push({ pathname: '/rent/new', params: { propertyId: id! } });
          } else {
            router.push({ pathname: '/expense/new', params: { propertyId: id! } });
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    padding: Spacing.md,
  },
  parentBanner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  tabContent: {
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
  propertyName: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.xs,
  },
  address: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.sm,
  },
  meta: {
    ...Typography.bodySmall,
    marginBottom: Spacing.xs,
  },
  rentAmount: {
    ...Typography.titleMedium,
    marginBottom: Spacing.sm,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
  },
});
