import { router } from 'expo-router';
import {
  Building2,
  ChartColumn,
  Plus,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';

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
      <View
        style={[
          styles.emptyCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBd,
            borderRadius: theme.radius.xl,
            ...theme.elevation.card,
          },
        ]}
      >
        <View style={[styles.emptyIc, { backgroundColor: colors.primaryTint }]}>
          <Building2 size={25} color={colors.primary} strokeWidth={2} />
        </View>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 23,
            letterSpacing: -0.46,
            color: colors.fg,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {t('empty.noProperties')}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 12.5,
            lineHeight: 20,
            color: colors.muted,
            textAlign: 'center',
            maxWidth: 230,
            marginBottom: 22,
          }}
        >
          {t('empty.noPropertiesHint')}
        </Text>
        <Pressable
          onPress={() => router.push('/property/new')}
          accessibilityRole="button"
          accessibilityLabel={t('properties.addNew')}
          style={[styles.cta, { backgroundColor: colors.primary }]}
        >
          <Plus size={18} color={colors.onPrimary} strokeWidth={2} />
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 14,
              letterSpacing: -0.14,
              color: colors.onPrimary,
            }}
          >
            {t('properties.addNew')}
          </Text>
        </Pressable>
      </View>

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
  emptyCard: {
    paddingTop: 44,
    paddingHorizontal: 22,
    paddingBottom: 38,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  emptyIc: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cta: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
