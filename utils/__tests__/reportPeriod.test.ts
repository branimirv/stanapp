import {
  ALL_TIME_START,
  buildPreviousReportPeriod,
  buildReportPeriod,
  isUsableCustomStartDate,
  resolveCustomReportPeriod,
} from '@/utils/reportPeriod';

describe('isUsableCustomStartDate', () => {
  it('rejects empty and all-time sentinel values', () => {
    expect(isUsableCustomStartDate(null)).toBe(false);
    expect(isUsableCustomStartDate(undefined)).toBe(false);
    expect(isUsableCustomStartDate('')).toBe(false);
    expect(isUsableCustomStartDate(ALL_TIME_START)).toBe(false);
    expect(isUsableCustomStartDate('1969-12-31')).toBe(false);
  });

  it('accepts valid calendar dates after the sentinel', () => {
    expect(isUsableCustomStartDate('2024-01-01')).toBe(true);
    expect(isUsableCustomStartDate('1970-01-02')).toBe(true);
  });

  it('rejects non-parseable strings', () => {
    expect(isUsableCustomStartDate('not-a-date')).toBe(false);
  });
});

describe('buildReportPeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 7, 15)); // 15 Aug 2025
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('builds current_month bounds', () => {
    expect(buildReportPeriod('current_month')).toEqual({
      preset: 'current_month',
      startDate: '2025-08-01',
      endDate: '2025-08-31',
    });
  });

  it('builds last_6_months from the current month inclusive', () => {
    expect(buildReportPeriod('last_6_months')).toEqual({
      preset: 'last_6_months',
      startDate: '2025-03-01',
      endDate: '2025-08-31',
    });
  });

  it('uses custom start/end when provided', () => {
    expect(buildReportPeriod('custom', '2024-02-01', '2024-05-31')).toEqual({
      preset: 'custom',
      startDate: '2024-02-01',
      endDate: '2024-05-31',
    });
  });
});

describe('buildPreviousReportPeriod', () => {
  it('returns null for all_time', () => {
    expect(
      buildPreviousReportPeriod({
        preset: 'all_time',
        startDate: ALL_TIME_START,
        endDate: '2025-08-31',
      }),
    ).toBeNull();
  });

  it('returns an equal-length window ending the day before start', () => {
    expect(
      buildPreviousReportPeriod({
        preset: 'current_month',
        startDate: '2025-08-01',
        endDate: '2025-08-31',
      }),
    ).toEqual({
      startDate: '2025-07-01',
      endDate: '2025-07-31',
    });
  });
});


describe('resolveCustomReportPeriod', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 7, 15));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('seeds from earliest activity when carry is unusable', () => {
    expect(
      resolveCustomReportPeriod({
        fromPreset: 'all_time',
        earliestActivityDate: '2023-05-01',
      }),
    ).toEqual({
      preset: 'custom',
      startDate: '2023-05-01',
      endDate: '2025-08-31',
    });
  });

  it('carries forward a usable custom start', () => {
    expect(
      resolveCustomReportPeriod({
        carryStart: '2024-01-01',
        carryEnd: '2024-12-31',
        fromPreset: 'custom',
      }),
    ).toEqual({
      preset: 'custom',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
  });
});
