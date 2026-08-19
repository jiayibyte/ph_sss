import { round2 } from '../format';

export interface ThirteenthMonthResult {
  totalBasicSalary: number;
  divisor: number;
  amount: number;
  /** Per-month amounts actually counted (Accurate mode) for the breakdown. */
  months: number[];
}

/**
 * DOLE / PD 851 rule: 13th month pay = total basic salary earned during the
 * calendar year ÷ 12. Accurate mode takes the twelve per-month basic-salary
 * amounts (0 for months not worked / unpaid) so mid-year hires, resignations
 * and salary increases are handled naturally.
 */
export function compute13thMonth(
  monthlyBasics: number[],
  divisor = 12,
): ThirteenthMonthResult {
  const months = monthlyBasics.map((m) => (Number.isFinite(m) && m > 0 ? m : 0));
  const total = round2(months.reduce((a, b) => a + b, 0));
  return { totalBasicSalary: total, divisor, amount: round2(total / divisor), months };
}

/** Simple mode: fixed monthly basic salary × months worked ÷ 12. */
export function compute13thMonthSimple(
  monthlyBasic: number,
  monthsWorked: number,
  divisor = 12,
): ThirteenthMonthResult {
  const clampedMonths = Math.min(Math.max(monthsWorked, 0), 12);
  const months = Array.from({ length: 12 }, (_, i) =>
    i < clampedMonths ? monthlyBasic : 0,
  );
  // Support fractional months (e.g. 10.5) on the last counted month
  const frac = clampedMonths - Math.floor(clampedMonths);
  if (frac > 0 && Math.floor(clampedMonths) < 12) {
    months[Math.floor(clampedMonths)] = round2(monthlyBasic * frac);
  }
  return compute13thMonth(months, divisor);
}
