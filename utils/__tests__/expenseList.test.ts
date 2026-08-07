import { isExpenseInMonth, sumExpensesInMonth, averageExpensesOverMonths } from '@/utils/expenseList';

describe('isExpenseInMonth', () => {
  it('matches year and month', () => {
    expect(isExpenseInMonth('2024-03-15', 3, 2024)).toBe(true);
    expect(isExpenseInMonth('2024-03-01', 3, 2024)).toBe(true);
    expect(isExpenseInMonth('2024-04-01', 3, 2024)).toBe(false);
    expect(isExpenseInMonth('2023-03-15', 3, 2024)).toBe(false);
  });
});

describe('sumExpensesInMonth', () => {
  it('sums matching amounts', () => {
    expect(
      sumExpensesInMonth(
        [
          { billing_date: '2024-03-01', amount: 10 },
          { billing_date: '2024-03-20', amount: '5.5' },
          { billing_date: '2024-04-01', amount: 100 },
        ],
        3,
        2024,
      ),
    ).toBe(15.5);
  });
});

describe('averageExpensesOverMonths', () => {
  it('averages the trailing window including empty months', () => {
    const expenses = [
      { billing_date: '2024-06-01', amount: 60 },
      { billing_date: '2024-05-01', amount: 60 },
    ];
    // Jun + May + Apr + Mar + Feb + Jan = 60+60+0+0+0+0 / 6
    expect(averageExpensesOverMonths(expenses, 6, 2024, 6)).toBe(20);
  });
});
