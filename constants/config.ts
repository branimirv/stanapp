export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const PROPERTY_TYPES = ['apartment', 'house', 'garage', 'other'] as const;

export const USAGE_STATUSES = ['rented', 'personal_use', 'vacant'] as const;

export const LANGUAGES = ['en', 'hr'] as const;

export const PAYMENT_STATUSES = ['pending', 'paid', 'late', 'partial'] as const;

export const THEMES = ['light', 'dark', 'system'] as const;

export const TOAST_DURATION_MS = 3000;

export const CONTRACT_EXPIRING_DAYS = 30;

export const EXPENSE_REMINDER_DAYS = [3, 1] as const;
