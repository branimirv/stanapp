import {
  getCurrentMonthRange,
  getMonthRange,
  isDateInRange,
} from '@/utils/dateRange';

describe('getMonthRange', () => {
  it('returns inclusive start and end for a 31-day month', () => {
    expect(getMonthRange(1, 2024)).toEqual({
      month: 1,
      year: 2024,
      start: '2024-01-01',
      end: '2024-01-31',
    });
  });

  it('handles February in a leap year', () => {
    expect(getMonthRange(2, 2024)).toEqual({
      month: 2,
      year: 2024,
      start: '2024-02-01',
      end: '2024-02-29',
    });
  });
});

describe('getCurrentMonthRange', () => {
  it('uses the provided date', () => {
    expect(getCurrentMonthRange(new Date(2025, 7, 15))).toEqual({
      month: 8,
      year: 2025,
      start: '2025-08-01',
      end: '2025-08-31',
    });
  });
});

describe('isDateInRange', () => {
  it('includes boundaries', () => {
    expect(isDateInRange('2024-03-01', '2024-03-01', '2024-03-31')).toBe(true);
    expect(isDateInRange('2024-03-31', '2024-03-01', '2024-03-31')).toBe(true);
  });

  it('excludes dates outside the range', () => {
    expect(isDateInRange('2024-02-29', '2024-03-01', '2024-03-31')).toBe(false);
    expect(isDateInRange('2024-04-01', '2024-03-01', '2024-03-31')).toBe(false);
  });
});
