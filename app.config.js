/**
 * Dynamic Expo config layered on app.json.
 * Sentry org/project and EAS projectId come from env so secrets stay out of git.
 *
 * Kept as CommonJS (.js) so EAS CLI can evaluate it without TypeScript transpile.
 * @param {{ config: import('expo/config').ExpoConfig }} param0
 * @returns {import('expo/config').ExpoConfig}
 */
module.exports = ({ config }) => {
  const plugins = [...(config.plugins ?? [])];

  const sentryOrg = process.env.SENTRY_ORG?.trim();
  const sentryProject = process.env.SENTRY_PROJECT?.trim();
  const withoutBareSentry = plugins.filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== '@sentry/react-native' && name !== '@sentry/react-native/expo';
  });

  if (sentryOrg && sentryProject) {
    withoutBareSentry.push([
      '@sentry/react-native/expo',
      {
        // EU orgs use de.sentry.io — override with SENTRY_URL if needed.
        url: process.env.SENTRY_URL?.trim() || 'https://de.sentry.io/',
        organization: sentryOrg,
        project: sentryProject,
        note: 'Use SENTRY_AUTH_TOKEN env to authenticate with Sentry.',
      },
    ]);
  }

  const easProjectId = process.env.EAS_PROJECT_ID?.trim();
  const existingExtra = typeof config.extra === 'object' && config.extra ? config.extra : {};
  const existingEas =
    typeof existingExtra.eas === 'object' && existingExtra.eas ? existingExtra.eas : {};

  return {
    ...config,
    name: config.name ?? 'StanApp',
    slug: config.slug ?? 'stanapp',
    plugins: withoutBareSentry,
    extra: {
      ...existingExtra,
      eas: {
        ...existingEas,
        ...(easProjectId ? { projectId: easProjectId } : {}),
      },
    },
  };
};
