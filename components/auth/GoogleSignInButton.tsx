import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { AppButton } from '@/components/ui/AppButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { signInWithGoogle } from '@/lib/auth';
import { Fonts } from '@/lib/fonts';
import { useUiStore } from '@/stores/uiStore';

/** Official multi-colour Google G — brand requirement, not a Lucide glyph. */
function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.29A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.29 5.37z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </Svg>
  );
}

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

export function GoogleSignInButton({ disabled = false }: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePress = async () => {
    setIsSubmitting(true);
    const { error, cancelled } = await signInWithGoogle();
    setIsSubmitting(false);

    if (cancelled) return;

    if (error) {
      if (__DEV__) {
        console.error('[GoogleSignIn]', error.message);
      }
      showToast({
        message: __DEV__ && error.message ? error.message : t('auth.googleSignInFailed'),
        type: 'error',
      });
      return;
    }

    showToast({ message: t('auth.loginSuccess'), type: 'success' });
    router.replace('/(tabs)/(dashboard)');
  };

  return (
    <View>
      <AppButton
        mode="outlined"
        loading={isSubmitting}
        disabled={disabled || isSubmitting}
        onPress={handlePress}
        accessibilityLabel={t('auth.continueWithGoogle')}
        className="bg-surface-2 border-bd h-11 w-full rounded-full border"
      >
        <View style={styles.row}>
          {!isSubmitting ? <GoogleMark /> : null}
          <Text
            style={{
              fontFamily: Fonts.sans.semibold,
              fontSize: 15,
              letterSpacing: -0.15,
              color: theme.colors.fg,
            }}
            numberOfLines={1}
          >
            {t('auth.continueWithGoogle')}
          </Text>
        </View>
      </AppButton>

      <View style={styles.divider}>
        <View style={[styles.hair, { backgroundColor: theme.colors.bd }]} />
        <Text
          style={{
            fontFamily: Fonts.sans.regular,
            fontSize: 13,
            color: theme.colors.muted,
          }}
          numberOfLines={1}
        >
          {t('auth.orContinueWith')}
        </Text>
        <View style={[styles.hair, { backgroundColor: theme.colors.bd }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  hair: {
    flex: 1,
    height: StyleSheet.hairlineWidth > 0 ? StyleSheet.hairlineWidth : 1,
    minHeight: 1,
  },
});
