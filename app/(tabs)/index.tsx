import { router } from 'expo-router';
import { Banknote, Building2, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AppFabGroup } from '@/components/ui/AppFabGroup';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardPeriodFilter } from '@/components/dashboard/DashboardPeriodFilter';
import { OverdueAlert } from '@/components/dashboard/OverdueAlert';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { RecentProperties } from '@/components/dashboard/RecentProperties';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { formatCurrency } from '@/utils/formatters';
import type { DashboardPeriod, Language } from '@/types/app.types';

function getInitialPeriod(): DashboardPeriod {
  const now = new Date();
  return { mode: 'month', month: now.getMonth() + 1, year: now.getFullYear() };
}

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<DashboardPeriod>(getInitialPeriod);
  const { stats, isLoading, error, refetch } = useDashboardStats(period);
  const { properties } = useProperties();
  const { profile } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const language = (profile?.language ?? i18n.language ?? 'hr') as Language;

  const recentProperties = useMemo(() => properties.slice(0, 3), [properties]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SkeletonLoader count={3} height={100} style={styles.skeleton} />
        <SkeletonLoader count={1} height={72} style={styles.skeleton} />
        <SkeletonLoader count={4} height={72} />
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
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 88 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <DashboardPeriodFilter value={period} onChange={setPeriod} language={language} />

        <View style={styles.summaryRow}>
          <SummaryCard
            title={t('dashboard.income')}
            value={formatCurrency(stats.totalRentIncome, stats.currency, language)}
            icon={TrendingUp}
            accentColor={Colors.accent}
          />
          <SummaryCard
            title={t('dashboard.expenses')}
            value={formatCurrency(stats.totalExpenses, stats.currency, language)}
            icon={TrendingDown}
            accentColor={Colors.danger}
          />
          <SummaryCard
            title={t('dashboard.netIncome')}
            value={formatCurrency(stats.netIncome, stats.currency, language)}
            icon={Banknote}
            accentColor={Colors.primary}
          />
        </View>

        <View style={styles.countsRow}>
          <Text style={[styles.count, { color: theme.colors.onSurfaceVariant }]}>
            {t('dashboard.propertiesCount', { count: stats.activePropertiesCount })}
          </Text>
          <Text style={[styles.count, { color: theme.colors.onSurfaceVariant }]}>
            {t('dashboard.tenantsCount', { count: stats.activeTenantsCount })}
          </Text>
        </View>

        <OverdueAlert
          count={stats.overdueExpensesCount}
          onPress={() =>
            router.push({ pathname: '/(tabs)/expenses', params: { filter: 'overdue' } })
          }
        />

        <RecentActivity items={stats.recentActivity} language={language} />

        <RecentProperties
          properties={recentProperties}
          currency={stats.currency}
          language={language}
          onPropertyPress={(property) => router.push(`/property/${property.id}`)}
          onViewAll={() => router.push('/(tabs)/properties')}
        />
      </ScrollView>

      <AppFabGroup
        actions={[
          {
            icon: Receipt,
            label: t('dashboard.addExpense'),
            onPress: () => router.push('/expense/new'),
          },
          {
            icon: Wallet,
            label: t('dashboard.addPayment'),
            onPress: () => router.push('/rent/new'),
          },
          {
            icon: Building2,
            label: t('dashboard.addProperty'),
            onPress: () => router.push('/property/new'),
          },
        ]}
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        fabStyle={{ backgroundColor: theme.colors.primary }}
      />
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
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  count: {
    ...Typography.bodySmall,
  },
  fab: {
    position: 'absolute',
    right: 0,
  },
});
