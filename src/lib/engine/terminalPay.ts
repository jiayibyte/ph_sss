/**
 * Separation pay (Labor Code Arts. 298–299) and retirement pay (Art. 302 /
 * RA 7641), per the DOLE Handbook on Workers' Statutory Monetary Benefits.
 * Parameters come from src/data/labor/<year>.json.
 */
import type { LaborRules } from '../rules/types';
import { round2 } from '../format';

/** Years of service counted the DOLE way: a fraction of at least six months is a whole year. */
export function creditedYears(years: number, extraMonths: number, fractionMonths: number): number {
  const y = Math.max(0, Math.floor(years));
  const m = Math.max(0, Math.min(11, Math.floor(extraMonths)));
  return y + (m >= fractionMonths ? 1 : 0);
}

export type SeparationCause = 'half-month' | 'one-month';

export interface SeparationInput {
  /** Latest monthly pay incl. regular allowances. */
  monthlyPay: number;
  years: number;
  extraMonths?: number;
  cause: SeparationCause;
}

export interface SeparationResult {
  creditedYears: number;
  monthsPerYear: number;
  computed: number;
  minimum: number;
  separationPay: number;
  minimumApplied: boolean;
}

export function computeSeparationPay(input: SeparationInput, rules: LaborRules): SeparationResult {
  const sp = rules.separation_pay;
  const cy = creditedYears(input.years, input.extraMonths ?? 0, sp.fraction_months_counted_as_year);
  const monthsPerYear = input.cause === 'one-month' ? 1 : 0.5;
  const computed = round2(input.monthlyPay * monthsPerYear * cy);
  const minimum = round2(input.monthlyPay * sp.min_months);
  const separationPay = Math.max(computed, minimum);
  return { creditedYears: cy, monthsPerYear, computed, minimum, separationPay, minimumApplied: minimum > computed };
}

export interface RetirementInput {
  /** Daily rate (basic, excluding COLA). */
  dailyRate: number;
  years: number;
  extraMonths?: number;
  age?: number | null;
}

export interface RetirementResult {
  creditedYears: number;
  daysPerYear: number;
  /** Daily rate × 22.5 — one "half-month salary". */
  halfMonthSalary: number;
  retirementPay: number;
  components: { salary: number; sil: number; thirteenth: number };
  eligibleByService: boolean;
  /** null when no age given. */
  eligibleByAge: boolean | null;
}

export function computeRetirementPay(input: RetirementInput, rules: LaborRules): RetirementResult {
  const rp = rules.retirement_pay;
  const cy = creditedYears(input.years, input.extraMonths ?? 0, rp.fraction_months_counted_as_year);
  const halfMonthSalary = round2(input.dailyRate * rp.days_per_year);
  const retirementPay = round2(halfMonthSalary * cy);
  const c = rp.components;
  return {
    creditedYears: cy,
    daysPerYear: rp.days_per_year,
    halfMonthSalary,
    retirementPay,
    components: {
      salary: round2(input.dailyRate * c.salary_days * cy),
      sil: round2(input.dailyRate * c.sil_days * cy),
      thirteenth: round2(input.dailyRate * c.thirteenth_month_days * cy),
    },
    eligibleByService: input.years + (input.extraMonths ?? 0) / 12 >= rp.min_service_years,
    eligibleByAge:
      input.age === null || input.age === undefined ? null : input.age >= rp.optional_age && input.age <= rp.compulsory_age,
  };
}
