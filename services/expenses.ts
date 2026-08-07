import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Expense, ExpenseInsert, ExpenseUpdate } from '@/types/app.types';
import type { ExpenseListFilters } from '@/lib/queryKeys';
import { throwQueryError } from '@/utils/errors';

export async function fetchExpenses(filters: ExpenseListFilters = {}): Promise<Expense[]> {
  const { propertyId, status } = filters;

  let query = supabase.from('expenses').select('*').order('billing_date', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  if (status === 'paid') {
    query = query.not('paid_at', 'is', null);
  } else if (status === 'unpaid') {
    query = query.is('paid_at', null);
  } else if (status === 'overdue') {
    query = query.is('paid_at', null).lt('due_date', format(new Date(), 'yyyy-MM-dd'));
  }

  const { data, error } = await query;
  if (error) throwQueryError(error);
  return data ?? [];
}

export async function fetchExpense(id: string): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();

  if (error) throwQueryError(error);
  return data;
}

export async function createExpense(values: ExpenseInsert): Promise<Expense> {
  const { data, error } = await supabase.from('expenses').insert(values).select().single();

  if (error) throwQueryError(error);
  return data;
}

export async function updateExpense(id: string, values: ExpenseUpdate): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throwQueryError(error);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throwQueryError(error);
}
