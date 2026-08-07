import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';

import { AppButton } from '@/components/ui/AppButton';
import { signInWithGoogle } from '@/lib/auth';
import { setPendingPostAuthRoute } from '@/lib/authDeepLinks';
import { routes } from '@/lib/routes';
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
  /** Safe post-login path (e.g. `/invite`). Defaults to dashboard. */
  returnTo?: string;
}

export function GoogleSignInButton({
  disabled = false,
  returnTo = routes.tabs.dashboard,
}: GoogleSignInButtonProps) {
  const { t } = useTranslation();
  const showToast = useUiStore((state) => state.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePress = async () => {
    setIsSubmitting(true);
    setPendingPostAuthRoute(returnTo);
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
    // Boot / auth Stack remount navigates via consumePendingPostAuthRoute.
  };

  return (
    <View>
      <AppButton
        variant="outline"
        loading={isSubmitting}
        disabled={disabled || isSubmitting}
        onPress={handlePress}
        accessibilityLabel={t('auth.continueWithGoogle')}
        className="bg-surface-2 border-bd h-11 w-full rounded-full border"
      >
        <View className="flex-row items-center justify-center gap-2">
          {!isSubmitting ? <GoogleMark /> : null}
          <Text
            className="text-fg text-[15px] font-semibold tracking-[-0.15px]"
            numberOfLines={1}
          >
            {t('auth.continueWithGoogle')}
          </Text>
        </View>
      </AppButton>

      <View className="my-6 flex-row items-center gap-3">
        <View
          className="bg-bd flex-1 min-h-px"
          style={{ height: StyleSheet.hairlineWidth > 0 ? StyleSheet.hairlineWidth : 1 }}
        />
        <Text className="text-muted text-[13px]" numberOfLines={1}>
          {t('auth.orContinueWith')}
        </Text>
        <View
          className="bg-bd flex-1 min-h-px"
          style={{ height: StyleSheet.hairlineWidth > 0 ? StyleSheet.hairlineWidth : 1 }}
        />
      </View>
    </View>
  );
}
