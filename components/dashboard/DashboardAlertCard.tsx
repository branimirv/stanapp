import {
  ChevronRight,
  CircleAlert,
  Clock,
  FileText,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { displayFontFamily, Fonts } from '@/lib/fonts';

export type DashboardAlertTone = 'neg' | 'warn' | 'primary';

export interface DashboardAlertCardProps {
  title: string;
  subtitle: string;
  tone?: DashboardAlertTone;
  icon?: LucideIcon;
  onPress?: () => void;
}

const DEFAULT_ICONS: Record<DashboardAlertTone, LucideIcon> = {
  neg: CircleAlert,
  warn: Clock,
  primary: FileText,
};

/** Naslov alert row — tinted icon well, Fraunces title, lab-sm subtitle, chevron. */
export function DashboardAlertCard({
  title,
  subtitle,
  tone = 'neg',
  icon,
  onPress,
}: DashboardAlertCardProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const Icon = icon ?? DEFAULT_ICONS[tone];

  const accent =
    tone === 'neg' ? colors.neg : tone === 'warn' ? colors.chart[4] : colors.primary;
  const tint =
    tone === 'neg' ? colors.negTint : tone === 'warn' ? colors.chartTint[4] : colors.primaryTint;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBd,
          borderRadius: theme.radius.xl,
          ...theme.elevation.card,
        },
      ]}
    >
      <View style={[styles.iconWell, { backgroundColor: tint }]}>
        <Icon size={18} color={accent} strokeWidth={2} />
      </View>
      <View style={styles.copy}>
        <Text
          style={{
            fontFamily: displayFontFamily(theme.name),
            fontSize: 17,
            letterSpacing: -0.34,
            color: accent,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 10,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: colors.muted,
            marginTop: 4,
          }}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
      {onPress ? <ChevronRight size={16} color={colors.muted} strokeWidth={2} /> : null}
    </Pressable>
  );
}

/** @deprecated Prefer DashboardAlertCard — kept as unpaid alias. */
export function DashboardUnpaidCard(props: Omit<DashboardAlertCardProps, 'tone' | 'icon'>) {
  return <DashboardAlertCard {...props} tone="neg" />;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconWell: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
});
