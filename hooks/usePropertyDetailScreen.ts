import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Route } from 'react-native-tab-view';

import { PROPERTY_TAB_BAR_HEIGHT } from '@/components/property/PropertyTabBar';
import { useFloatingStackHeaderInset } from '@/components/ui/FloatingStackHeader';
import { useLocale } from '@/hooks/useLocale';
import { useMyMembership } from '@/hooks/useMembers';
import { useProfile } from '@/hooks/useProfile';
import { useProperty } from '@/hooks/useProperties';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import { routes } from '@/lib/routes';
import { useUiStore } from '@/stores/uiStore';
import type { RentPayment } from '@/types/app.types';
import { resolveCurrency } from '@/utils/currency';
import { getCurrentMonthRange } from '@/utils/dateRange';
import { formatDateOnly } from '@/utils/formatters';

const PARENT_BANNER_HEIGHT = 44;

export type PropertyTabKey = 'overview' | 'tenants' | 'expenses' | 'rent';

export type PropertyRoute = Route & { key: PropertyTabKey };

/** Chrome + sheet orchestration for the property detail TabView. */
export function usePropertyDetailScreen() {
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
  const { isOwner, canManage } = useMyMembership(id);

  const [index, setIndex] = useState(0);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [statementVisible, setStatementVisible] = useState(false);
  const [rentSheet, setRentSheet] = useState<{
    visible: boolean;
    month: number;
    year: number;
    payment?: RentPayment;
  }>({ visible: false, month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const chromeHidden = rentSheet.visible || statementVisible || historyVisible;

  const { profile } = useProfile();
  const { language } = useLocale();
  const currency = resolveCurrency(profile, property);

  const isRented = property?.usage_status === 'rented';

  const { tenants, refetch: refetchTenants } = useTenants({ propertyId: id });
  const {
    rentPayments,
    refetch: refetchRent,
    create: createRentPayment,
    markAsPaid: markRentAsPaid,
  } = useRentPayments({ propertyId: id });

  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const activeTenant = useMemo(
    () => tenants.find((tenant) => tenant.is_active),
    [tenants],
  );

  const currentMonthRentPayment = useMemo(
    () =>
      rentPayments.find(
        (payment) =>
          payment.period_month === currentMonthRange.month &&
          payment.period_year === currentMonthRange.year,
      ),
    [currentMonthRange.month, currentMonthRange.year, rentPayments],
  );

  const refetchChrome = useCallback(async () => {
    await Promise.all([refetchProperty(), refetchTenants(), refetchRent()]);
  }, [refetchProperty, refetchRent, refetchTenants]);

  useRefetchOnFocus(refetchChrome);

  const tabRoutes = useMemo<PropertyRoute[]>(() => {
    const base: PropertyRoute[] = [{ key: 'overview', title: t('properties.overview') }];
    if (isRented) base.push({ key: 'rent', title: t('properties.rentTab') });
    base.push({ key: 'expenses', title: t('properties.expensesTab') });
    if (isRented) base.push({ key: 'tenants', title: t('properties.tenantsTab') });
    return base;
  }, [isRented, t]);

  const rentTabIndex = useMemo(
    () => tabRoutes.findIndex((route) => route.key === 'rent'),
    [tabRoutes],
  );

  const tenantsTabIndex = useMemo(
    () => tabRoutes.findIndex((route) => route.key === 'tenants'),
    [tabRoutes],
  );

  const goToRentTab = useCallback(() => {
    if (rentTabIndex >= 0) setIndex(rentTabIndex);
  }, [rentTabIndex]);

  const goToTenantsTab = useCallback(() => {
    if (tenantsTabIndex >= 0) setIndex(tenantsTabIndex);
  }, [tenantsTabIndex]);

  const openRentSheet = useCallback((month: number, year: number, payment?: RentPayment) => {
    setRentSheet({ visible: true, month, year, payment });
  }, []);

  const markMonthPaid = useCallback(
    async (month: number, year: number, payment?: RentPayment) => {
      if (!property || !id) return;

      try {
        if (payment) {
          if (payment.status !== 'paid') {
            await markRentAsPaid(payment.id);
          }
        } else if (!activeTenant) {
          router.push({
            pathname: routes.rent.new,
            params: {
              propertyId: id,
              periodMonth: String(month),
              periodYear: String(year),
            },
          });
          return;
        } else {
          await createRentPayment({
            property_id: id,
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

  const handleRentPartialPayment = useCallback(() => {
    if (!id) return;
    const { month, year } = rentSheet;
    router.push({
      pathname: routes.rent.new,
      params: {
        propertyId: id,
        ...(activeTenant ? { tenantId: activeTenant.id } : {}),
        periodMonth: String(month),
        periodYear: String(year),
      },
    });
  }, [activeTenant, id, rentSheet]);

  const handleRentAddDetails = useCallback(() => {
    if (!id) return;
    const { month, year, payment } = rentSheet;
    if (payment) {
      router.push(routes.rent.detail(payment.id));
      return;
    }
    router.push({
      pathname: routes.rent.new,
      params: {
        propertyId: id,
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

  const handleShowUsageHistory = useCallback(() => {
    setHistoryVisible(true);
  }, []);

  const handleRecordPayment = useCallback(() => {
    openRentSheet(
      currentMonthRange.month,
      currentMonthRange.year,
      currentMonthRentPayment,
    );
  }, [currentMonthRange.month, currentMonthRange.year, currentMonthRentPayment, openRentSheet]);

  const overlayTop = headerInset;
  const sceneTopInset =
    headerInset +
    PROPERTY_TAB_BAR_HEIGHT +
    (parentProperty ? PARENT_BANNER_HEIGHT : 0);

  return {
    t,
    id,
    layout,
    property,
    parentProperty,
    isLoading,
    error,
    refetchProperty,
    isOwner,
    canManage,
    currency,
    language,
    index,
    setIndex,
    tabRoutes,
    chromeHidden,
    historyVisible,
    setHistoryVisible,
    statementVisible,
    setStatementVisible,
    rentSheet,
    setRentSheet,
    overlayTop,
    sceneTopInset,
    goToRentTab,
    goToTenantsTab,
    handleShowUsageHistory,
    handleRecordPayment,
    handleRentMonthPress,
    handleRentMarkPaid,
    handleRentPartialPayment,
    handleRentAddDetails,
    showToast,
  };
}
