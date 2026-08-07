import {
  formatChartAxisMonths,
  formatCurrency,
  formatCurrencyShort,
  formatDate,
  formatDateOnly,
  formatPeriod,
  getStatusColor,
  isOverdue,
} from '@/utils/formatters';
import { Colors } from '@/constants/theme';

describe('formatCurrency', () => {
  it('formats EUR for Croatian locale with two decimals', () => {
    const formatted = formatCurrency(1300, 'EUR', 'hr');
    expect(formatted).toContain('1.300,00');
    expect(formatted).toMatch(/EUR|€/);
  });
});

describe('formatCurrencyShort', () => {
  it('hides decimals on whole amounts', () => {
    const formatted = formatCurrencyShort(1300, 'EUR', 'hr');
    expect(formatted).toContain('1.300');
    expect(formatted).not.toContain(',00');
  });

  it('keeps decimals on fractional amounts', () => {
    expect(formatCurrencyShort(12.5, 'EUR', 'hr')).toContain('12,50');
  });
});

describe('formatDate / formatDateOnly', () => {
  it('formats ISO dates as dd.MM.yyyy', () => {
    expect(formatDate('2024-03-05', 'hr')).toBe('05.03.2024');
  });

  it('formats a Date as yyyy-MM-dd', () => {
    expect(formatDateOnly(new Date(2024, 2, 5))).toBe('2024-03-05');
  });
});

describe('formatPeriod', () => {
  it('returns localized month and year', () => {
    expect(formatPeriod(3, 2024, 'en').toLowerCase()).toContain('march');
    expect(formatPeriod(3, 2024, 'en')).toContain('2024');
  });
});

describe('formatChartAxisMonths', () => {
  it('shows year on first point and year changes only', () => {
    expect(
      formatChartAxisMonths(
        [
          { month: 11, year: 2023 },
          { month: 12, year: 2023 },
          { month: 1, year: 2024 },
        ],
        'en',
      ),
    ).toEqual(["Nov '23", 'Dec', "Jan '24"]);
  });
});

describe('getStatusColor', () => {
  it('maps payment statuses to theme colors', () => {
    expect(getStatusColor('paid')).toBe(Colors.statusPaid);
    expect(getStatusColor('late')).toBe(Colors.statusLate);
  });
});

describe('isOverdue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('is false when already paid or missing due date', () => {
    expect(isOverdue('2024-01-01', '2024-01-02')).toBe(false);
    expect(isOverdue(null, null)).toBe(false);
  });

  it('is true when unpaid and due date is before today', () => {
    expect(isOverdue('2024-06-01', null)).toBe(true);
  });

  it('is false when unpaid but due today or later', () => {
    expect(isOverdue('2024-06-15', null)).toBe(false);
    expect(isOverdue('2024-06-20', null)).toBe(false);
  });
});
