import { Redirect } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/useAppTheme';
import { consumePendingPostAuthRoute } from '@/lib/authDeepLinks';
import { routes } from '@/lib/routes';
import { useAuthStore } from '@/stores/authStore';

/**
 * Entry route. Renders login in-place when signed out (no nested Redirect),
 * which avoids blank screens after NativeTabs unmount / Stack.Protected.
 */
export default function Index() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const postAuthHref = useRef<string | null>(null);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-transparent">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="text-muted text-sm">{t('common.loading')}</Text>
      </View>
    );
  }

  if (session) {
    if (postAuthHref.current === null) {
      postAuthHref.current = consumePendingPostAuthRoute();
    }
    return <Redirect href={postAuthHref.current as typeof routes.tabs.dashboard} />;
  }

  return <LoginScreen />;
}
