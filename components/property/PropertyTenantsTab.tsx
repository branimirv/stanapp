import { Plus, Users } from 'lucide-react-native';
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
import { PropertyTenantCard } from '@/components/property/PropertyTenantCard';
import { AppButton } from '@/components/ui/AppButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { listPerformanceProps } from '@/constants/list';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Language, Tenant } from '@/types/app.types';

const PREVIEW_COUNT = 3;

export interface PropertyTenantsTabProps {
  tenants: Tenant[];
  isLoading: boolean;
  canManage: boolean;
  currency: string;
  language: Language;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectTenant: (tenantId: string) => void;
  onAddTenant: () => void;
  /** Clears floating header + tabs; content still peeks under glass. */
  contentTopInset?: number;
}

function keyExtractor(tenant: Tenant) {
  return tenant.id;
}

function PropertyTenantsTabComponent({
  tenants,
  isLoading,
  canManage,
  language,
  refreshing,
  onRefresh,
  onSelectTenant,
  onAddTenant,
  contentTopInset = 0,
}: PropertyTenantsTabProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  const listTopPad = (contentTopInset || 0) + PROPERTY_SCENE_TOP_GAP;
  const ctaBottom = Math.max(insets.bottom, 12) + 10;
  const listBottomPad = canManage ? 72 + ctaBottom : Spacing.xxl;

  const sortedTenants = useMemo(() => {
    return [...tenants].sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return `${a.last_name}${a.first_name}`.localeCompare(
        `${b.last_name}${b.first_name}`,
        language === 'en' ? 'en' : 'hr',
      );
    });
  }, [language, tenants]);

  const visibleTenants = useMemo(() => {
    if (expanded || sortedTenants.length <= PREVIEW_COUNT) {
      return sortedTenants;
    }
    return sortedTenants.slice(0, PREVIEW_COUNT);
  }, [expanded, sortedTenants]);

  const hasMore = sortedTenants.length > PREVIEW_COUNT;

  const renderTenant = useCallback(
    ({ item }: { item: Tenant }) => (
      <PropertyTenantCard
        tenant={item}
        language={language}
        onPress={onSelectTenant}
      />
    ),
    [language, onSelectTenant],
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
        data={visibleTenants}
        keyExtractor={keyExtractor}
        renderItem={renderTenant}
        contentContainerStyle={{
          paddingHorizontal: Spacing.gutter,
          paddingTop: listTopPad,
          paddingBottom: listBottomPad,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        {...listPerformanceProps}
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
              icon={Users}
              title={t('empty.noTenants')}
              subtitle={t('empty.noTenantsHint')}
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
            onPress={onAddTenant}
            className="h-12 w-full"
            accessibilityLabel={t('tenants.addNew')}
            style={styles.ctaShadow}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Plus size={18} color={colors.onPrimary} strokeWidth={2.5} />
              <Text className="text-on-primary text-[15px] font-semibold tracking-[-0.15px]">
                {t('tenants.addNew')}
              </Text>
            </View>
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}

export const PropertyTenantsTab = memo(PropertyTenantsTabComponent);

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
