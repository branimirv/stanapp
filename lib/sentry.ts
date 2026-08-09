import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();

export const isSentryEnabled = Boolean(dsn);

Sentry.init({
  dsn: dsn || undefined,
  enabled: isSentryEnabled,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  sendDefaultPii: false,
  enableLogs: true,
  replaysSessionSampleRate: __DEV__ ? 0 : 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

export { Sentry };
