import '@/i18n';
import '../global.css';

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeOut } from 'react-native-reanimated';
import 'react-native-reanimated';

import i18n from '@/i18n';
import { BootError } from '@/components/BootError';
import { BootScreen } from '@/components/BootScreen';
import { AppScreenBackground } from '@/components/ui/AppScreenBackground';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthDeepLinkSubscription } from '@/hooks/useAuthDeepLinkSubscription';
import { useAuthSessionGate } from '@/hooks/useAuthSessionGate';
import { useProfile } from '@/hooks/useProfile';
import { queryClient } from '@/lib/queryClient';
import { NAV_THEME } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  // Always-available fallback when protected app routes become inaccessible.
  initialRouteName: 'index',
};

// Module scope — must run before the first render.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden (fast refresh); harmless */
});

// Cross-fade the native layer out instead of cutting.
SplashScreen.setOptions({ duration: 260, fade: true });

export default function RootLayout() {
  const { boot, bootVisible, isAuthenticated, onBootLaidOut } = useAuthSessionGate();
  useAuthDeepLinkSubscription();

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
