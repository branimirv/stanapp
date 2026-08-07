import '@/i18n';
import '../global.css';

import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeOut } from 'react-native-reanimated';
import 'react-native-reanimated';

import i18n from '@/i18n';
import { BootScreen } from '@/components/BootScreen';
import { AppScreenBackground } from '@/components/ui/AppScreenBackground';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useProfile } from '@/hooks/useProfile';
import { onAuthStateChange } from '@/lib/auth';
import { subscribeToAuthDeepLinks, consumePendingPostAuthRoute, setPendingPostAuthRoute } from '@/lib/authDeepLinks';
import { queryClient } from '@/lib/queryClient';
import { NAV_THEME } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  // Always-available fallback when protected app routes become inaccessible.
  initialRouteName: 'index',
};

/** Routes that signed-out users may stay on (no boot eject to login). */
const PUBLIC_ROOT_SEGMENTS = new Set(['(auth)', 'invite', 'reset-password']);

// Module scope — must run before the first render.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden (fast refresh); harmless */
});

// Cross-fade the native layer out instead of cutting.
SplashScreen.setOptions({ duration: 260, fade: true });

export default function RootLayout() {
  const setSession = useAuthStore((state) => state.setSession);
  const isAuthenticated = useAuthStore((state) => Boolean(state.session));
  const showToast = useUiStore((state) => state.showToast);
  const boot = useBootstrap();
  const router = useRouter();
  const segments = useSegments();
  const [bootVisible, setBootVisible] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    return subscribeToAuthDeepLinks((url, result) => {
      if (result.error) {
        showToast({ message: result.error, type: 'error' });
      }

      if (result.path === 'reset-password') {
        setPendingPostAuthRoute('/reset-password');
      } else if (result.path === 'invite' || url.includes('invite')) {
        setPendingPostAuthRoute('/invite');
      }

      // Session is also pushed via onAuthStateChange; setSession keeps store warm
      // if the listener races ahead of the auth event.
      if (result.session) {
        setSession(result.session);
      }

      if (result.path === 'reset-password') {
        router.replace('/reset-password');
        return;
      }
      if (result.path === 'invite' || url.includes('invite')) {
        router.replace('/invite');
      }
    });
  }, [router, setSession, showToast]);

  /** BootScreen has painted, so the native layer can go. */
  const onBootLaidOut = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  /** Route once ready, then release the overlay. */
  useEffect(() => {
    if (boot.status === 'loading') return;

    const root = segments[0];
    const inAuthGroup = root === '(auth)';
    const isPublicRoot = typeof root === 'string' && PUBLIC_ROOT_SEGMENTS.has(root);

    if (boot.status === 'ready' && boot.authenticated && inAuthGroup) {
      router.replace(consumePendingPostAuthRoute() as '/(tabs)/(dashboard)');
    } else if (boot.status === 'ready' && !boot.authenticated && !isPublicRoot) {
      router.replace('/(auth)/login');
    } else if (boot.status === 'error') {
      // Restore failed — do not pretend they are signed out. The error panel
      // offers a retry; keep the overlay up.
      return;
    }

    // One frame of overlap so the routed screen is mounted underneath before
    // the boot screen fades; otherwise you see the app's background flash.
    const id = setTimeout(() => setBootVisible(false), 32);
    return () => clearTimeout(id);
  }, [
    boot.status,
    boot.status === 'ready' ? boot.authenticated : false,
    segments,
    router,
  ]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppProviders>
            <RootStack isAuthenticated={isAuthenticated} />
            <Toast />
            <ConfirmDialog />
            {bootVisible ? (
              <Animated.View
                style={[StyleSheet.absoluteFill, styles.bootOverlay]}
                onLayout={onBootLaidOut}
                exiting={FadeOut.duration(240)}
                pointerEvents={boot.status === 'error' ? 'auto' : 'none'}
              >
                {boot.status === 'error' ? (
                  <BootError message={boot.error.message} onRetry={boot.retry} />
                ) : (
                  <BootScreen />
                )}
              </Animated.View>
            ) : null}
          </AppProviders>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const { isDark } = useAppTheme();

  useEffect(() => {
    if (profile?.language) {
      void i18n.changeLanguage(profile.language);
    }
  }, [profile?.language]);

  return (
    <ThemeProvider value={NAV_THEME[isDark ? 'dark' : 'light']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppScreenBackground>
        {children}
      </AppScreenBackground>
      <PortalHost />
    </ThemeProvider>
  );
}

function RootStack({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Stack
      // Force a clean navigator when auth flips. NativeTabs does not leave
      // cleanly via replace() alone — the URL can stick on /(tabs)/...
      key={isAuthenticated ? 'signed-in' : 'signed-out'}
      screenOptions={{
        headerShown: false,
        contentStyle: styles.transparentScreen,
      }}
    >
      {/* Fallback when app routes are protected — renders LoginScreen if signed out */}
      <Stack.Screen name="index" />

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="property" />
        <Stack.Screen name="tenant" />
        <Stack.Screen name="expense" />
        <Stack.Screen name="rent" />
        <Stack.Screen name="settings" />
        {__DEV__ ? <Stack.Screen name="dev" /> : null}
      </Stack.Protected>

      <Stack.Screen name="invite" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

/**
 * Shown when session restore fails (usually offline). Deliberately reuses the
 * boot layout so it reads as the same screen changing state, not a crash.
 */
function BootError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { theme } = useAppTheme();
  const { colors, typography } = theme;

  return (
    <View style={[bootErrorStyles.root, { backgroundColor: colors.bg }]}>
      <View style={bootErrorStyles.stack}>
        <Text
          style={[
            bootErrorStyles.eyebrow,
            { color: colors.neg, fontFamily: typography.fontFamily.sans },
          ]}
        >
          NEUSPJEŠNO POVEZIVANJE
        </Text>

        <Text
          style={[
            bootErrorStyles.wordmark,
            {
              color: colors.fg,
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.displayWeight,
            },
          ]}
        >
          StanApp
        </Text>

        <Text
          style={[
            bootErrorStyles.body,
            { color: colors.muted, fontFamily: typography.fontFamily.sans },
          ]}
        >
          Provjerite internetsku vezu pa pokušajte ponovno.
        </Text>

        <Pressable
          onPress={onRetry}
          style={[bootErrorStyles.btn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Text
            style={[
              bootErrorStyles.btnLabel,
              { color: colors.onPrimary, fontFamily: typography.fontFamily.sans },
            ]}
          >
            Pokušaj ponovno
          </Text>
        </Pressable>

        {__DEV__ ? (
          <Text style={[bootErrorStyles.debug, { color: colors.muted }]} numberOfLines={3}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootOverlay: {
    zIndex: 10,
  },
  transparentScreen: {
    backgroundColor: 'transparent',
  },
});

const bootErrorStyles = StyleSheet.create({
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
    letterSpacing: 1.54,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  wordmark: { fontSize: 46, lineHeight: 47, letterSpacing: -0.92 },
  body: { fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 250 },
  btn: {
    height: 44,
    borderRadius: 999,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  btnLabel: { fontSize: 14, fontWeight: '600', letterSpacing: -0.14 },
  debug: { fontSize: 10, marginTop: 14, opacity: 0.7 },
});
