import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import type { ReportPeriod, ReportPeriodPreset } from '@/types/app.types';

export const ALL_TIME_START = '1970-01-01';

/** True when a custom "Od" can be shown in the date picker (not empty / all-time sentinel). */
export function isUsableCustomStartDate(value: string | null | undefined): boolean {
  if (!value) return false;
  if (value <= ALL_TIME_START) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function currentMonthBounds(now = new Date()): { startDate: string; endDate: string } {
  return {
    startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

/**
 * Resolve Custom period dates per ADR 002: carry forward when possible,
 * otherwise seed Od from first financial activity (or current month).
 */
export function resolveCustomReportPeriod(options: {
  carryStart?: string;
  carryEnd?: string;
  fromPreset?: ReportPeriodPreset;
  earliestActivityDate?: string | null;
  forceReseedStart?: boolean;
}): ReportPeriod {
  const now = new Date();
  const month = currentMonthBounds(now);
  const fallbackStart = options.earliestActivityDate ?? month.startDate;

  const canCarryStart =
    !options.forceReseedStart &&
    options.fromPreset !== 'all_time' &&
    isUsableCustomStartDate(options.carryStart);

  let startDate = canCarryStart ? options.carryStart! : fallbackStart;
  let endDate =
    options.carryEnd && isUsableCustomStartDate(options.carryEnd)
      ? options.carryEnd
      : month.endDate;

  if (endDate < startDate) {
    endDate = month.endDate < startDate ? startDate : month.endDate;
  }

  return {
    preset: 'custom',
    startDate,
    endDate,
  };
}

export function buildDefaultReportPeriod(): ReportPeriod {
  const now = new Date();
  return {
    preset: 'all_time',
    startDate: ALL_TIME_START,
    endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

export function buildReportPeriod(
  preset: ReportPeriodPreset,
  customStart?: string,
  customEnd?: string,
): ReportPeriod {
  const now = new Date();

  switch (preset) {
    case 'all_time':
      return {
        preset,
        startDate: ALL_TIME_START,
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
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
    case 'last_6_months':
      return {
        preset,
        startDate: format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last_12_months':
      return {
        preset,
        startDate: format(startOfMonth(subMonths(now, 11)), 'yyyy-MM-dd'),
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

/** Equal-length window ending the day before the selected period starts. */
export function buildPreviousReportPeriod(
  period: ReportPeriod,
): { startDate: string; endDate: string } | null {
  if (period.preset === 'all_time') return null;

  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return null;
  }

  const daySpan = differenceInCalendarDays(end, start);
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, daySpan);

  return {
    startDate: format(prevStart, 'yyyy-MM-dd'),
    endDate: format(prevEnd, 'yyyy-MM-dd'),
  };
}
