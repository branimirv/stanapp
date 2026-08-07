import {
  defaultRecurringForType,
  filterCategoriesByType,
  getCategoryEffectiveType,
  getCategoryLabel,
} from '@/utils/expense';
import type { ExpenseCategory } from '@/types/app.types';

function category(overrides: Partial<ExpenseCategory> = {}): ExpenseCategory {
  return {
    id: 'cat-1',
    user_id: null,
    key: 'utilities',
    name: null,
    icon: 'Zap',
    color: '#000',
    type: 'regular',
    ...overrides,
  };
}

describe('getCategoryEffectiveType', () => {
  it('returns the explicit category type', () => {
    expect(getCategoryEffectiveType(category({ type: 'regular' }))).toBe('regular');
    expect(getCategoryEffectiveType(category({ type: 'irregular' }))).toBe('irregular');
  });
});

describe('filterCategoriesByType', () => {
  it('keeps only matching effective types', () => {
    const categories = [
      category({ id: '1', type: 'regular' }),
      category({ id: '2', type: 'irregular', key: 'repair' }),
    ];
    expect(filterCategoriesByType(categories, 'regular')).toHaveLength(1);
    expect(filterCategoriesByType(categories, 'irregular')[0]?.id).toBe('2');
  });
});

describe('defaultRecurringForType', () => {
  it('is true only for regular', () => {
    expect(defaultRecurringForType('regular')).toBe(true);
    expect(defaultRecurringForType('irregular')).toBe(false);
  });
});

describe('getCategoryLabel', () => {
  const t = (key: string, options?: { defaultValue?: string }) =>
    options?.defaultValue ? `t:${key}` : key;

  it('returns empty string for missing category', () => {
    expect(getCategoryLabel(null, t)).toBe('');
  });

  it('prefers custom name over i18n key', () => {
    expect(getCategoryLabel(category({ name: 'Custom' }), t)).toBe('Custom');
  });

  it('falls back to translated key', () => {
    expect(getCategoryLabel(category({ key: 'utilities', name: null }), t)).toBe(
      't:categories.utilities',
    );
  });
});
