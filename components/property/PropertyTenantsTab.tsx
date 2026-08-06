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
import { Fonts } from '@/lib/fonts';
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
  const { colors, radius } = theme;
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
    return <SkeletonLoader count={3} style={[styles.content, { paddingTop: listTopPad }]} />;
  }

  return (
    <View style={styles.shell}>
      <FlatList
        data={visibleTenants}
        keyExtractor={keyExtractor}
        renderItem={renderTenant}
        contentContainerStyle={[
          styles.content,
          { paddingTop: listTopPad, paddingBottom: listBottomPad },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        {...listPerformanceProps}
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
                borderRadius: radius.xl,
              },
            ]}
          >
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
