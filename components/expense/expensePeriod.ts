import {
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns';

import type { Language } from '@/types/app.types';
import { formatDate, formatPeriod } from '@/utils/formatters';

export type ExpensePeriodPreset =
  | 'current_month'
  | 'last_3_months'
  | 'current_year'
  | 'custom';

export interface ExpensePeriod {
  preset: ExpensePeriodPreset;
  startDate: string;
  endDate: string;
}

export const EXPENSE_PERIOD_PRESETS: ExpensePeriodPreset[] = [
  'current_month',
  'last_3_months',
  'current_year',
  'custom',
];

export function buildExpensePeriod(
  preset: ExpensePeriodPreset,
  customStart?: string,
  customEnd?: string,
): ExpensePeriod {
  const now = new Date();

  switch (preset) {
    case 'current_month':
      return {
        preset,
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last_3_months':
      return {
        preset,
        startDate: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'current_year':
      return {
        preset,
        startDate: format(startOfYear(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'custom':
      return {
        preset,
        startDate: customStart ?? format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: customEnd ?? format(endOfMonth(now), 'yyyy-MM-dd'),
      };
  }
}

export function buildDefaultExpensePeriod(): ExpensePeriod {
  return buildExpensePeriod('current_month');
}

export function isExpenseInPeriod(billingDate: string, period: ExpensePeriod): boolean {
  return billingDate >= period.startDate && billingDate <= period.endDate;
}

/** Eyebrow / chip label for the selected period. */
export function formatExpensePeriodLabel(
  period: ExpensePeriod,
  language: Language,
  t: (key: string) => string,
): string {
  switch (period.preset) {
    case 'current_month': {
      const now = new Date();
      const label = formatPeriod(now.getMonth() + 1, now.getFullYear(), language);
      return label.replace(/^./, (ch) =>
        ch.toLocaleUpperCase(language === 'en' ? 'en' : 'hr'),
      );
    }
    case 'last_3_months':
      return t('reports.last3Months');
    case 'current_year':
      return t('expenses.periodThisYear');
    case 'custom':
      return `${formatDate(period.startDate, language)} – ${formatDate(period.endDate, language)}`;
  }
}
