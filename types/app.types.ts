import type { Database } from './database.types';

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
export type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export type RentPayment = Database['public']['Tables']['rent_payments']['Row'];
export type RentPaymentInsert = Database['public']['Tables']['rent_payments']['Insert'];
export type RentPaymentUpdate = Database['public']['Tables']['rent_payments']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row'];

export type ExpenseType = 'regular' | 'irregular';

export type PropertyType = 'apartment' | 'house' | 'garage' | 'other';
export type UsageStatus = 'rented' | 'personal_use' | 'vacant';
export type PaymentStatus = 'pending' | 'paid' | 'late' | 'partial';
export type Language = 'en' | 'hr';
export type Theme = 'light' | 'dark' | 'system';

export type ExpenseStatusFilter = 'paid' | 'unpaid' | 'overdue';

export type RecentActivityType = 'expense' | 'rent_payment';

export interface RecentActivityItem {
  type: RecentActivityType;
  id: string;
  title: string;
  amount: number;
  currency: string | null;
  created_at: string;
}

export type DashboardPeriod =
  | { mode: 'month'; month: number; year: number }
  | { mode: 'all' };

export interface DashboardStats {
  totalRentIncome: number;
  totalExpenses: number;
  netIncome: number;
  activePropertiesCount: number;
  activeTenantsCount: number;
  overdueExpensesCount: number;
  recentActivity: RecentActivityItem[];
  currency: string;
  month: number;
  year: number;
  periodMode: 'month' | 'all';
}

export type ReportPeriodPreset =
  | 'current_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_12_months'
  | 'custom';

export interface ReportPeriod {
  preset: ReportPeriodPreset;
  startDate: string;
  endDate: string;
}

export interface MonthlyIncomeExpense {
  month: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryKey: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface PropertyReportSummary {
  propertyId: string;
  propertyName: string;
  totalRentCollected: number;
  totalExpensesPaid: number;
  net: number;
  currency: string;
}

export interface ReportData {
  period: ReportPeriod;
  currency: string;
  hasMixedCurrencies: boolean;
  currenciesFound: string[];
  monthlyIncomeExpense: MonthlyIncomeExpense[];
  categoryBreakdown: CategoryBreakdown[];
  propertySummaries: PropertyReportSummary[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}
