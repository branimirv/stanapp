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

export type PropertyMember = Database['public']['Tables']['property_members']['Row'];
export type PropertyMemberInsert = Database['public']['Tables']['property_members']['Insert'];
export type PropertyMemberUpdate = Database['public']['Tables']['property_members']['Update'];

export type PropertyStatusHistory = Database['public']['Tables']['property_status_history']['Row'];

export type PropertyInvite = Database['public']['Tables']['property_invites']['Row'];
export type PropertyInviteInsert = Database['public']['Tables']['property_invites']['Insert'];
export type PropertyInviteUpdate = Database['public']['Tables']['property_invites']['Update'];

export type ExpenseType = 'regular' | 'irregular';

export type PropertyType = 'apartment' | 'house' | 'garage' | 'other';
export type UsageStatus = 'rented' | 'personal_use' | 'vacant' | 'in_renovation';
export type PaymentStatus = 'pending' | 'paid' | 'late' | 'partial';
export type MembershipRole = 'owner' | 'manager' | 'tenant';
export type Language = 'en' | 'hr';
export type Theme = 'light' | 'dark' | 'system';
export type TabBarLabelMode = 'iconAndLabel' | 'iconOnly';

export interface PropertyMemberWithProfile extends PropertyMember {
  profile: Pick<Profile, 'id' | 'full_name'> | null;
}

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

export interface DashboardPeriod {
  month: number;
  year: number;
}

export interface DashboardStats {
  totalRentIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeDeltaPct: number | null;
  expensesDeltaPct: number | null;
  netDeltaPct: number | null;
  activePropertiesCount: number;
  activeTenantsCount: number;
  rentedCount: number;
  vacantCount: number;
  totalPropertiesCount: number;
  expectedRent: number;
  collectedRent: number;
  unpaidRentCount: number;
  overdueExpensesCount: number;
  upcomingDueCount: number;
  contractsExpiringCount: number;
  recentActivity: RecentActivityItem[];
  currency: string;
  month: number;
  year: number;
}

export type ReportPeriodPreset =
  | 'all_time'
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

export type ReportCategoryTypeFilter = 'all' | ExpenseType;

/** Cash-flow definition: which booked expenses count toward net. */
export type ReportExpensePaymentStatus = 'all' | 'paid' | 'unpaid';

export interface MonthlyIncomeExpense {
  month: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryKey: string;
  categoryName: string | null;
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

export interface ReportPeriodComparison {
  previousNet: number;
  deltaAbsolute: number;
  /** Null when previous net is 0 and current is not — avoid fake percentages. */
  deltaPercent: number | null;
  previousPeriod: {
    startDate: string;
    endDate: string;
  };
}

export interface ReportData {
  period: ReportPeriod;
  currency: string;
  hasMixedCurrencies: boolean;
  currenciesFound: string[];
  expensePaymentStatus: ReportExpensePaymentStatus;
  monthlyIncomeExpense: MonthlyIncomeExpense[];
  categoryBreakdown: CategoryBreakdown[];
  propertySummaries: PropertyReportSummary[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  comparison: ReportPeriodComparison | null;
}
