import { format, parseISO, startOfDay } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import { Colors } from '@/constants/theme';
import type { Language, PaymentStatus } from '@/types/app.types';

const dateLocales = { en: enUS, hr } as const;

function getIntlLocale(language: Language): string {
  return language === 'en' ? 'en-GB' : 'hr-HR';
}

export function formatCurrency(
  amount: number,
  currency = 'EUR',
  language: Language = 'hr',
): string {
  return new Intl.NumberFormat(getIntlLocale(language), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Same as formatCurrency but hides the decimals on whole amounts. */
export function formatCurrencyShort(
  amount: number,
  currency = 'EUR',
  language: Language = 'hr',
): string {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(getIntlLocale(language), {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatDate(dateString: string, language: Language = 'hr'): string {
  return format(parseISO(dateString), 'dd.MM.yyyy', { locale: dateLocales[language] });
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatPeriod(month: number, year: number, language: Language = 'hr'): string {
  const date = new Date(year, month - 1);
  return format(date, 'LLLL yyyy', { locale: dateLocales[language] });
}

/** Month name without the year, for labels where the year is already implied. */
export function formatMonthName(month: number, year: number, language: Language = 'hr'): string {
  const date = new Date(year, month - 1);
  return format(date, 'LLLL', { locale: dateLocales[language] });
}

/** Abbreviated month name, for tight spots like badges. */
export function formatMonthNameShort(
  month: number,
  year: number,
  language: Language = 'hr',
): string {
  const date = new Date(year, month - 1);
  return format(date, 'LLL', { locale: dateLocales[language] });
}

export function formatPeriodShort(month: number, year: number, language: Language = 'hr'): string {
  const date = new Date(year, month - 1);
  return format(date, 'MMM yyyy', { locale: dateLocales[language] });
}

export function getStatusColor(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    paid: Colors.statusPaid,
    pending: Colors.statusPending,
    late: Colors.statusLate,
    partial: Colors.statusPartial,
  };
  return map[status];
}

export function isOverdue(
  dueDateString: string | null | undefined,
  paidAt: string | null | undefined,
): boolean {
  if (!dueDateString || paidAt) return false;
  const dueDate = startOfDay(parseISO(dueDateString));
  const today = startOfDay(new Date());
  return dueDate < today;
}
