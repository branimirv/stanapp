import '@/i18n';

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import i18n from '@/i18n';
import { Toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfile } from '@/hooks/useProfile';
import { onAuthStateChange } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const setSession = useAuthStore((state) => state.setSession);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProviders>
          <RootStack />
          <Toast />
          <ConfirmDialog />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const { theme, isDark, isHydrated } = useAppTheme();

  useEffect(() => {
    if (profile?.language) {
      void i18n.changeLanguage(profile.language);
    }
  }, [profile?.language]);

  if (!isHydrated) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </PaperProvider>
  );
}

function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="property" />
      <Stack.Screen name="tenant" />
      <Stack.Screen name="expense" />
      <Stack.Screen name="rent" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
