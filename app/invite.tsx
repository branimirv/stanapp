import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { Text } from '@/components/ui/text';
import { invalidateAcceptInvitesDomain } from '@/lib/queryInvalidation';
import { routes } from '@/lib/routes';
import { acceptPendingInvites } from '@/services/invites';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/utils/errors';

type AcceptResult =
  | { status: 'success'; count: number }
  | { status: 'error'; message: string };

export default function InviteAcceptScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const [acceptResult, setAcceptResult] = useState<AcceptResult | null>(null);

  const status: 'loading' | 'success' | 'error' | 'auth' = isAuthLoading
    ? 'loading'
    : !session
      ? 'auth'
      : (acceptResult?.status ?? 'loading');

  useEffect(() => {
    if (isAuthLoading || !session) return;

    let cancelled = false;
    (async () => {
      try {
        const count = await acceptPendingInvites();
        if (cancelled) return;
        invalidateAcceptInvitesDomain(queryClient);
        setAcceptResult({ status: 'success', count });
      } catch (err) {
        if (cancelled) return;
        setAcceptResult({
          status: 'error',
          message: getErrorMessage(err, t('members.acceptFailed')),
        });
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
          <AppButton
            variant="default"
            onPress={() =>
              router.replace({
                pathname: routes.auth.login,
                params: { returnTo: routes.invite },
              })
            }
          >
            {t('auth.signIn')}
          </AppButton>
        </>
      ) : null}

      {status === 'success' ? (
        <>
          <Text className="text-center text-lg font-semibold">{t('members.acceptSuccess')}</Text>
          <Text className="text-muted-foreground text-center text-sm">
            {t('members.acceptSuccessCount', {
              count: acceptResult?.status === 'success' ? acceptResult.count : 0,
            })}
          </Text>
          <AppButton variant="default" onPress={() => router.replace(routes.tabs.properties)}>
            {t('members.viewProperties')}
          </AppButton>
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <Text className="text-center text-lg font-semibold">{t('members.acceptFailed')}</Text>
          {acceptResult?.status === 'error' && acceptResult.message ? (
            <Text className="text-destructive text-center text-sm">{acceptResult.message}</Text>
          ) : null}
          <AppButton variant="default" onPress={() => router.replace(routes.tabs.properties)}>
            {t('common.goHome')}
          </AppButton>
        </>
      ) : null}
    </SafeAreaView>
  );
}
