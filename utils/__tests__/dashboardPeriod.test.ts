import { calcDeltaPct, getMonthRange } from '@/utils/dashboardPeriod';

describe('calcDeltaPct', () => {
  it('returns null when previous is zero', () => {
    expect(calcDeltaPct(100, 0)).toBeNull();
  });

  it('computes percent change', () => {
    expect(calcDeltaPct(150, 100)).toBe(50);
    expect(calcDeltaPct(50, 100)).toBe(-50);
  });
});

describe('getMonthRange', () => {
  it('returns first and last day of the month', () => {
    expect(getMonthRange(1, 2026)).toEqual({
      monthStart: '2026-01-01',
      monthEnd: '2026-01-31',
    });
    expect(getMonthRange(2, 2024)).toEqual({
      monthStart: '2024-02-01',
      monthEnd: '2024-02-29',
    });
  });
});
