/**
 * components/BootScreen.tsx
 *
 * The bootstrap screen — variant F, "Prozori se pale".
 *
 * Shown while fonts load and the Supabase session is restored. It is a REAL
 * React screen, not the native splash: the native splash is a static image
 * that cannot animate. See docs/splash/SPLASH_HANDOFF.md §2.
 *
 * Layout is the app's `titleblk` pattern — eyebrow, then Fraunces wordmark,
 * bottom-left — so the transition into Početna keeps the same type in the
 * same place.
 *
 * Indicator: Lucide `Building2` with its four window strokes lighting
 * BOTTOM → TOP, like units coming online.
 *
 * NOTE — the icon is inlined as raw SVG rather than imported from
 * lucide-react-native, because we animate individual <Path> children and the
 * Lucide component does not expose them. Path data is copied verbatim from
 * lucide-react-native's Building2; re-copy it if you upgrade Lucide.
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  useReducedMotion,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One full loop. Matches the 2.4s in the mockup. */
const CYCLE = 2400;
/** Stagger between floors: 4 windows × 250ms = 750ms to travel the building. */
const STAGGER = 250;

const RISE = 430; // window lights
const HOLD = 580; // stays lit
const FALL = 380; // fades back
const REST = CYCLE - RISE - HOLD - FALL; // idle so all four stay in phase

/**
 * Window stroke data, ordered BOTTOM → TOP.
 *
 * y=18 is the ground floor and y=6 the top — SVG y grows downward, so the
 * visual bottom is the LARGEST y. Ordering this array by lighting sequence
 * rather than by y keeps the stagger index trivially correct; don't re-sort
 * it to look like the original icon markup.
 */
const WINDOWS = ['M10 18h4', 'M10 14h4', 'M10 10h4', 'M10 6h4'] as const;

function Window({ d, index }: { d: string; index: number }) {
  const t = useSharedValue(0);
  const { theme } = useAppTheme();
  const { colors } = theme;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      // Respect the OS setting: hold every window lit instead of pulsing.
      // The screen still reads as branded, just still.
      t.value = 1;
      return;
    }

    t.value = withDelay(
      index * STAGGER,
      withRepeat(
        withSequence(
          withTiming(1, { duration: RISE, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: HOLD }),
          withTiming(0, { duration: FALL, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: REST }),
        ),
        -1,
        false,
      ),
    );

    return () => cancelAnimation(t);
  }, [index, reducedMotion, t]);

  const stroke = useDerivedValue(() =>
    interpolateColor(t.value, [0, 1], [colors.bdStrong, colors.primary]),
  );

  const animatedProps = useAnimatedProps(() => ({ stroke: stroke.value }));

  return (
    <AnimatedPath
      d={d}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      animatedProps={animatedProps}
    />
  );
}

export function BootScreen() {
  const { theme } = useAppTheme();
  const { colors, typography } = theme;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.stack}>
        <Text
          style={[
            styles.eyebrow,
            {
              color: colors.muted,
              fontFamily: typography.fontFamily.sans,
              letterSpacing: typography.eyebrow.base.letterSpacing,
            },
          ]}
        >
          NEKRETNINE · NAJAM · TROŠKOVI
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

        <View style={styles.mark}>
          <Svg width={34} height={34} viewBox="0 0 24 24">
            {/* static shell — the outline never animates */}
            <G
              stroke={colors.bdStrong}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <Path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <Path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <Path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            </G>

            {WINDOWS.map((d, i) => (
              <Window key={d} d={d} index={i} />
            ))}
          </Svg>
        </View>
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
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  wordmark: {
    fontSize: 46,
    lineHeight: 47,
    letterSpacing: -0.92,
  },
  mark: { marginTop: 24 },
});

export default BootScreen;
