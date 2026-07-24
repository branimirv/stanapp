import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/ui/AppButton';
import { Spacing, Typography } from '@/constants/theme';
import { queryKeys } from '@/lib/queryKeys';
import { acceptPendingInvites } from '@/services/invites';
import { useAuthStore } from '@/stores/authStore';

export default function InviteAcceptScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {status === 'loading' ? (
        <>
          <ActivityIndicator />
          <Text style={[styles.message, { color: theme.colors.onSurface }]}>
            {t('members.accepting')}
          </Text>
        </>
      ) : null}

      {status === 'auth' ? (
        <>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('members.signInToAccept')}
          </Text>
          <AppButton mode="contained" onPress={() => router.replace('/(auth)/login')}>
            {t('auth.signIn')}
          </AppButton>
        </>
      ) : null}

      {status === 'success' ? (
        <>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('members.acceptSuccess')}
          </Text>
          <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
            {t('members.acceptSuccessCount', { count: acceptedCount })}
          </Text>
          <AppButton mode="contained" onPress={() => router.replace('/(tabs)/properties')}>
            {t('members.viewProperties')}
          </AppButton>
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('members.acceptFailed')}
          </Text>
          {errorMessage ? (
            <Text style={[styles.message, { color: theme.colors.error }]}>{errorMessage}</Text>
          ) : null}
          <AppButton mode="contained" onPress={() => router.replace('/(tabs)/properties')}>
            {t('common.goHome')}
          </AppButton>
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    ...Typography.titleLarge,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodyMedium,
    textAlign: 'center',
  },
});
