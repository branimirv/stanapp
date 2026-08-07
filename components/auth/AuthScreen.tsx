import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

import { HeaderBtnIco } from '@/components/ui/HeaderActionsPill';
import { HEADER_ICON_SIZE } from '@/constants/header';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Typography } from '@/constants/theme';
import { displayFontFamily } from '@/lib/fonts';
import { routes } from '@/lib/routes';

/**
 * Auth shell — flat Naslov `--bg` (no ScreenAmbient).
 * Layout flex via StyleSheet so a Uniwind miss cannot collapse the screen.
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
    <View style={[styles.fill, { backgroundColor: theme.colors.bg }]}>
      <SafeAreaView style={styles.fill} edges={['top', 'right', 'bottom', 'left']}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              {
                flexGrow: 1,
                paddingBottom: 40,
                paddingHorizontal: theme.spacing.gutter,
              },
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {showBack ? (
              <HeaderBtnIco
                onPress={() => router.back()}
                accessibilityLabel={t('common.back')}
                style={{ marginTop: 8, marginBottom: 8 }}
              >
                <ChevronLeft size={HEADER_ICON_SIZE} color={theme.colors.fg} strokeWidth={2} />
              </HeaderBtnIco>
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
  const titleTok = Typography.display.screenTitle;

  return (
    <View style={[{ marginBottom: 26, paddingTop: 6 }, style]}>
      {eyebrow ? (
        <Text
          style={{
            color: theme.colors.primary,
            marginBottom: 12,
            fontSize: 12,
            lineHeight: 16,
            fontWeight: '600',
            letterSpacing: 1.68,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        style={{
          color: theme.colors.fg,
          fontFamily: displayFontFamily(theme.name),
          fontSize: titleTok.size,
          lineHeight: Math.round(titleTok.size * 1.1),
          letterSpacing: titleTok.letterSpacing,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 15,
          lineHeight: 22,
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
  href: typeof routes.auth.login | typeof routes.auth.register;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.footer}>
      <Text style={{ color: theme.colors.muted, fontSize: 14, lineHeight: 20 }}>
        {prompt}{' '}
      </Text>
      <Text
        onPress={() => router.push(href)}
        accessibilityRole="link"
        style={{
          color: theme.colors.primary,
          fontSize: 14,
          lineHeight: 20,
          fontWeight: '600',
        }}
      >
        {actionLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  footer: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
