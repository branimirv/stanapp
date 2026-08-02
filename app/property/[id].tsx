import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Pencil, FileText } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { TabView, type Route } from 'react-native-tab-view';
import { useTranslation } from 'react-i18next';
import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { useFloatingStackHeaderInset } from '@/components/ui/FloatingStackHeader';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { StackHeaderActions } from '@/components/ui/StackHeaderActions';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { Text } from '@/components/ui/text';
import { PropertyChromeBackdrop } from '@/components/property/PropertyChromeBackdrop';
import { PropertyExpensesTab } from '@/components/property/PropertyExpensesTab';
import { PropertyOverviewTab } from '@/components/property/PropertyOverviewTab';
import { PropertyRentTab } from '@/components/property/PropertyRentTab';
import {
  PROPERTY_PAGE_TITLE_HEIGHT,
  PROPERTY_TAB_BAR_HEIGHT,
  PropertyTabBar,
} from '@/components/property/PropertyTabBar';
import { PropertyTenantsTab } from '@/components/property/PropertyTenantsTab';
import { UsageHistorySheet } from '@/components/property/UsageHistorySheet';
import { StatementSheet } from '@/components/property/StatementSheet';
import { RentMonthActionSheet } from '@/components/rent/RentMonthActionSheet';
import { HEADER_EDGE_INSET } from '@/constants/header';
import { Spacing } from '@/constants/theme';
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
import { openAddressInMaps } from '@/utils/maps';
import { formatDateOnly } from '@/utils/formatters';

const PARENT_BANNER_HEIGHT = 44;
/** Extra backdrop below tab pills so glass always refracts something colorful. */
const CHROME_BACKDROP_BLEED = 140;

type TabKey = 'overview' | 'tenants' | 'expenses' | 'rent';

