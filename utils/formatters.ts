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

export function formatDate(dateString: string, language: Language = 'hr'): string {
  return format(parseISO(dateString), 'dd.MM.yyyy', { locale: dateLocales[language] });
}

export function formatDateTime(dateString: string, language: Language = 'hr'): string {
  return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: dateLocales[language] });
}

export function formatPeriod(month: number, year: number, language: Language = 'hr'): string {
  const date = new Date(year, month - 1);
  return format(date, 'MMMM yyyy', { locale: dateLocales[language] });
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
