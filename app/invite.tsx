import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { queryKeys } from '@/lib/queryKeys';
import { acceptPendingInvites } from '@/services/invites';
import { useAuthStore } from '@/stores/authStore';

export default function InviteAcceptScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth'>('loading');
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!session) {
      setStatus('auth');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const count = await acceptPendingInvites();
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
        await queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
        setAcceptedCount(count);
        setStatus('success');
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : t('members.acceptFailed'));
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, queryClient, session, t]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-transparent p-6">
      {status === 'loading' ? (
        <>
          <ActivityIndicator />
          <Text className="text-center text-sm">{t('members.accepting')}</Text>
        </>
      ) : null}

      {status === 'auth' ? (
        <>
          <Text className="text-center text-lg font-semibold">{t('members.signInToAccept')}</Text>
          <AppButton mode="contained" onPress={() => router.replace('/(auth)/login')}>
            {t('auth.signIn')}
          </AppButton>
        </>
      ) : null}

      {status === 'success' ? (
        <>
          <Text className="text-center text-lg font-semibold">{t('members.acceptSuccess')}</Text>
          <Text className="text-muted-foreground text-center text-sm">
            {t('members.acceptSuccessCount', { count: acceptedCount })}
          </Text>
          <AppButton mode="contained" onPress={() => router.replace('/(tabs)/properties')}>
            {t('members.viewProperties')}
          </AppButton>
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <Text className="text-center text-lg font-semibold">{t('members.acceptFailed')}</Text>
          {errorMessage ? (
            <Text className="text-destructive text-center text-sm">{errorMessage}</Text>
          ) : null}
          <AppButton mode="contained" onPress={() => router.replace('/(tabs)/properties')}>
            {t('common.goHome')}
          </AppButton>
        </>
      ) : null}
    </SafeAreaView>
  );
}
