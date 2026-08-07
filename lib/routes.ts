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
} as const;
