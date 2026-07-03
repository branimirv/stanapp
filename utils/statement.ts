import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { TFunction } from 'i18next';
import type { Language, Property } from '@/types/app.types';
import { formatCurrency, formatPeriod } from '@/utils/formatters';

function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export interface StatementExpenseLine {
  label: string;
  amount: number;
}

export interface ExportPropertyStatementParams {
  property: Property;
  tenantName: string;
  landlordName: string;
  rentAmount: number;
  regularExpenses: StatementExpenseLine[];
  month: number;
  year: number;
  currency: string;
  language: Language;
  t: TFunction;
}

function generateStatementHTML(params: ExportPropertyStatementParams): string {
  const {
    property,
    tenantName,
    landlordName,
    rentAmount,
    regularExpenses,
    month,
    year,
    currency,
    language,
    t,
  } = params;

  const periodLabel = formatPeriod(month, year, language);
  const generatedAt = format(new Date(), 'dd.MM.yyyy HH:mm');
  const expensesTotal = regularExpenses.reduce((sum, line) => sum + line.amount, 0);
  const totalDue = rentAmount + expensesTotal;

  const expenseRows = regularExpenses
    .map(
      (line) =>
        `<tr><td>${line.label}</td><td class="amount">${formatCurrency(line.amount, currency, language)}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #0F172A; }
      h1 { color: #2563EB; font-size: 22px; margin-bottom: 4px; }
      h2 { color: #334155; font-size: 14px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
      p { color: #64748B; font-size: 13px; margin: 4px 0; }
      .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 24px; }
      .parties { display: flex; gap: 32px; margin-bottom: 24px; }
      .party { flex: 1; }
      .party-label { font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
      .party-name { font-size: 16px; font-weight: 600; color: #0F172A; }
      .party-detail { font-size: 13px; color: #64748B; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { padding: 10px 12px; border: 1px solid #E2E8F0; text-align: left; font-size: 13px; }
      th { background: #F8FAFC; color: #64748B; font-weight: 600; }
      td.amount { text-align: right; font-weight: 500; }
      .total-row td { font-weight: 700; font-size: 15px; background: #F1F5F9; border-top: 2px solid #2563EB; }
      .total-row td.amount { color: #2563EB; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${t('statement.title')}</h1>
      <p>${periodLabel}</p>
      <p>${t('statement.generatedAt', { date: generatedAt })}</p>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">${t('statement.landlord')}</div>
        <div class="party-name">${landlordName}</div>
      </div>
      <div class="party">
        <div class="party-label">${t('statement.billTo')}</div>
        <div class="party-name">${tenantName}</div>
        <div class="party-detail">${property.name}</div>
        <div class="party-detail">${property.address}</div>
      </div>
    </div>

    <h2>${t('statement.lineItems')}</h2>
    <table>
      <thead>
        <tr>
          <th>${t('common.description')}</th>
          <th style="text-align:right">${t('common.amount')}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${t('statement.rent')}</td>
          <td class="amount">${formatCurrency(rentAmount, currency, language)}</td>
        </tr>
        ${expenseRows}
        <tr class="total-row">
          <td>${t('statement.totalDue')}</td>
          <td class="amount">${formatCurrency(totalDue, currency, language)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>${t('statement.footerNote')}</p>
    </div>
  </body>
</html>`;
}

export async function exportPropertyStatementPDF(params: ExportPropertyStatementParams): Promise<void> {
  const { property, month, year, language } = params;
  const html = generateStatementHTML(params);
  const { uri } = await Print.printToFileAsync({ html });

  const periodLabel = formatPeriod(month, year, language);
  const baseName = sanitizeFileName(`${property.name}-${periodLabel}`) || 'statement';
  const targetUri = `${FileSystem.cacheDirectory}${baseName}.pdf`;

  let shareUri = uri;
  try {
    const existing = await FileSystem.getInfoAsync(targetUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(targetUri, { idempotent: true });
    }
    await FileSystem.moveAsync({ from: uri, to: targetUri });
    shareUri = targetUri;
  } catch {
    shareUri = uri;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(shareUri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `${property.name} — ${periodLabel}`,
    });
  }
}
