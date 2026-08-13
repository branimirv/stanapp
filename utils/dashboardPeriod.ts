import { format } from 'date-fns';

export function calcDeltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function getMonthRange(month: number, year: number): {
  monthStart: string;
  monthEnd: string;
} {
  const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const monthEnd = format(new Date(year, month, 0), 'yyyy-MM-dd');
  return { monthStart, monthEnd };
}
