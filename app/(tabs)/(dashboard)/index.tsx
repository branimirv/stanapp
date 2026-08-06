import { router } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DashboardAlertCard } from '@/components/dashboard/DashboardAlertCard';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPeriodFilter } from '@/components/dashboard/DashboardPeriodFilter';
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions';
import { OccupancyCard } from '@/components/dashboard/OccupancyCard';
import { QuickCreateSheet } from '@/components/dashboard/QuickCreateSheet';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { RentCollectionCard } from '@/components/dashboard/RentCollectionCard';
import {
  IncomeExpenseBays,
  NetIncomeCard,
  previousFromDelta,
} from '@/components/dashboard/SummaryCard';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { ErrorState } from '@/components/ui/ErrorState';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useTabBarStore } from '@/stores/tabBarStore';
import type { DashboardPeriod, Language } from '@/types/app.types';

function getInitialPeriod(): DashboardPeriod {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const [period, setPeriod] = useState<DashboardPeriod>(getInitialPeriod);
  const { stats, isLoading, error, refetch } = useDashboardStats(period);
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { profile } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [createSheetVisible, setCreateSheetVisible] = useState(false);
  const setChromeHidden = useTabBarStore((s) => s.setChromeHidden);
  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;

  const hasNoProperties = !isLoading && !propertiesLoading && properties.length === 0;

  const openCreateSheet = useCallback(() => {
    setChromeHidden(true);
    setCreateSheetVisible(true);
  }, [setChromeHidden]);

  const closeCreateSheet = useCallback(() => {
    setCreateSheetVisible(false);
    setChromeHidden(false);
  }, [setChromeHidden]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const previousNet = useMemo(() => {
    if (!stats) return null;
    return previousFromDelta(stats.netIncome, stats.netDeltaPct);
  }, [stats]);

  const wrap = (children: ReactNode) => (
    <View style={styles.shell} collapsable={false}>
      <View style={styles.content} collapsable={false}>
        {children}
      </View>
      {/* Blur sibling of content — never inside the Modal (see docs/blur). */}
      <BlurOverlay
        visible={createSheetVisible}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
      <QuickCreateSheet visible={createSheetVisible} onDismiss={closeCreateSheet} />
    </View>
  );

  const contentPad = {
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: theme.spacing.scrollBottom,
  };

  if ((isLoading || propertiesLoading) && !stats && !hasNoProperties) {
    return wrap(
      <View style={[contentPad, { paddingTop: 16 }]}>
        <SkeletonLoader count={1} height={56} style={styles.skeleton} />
        <SkeletonLoader count={1} height={48} style={styles.skeleton} />
        <SkeletonLoader count={1} height={120} style={styles.skeleton} />
        <SkeletonLoader count={2} height={100} style={styles.skeleton} />
      </View>,
    );
  }

  if (error && !stats && !hasNoProperties) {
    return wrap(<ErrorState message={error} onRetry={refetch} />);
  }

  if (hasNoProperties) {
    return wrap(
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={contentPad}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <DashboardHeader name={profile?.full_name} language={language} showAdd={false} />
        <DashboardEmptyState />
      </ScrollView>,
    );
  }

  if (!stats) {
    return wrap(
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={contentPad}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <DashboardHeader
          name={profile?.full_name}
          language={language}
          showAdd
          onAddPress={openCreateSheet}
        />
        <DashboardEmptyState />
      </ScrollView>,
    );
  }

  return wrap(
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={contentPad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <DashboardHeader
        name={profile?.full_name}
        language={language}
        showAdd
        onAddPress={openCreateSheet}
      />

      <DashboardPeriodFilter value={period} onChange={setPeriod} language={language} />

      <NetIncomeCard
        title={t('dashboard.netIncome')}
        amount={stats.netIncome}
        currency={stats.currency}
        language={language}
        deltaPct={stats.netDeltaPct}
        previousAmount={previousNet}
      />

      <IncomeExpenseBays
        incomeLabel={t('dashboard.income')}
        incomeAmount={stats.totalRentIncome}
        incomeDeltaPct={stats.incomeDeltaPct}
        expenseLabel={t('dashboard.expenses')}
        expenseAmount={stats.totalExpenses}
        expenseDeltaPct={stats.expensesDeltaPct}
        currency={stats.currency}
        language={language}
      />

      <DashboardQuickActions />

      {stats.expectedRent > 0 ? (
        <RentCollectionCard
          collected={stats.collectedRent}
          expected={stats.expectedRent}
          currency={stats.currency}
          language={language}
          onPress={() => router.push('/(tabs)/properties')}
        />
      ) : null}

      {stats.unpaidRentCount > 0 ? (
        <DashboardAlertCard
          tone="neg"
          title={t('dashboard.unpaidRentCount', { count: stats.unpaidRentCount })}
          subtitle={t('dashboard.unpaidRentAlert')}
          onPress={() => router.push('/(tabs)/properties')}
        />
      ) : null}

      {stats.overdueExpensesCount > 0 ? (
        <DashboardAlertCard
          tone="neg"
          title={t('dashboard.overdueCount', { count: stats.overdueExpensesCount })}
          subtitle={t('dashboard.overdueAlert')}
          onPress={() =>
            router.push({ pathname: '/(tabs)/expenses', params: { filter: 'overdue' } })
          }
        />
      ) : null}

      {stats.upcomingDueCount > 0 ? (
        <DashboardAlertCard
          tone="warn"
          title={t('dashboard.upcomingDueCount', { count: stats.upcomingDueCount })}
          subtitle={t('dashboard.upcomingDueAlert')}
          onPress={() =>
            router.push({ pathname: '/(tabs)/expenses', params: { filter: 'unpaid' } })
          }
        />
      ) : null}

      {stats.contractsExpiringCount > 0 ? (
        <DashboardAlertCard
          tone="primary"
          title={t('dashboard.contractsExpiringCount', { count: stats.contractsExpiringCount })}
          subtitle={t('dashboard.contractsExpiringAlert')}
          onPress={() => router.push('/(tabs)/properties')}
        />
      ) : null}

      <OccupancyCard
        rentedCount={stats.rentedCount}
        vacantCount={stats.vacantCount}
        totalCount={stats.totalPropertiesCount}
        onPress={() => router.push('/(tabs)/properties')}
      />

      <RecentActivity
        items={stats.recentActivity}
        language={language}
        onItemPress={(item) => {
          if (item.type === 'rent_payment') {
            router.push(`/rent/${item.id}`);
          } else {
            router.push(`/expense/${item.id}`);
          }
        }}
      />
    </ScrollView>,
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  skeleton: {
    marginBottom: 16,
  },
});
