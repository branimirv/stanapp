import { router } from 'expo-router';
import {
  Building2,
  ChartColumn,
  Plus,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui/EmptyState';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

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
  const { colors } = theme;

  return (
    <View>
      <EmptyState
        icon={Building2}
        title={t('empty.noProperties')}
        subtitle={t('empty.noPropertiesHint')}
        ctaLabel={t('properties.addNew')}
        ctaIcon={Plus}
        onCtaPress={() => router.push('/property/new')}
        style={styles.emptyState}
      />

      <View
        style={[
          styles.stepsCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBd,
            borderRadius: theme.radius.xl,
            ...theme.elevation.card,
          },
        ]}
      >
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === STEPS.length - 1;
          return (
            <View
              key={step.titleKey}
              style={[styles.stepRow, !isLast && { marginBottom: 14 }]}
            >
              <View style={[styles.stepIcon, { backgroundColor: colors.surface3 }]}>
                <Icon size={18} color={colors.muted} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 13.5,
                    color: colors.fg,
                    marginBottom: 2,
                  }}
                >
                  {t(step.titleKey)}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.sans.semibold,
                    fontSize: 10,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: colors.muted,
                  }}
                >
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

const styles = StyleSheet.create({
  emptyState: {
    marginBottom: 16,
  },
  stepsCard: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
