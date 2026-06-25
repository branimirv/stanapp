import type { TFunction } from 'i18next';

export function translateFieldError(t: TFunction, message?: string): string | undefined {
  if (!message) return undefined;
  if (message.includes('.')) return t(message);
  return message;
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed.replace(',', '.'));
  return Number.isNaN(num) ? null : num;
}
