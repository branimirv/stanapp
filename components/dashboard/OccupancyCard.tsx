import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily, Fonts } from '@/lib/fonts';

export interface OccupancyCardProps {
  rentedCount: number;
  vacantCount: number;
  totalCount: number;
  onPress?: () => void;
}

/** Naslov occupancy — sechead + % · 3-bay strip (rented / vacant / total). */
export function OccupancyCard({
  rentedCount,
  vacantCount,
  totalCount,
  onPress,
}: OccupancyCardProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const occupancyPct = totalCount > 0 ? Math.round((rentedCount / totalCount) * 100) : 0;

  return (
    <View style={{ marginBottom: 16 }}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        <View style={styles.secheadRow}>
          <Text
            style={{
              fontFamily: displayFontFamily(theme.name),
              fontSize: Typography.display.sectionHead.size,
              lineHeight: Typography.display.sectionHead.lineHeight,
              letterSpacing: Typography.display.sectionHead.letterSpacing,
              color: colors.fg,
              flex: 1,
            }}
          >
            {t('dashboard.occupancy')}
          </Text>
          <Text
            style={{
              fontFamily: displayFontFamily(theme.name),
              fontSize: Typography.display.rowFigure.size,
              letterSpacing: Typography.display.rowFigure.letterSpacing,
              color: colors.primary,
            }}
          >
            {occupancyPct} %
          </Text>
          {onPress ? (
            <ChevronRight size={16} color={colors.muted} strokeWidth={2} style={{ marginLeft: 4 }} />
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.bays,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBd,
            borderRadius: theme.radius.xl,
            ...theme.elevation.card,
          },
        ]}
      >
        <Bay
          value={rentedCount}
          label={t('dashboard.rented')}
          valueColor={colors.pos}
        />
        <View style={[styles.divider, { backgroundColor: colors.bd }]} />
        <Bay
          value={vacantCount}
          label={t('dashboard.vacant')}
          valueColor={vacantCount > 0 ? colors.chart[4] : colors.fg}
        />
        <View style={[styles.divider, { backgroundColor: colors.bd }]} />
        <Bay value={totalCount} label={t('dashboard.total')} valueColor={colors.fg} />
      </Pressable>
    </View>
  );
}

function Bay({
  value,
  label,
  valueColor,
}: {
  value: number;
  label: string;
  valueColor: string;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.bay}>
      <Text
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: colors.muted,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: 23,
          letterSpacing: -0.46,
          color: valueColor,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  secheadRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 11,
    gap: 8,
  },
  bays: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
  },
  bay: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 15,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
});
