import { Building2, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '@/constants/theme';

export interface OccupancyCardProps {
  rentedCount: number;
  vacantCount: number;
  totalCount: number;
  onPress?: () => void;
}

export function OccupancyCard({
  rentedCount,
  vacantCount,
  totalCount,
  onPress,
}: OccupancyCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const occupancyPct = totalCount > 0 ? Math.round((rentedCount / totalCount) * 100) : 0;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.dark ? Colors.surfaceDark : Colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${Colors.primary}22` }]}>
          <Building2 size={20} color={Colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('dashboard.occupancy')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('dashboard.occupancyRate', { percent: occupancyPct })}
          </Text>
        </View>
        {onPress ? (
          <ChevronRight size={20} color={theme.colors.onSurfaceVariant} strokeWidth={2} />
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: Colors.accent }]}>{rentedCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('dashboard.rented')}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
        <View style={styles.stat}>
          <Text
            style={[
              styles.statValue,
              { color: vacantCount > 0 ? Colors.warning : theme.colors.onSurfaceVariant },
            ]}
          >
            {vacantCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('dashboard.vacant')}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{totalCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('dashboard.total')}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.titleMedium,
  },
  subtitle: {
    ...Typography.bodySmall,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statValue: {
    ...Typography.headlineMedium,
  },
  statLabel: {
    ...Typography.labelSmall,
  },
  divider: {
    width: 1,
    height: 32,
  },
});
