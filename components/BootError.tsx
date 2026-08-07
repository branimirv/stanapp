import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Shown when session restore fails (usually offline). Deliberately reuses the
 * boot layout so it reads as the same screen changing state, not a crash.
 */
export function BootError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { theme } = useAppTheme();
  const { colors, typography } = theme;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.stack}>
        <Text
          style={[
            styles.eyebrow,
            { color: colors.neg, fontFamily: typography.fontFamily.sans },
          ]}
        >
          NEUSPJEŠNO POVEZIVANJE
        </Text>

        <Text
          style={[
            styles.wordmark,
            {
              color: colors.fg,
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.displayWeight,
            },
          ]}
        >
          StanApp
        </Text>

        <Text
          style={[
            styles.body,
            { color: colors.muted, fontFamily: typography.fontFamily.sans },
          ]}
        >
          Provjerite internetsku vezu pa pokušajte ponovno.
        </Text>

        <Pressable
          onPress={onRetry}
          style={[styles.btn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.btnLabel,
              { color: colors.onPrimary, fontFamily: typography.fontFamily.sans },
            ]}
          >
            Pokušaj ponovno
          </Text>
        </Pressable>

        {__DEV__ ? (
          <Text style={[styles.debug, { color: colors.muted }]} numberOfLines={3}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stack: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 26,
    paddingBottom: 46,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.54,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  wordmark: { fontSize: 46, lineHeight: 47, letterSpacing: -0.92 },
  body: { fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 250 },
  btn: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  btnLabel: { fontSize: 14, fontWeight: '600', letterSpacing: -0.14 },
  debug: { fontSize: 10, marginTop: 14, opacity: 0.7 },
});
