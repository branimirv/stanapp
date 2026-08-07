import { parseISO } from 'date-fns';

import type { Language, ReportPeriod } from '@/types/app.types';
import { formatMonthName, formatPeriod } from '@/utils/formatters';

export function capitalizeLabel(label: string, language: Language): string {
  return label.replace(/^./, (ch) =>
    ch.toLocaleUpperCase(language === 'en' ? 'en' : 'hr'),
  );
}

export function formatReportPeriodEyebrow(
  period: ReportPeriod,
  language: Language,
  t: (key: string) => string,
): string {
  if (period.preset === 'all_time') return t('reports.periodAllTime');

  const start = parseISO(period.startDate);
  const end = parseISO(period.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return t('reports.periodCustom');
  }

  const startMonth = start.getMonth() + 1;
  const startYear = start.getFullYear();
  const endMonth = end.getMonth() + 1;
  const endYear = end.getFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return capitalizeLabel(formatPeriod(endMonth, endYear, language), language);
  }

  if (startYear === endYear) {
    return `${capitalizeLabel(formatMonthName(startMonth, startYear, language), language)} – ${formatPeriod(endMonth, endYear, language)}`;
  }

  return `${capitalizeLabel(formatPeriod(startMonth, startYear, language), language)} – ${formatPeriod(endMonth, endYear, language)}`;
}
