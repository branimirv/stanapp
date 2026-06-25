import type { ExpenseCategory, ExpenseType } from '@/types/app.types';

export function getExpenseType(category?: ExpenseCategory | null): ExpenseType | undefined {
  return category?.type;
}

export function filterCategoriesByType(
  categories: ExpenseCategory[],
  type: ExpenseType,
): ExpenseCategory[] {
  return categories.filter((category) => category.type === type);
}

export function defaultRecurringForType(type: ExpenseType): boolean {
  return type === 'regular';
}
