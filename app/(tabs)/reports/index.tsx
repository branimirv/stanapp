import { RefreshControl, ScrollView, View } from 'react-native';

import { ReportBody } from '@/components/reports/ReportBody';
import { ReportFiltersSheetHost } from '@/components/reports/ReportFilters';
import { ReportScreenActions } from '@/components/reports/ReportScreenActions';
import { ReportScreenHeader } from '@/components/reports/ReportScreenHeader';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReportsScreen } from '@/hooks/useReportsScreen';

export default function ReportsScreen() {
  const { theme } = useAppTheme();
  const screen = useReportsScreen();

  if (screen.isLoading && !screen.report) {
    return (
      <View className="flex-1 bg-transparent">
        <SkeletonLoader count={5} height={120} className="p-4" />
      </View>
    );
  }

  if (screen.error && !screen.report) {
    return (
      <View className="flex-1 bg-transparent">
        <ErrorState message={screen.error} onRetry={screen.refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent" collapsable={false}>
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          {
            flexGrow: 1,
            paddingTop: 0,
            paddingHorizontal: theme.spacing.gutter,
            paddingBottom: theme.spacing.scrollBottom,
          },
          !screen.report || !screen.hasData ? { flexGrow: 0 } : null,
        ]}
        refreshControl={
          <RefreshControl refreshing={screen.refreshing} onRefresh={screen.onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ReportScreenHeader
          periodEyebrow={screen.periodEyebrow}
          properties={screen.properties}
          propertyFilter={screen.propertyFilter}
          onPropertyPill={screen.handlePropertyPill}
          filterStateProps={screen.filterStateProps}
          isFilterRefreshing={screen.isFilterRefreshing}
        />

        <View className={screen.isFilterRefreshing ? 'opacity-55' : undefined}>
          <ReportBody
            report={screen.report}
            hasData={screen.hasData}
            showPerProperty={screen.showPerProperty}
            language={screen.language}
            onAddExpense={screen.handleAddExpense}
          />
        </View>
      </ScrollView>

      <ReportScreenActions
        activeFilterCount={screen.activeFilterCount}
        onFilterPress={screen.handleFilterPress}
        onDownloadPress={screen.handleExport}
        downloadDisabled={screen.downloadDisabled}
      />

      <BlurOverlay
        visible={screen.filtersVisible}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={5}
      />
      <ReportFiltersSheetHost
        sheetVisible={screen.filtersVisible}
        onSheetVisibleChange={screen.handleFiltersVisibleChange}
        {...screen.filterStateProps}
      />
    </View>
  );
}