type PropertyRoute = Route & { key: TabKey };

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const layout = useWindowDimensions();
  const headerInset = useFloatingStackHeaderInset();
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
  const [historyVisible, setHistoryVisible] = useState(false);
  const [statementVisible, setStatementVisible] = useState(false);
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
  const currentYear = useMemo(() => new Date().getFullYear(), []);

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

  const handleOpenAddress = useCallback(async () => {
    if (!property?.address) return;
    const opened = await openAddressInMaps(property.address);
    if (!opened) {
      showToast({ message: t('properties.openInMapsFailed'), type: 'error' });
    }
  }, [property?.address, showToast, t]);

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

  const rentTabIndex = useMemo(
    () => routes.findIndex((route) => route.key === 'rent'),
    [routes],
  );

  const goToRentTab = useCallback(() => {
    if (rentTabIndex >= 0) {
      setIndex(rentTabIndex);
    }
  }, [rentTabIndex]);

  const currentMonthRentPayment = useMemo(
    () =>
      rentPayments.find(
        (payment) =>
          payment.period_month === currentMonthRange.month &&
          payment.period_year === currentMonthRange.year,
      ),
    [currentMonthRange.month, currentMonthRange.year, rentPayments],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProperty(), refetchTenants(), refetchExpenses(), refetchRent()]);
    setRefreshing(false);
  }, [refetchProperty, refetchExpenses, refetchRent, refetchTenants]);

  const openRentSheet = useCallback((month: number, year: number, payment?: RentPayment) => {
    setRentSheet({ visible: true, month, year, payment });
  }, []);

  const markMonthPaid = useCallback(
    async (month: number, year: number, payment?: RentPayment) => {
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
    },
    [
      activeTenant,
      createRentPayment,
      id,
      markRentAsPaid,
      property,
      refetchRent,
      showToast,
      t,
    ],
  );

  const handleRentMarkPaid = useCallback(
    () => markMonthPaid(rentSheet.month, rentSheet.year, rentSheet.payment),
    [markMonthPaid, rentSheet],
  );

  const handleCurrentMonthMarkPaid = useCallback(
    () => markMonthPaid(currentMonthRange.month, currentMonthRange.year, currentMonthRentPayment),
    [currentMonthRange.month, currentMonthRange.year, currentMonthRentPayment, markMonthPaid],
  );

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

  const handleRentMonthPress = useCallback(
    (month: number, payment?: RentPayment) => {
      if (!canManage) return;
      openRentSheet(month, currentYear, payment);
    },
    [canManage, currentYear, openRentSheet],
  );

  const handleMarkExpensePaid = useCallback(
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

  const handleSelectExpense = useCallback((expenseId: string) => {
    router.push(`/expense/${expenseId}`);
  }, []);

  const handleSelectTenant = useCallback((tenantId: string) => {
    router.push(`/tenant/${tenantId}`);
  }, []);

  const handleAddTenant = useCallback(() => {
    router.push({ pathname: '/tenant/new', params: { propertyId: id! } });
  }, [id]);

  const handleAddRentPayment = useCallback(() => {
    router.push({ pathname: '/rent/new', params: { propertyId: id! } });
  }, [id]);

  const handleShowUsageHistory = useCallback(() => {
    setHistoryVisible(true);
  }, []);

  const overlayTop = headerInset;
  const sceneTopInset =
    headerInset +
    PROPERTY_PAGE_TITLE_HEIGHT +
    PROPERTY_TAB_BAR_HEIGHT +
    (parentProperty ? PARENT_BANNER_HEIGHT : 0);
  const chromeBackdropHeight = sceneTopInset + CHROME_BACKDROP_BLEED;

  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key as TabKey) {
      case 'overview':
        return (
          <PropertyOverviewTab
            property={property!}
            childProperties={childProperties}
            isRented={Boolean(isRented)}
            canManage={canManage}
            isOwner={isOwner}
            currency={currency}
            language={language}
            month={currentMonthRange.month}
            year={currentMonthRange.year}
            monthExpenses={currentMonthExpenses}
            monthExpenseTotal={currentMonthExpenseTotal}
            monthIncome={currentMonthIncome}
            categoryMap={categoryMap}
            rentPayment={currentMonthRentPayment}
            activeTenant={activeTenant}
            hasAnyExpenses={expenses.length > 0}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onOpenAddress={handleOpenAddress}
            onShowUsageHistory={handleShowUsageHistory}
            onGoToRent={goToRentTab}
            onViewAllExpenses={goToExpensesTab}
            onOpenMembers={() => router.push(`/property/members/${property!.id}`)}
            onMarkRentPaid={canManage ? handleCurrentMonthMarkPaid : undefined}
            onSelectTenant={handleSelectTenant}
            onSelectExpense={handleSelectExpense}
            onMarkExpensePaid={handleMarkExpensePaid}
            contentTopInset={sceneTopInset}
          />
        );
      case 'tenants':
        return (
          <PropertyTenantsTab
            tenants={tenants}
            isLoading={tenantsLoading}
            canManage={canManage}
            currency={currency}
            language={language}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onSelectTenant={handleSelectTenant}
            onAddTenant={handleAddTenant}
            contentTopInset={sceneTopInset}
          />
        );
      case 'expenses':
        return (
          <PropertyExpensesTab
            expenses={expenses}
            monthExpenses={currentMonthExpenses}
            monthExpenseTotal={currentMonthExpenseTotal}
            month={currentMonthRange.month}
            year={currentMonthRange.year}
            isLoading={expensesLoading}
            canManage={canManage}
            currency={currency}
            language={language}
            categoryMap={categoryMap}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onSelectExpense={handleSelectExpense}
            onMarkExpensePaid={handleMarkExpensePaid}
            contentTopInset={sceneTopInset}
          />
        );
      case 'rent':
        return (
          <PropertyRentTab
            rentPayments={rentPayments}
            tenantMap={tenantMap}
            year={currentYear}
            isLoading={rentLoading}
            canManage={canManage}
            currency={currency}
            language={language}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onMonthPress={handleRentMonthPress}
            onAddPayment={handleAddRentPayment}
            contentTopInset={sceneTopInset}
          />
        );
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
      hideHeaderTitle
      isLoading={false}
      isReady
      error={null}
      notFoundMessage={t('properties.notFound')}
      onRetry={refetchProperty}
      edgeToEdge
      headerRight={() => (
        <StackHeaderActions>
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
      {/* Keeps glass refracting color on every tab — not only Overview's hero photo. */}
      <PropertyChromeBackdrop photoUrl={property.photo_url} height={chromeBackdropHeight} />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
        renderTabBar={(props) => (
          <View
            pointerEvents="box-none"
            style={[styles.tabOverlay, { top: overlayTop }]}
          >
            <View style={styles.pageTitle}>
              <Text
                className="text-foreground text-2xl leading-8 font-bold"
                numberOfLines={2}
                accessibilityRole="header"
              >
                {property.name}
              </Text>
            </View>
            {parentProperty ? (
              <View className="px-4 pb-1">
                <GlassSurface shape="pill" interactive contentStyle={styles.parentBanner}>
                  <Text
                    className="text-primary text-center text-sm font-medium"
                    onPress={() => router.push(`/property/${parentProperty.id}`)}
                  >
                    {t('properties.linkedTo', { name: parentProperty.name })}
                  </Text>
                </GlassSurface>
              </View>
            ) : null}
            <PropertyTabBar {...props} />
          </View>
        )}
      />

      <UsageHistorySheet
        visible={historyVisible}
        onDismiss={() => setHistoryVisible(false)}
        propertyId={property.id}
        language={language}
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
    </DetailScreenScaffold>
  );
}

const styles = StyleSheet.create({
  tabView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  pageTitle: {
    minHeight: PROPERTY_PAGE_TITLE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: HEADER_EDGE_INSET,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  parentBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
