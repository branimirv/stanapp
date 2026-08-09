import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  ReportActiveFilterChips,
  type ReportFiltersStateProps,
} from '@/components/reports/ReportFilters';
import { FLOATING_ACTIONS_ROW_HEIGHT } from '@/components/ui/FloatingScreenActions';
import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/app.types';

type ReportScreenHeaderProps = {
  periodEyebrow: string;
  properties: Property[];
  propertyFilter: string;
  onPropertyPill: (propertyId: string) => void;
  filterStateProps: ReportFiltersStateProps;
  /** True while a new property/period/category query is still loading. */
  isFilterRefreshing?: boolean;
};

/** Floating spacer, title, property pills, and active filter chips for Analitika. */
export function ReportScreenHeader({
  periodEyebrow,
  properties,
  propertyFilter,
  onPropertyPill,
  filterStateProps,
  isFilterRefreshing = false,
}: ReportScreenHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View>
      <View style={{ height: FLOATING_ACTIONS_ROW_HEIGHT }} />

      <View className="mb-4">
        <Text className="text-muted mb-2.5 text-[11px] leading-3.5 font-semibold tracking-[1.54px] uppercase">
          {periodEyebrow}
        </Text>
        <Text
          className="text-fg text-[34px] tracking-[-0.85px]"
          style={{
            fontFamily: displayFontFamily(theme.name),
            lineHeight: 34,
          }}
        >
          {t('reports.title')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3.5 grow-0"
        style={{ marginHorizontal: -theme.spacing.gutter }}
        contentContainerClassName="flex-row items-center gap-2 pb-px"
        contentContainerStyle={{ paddingHorizontal: theme.spacing.gutter }}
      >
        <Pressable
          onPress={() => onPropertyPill('all')}
          className={cn(
            'h-8.5 items-center justify-center rounded-full px-3.5',
            propertyFilter === 'all' ? 'bg-primary-tint' : 'bg-surface-2',
          )}
          accessibilityRole="button"
          accessibilityState={{ selected: propertyFilter === 'all' }}
        >
          <Text
            className={cn(
              'text-[13px] font-semibold',
              propertyFilter === 'all' ? 'text-primary' : 'text-muted',
            )}
          >
            {t('reports.allProperties')}
          </Text>
        </Pressable>
        {properties.map((property) => {
          const on = propertyFilter === property.id;
          return (
            <Pressable
              key={property.id}
              onPress={() => onPropertyPill(property.id)}
              className={cn(
                'h-8.5 items-center justify-center rounded-full px-3.5',
                on ? 'bg-primary-tint' : 'bg-surface-2',
              )}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text
                className={cn('text-[13px] font-semibold', on ? 'text-primary' : 'text-muted')}
                numberOfLines={1}
              >
                {property.name}
              </Text>
            </Pressable>
          );
        })}
        {isFilterRefreshing ? (
          <View className="h-8.5 w-8.5 items-center justify-center">
            <ActivityIndicator size="small" color={colors.muted} />
          </View>
        ) : null}
      </ScrollView>

      <ReportActiveFilterChips {...filterStateProps} />
    </View>
  );
}
