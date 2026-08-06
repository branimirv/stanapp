import { Stack } from 'expo-router';

import { useAppTheme } from '@/hooks/useAppTheme';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  const { theme } = useAppTheme();

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        // Solid canvas — auth is flat --bg in naslov-theme.html (no ambient wash).
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
