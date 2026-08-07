import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
    <View className="bg-bg flex-1">
      <SafeAreaView className="flex-1" edges={['top', 'right', 'bottom', 'left']}>
        <KeyboardAvoidingView
          className="flex-1"
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
    <View className="mb-6.5 pt-1.5" style={style}>
      {eyebrow ? (
        <Text className="text-primary mb-3 text-xs leading-4 font-semibold tracking-[1.68px] uppercase">
          {eyebrow}
        </Text>
      ) : null}
      <Text
        className="text-fg mb-2.5"
        style={{
          fontFamily: displayFontFamily(theme.name),
          fontSize: titleTok.size,
          lineHeight: Math.round(titleTok.size * 1.1),
          letterSpacing: titleTok.letterSpacing,
        }}
      >
        {title}
      </Text>
      <Text className="text-muted text-[15px] leading-5.5">{subtitle}</Text>
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
  return (
    <View className="mt-6.5 flex-row flex-wrap items-center justify-center">
      <Text className="text-muted text-sm leading-5">
        {prompt}{' '}
      </Text>
      <Text
        onPress={() => router.push(href)}
        accessibilityRole="link"
        className="text-primary text-sm leading-5 font-semibold"
      >
        {actionLabel}
      </Text>
    </View>
  );
}
