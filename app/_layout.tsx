import '@/i18n';
import '../global.css';

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import i18n from '@/i18n';
import { AppScreenBackground } from '@/components/ui/AppScreenBackground';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { onAuthStateChange } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { NAV_THEME } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  // Always-available fallback when protected app routes become inaccessible.
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const setSession = useAuthStore((state) => state.setSession);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => Boolean(state.session));

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppProviders>
            <RootStack isAuthenticated={isAuthenticated} />
            <Toast />
            <ConfirmDialog />
          </AppProviders>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const { isDark, isHydrated } = useAppTheme();

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
        {!isHydrated ? (
          <View
            style={[styles.bootOverlay, isDark ? styles.bootDark : styles.bootLight]}
            pointerEvents="none"
          />
        ) : null}
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
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  bootLight: {
    backgroundColor: Colors.background,
  },
  bootDark: {
    backgroundColor: Colors.backgroundDark,
  },
  transparentScreen: {
    backgroundColor: 'transparent',
  },
});
