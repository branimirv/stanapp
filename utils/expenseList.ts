import { parseISO } from 'date-fns';

/** True when billing_date falls in the given calendar month (1–12). */
export function isExpenseInMonth(billingDate: string, month: number, year: number): boolean {
  const date = parseISO(billingDate);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

/** Sum amounts for expenses billed in the given month. */
export function sumExpensesInMonth(
  expenses: Array<{ billing_date: string; amount: number | string }>,
  month: number,
  year: number,
): number {
  return expenses
    .filter((expense) => isExpenseInMonth(expense.billing_date, month, year))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
}

/** Average of the last `monthCount` calendar months (including the current). */
export function averageExpensesOverMonths(
  expenses: Array<{ billing_date: string; amount: number | string }>,
  currentMonth: number,
  currentYear: number,
  monthCount = 6,
): number {
  let total = 0;
  for (let offset = 0; offset < monthCount; offset += 1) {
    const date = new Date(currentYear, currentMonth - 1 - offset, 1);
    total += sumExpensesInMonth(expenses, date.getMonth() + 1, date.getFullYear());
  }
  return total / monthCount;
}
