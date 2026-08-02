import type { ExpenseStatusFilter, ExpenseType } from '@/types/app.types';

export type StatusFilter = 'all' | ExpenseStatusFilter;
export type RecurringFilter = 'all' | 'recurring' | 'one_time';
export type TypeFilter = 'all' | ExpenseType;
