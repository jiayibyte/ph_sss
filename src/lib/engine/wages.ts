/**
 * Daily ↔ monthly conversions for minimum-wage figures, using the DOLE
 * Handbook factors (365 / 395 / 313 / 261). Parameters come from
 * src/data/wages/<year>.json → divisors.
 */
import type { WageRules } from '../rules/types';
import { round2 } from '../format';

/** Estimated equivalent monthly rate: daily × factor ÷ 12. */
export function monthlyEquivalent(daily: number, factor: number): number {
  return round2((daily * factor) / 12);
}

/** Daily rate implied by a monthly salary under a given factor: monthly × 12 ÷ factor. */
export function dailyEquivalent(monthly: number, factor: number): number {
  return round2((monthly * 12) / factor);
}

/** Highest and lowest daily tier across all regions with a wage order. */
export function rateRange(rules: WageRules): { high: number; low: number } {
  const rates = rules.regions.flatMap((r) => r.tiers.map((t) => t.rate));
  return { high: Math.max(...rates), low: Math.min(...rates) };
}

/** Hourly rate from a daily rate (normal hours per day, default 8). */
export function hourlyFromDaily(daily: number, hoursPerDay = 8): number {
  return round2(daily / hoursPerDay);
}

/** Is a given daily pay at or above a tier's minimum? Returns the shortfall (0 if compliant). */
export function shortfall(dailyPay: number, minimum: number): number {
  return round2(Math.max(0, minimum - dailyPay));
}
