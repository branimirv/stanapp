import type { ExpenseCategory, ExpenseType } from '@/types/app.types';

const IRREGULAR_CATEGORY_KEYS = new Set(['maintenance', 'repair', 'other']);

export function getCategoryEffectiveType(category: ExpenseCategory): ExpenseType {
  if (category.type === 'regular' || category.type === 'irregular') {
    return category.type;
  }

  if (category.user_id || category.name || category.key.startsWith('custom_')) {
    return 'irregular';
  }

  if (IRREGULAR_CATEGORY_KEYS.has(category.key)) {
    return 'irregular';
  }

  return 'regular';
}

export function filterCategoriesByType(
  categories: ExpenseCategory[],
  type: ExpenseType,
): ExpenseCategory[] {
  return categories.filter((category) => getCategoryEffectiveType(category) === type);
}

export function defaultRecurringForType(type: ExpenseType): boolean {
  return type === 'regular';
}

export function getCategoryLabel(
  category: Pick<ExpenseCategory, 'key' | 'name'> | null | undefined,
  t: (key: string, options?: { defaultValue?: string }) => string,
): string {
  if (!category) return '';
  if (category.name) return category.name;
  return t(`categories.${category.key}`, { defaultValue: category.key });
}
