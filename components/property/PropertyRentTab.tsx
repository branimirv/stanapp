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
import { displayFontFamily, Fonts } from '@/lib/fonts';
import type { Language, RentPayment, Tenant } from '@/types/app.types';

const PREVIEW_COUNT = 3;

export interface PropertyRentTabProps {
  rentPayments: RentPayment[];
  tenantMap: Map<string, Tenant>;
  year: number;
  isLoading: boolean;
  canManage: boolean;
  currency: string;
  language: Language;
  refreshing: boolean;
  onRefresh: () => void;
  onMonthPress: (month: number, payment?: RentPayment) => void;
  onAddPayment: () => void;
  /** Clears floating header + tabs; content still peeks under glass. */
  contentTopInset?: number;
}

function keyExtractor(payment: RentPayment) {
  return payment.id;
}

function PropertyRentTabComponent({
  rentPayments,
  tenantMap,
  year,
  isLoading,
  canManage,
  currency,
  language,
  refreshing,
  onRefresh,
  onMonthPress,
  onAddPayment,
  contentTopInset = 0,
}: PropertyRentTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

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
    return <SkeletonLoader count={3} style={[styles.content, { paddingTop: listTopPad }]} />;
  }

  return (
    <View style={styles.shell}>
      <FlatList
        data={visiblePayments}
        keyExtractor={keyExtractor}
        renderItem={renderPayment}
        contentContainerStyle={[
          styles.content,
          { paddingTop: listTopPad, paddingBottom: listBottomPad },
        ]}
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
                style={{
                  fontFamily: displayFontFamily(theme.name),
                  fontSize: 22,
                  letterSpacing: -0.55,
                  color: colors.fg,
                  marginBottom: 11,
                }}
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
              style={[styles.ghostBtn, { backgroundColor: colors.surface2 }]}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 14,
                  color: colors.fg,
                }}
              >
                {expanded ? t('common.showLess') : t('common.showMore')}
              </Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={[
              styles.empty,
              {
                backgroundColor: colors.surface2,
                borderRadius: theme.radius.xl,
              },
            ]}
          >
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
            mode="contained"
            onPress={onAddPayment}
            className="h-12 w-full"
            accessibilityLabel={t('rent.addPayment')}
            style={styles.ctaShadow}
          >
            <View style={styles.ctaInner}>
              <Plus size={18} color={colors.onPrimary} strokeWidth={2.5} />
              <Text
                style={{
                  fontFamily: Fonts.sans.semibold,
                  fontSize: 15,
                  letterSpacing: -0.15,
                  color: colors.onPrimary,
                }}
              >
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
  shell: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.gutter,
  },
  empty: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
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
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
