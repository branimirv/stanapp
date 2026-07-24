import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Pencil, FileText, LayoutGrid, Users, Receipt, Banknote, UserPlus } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text, useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { TabView, type Route } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import { AppFab } from '@/components/ui/AppFab';
import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { StackHeaderActions } from '@/components/ui/StackHeaderActions';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { AppSegmentedControl } from '@/components/ui/AppSegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { PropertyTabBar } from '@/components/property/PropertyTabBar';
import { PropertyStats } from '@/components/property/PropertyStats';
import { PropertyTypeBadge } from '@/components/property/PropertyTypeBadge';
import { SubPropertyList } from '@/components/property/SubPropertyList';
import { UsageStatusBadge } from '@/components/property/UsageStatusBadge';
import { TenantCard } from '@/components/tenant/TenantCard';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { MonthlyGrid } from '@/components/rent/MonthlyGrid';
import { QuickAddExpenseSheet } from '@/components/expense/QuickAddExpenseSheet';
import { StatementSheet } from '@/components/property/StatementSheet';
import { RentMonthActionSheet } from '@/components/rent/RentMonthActionSheet';
import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useExpenses } from '@/hooks/useExpenses';
import { useLocale } from '@/hooks/useLocale';
import { useMyMembership } from '@/hooks/useMembers';
import { useProfile } from '@/hooks/useProfile';
import { useProperty, useChildProperties } from '@/hooks/useProperties';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useUiStore } from '@/stores/uiStore';
import type { RentPayment } from '@/types/app.types';
import { resolveCurrency } from '@/utils/currency';
import { getCurrentMonthRange, isDateInRange } from '@/utils/dateRange';
import { formatCurrency, formatDateOnly, formatPeriod } from '@/utils/formatters';

type TabKey = 'overview' | 'tenants' | 'expenses' | 'rent';
type ExpensePeriodFilter = 'current_month' | 'all';

type PropertyRoute = Route & { key: TabKey };

