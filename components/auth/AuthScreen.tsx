import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily, Fonts } from '@/lib/fonts';

/**
 * Auth shell — flat Naslov `--bg` (no ScreenAmbient).
 * Uses RN Text so Uniwind `text-base` cannot override mockup sizes.
 */
export function AuthScreen({
  children,
  contentStyle,
  showBack = false,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showBack?: boolean;
}) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <SafeAreaView style={styles.flex} edges={['top', 'right', 'bottom', 'left']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingHorizontal: theme.spacing.gutter },
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {showBack ? (
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
                style={[styles.back, { backgroundColor: theme.colors.surface2 }]}
              >
                <ChevronLeft size={17} color={theme.colors.fg} strokeWidth={2} />
              </Pressable>
            ) : null}
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/**
 * Title block — sizes from naslov-theme.html Prijava, bumped one step so they
 * read like the 306px mockup phone when viewed on a ~390pt device.
 */
export function AuthTitleBlock({
  eyebrow,
  title,
  subtitle,
  style,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const titleTok = Typography.display.screenTitle;

  return (
    <View style={[styles.titleBlk, style]}>
      {eyebrow ? (
        <Text
          style={{
            fontFamily: Fonts.sans.semibold,
            fontSize: 12,
            lineHeight: 16,
            letterSpacing: 1.68,
            textTransform: 'uppercase',
            color: colors.primary,
            marginBottom: 12,
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: titleTok.size,
          lineHeight: Math.round(titleTok.size * 1.1),
          letterSpacing: titleTok.letterSpacing,
          color: colors.fg,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.sans.regular,
          fontSize: 15,
          lineHeight: 22,
          color: colors.muted,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

export function AuthFooter({
  prompt,
  actionLabel,
  href,
}: {
  prompt: string;
  actionLabel: string;
  href: '/(auth)/login' | '/(auth)/register';
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.footer}>
      <Text
        style={{
          fontFamily: Fonts.sans.regular,
          fontSize: 14,
          lineHeight: 20,
          color: theme.colors.muted,
        }}
      >
        {prompt}{' '}
      </Text>
      <Text
        onPress={() => router.push(href)}
        accessibilityRole="link"
        style={{
          fontFamily: Fonts.sans.semibold,
          fontSize: 14,
          lineHeight: 20,
          color: theme.colors.primary,
        }}
      >
        {actionLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  titleBlk: {
    paddingTop: 6,
    marginBottom: 26,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  footer: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
