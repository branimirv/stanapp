import {
  capitalizeLabel,
  formatReportPeriodEyebrow,
} from '@/utils/reportPeriodLabel';
import type { ReportPeriod } from '@/types/app.types';

const t = (key: string) => {
  if (key === 'reports.periodAllTime') return 'All time';
  if (key === 'reports.periodCustom') return 'Custom';
  return key;
};

function period(
  partial: Pick<ReportPeriod, 'startDate' | 'endDate'> & Partial<ReportPeriod>,
): ReportPeriod {
  return {
    preset: 'custom',
    ...partial,
  };
}

describe('capitalizeLabel', () => {
  it('uppercases the first character', () => {
    expect(capitalizeLabel('january 2024', 'en')).toBe('January 2024');
  });
});

describe('formatReportPeriodEyebrow', () => {
  it('formats a single-month period', () => {
    expect(
      formatReportPeriodEyebrow(
        period({ startDate: '2024-03-01', endDate: '2024-03-31' }),
        'en',
        t,
      ),
    ).toBe('March 2024');
  });

  it('formats a same-year month range', () => {
    expect(
      formatReportPeriodEyebrow(
        period({ startDate: '2024-01-01', endDate: '2024-06-30' }),
        'en',
        t,
      ),
    ).toBe('January – June 2024');
  });

  it('formats a cross-year month range', () => {
    expect(
      formatReportPeriodEyebrow(
        period({ startDate: '2023-11-01', endDate: '2024-02-29' }),
        'en',
        t,
      ),
    ).toBe('November 2023 – February 2024');
  });

  it('returns all-time label for all_time preset', () => {
    expect(
      formatReportPeriodEyebrow(
        period({
          preset: 'all_time',
          startDate: '2000-01-01',
          endDate: '2024-12-31',
        }),
        'en',
        t,
      ),
    ).toBe('All time');
  });

  it('returns custom label for invalid dates', () => {
    expect(
      formatReportPeriodEyebrow(
        period({ startDate: 'not-a-date', endDate: '2024-03-31' }),
        'en',
        t,
      ),
    ).toBe('Custom');
    expect(
      formatReportPeriodEyebrow(
        period({ startDate: '2024-03-01', endDate: 'also-bad' }),
        'en',
        t,
      ),
    ).toBe('Custom');
  });
});
