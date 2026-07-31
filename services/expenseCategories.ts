import { supabase } from '@/lib/supabase';
import type { ExpenseCategory } from '@/types/app.types';

function generateCustomCategoryKey(): string {
  return `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return new Error(message);
  }
  if (typeof error === 'string' && error.trim()) return new Error(error);
  return new Error(fallback);
}

export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('key', { ascending: true });

  if (error) throw toError(error, 'Failed to load expense categories');
  return data ?? [];
}

export async function createCustomCategory(
  userId: string,
  name: string,
): Promise<ExpenseCategory> {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error('Category name is required');

  const { data, error } = await supabase
    .from('expense_categories')
    .insert({
      user_id: userId,
      key: generateCustomCategoryKey(),
      name: normalizedName,
      icon: 'Tag',
      color: '#6B7280',
      type: 'irregular',
    })
    .select('*')
    .single();

  if (error) throw toError(error, 'Could not create custom category');
  return data;
}
