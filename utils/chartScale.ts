/** Shared Y-scale helpers for signed portfolio charts (gifted-charts). */

/** Fixed plot height (positive + negative quadrants). Card chart area stays stable. */
export const CHART_PLOT_HEIGHT = 200;
/** Space reserved under the plot for month labels at the bottom. */
export const CHART_LABEL_BAND = 28;
/** Total chart viewport height inside the card (plot + labels). */
export const CHART_VIEWPORT_HEIGHT = CHART_PLOT_HEIGHT + CHART_LABEL_BAND;

const RANGE_PADDING = 0.12;

export interface SignedChartScale {
  maxValue: number;
  mostNegativeValue: number;
  noOfSections: number;
  noOfSectionsBelowXAxis: number;
  stepValue: number;
  /**
   * gifted-charts `height` is the *positive* quadrant only; space below zero is
   * added as `noOfSectionsBelowXAxis * (height / noOfSections)`.
   * Chosen so positive + negative always equals `CHART_PLOT_HEIGHT`.
   */
  height: number;
}

/** Round a rough step to 1 / 2 / 5 × 10^n (classic “nice number” algorithm). */
export function niceNum(range: number, round: boolean): number {
  const safe = Math.max(Math.abs(range), Number.EPSILON);
  const exponent = Math.floor(Math.log10(safe));
  const fraction = safe / 10 ** exponent;

  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * 10 ** exponent;
}

/**
 * Tight, data-driven scale that always includes zero (cash-flow baseline),
 * uses nice tick steps, and allocates vertical space proportional to the
 * positive vs negative extents — no forced ±symmetry.
 */
export function getSignedChartScale(values: number[]): SignedChartScale {
  if (values.length === 0) {
    return {
      maxValue: 1,
      mostNegativeValue: 0,
      noOfSections: 4,
      noOfSectionsBelowXAxis: 0,
      stepValue: 0.25,
      height: CHART_PLOT_HEIGHT,
    };
  }

  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);

  // Always include 0 — net cash flow is relative to break-even.
  let yMax = Math.max(dataMax, 0);
  let yMin = Math.min(dataMin, 0);

  const span = Math.max(yMax - yMin, 1);
  if (yMax > 0) yMax += span * RANGE_PADDING;
  if (yMin < 0) yMin -= span * RANGE_PADDING;

  // All-zero series: tiny positive band so the chart still renders.
  if (yMax === 0 && yMin === 0) {
    yMax = 1;
  }

  const positiveExtent = yMax;
  const negativeExtent = -yMin;

  const dominant = Math.max(positiveExtent, negativeExtent, 1);
  const stepValue = Math.max(niceNum(dominant / 4, true), Number.EPSILON);

  // At least one positive section so the zero line / labels render cleanly.
  const noOfSections =
    positiveExtent > 0 ? Math.max(1, Math.ceil(positiveExtent / stepValue)) : 1;
  const noOfSectionsBelowXAxis =
    negativeExtent > 0 ? Math.max(1, Math.ceil(negativeExtent / stepValue)) : 0;

  const maxValue = stepValue * noOfSections;
  const mostNegativeValue =
    noOfSectionsBelowXAxis > 0 ? -stepValue * noOfSectionsBelowXAxis : 0;

  // Fixed plot height: allocate positive/negative bands inside CHART_PLOT_HEIGHT.
  const totalSections = Math.max(noOfSections + noOfSectionsBelowXAxis, 1);
  const height = Math.round((CHART_PLOT_HEIGHT * noOfSections) / totalSections);

  return {
    maxValue,
    mostNegativeValue,
    noOfSections,
    noOfSectionsBelowXAxis,
    stepValue,
    height,
  };
}

/** Non-negative charts (income / expenses) — tight top, no below-zero band. */
export function getPositiveChartScale(values: number[]): SignedChartScale {
  const nonNegative = values.map((value) => Math.max(value, 0));
  const max = Math.max(...nonNegative, 0);
  const padded = max === 0 ? 1 : max * (1 + RANGE_PADDING);
  const stepValue = Math.max(niceNum(padded / 4, true), Number.EPSILON);
  const noOfSections = Math.max(1, Math.ceil(padded / stepValue));

  return {
    maxValue: stepValue * noOfSections,
    mostNegativeValue: 0,
    noOfSections,
    noOfSectionsBelowXAxis: 0,
    stepValue,
    height: CHART_PLOT_HEIGHT,
  };
}

/** Compact axis labels — gifted-charts passes the label as a string. */
export function formatChartAxisValue(label: string): string {
  const value = Number(label);
  if (!Number.isFinite(value)) return label;

  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';

  if (abs >= 1_000_000) {
    const decimals = abs >= 10_000_000 ? 0 : 1;
    return `${sign}${(abs / 1_000_000).toFixed(decimals)}M`;
  }
  if (abs >= 10_000) {
    return `${sign}${(abs / 1_000).toFixed(0)}k`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}k`;
  }
  if (abs === 0) {
    return '0';
  }
  if (Number.isInteger(value) || abs >= 10) {
    return `${sign}${Math.round(abs)}`;
  }
  return `${sign}${abs.toFixed(1)}`;
}
