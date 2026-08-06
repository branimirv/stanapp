import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Fonts } from '@/lib/fonts';

export interface FilterChip {
  key: string;
  label: string;
  onClear: () => void;
}

interface FilterChipRowProps {
  chips: FilterChip[];
}

/**
 * Naslov `.fchip` row — applied filters with primary outline + clear.
 * Wraps to multiple rows so chips never clip off-screen.
 * See Analitika · filtrirano in naslov-theme.html.
 */
export function FilterChipRow({ chips }: FilterChipRowProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { colors } = theme;

  if (chips.length === 0) return null;

  return (
    <View style={styles.row}>
      {chips.map((chip) => (
        <View
          key={chip.key}
          style={[
            styles.fchip,
            {
              backgroundColor: colors.primaryTint,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 12,
              letterSpacing: -0.12,
              color: colors.primary,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {chip.label}
          </Text>
          <Pressable
            onPress={chip.onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.removeFilter', { filter: chip.label })}
            style={styles.clearHit}
          >
            <X size={15} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  fchip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 30,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
    maxWidth: '100%',
  },
  clearHit: {
    padding: 2,
  },
});
