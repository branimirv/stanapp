import { format } from 'date-fns';

export interface MonthRange {
  month: number;
  year: number;
  start: string;
  end: string;
}

export function getCurrentMonthRange(date = new Date()): MonthRange {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const start = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const end = format(new Date(year, month, 0), 'yyyy-MM-dd');

  return { month, year, start, end };
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}
