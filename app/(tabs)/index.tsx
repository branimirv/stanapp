import { router } from 'expo-router';
import { Banknote, Building2, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useGlassTabBarInset } from '@/hooks/useGlassTabBarInset';
import { useDefaultTabHeader } from '@/hooks/useDefaultTabHeader';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPeriodFilter } from '@/components/dashboard/DashboardPeriodFilter';
import { OccupancyCard } from '@/components/dashboard/OccupancyCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { RecentProperties } from '@/components/dashboard/RecentProperties';
import { RentCollectionCard } from '@/components/dashboard/RentCollectionCard';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Colors, Spacing } from '@/constants/theme';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { formatCurrency } from '@/utils/formatters';
import type { DashboardPeriod, Language } from '@/types/app.types';

function getInitialPeriod(): DashboardPeriod {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { scrollPadding } = useGlassTabBarInset();
  useDefaultTabHeader();
  const [period, setPeriod] = useState<DashboardPeriod>(getInitialPeriod);
  const { stats, isLoading, error, refetch } = useDashboardStats(period);
  const { properties } = useProperties();
  const { profile } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;

  const recentProperties = useMemo(() => properties.slice(0, 3), [properties]);
  const hasNoProperties = !isLoading && properties.length === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SkeletonLoader count={1} height={56} style={styles.skeleton} />
        <SkeletonLoader count={1} height={48} style={styles.skeleton} />
        <SkeletonLoader count={1} height={120} style={styles.skeleton} />
        <SkeletonLoader count={2} height={100} style={styles.skeleton} />
        <SkeletonLoader count={3} height={72} />
      </View>
    );
  }

  if (error && !stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState message={error} onRetry={refetch} />
      </View>
    );
  }

  if (hasNoProperties) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon={Building2}
          title={t('empty.noProperties')}
          subtitle={t('empty.noPropertiesHint')}
          ctaLabel={t('properties.addNew')}
          onCtaPress={() => router.push('/property/new')}
        />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState title={t('empty.noActivity')} subtitle={t('empty.noActivityHint')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <DashboardHeader name={profile?.full_name} language={language} />

        <DashboardPeriodFilter value={period} onChange={setPeriod} language={language} />

        <SummaryCard
          title={t('dashboard.netIncome')}
          value={formatCurrency(stats.netIncome, stats.currency, language)}
          icon={Banknote}
          accentColor={Colors.primary}
          delta={stats.netDeltaPct}
          hero
        />

        <View style={styles.summaryRow}>
          <SummaryCard
            title={t('dashboard.income')}
            value={formatCurrency(stats.totalRentIncome, stats.currency, language)}
            icon={TrendingUp}
            accentColor={Colors.accent}
            delta={stats.incomeDeltaPct}
          />
          <SummaryCard
            title={t('dashboard.expensesBilled')}
            value={formatCurrency(stats.totalExpenses, stats.currency, language)}
            icon={TrendingDown}
            accentColor={Colors.danger}
            delta={stats.expensesDeltaPct}
            invertDelta
          />
        </View>

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
          <AlertBanner
            variant="danger"
            title={t('dashboard.unpaidRentCount', { count: stats.unpaidRentCount })}
            message={t('dashboard.unpaidRentAlert')}
            actionLabel={t('dashboard.viewUnpaidRent')}
            onPress={() => router.push('/(tabs)/properties')}
          />
        ) : null}

        {stats.overdueExpensesCount > 0 ? (
          <AlertBanner
            variant="danger"
            title={t('dashboard.overdueCount', { count: stats.overdueExpensesCount })}
            message={t('dashboard.overdueAlert')}
            actionLabel={t('dashboard.viewOverdue')}
            onPress={() =>
              router.push({ pathname: '/(tabs)/expenses', params: { filter: 'overdue' } })
            }
          />
        ) : null}

        {stats.upcomingDueCount > 0 ? (
          <AlertBanner
            variant="warning"
            title={t('dashboard.upcomingDueCount', { count: stats.upcomingDueCount })}
            message={t('dashboard.upcomingDueAlert')}
            actionLabel={t('dashboard.viewUpcoming')}
            onPress={() =>
              router.push({ pathname: '/(tabs)/expenses', params: { filter: 'unpaid' } })
            }
          />
        ) : null}

        {stats.contractsExpiringCount > 0 ? (
          <AlertBanner
            variant="info"
            title={t('dashboard.contractsExpiringCount', { count: stats.contractsExpiringCount })}
            message={t('dashboard.contractsExpiringAlert')}
            onPress={() => router.push('/(tabs)/properties')}
          />
        ) : null}

        <OccupancyCard
          rentedCount={stats.rentedCount}
          vacantCount={stats.vacantCount}
          totalCount={stats.totalPropertiesCount}
          onPress={() => router.push('/(tabs)/properties')}
        />

        <QuickActions />

        <RecentActivity items={stats.recentActivity} language={language} />

        <RecentProperties
          properties={recentProperties}
          currency={stats.currency}
          language={language}
          onPropertyPress={(property) => router.push(`/property/${property.id}`)}
          onViewAll={() => router.push('/(tabs)/properties')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  skeleton: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});
