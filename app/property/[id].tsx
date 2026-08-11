import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Pencil, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import { TabView, type Route } from 'react-native-tab-view';

import { DetailScreenScaffold } from '@/components/ui/DetailScreenScaffold';
import { StackHeaderActions } from '@/components/ui/StackHeaderActions';
import { HeaderIconButton } from '@/components/ui/HeaderIconButton';
import { PropertyExpensesTab } from '@/components/property/PropertyExpensesTab';
import { PropertyOverviewTab } from '@/components/property/PropertyOverviewTab';
import { PropertyParentBanner } from '@/components/property/PropertyParentBanner';
import { PropertyRentTab } from '@/components/property/PropertyRentTab';
import { PropertyTabBar } from '@/components/property/PropertyTabBar';
import { PropertyTenantsTab } from '@/components/property/PropertyTenantsTab';
import { UsageHistorySheet } from '@/components/property/UsageHistorySheet';
import { StatementSheet } from '@/components/property/StatementSheet';
import { RentMonthActionSheet } from '@/components/rent/RentMonthActionSheet';
import { APP_BOTTOM_SHEET_CLOSE_MS } from '@/components/ui/AppBottomSheet';
import { BlurOverlay } from '@/components/ui/BlurOverlay';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  usePropertyDetailScreen,
  type PropertyTabKey,
} from '@/hooks/usePropertyDetailScreen';
import { routes } from '@/lib/routes';

/** Android ViewPager leaves a 1px white seam; skip the pager there. */
const USE_PAGER = Platform.OS !== 'android';

export default function PropertyDetailScreen() {
  const { theme } = useAppTheme();
  const {
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
  } = usePropertyDetailScreen();

  const sharedTabProps = {
    propertyId: id!,
    canManage,
    currency,
    language,
    contentTopInset: sceneTopInset,
  };

  const renderSceneContent = (routeKey: PropertyTabKey): ReactNode => {
    switch (routeKey) {
      case 'overview':
        return (
          <PropertyOverviewTab
            {...sharedTabProps}
            isOwner={isOwner}
            onGoToRent={goToRentTab}
            onGoToTenants={goToTenantsTab}
            onShowUsageHistory={handleShowUsageHistory}
            onRecordPayment={handleRecordPayment}
          />
        );
      case 'tenants':
        return <PropertyTenantsTab {...sharedTabProps} />;
      case 'expenses':
        return <PropertyExpensesTab {...sharedTabProps} />;
      case 'rent':
        return (
          <PropertyRentTab {...sharedTabProps} onMonthPress={handleRentMonthPress} />
        );
      default:
        return null;
    }
  };

  const renderScene = ({ route }: { route: Route }) => (
    <View style={[styles.scene, { backgroundColor: theme.colors.bg }]}>
      {renderSceneContent(route.key as PropertyTabKey)}
    </View>
  );

  const renderTabChrome = () =>
    chromeHidden ? null : (
      <View pointerEvents="box-none" style={[styles.tabOverlay, { top: overlayTop }]}>
        {parentProperty ? <PropertyParentBanner parent={parentProperty} /> : null}
        <PropertyTabBar routes={tabRoutes} index={index} onIndexChange={setIndex} />
      </View>
    );

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

  const activeRoute = tabRoutes[index] ?? tabRoutes[0];

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
      chromeHidden={chromeHidden}
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
              onPress={() => router.push(routes.property.edit(property.id))}
              accessibilityLabel={t('common.edit')}
            />
          ) : null}
        </StackHeaderActions>
      )}
    >
      {USE_PAGER ? (
        <TabView
          navigationState={{ index, routes: tabRoutes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={[styles.tabView, { backgroundColor: theme.colors.bg }]}
          pagerStyle={{ backgroundColor: theme.colors.bg }}
          renderTabBar={() => renderTabChrome()}
        />
      ) : (
        <View style={[styles.tabView, { backgroundColor: theme.colors.bg }]}>
          {renderTabChrome()}
          <View style={[styles.scene, { backgroundColor: theme.colors.bg }]}>
            {activeRoute ? renderSceneContent(activeRoute.key as PropertyTabKey) : null}
          </View>
        </View>
      )}

      <BlurOverlay
        visible={rentSheet.visible || statementVisible || historyVisible}
        intensity="strong"
        tint="dark"
        duration={APP_BOTTOM_SHEET_CLOSE_MS}
        zIndex={30}
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
        currency={currency}
        language={language}
        onExportSuccess={() =>
          showToast({ message: t('statement.exportSuccess'), type: 'success' })
        }
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
    overflow: 'hidden',
  },
  scene: {
    flex: 1,
  },
  tabOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
