import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { TFunction } from 'i18next';
import { supabase } from '@/lib/supabase';
import type { ReportData } from '@/types/app.types';
import { formatCurrency } from '@/utils/formatters';

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvSection(title: string, headers: string[], rows: string[][]): string {
  const lines = [title, headers.join(','), ...rows.map((row) => row.map(escapeCsv).join(','))];
  return lines.join('\n');
}

function generateReportHTML(data: ReportData, t: TFunction, language: 'en' | 'hr'): string {
  const monthlyRows = data.monthlyIncomeExpense
    .map(
      (row) =>
        `<tr><td>${row.label}</td><td>${formatCurrency(row.income, data.currency, language)}</td><td>${formatCurrency(row.expenses, data.currency, language)}</td></tr>`,
    )
    .join('');

  const categoryRows = data.categoryBreakdown
    .map(
      (row) =>
        `<tr><td>${t(`categories.${row.categoryKey}`)}</td><td>${formatCurrency(row.amount, data.currency, language)}</td><td>${row.percentage.toFixed(1)}%</td></tr>`,
    )
    .join('');

  const propertyRows = data.propertySummaries
    .map(
      (row) =>
        `<tr><td>${row.propertyName}</td><td>${formatCurrency(row.totalRentCollected, row.currency, language)}</td><td>${formatCurrency(row.totalExpensesPaid, row.currency, language)}</td><td>${formatCurrency(row.net, row.currency, language)}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #0F172A; }
      h1 { color: #2563EB; margin-bottom: 8px; }
      h2 { color: #334155; margin-top: 24px; }
      p { color: #64748B; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { padding: 10px; border: 1px solid #E2E8F0; text-align: left; }
      th { background: #F1F5F9; }
      .summary { display: flex; gap: 16px; margin: 16px 0; }
      .summary-card { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; }
      .summary-label { font-size: 12px; color: #64748B; }
      .summary-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
      .income { color: #10B981; }
      .expense { color: #EF4444; }
      .net { color: #2563EB; }
    </style>
  </head>
  <body>
    <h1>${t('reports.title')} — StanApp</h1>
    <p>${t('reports.generatedAt', { date: format(new Date(), 'dd.MM.yyyy HH:mm') })}</p>
    <p>${data.period.startDate} — ${data.period.endDate}</p>

    <div class="summary">
      <div class="summary-card">
        <div class="summary-label">${t('reports.totalIncome')}</div>
        <div class="summary-value income">${formatCurrency(data.totalIncome, data.currency, language)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">${t('reports.totalExpenses')}</div>
        <div class="summary-value expense">${formatCurrency(data.totalExpenses, data.currency, language)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">${t('reports.netTotal')}</div>
        <div class="summary-value net">${formatCurrency(data.netIncome, data.currency, language)}</div>
      </div>
    </div>

    <h2>${t('reports.incomeVsExpenses')}</h2>
    <table>
      <thead><tr><th>${t('common.period')}</th><th>${t('reports.chartIncome')}</th><th>${t('reports.chartExpenses')}</th></tr></thead>
      <tbody>${monthlyRows || `<tr><td colspan="3">${t('reports.noData')}</td></tr>`}</tbody>
    </table>

    <h2>${t('reports.expenseBreakdown')}</h2>
    <table>
      <thead><tr><th>${t('expenses.category')}</th><th>${t('common.amount')}</th><th>${t('reports.categoryShare')}</th></tr></thead>
      <tbody>${categoryRows || `<tr><td colspan="3">${t('reports.noData')}</td></tr>`}</tbody>
    </table>

    <h2>${t('reports.perProperty')}</h2>
    <table>
      <thead><tr><th>${t('properties.property')}</th><th>${t('reports.collected')}</th><th>${t('reports.spent')}</th><th>${t('reports.net')}</th></tr></thead>
      <tbody>${propertyRows || `<tr><td colspan="4">${t('reports.noData')}</td></tr>`}</tbody>
    </table>
  </body>
</html>`;
}

export async function exportReportAsPDF(
  data: ReportData,
  t: TFunction,
  language: 'en' | 'hr' = 'hr',
): Promise<void> {
  const html = generateReportHTML(data, t, language);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  }
}

