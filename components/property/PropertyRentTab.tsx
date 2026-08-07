import { Plus } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PROPERTY_SCENE_TOP_GAP } from '@/components/property/PropertyTabBar';
import { MonthlyGrid } from '@/components/rent/MonthlyGrid';
import { RentPaymentCard } from '@/components/rent/RentPaymentCard';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { useRentPayments } from '@/hooks/useRentPayments';
import { useTenants } from '@/hooks/useTenants';
import { displayFontFamily } from '@/lib/fonts';
import { routes } from '@/lib/routes';
import type { Language, RentPayment } from '@/types/app.types';

const PREVIEW_COUNT = 3;

export interface PropertyRentTabProps {
  propertyId: string;
  canManage: boolean;
  currency: string;
  language: Language;
  contentTopInset?: number;
  onMonthPress: (month: number, payment?: RentPayment) => void;
}

function keyExtractor(payment: RentPayment) {
  return payment.id;
}

function PropertyRentTabComponent({
  propertyId,
  canManage,
  currency,
  language,
  contentTopInset = 0,
  onMonthPress,
}: PropertyRentTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  const { rentPayments, isLoading, refetch: refetchRent } = useRentPayments({ propertyId });
  const { tenants, refetch: refetchTenants } = useTenants({ propertyId });

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchRent(), refetchTenants()]);
  }, [refetchRent, refetchTenants]);

  useRefetchOnFocus(refetchAll);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  }, [refetchAll]);

  const handleAddPayment = useCallback(() => {
    router.push({ pathname: routes.rent.new, params: { propertyId } });
  }, [propertyId]);

  const tenantMap = useMemo(
    () => new Map(tenants.map((tenant) => [tenant.id, tenant])),
    [tenants],
  );

  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const ctaBottom = Math.max(insets.bottom, 12) + 10;
  const listBottomPad = canManage ? 72 + ctaBottom : Spacing.xxl;

  const sortedPayments = useMemo(() => {
    return [...rentPayments].sort((a, b) => {
      if (a.period_year !== b.period_year) return b.period_year - a.period_year;
      return b.period_month - a.period_month;
    });
  }, [rentPayments]);

  const visiblePayments = useMemo(() => {
    if (expanded || sortedPayments.length <= PREVIEW_COUNT) {
      return sortedPayments;
    }
    return sortedPayments.slice(0, PREVIEW_COUNT);
  }, [expanded, sortedPayments]);

  const hasMore = sortedPayments.length > PREVIEW_COUNT;

  const renderPayment = useCallback(
    ({ item }: { item: RentPayment }) => {
      const tenant = tenantMap.get(item.tenant_id);
      return (
        <RentPaymentCard
          payment={item}
          tenantName={tenant ? `${tenant.first_name} ${tenant.last_name}` : undefined}
          currency={currency}
          language={language}
        />
      );
    },
    [currency, language, tenantMap],
  );

  if (isLoading) {
    return (
      <SkeletonLoader
        count={3}
        style={{ paddingHorizontal: Spacing.gutter, paddingTop: listTopPad }}
      />
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={visiblePayments}
        keyExtractor={keyExtractor}
        renderItem={renderPayment}
        contentContainerStyle={{
          paddingHorizontal: Spacing.gutter,
          paddingTop: listTopPad,
          paddingBottom: listBottomPad,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        {...listPerformanceProps}
        ListHeaderComponent={
          <View>
            <MonthlyGrid
              payments={rentPayments}
              year={year}
              language={language}
              onMonthPress={onMonthPress}
            />
            {sortedPayments.length > 0 ? (
              <Text
                className="text-fg mb-2.75 text-[22px] tracking-[-0.55px]"
                style={{ fontFamily: displayFontFamily(theme.name) }}
              >
                {t('rent.title')}
              </Text>
            ) : null}
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <Pressable
              onPress={() => setExpanded((current) => !current)}
              className="bg-surface-2 mb-2 min-h-12 flex-row items-center justify-center gap-1.5 rounded-full px-4.5"
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <Text className="text-fg text-sm font-semibold">
                {expanded ? t('common.showLess') : t('common.showMore')}
              </Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          <View className="bg-surface-2 rounded-xl px-2 py-4">
            <EmptyState
              title={t('empty.noRentPayments')}
              subtitle={t('empty.noRentPaymentsHint')}
            />
          </View>
        }
      />

      {canManage ? (
        <View
          pointerEvents="box-none"
          style={[styles.ctaWrap, { paddingBottom: ctaBottom }]}
        >
          <AppButton
            variant="default"
            onPress={handleAddPayment}
            className="h-12 w-full"
            accessibilityLabel={t('rent.addPayment')}
            style={styles.ctaShadow}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Plus size={18} color={colors.onPrimary} strokeWidth={2.5} />
              <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
                {t('rent.addPayment')}
              </Text>
            </View>
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}

export const PropertyRentTab = memo(PropertyRentTabComponent);

const styles = StyleSheet.create({
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.gutter,
  },
  ctaShadow: {
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