const TAB_ICONS: Record<TabKey, LucideIcon> = {
  overview: LayoutGrid,
  tenants: Users,
  expenses: Receipt,
  rent: Banknote,
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const layout = useWindowDimensions();
  const showToast = useUiStore((s) => s.showToast);

  const {
    property,
    isLoading,
    error,
    refetch: refetchProperty,
  } = useProperty(id);
  const { property: parentProperty } = useProperty(property?.parent_property_id ?? undefined);
  const childProperties = useChildProperties(id);
  const { isOwner, canManage } = useMyMembership(id);
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [expensePeriodFilter, setExpensePeriodFilter] = useState<ExpensePeriodFilter>('all');
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [statementVisible, setStatementVisible] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [rentSheet, setRentSheet] = useState<{
    visible: boolean;
    month: number;
    year: number;
    payment?: RentPayment;
  }>({ visible: false, month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const { profile } = useProfile();
  const { language } = useLocale();
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
    create: createExpense,
  } = useExpenses({ propertyId: id });
  const {
    rentPayments,
    isLoading: rentLoading,
    refetch: refetchRent,
    create: createRentPayment,
    markAsPaid: markRentAsPaid,
  } = useRentPayments({ propertyId: id });
  const { categories } = useExpenseCategories();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const tenantMap = useMemo(
    () => new Map(tenants.map((tenant) => [tenant.id, tenant])),
    [tenants],
  );

  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);

  const currentMonthExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        isDateInRange(expense.billing_date, currentMonthRange.start, currentMonthRange.end),
      ),
    [currentMonthRange.end, currentMonthRange.start, expenses],
  );

  const currentMonthIncome = useMemo(
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

  const currentMonthExpenseTotal = useMemo(
    () => currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [currentMonthExpenses],
  );

  const currentMonthPeriodLabel = formatPeriod(
    currentMonthRange.month,
    currentMonthRange.year,
    language,
  );

  const refetchTabData = useCallback(async () => {
    await Promise.all([refetchTenants(), refetchExpenses(), refetchRent()]);
  }, [refetchExpenses, refetchRent, refetchTenants]);

  useRefetchOnFocus(refetchTabData);

  const routes = useMemo<PropertyRoute[]>(() => {
    const base: PropertyRoute[] = [{ key: 'overview', title: t('properties.overview') }];
    if (isRented) base.push({ key: 'tenants', title: t('properties.tenantsTab') });
    base.push({ key: 'expenses', title: t('properties.expensesTab') });
    if (isRented) base.push({ key: 'rent', title: t('properties.rentTab') });
    return base;
  }, [isRented, t]);

  const activeTenant = useMemo(
    () => tenants.find((tenant) => tenant.is_active),
    [tenants],
  );

  const expensesTabIndex = useMemo(
    () => routes.findIndex((route) => route.key === 'expenses'),
    [routes],
  );

  const goToExpensesTab = useCallback(() => {
    if (expensesTabIndex >= 0) {
      setIndex(expensesTabIndex);
    }
  }, [expensesTabIndex]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProperty(), refetchTenants(), refetchExpenses(), refetchRent()]);
    setRefreshing(false);
  }, [refetchProperty, refetchExpenses, refetchRent, refetchTenants]);

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

  const handleQuickAddExpense = useCallback(
    async (values: {
      property_id: string;
      category_id: string;
      amount: number;
      is_recurring: boolean;
      billing_date: string;
      notes: string | null;
    }) => {
      setIsSavingExpense(true);
      try {
        await createExpense(values);
        showToast({ message: t('expenses.saveSuccess'), type: 'success' });
        await refetchExpenses();
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : t('expenses.saveFailed'),
          type: 'error',
        });
      } finally {
        setIsSavingExpense(false);
      }
    },
    [createExpense, refetchExpenses, showToast, t],
  );

  const openRentSheet = useCallback((month: number, year: number, payment?: RentPayment) => {
    setRentSheet({ visible: true, month, year, payment });
  }, []);

  const handleRentMarkPaid = useCallback(async () => {
    const { month, year, payment } = rentSheet;
    if (!property) return;

    try {
      if (payment) {
        if (payment.status !== 'paid') {
          await markRentAsPaid(payment.id);
        }
      } else if (!activeTenant) {
        router.push({
          pathname: '/rent/new',
          params: {
            propertyId: id!,
            periodMonth: String(month),
            periodYear: String(year),
          },
        });
        return;
      } else {
        await createRentPayment({
          property_id: id!,
          tenant_id: activeTenant.id,
          amount: property.rent_amount,
          period_month: month,
          period_year: year,
          status: 'paid',
          payment_date: formatDateOnly(new Date()),
          notes: null,
        });
      }
      showToast({ message: t('rent.markedPaid'), type: 'success' });
      await refetchRent();
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : t('rent.markPaidFailed'),
        type: 'error',
      });
    }
  }, [
    activeTenant,
    createRentPayment,
    id,
    markRentAsPaid,
    property,
    refetchRent,
    rentSheet,
    showToast,
    t,
  ]);

  const handleRentPartialPayment = useCallback(() => {
    const { month, year } = rentSheet;
    router.push({
      pathname: '/rent/new',
      params: {
        propertyId: id!,
        ...(activeTenant ? { tenantId: activeTenant.id } : {}),
        periodMonth: String(month),
        periodYear: String(year),
      },
    });
  }, [activeTenant, id, rentSheet]);

  const handleRentAddDetails = useCallback(() => {
    const { month, year, payment } = rentSheet;
    if (payment) {
      router.push(`/rent/${payment.id}`);
      return;
    }
    router.push({
      pathname: '/rent/new',
      params: {
        propertyId: id!,
        ...(activeTenant ? { tenantId: activeTenant.id } : {}),
        periodMonth: String(month),
        periodYear: String(year),
      },
    });
  }, [activeTenant, id, rentSheet]);

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
        totalIncome={currentMonthIncome}
        totalExpenses={currentMonthExpenseTotal}
        currency={currency}
        language={language}
        periodLabel={currentMonthPeriodLabel}
      />

      <View style={styles.expensesSectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('properties.thisMonthExpenses')}
        </Text>
        <Text style={{ color: theme.colors.primary }}>
          {formatCurrency(currentMonthExpenseTotal, currency, language)}
        </Text>
      </View>

      {currentMonthExpenses.length === 0 ? (
        <EmptyState
          title={t('properties.noExpensesThisMonth')}
          ctaLabel={canManage ? t('expenses.addNew') : undefined}
          onCtaPress={
            canManage
              ? () => router.push({ pathname: '/expense/new', params: { propertyId: id! } })
              : undefined
          }
        />
      ) : (
        currentMonthExpenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            category={categoryMap.get(expense.category_id)}
            currency={currency}
            language={language}
            onPress={() => router.push(`/expense/${expense.id}`)}
            onMarkPaid={
              canManage && !expense.paid_at ? () => handleMarkPaid(expense.id) : undefined
            }
          />
        ))
      )}

      {expenses.length > 0 ? (
        <Text
          style={[styles.viewAllLink, { color: theme.colors.primary }]}
          onPress={goToExpensesTab}
        >
          {t('properties.viewAllExpenses')}
        </Text>
      ) : null}

      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {t('properties.subProperties')}
      </Text>
      <SubPropertyList properties={childProperties} />
    </ScrollView>
  );

  const renderTenants = () => {
    if (tenantsLoading) return <SkeletonLoader count={3} style={styles.tabContent} />;
    if (tenants.length === 0) {
      return (
        <EmptyState
          title={t('empty.noTenants')}
          subtitle={t('empty.noTenantsHint')}
          ctaLabel={canManage ? t('tenants.addNew') : undefined}
          onCtaPress={
            canManage
              ? () => router.push({ pathname: '/tenant/new', params: { propertyId: id! } })
              : undefined
          }
        />
      );
    }

    return (
      <FlatList
        data={tenants}
        keyExtractor={(tenant) => tenant.id}
        contentContainerStyle={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item: tenant }) => (
          <TenantCard
            tenant={tenant}
            currency={currency}
            language={language}
            onPress={() => router.push(`/tenant/${tenant.id}`)}
          />
        )}
      />
    );
  };

  const renderExpenses = () => {
    if (expensesLoading) return <SkeletonLoader count={4} style={styles.tabContent} />;

    if (expenses.length === 0) {
      return (
        <EmptyState
          title={t('empty.noExpenses')}
          subtitle={t('empty.noExpensesHint')}
          ctaLabel={canManage ? t('expenses.addNew') : undefined}
          onCtaPress={
            canManage
              ? () => router.push({ pathname: '/expense/new', params: { propertyId: id! } })
              : undefined
          }
        />
      );
    }

    const periodFilter = (
      <View style={styles.expenseFilter}>
        <AppSegmentedControl
          segments={[
            { label: t('properties.expensePeriodThisMonth'), value: 'current_month' },
            { label: t('properties.expensePeriodAll'), value: 'all' },
          ]}
          value={expensePeriodFilter}
          onValueChange={(value) => setExpensePeriodFilter(value as ExpensePeriodFilter)}
        />
      </View>
    );

    if (expensePeriodFilter === 'current_month') {
      return (
        <FlatList
          data={currentMonthExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <>
              {periodFilter}
              {currentMonthExpenses.length > 0 ? (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    {currentMonthPeriodLabel}
                  </Text>
                  <Text style={{ color: theme.colors.primary }}>
                    {formatCurrency(currentMonthExpenseTotal, currency, language)}
                  </Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={<EmptyState title={t('properties.noExpensesThisMonth')} />}
          renderItem={({ item }) => (
            <ExpenseCard
              expense={item}
              category={categoryMap.get(item.category_id)}
              currency={currency}
              language={language}
              onPress={() => router.push(`/expense/${item.id}`)}
              onMarkPaid={
                canManage && !item.paid_at ? () => handleMarkPaid(item.id) : undefined
              }
            />
          )}
        />
      );
    }

    return (
      <SectionList
        sections={expensesByMonth}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={periodFilter}
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
            onPress={() => router.push(`/expense/${item.id}`)}
            onMarkPaid={
              canManage && !item.paid_at ? () => handleMarkPaid(item.id) : undefined
            }
          />
        )}
      />
    );
  };

  const renderRent = () => {
    if (rentLoading) return <SkeletonLoader count={3} style={styles.tabContent} />;

    const currentYear = new Date().getFullYear();

    return (
      <FlatList
        data={rentPayments}
        keyExtractor={(payment) => payment.id}
        contentContainerStyle={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <MonthlyGrid
            payments={rentPayments}
            year={currentYear}
            language={language}
            onMonthPress={(month, payment) => {
              if (!canManage) return;
              openRentSheet(month, currentYear, payment);
            }}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('empty.noRentPayments')}
            subtitle={t('empty.noRentPaymentsHint')}
            ctaLabel={canManage ? t('rent.addPayment') : undefined}
            onCtaPress={
              canManage
                ? () => router.push({ pathname: '/rent/new', params: { propertyId: id! } })
                : undefined
            }
          />
        }
        renderItem={({ item: payment }) => {
          const tenant = tenantMap.get(payment.tenant_id);
          return (
            <RentPaymentCard
              payment={payment}
              tenantName={tenant ? `${tenant.first_name} ${tenant.last_name}` : undefined}
              currency={currency}
              language={language}
            />
          );
        }}
      />
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

  if (isLoading || error || !property) {
    return (
      <DetailScreenScaffold
        title={t('properties.propertyDetails')}
        isLoading={isLoading}
        isReady={Boolean(property)}
        error={error}
        notFoundMessage={t('properties.notFound')}
        onRetry={refetchProperty}
        loaderCount={6}
      >
        {null}
      </DetailScreenScaffold>
    );
  }

  return (
    <DetailScreenScaffold
      title={property.name}
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={t('properties.notFound')}
      onRetry={refetchProperty}
      headerRight={() => (
        <StackHeaderActions>
          {isOwner ? (
            <HeaderIconButton
              icon={UserPlus}
              onPress={() => router.push(`/property/members/${property.id}`)}
              accessibilityLabel={t('members.title')}
            />
          ) : null}
          {canManage ? (
            <HeaderIconButton
              icon={FileText}
              onPress={() => setStatementVisible(true)}
              accessibilityLabel={t('statement.action')}
            />
          ) : null}
          {canManage ? (
            <HeaderIconButton
              icon={Pencil}
              onPress={() => router.push(`/property/edit/${property.id}`)}
              accessibilityLabel={t('common.edit')}
            />
          ) : null}
        </StackHeaderActions>
      )}
    >
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
        renderTabBar={(props) => <PropertyTabBar {...props} icons={TAB_ICONS} />}
      />

      <QuickAddExpenseSheet
        visible={quickAddVisible}
        onDismiss={() => setQuickAddVisible(false)}
        propertyId={property.id}
        categories={categories}
        onSubmit={handleQuickAddExpense}
        isSubmitting={isSavingExpense}
      />

      <StatementSheet
        visible={statementVisible}
        onDismiss={() => setStatementVisible(false)}
        property={property}
        tenants={tenants}
        expenses={expenses}
        rentPayments={rentPayments}
        categories={categories}
        landlordName={profile?.full_name ?? t('statement.landlord')}
        currency={currency}
        language={language}
        onExportSuccess={() => showToast({ message: t('statement.exportSuccess'), type: 'success' })}
        onExportError={(message) => showToast({ message, type: 'error' })}
      />

      <RentMonthActionSheet
        visible={rentSheet.visible}
        onDismiss={() => setRentSheet((prev) => ({ ...prev, visible: false }))}
        month={rentSheet.month}
        year={rentSheet.year}
        payment={rentSheet.payment}
        rentAmount={property.rent_amount}
        currency={currency}
        language={language}
        onMarkPaid={handleRentMarkPaid}
        onPartialPayment={handleRentPartialPayment}
        onAddDetails={handleRentAddDetails}
      />

      {canManage ? (
        <AppFab
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={Colors.textInverse}
          onPress={() => {
            const currentRoute = routes[index]?.key as TabKey;
            if (currentRoute === 'tenants') {
              router.push({ pathname: '/tenant/new', params: { propertyId: id! } });
            } else if (currentRoute === 'rent') {
              router.push({ pathname: '/rent/new', params: { propertyId: id! } });
            } else {
              setQuickAddVisible(true);
            }
          }}
        />
      ) : null}
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
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
  expenseFilter: {
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
