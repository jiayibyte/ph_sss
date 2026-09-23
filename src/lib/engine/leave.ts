/**
 * Service incentive leave (Labor Code Art. 95): five days with pay a year
 * after one year of service; unused days are converted to cash at the daily
 * rate on the date of conversion, pro rata (DOLE Handbook 2024, Ch. 7).
 * Parameters come from src/data/labor/<year>.json → leave.
 */
import type { LaborRules } from '../rules/types';
import { round2 } from '../format';

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** Whole months from `start` to `end` (ISO dates); a month counts once its day-of-month is reached. */
export function fullMonthsBetween(start: string, end: string): number {
  const [y1, m1, d1] = start.split('-').map(Number) as [number, number, number];
  const [y2, m2, d2] = end.split('-').map(Number) as [number, number, number];
  const months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
  return Math.max(0, months);
}

export interface SilInput {
  /** Months of service (or give `hired` and `asOf`). */
  months?: number;
  hired?: string;
  asOf?: string;
  /** SIL days already used or already converted to cash. */
  usedDays?: number;
  /** Skip the accrual and value these unused days directly. */
  unusedDays?: number | null;
  dailyRate: number;
}

export interface SilResult {
  monthsOfService: number | null;
  entitled: boolean;
  /** 5 days × months ÷ 12, rounded to three decimals as in the Handbook's example. */
  accruedDays: number;
  usedDays: number;
  unusedDays: number;
  cashValue: number;
}

export function computeSil(input: SilInput, rules: LaborRules): SilResult {
  const L = rules.leave;
  const rate = Math.max(input.dailyRate, 0);
  if (input.unusedDays !== undefined && input.unusedDays !== null) {
    const days = Math.max(input.unusedDays, 0);
    return { monthsOfService: null, entitled: true, accruedDays: days, usedDays: 0, unusedDays: days, cashValue: round2(days * rate) };
  }
  const months = input.months ?? (input.hired && input.asOf ? fullMonthsBetween(input.hired, input.asOf) : 0);
  const entitled = months >= L.sil_min_service_months;
  const accruedDays = entitled ? round3((L.sil_days_per_year * months) / 12) : 0;
  const usedDays = Math.max(input.usedDays ?? 0, 0);
  const unusedDays = round3(Math.max(accruedDays - usedDays, 0));
  return { monthsOfService: months, entitled, accruedDays, usedDays, unusedDays, cashValue: round2(unusedDays * rate) };
}
