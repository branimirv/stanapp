import { router } from 'expo-router';
import {
  Building2,
  ChartColumn,
  Plus,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';
import { useAppTheme } from '@/hooks/useAppTheme';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';

const STEPS: { icon: LucideIcon; titleKey: string; hintKey: string }[] = [
  {
    icon: Building2,
    titleKey: 'dashboard.onboardingAddProperty',
    hintKey: 'dashboard.onboardingAddPropertyHint',
  },
  {
    icon: Users,
    titleKey: 'dashboard.onboardingAddTenant',
    hintKey: 'dashboard.onboardingAddTenantHint',
  },
  {
    icon: ChartColumn,
    titleKey: 'dashboard.onboardingTrack',
    hintKey: 'dashboard.onboardingTrackHint',
  },
];

/** Naslov Početna · prazno — empty card + onboarding steps. */
export function DashboardEmptyState() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors, elevation } = theme;

  return (
    <View>
      <EmptyState
        icon={Building2}
        title={t('empty.noProperties')}
        subtitle={t('empty.noPropertiesHint')}
        ctaLabel={t('properties.addNew')}
        ctaIcon={Plus}
        onCtaPress={() => router.push(routes.property.new)}
        className="mb-4"
      />

      <View
        className="border-card-bd bg-surface rounded-xl border px-4.5 py-4"
        style={elevation.card}
      >
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === STEPS.length - 1;
          return (
            <View
              key={step.titleKey}
              className={cn('flex-row items-start gap-3', !isLast && 'mb-3.5')}
            >
              <View className="bg-surface-3 h-9.5 w-9.5 items-center justify-center rounded-full">
                <Icon size={18} color={colors.muted} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-fg mb-0.5 text-[13.5px] font-semibold">
                  {t(step.titleKey)}
                </Text>
                <Text className="text-muted text-[10px] font-semibold tracking-[0.8px] uppercase">
                  {t(step.hintKey)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