export interface ExportAllDataResult {
  propertiesCount: number;
  tenantsCount: number;
  expensesCount: number;
  rentPaymentsCount: number;
}

export async function exportAllDataCSV(t: TFunction): Promise<ExportAllDataResult> {
  const [propertiesRes, tenantsRes, expensesRes, rentRes, categoriesRes] = await Promise.all([
    supabase.from('properties').select('*').order('created_at', { ascending: false }),
    supabase.from('tenants').select('*').order('created_at', { ascending: false }),
    supabase.from('expenses').select('*').order('billing_date', { ascending: false }),
    supabase.from('rent_payments').select('*').order('period_year', { ascending: false }),
    supabase.from('expense_categories').select('*'),
  ]);

  if (propertiesRes.error) throw propertiesRes.error;
  if (tenantsRes.error) throw tenantsRes.error;
  if (expensesRes.error) throw expensesRes.error;
  if (rentRes.error) throw rentRes.error;
  if (categoriesRes.error) throw categoriesRes.error;

  const properties = propertiesRes.data ?? [];
  const tenants = tenantsRes.data ?? [];
  const expenses = expensesRes.data ?? [];
  const rentPayments = rentRes.data ?? [];
  const categories = categoriesRes.data ?? [];

  const categoryMap = new Map(categories.map((c) => [c.id, c.key]));
  const propertyMap = new Map(properties.map((p) => [p.id, p.name]));

  const sections = [
    buildCsvSection(
      t('properties.title'),
      ['id', 'name', 'type', 'usage_status', 'address', 'rent_amount', 'area_sqm', 'is_archived'],
      properties.map((p) => [
        p.id,
        p.name,
        p.type,
        p.usage_status,
        p.address,
        String(p.rent_amount),
        p.area_sqm != null ? String(p.area_sqm) : '',
        String(p.is_archived),
      ]),
    ),
    '',
    buildCsvSection(
      t('tenants.title'),
      [
        'id',
        'property_id',
        'property_name',
        'first_name',
        'last_name',
        'email',
        'phone',
        'contract_start',
        'contract_end',
        'deposit_amount',
        'is_active',
      ],
      tenants.map((tenant) => [
        tenant.id,
        tenant.property_id,
        propertyMap.get(tenant.property_id) ?? '',
        tenant.first_name,
        tenant.last_name,
        tenant.email ?? '',
        tenant.phone ?? '',
        tenant.contract_start,
        tenant.contract_end ?? '',
        String(tenant.deposit_amount),
        String(tenant.is_active),
      ]),
    ),
    '',
    buildCsvSection(
      t('expenses.title'),
      [
        'id',
        'property_id',
        'property_name',
        'category',
        'amount',
        'is_recurring',
        'billing_date',
        'due_date',
        'paid_at',
      ],
      expenses.map((expense) => [
        expense.id,
        expense.property_id,
        propertyMap.get(expense.property_id) ?? '',
        categoryMap.get(expense.category_id) ?? expense.category_id,
        String(expense.amount),
        String(expense.is_recurring),
        expense.billing_date,
        expense.due_date ?? '',
        expense.paid_at ?? '',
      ]),
    ),
    '',
    buildCsvSection(
      t('rent.title'),
      [
        'id',
        'property_id',
        'property_name',
        'tenant_id',
        'amount',
        'period_month',
        'period_year',
        'status',
        'payment_date',
      ],
      rentPayments.map((payment) => [
        payment.id,
        payment.property_id,
        propertyMap.get(payment.property_id) ?? '',
        payment.tenant_id,
        String(payment.amount),
        String(payment.period_month),
        String(payment.period_year),
        payment.status,
        payment.payment_date ?? '',
      ]),
    ),
  ];

  const csv = `\uFEFF${sections.join('\n')}`;
  const fileName = `stanapp-export-${format(new Date(), 'yyyyMMdd-HHmmss')}.csv`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
    });
  }

  return {
    propertiesCount: properties.length,
    tenantsCount: tenants.length,
    expensesCount: expenses.length,
    rentPaymentsCount: rentPayments.length,
  };
}
