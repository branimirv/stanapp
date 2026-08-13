/**
 * Central Expo Router path map. Prefer these over string literals at call sites.
 */
export const routes = {
  home: '/',
  invite: '/invite',
  resetPassword: '/reset-password',

  auth: {
    login: '/(auth)/login',
    register: '/(auth)/register',
    forgotPassword: '/(auth)/forgot-password',
  },

  tabs: {
    root: '/(tabs)',
    dashboard: '/(tabs)/(dashboard)',
    properties: '/(tabs)/properties',
    expenses: '/(tabs)/expenses',
    reports: '/(tabs)/reports',
    me: {
      index: '/(tabs)/me',
      profile: '/(tabs)/me/profile',
      team: '/(tabs)/me/team',
      notifications: '/(tabs)/me/notifications',
    },
  },

  property: {
    new: '/property/new',
    detail: (id: string) => `/property/${id}` as const,
    edit: (id: string) => `/property/edit/${id}` as const,
    members: (id: string) => `/property/members/${id}` as const,
  },

  tenant: {
    new: '/tenant/new',
    detail: (id: string) => `/tenant/${id}` as const,
    edit: (id: string) => `/tenant/edit/${id}` as const,
  },

  expense: {
    new: '/expense/new',
    detail: (id: string) => `/expense/${id}` as const,
    edit: (id: string) => `/expense/edit/${id}` as const,
  },

  rent: {
    new: '/rent/new',
    detail: (id: string) => `/rent/${id}` as const,
  },

  /** Dev-only routes (registered under Stack.Protected when __DEV__). */
  dev: {
    navAudit: '/dev/nav-audit',
  },
} as const;

/** Must match `expo.scheme` in app.json. */
export const APP_SCHEME = 'stanapp';

function pathSlug<P extends string>(path: P): P extends `/${infer Rest}` ? Rest : P {
  return (path.startsWith('/') ? path.slice(1) : path) as P extends `/${infer Rest}` ? Rest : P;
}

/** Host/path used in `stanapp://…` auth callbacks (and Expo Router root segments). */
export const deepLinkPaths = {
  invite: pathSlug(routes.invite),
  resetPassword: pathSlug(routes.resetPassword),
} as const;

/**
 * Outbound auth redirects. Must match `additional_redirect_urls` in
 * supabase/config.toml (that file cannot import this module).
 */
export const deepLinks = {
  invite: `${APP_SCHEME}://${deepLinkPaths.invite}`,
  resetPassword: `${APP_SCHEME}://${deepLinkPaths.resetPassword}`,
} as const;
