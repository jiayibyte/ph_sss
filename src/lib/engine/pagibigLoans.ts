/**
 * Pag-IBIG short-term loans: the Multi-Purpose Loan (the "Pag-IBIG salary
 * loan", Circular No. 469) and the Calamity Loan (Circular No. 470).
 * Parameters come from src/data/pagibig/<year>.json → short_term_loans.
 */
import type { PagibigRules } from '../rules/types';
import { round2 } from '../format';

export type StlType = 'mpl' | 'calamity';

export interface StlInput {
  type: StlType;
  /** Total Accumulated Value of Regular Savings: member + employer savings + dividends. */
  tav: number;
  /** Outstanding MPL / Calamity Loan / HELPs balance, deducted from the entitlement. */
  outstanding?: number;
  /** Amount applied for; null = the maximum. */
  desired?: number | null;
  termMonths: number;
}

export interface StlResult {
  /** 90% of TAV less the outstanding short-term loans (never below 0). */
  entitlement: number;
  loanAmount: number;
  monthlyRate: number;
  graceMonths: number;
  /** Interest that runs during the grace period, amortized with the loan. */
  graceInterest: number;
  termMonths: number;
  monthlyAmortization: number;
  totalPayable: number;
  totalInterest: number;
  /** Payments start in this month counted from the release (3rd for MPL, 4th for Calamity). */
  firstPaymentMonth: number;
}

/** Monthly rate: MPL is set per month (1.4583%), the Calamity Loan per year (5.95% ÷ 12). */
export function stlMonthlyRate(type: StlType, rules: PagibigRules): number {
  const L = rules.short_term_loans;
  return type === 'mpl' ? L.mpl.rate_monthly : L.calamity.rate_annual / 12;
}

/**
 * Loan amount = lowest of the amount applied for and 90% of TAV less
 * outstanding short-term loans (capacity-to-pay, the third cap, depends on the
 * payslip and is checked by Pag-IBIG). Interest accrues on the diminishing
 * balance, including during the grace period, and the balance is repaid in
 * equal monthly amortizations over the term — an estimate of the amount on
 * Pag-IBIG's disclosure statement.
 */
export function computeShortTermLoan(input: StlInput, rules: PagibigRules): StlResult {
  const L = rules.short_term_loans;
  const p = input.type === 'mpl' ? L.mpl : L.calamity;
  const entitlement = round2(Math.max(Math.max(input.tav, 0) * L.tav_share - Math.max(input.outstanding ?? 0, 0), 0));
  const desired = input.desired ?? null;
  const loanAmount = round2(desired !== null && desired > 0 ? Math.min(desired, entitlement) : entitlement);
  const r = stlMonthlyRate(input.type, rules);
  const n = Math.max(1, Math.round(input.termMonths));
  const afterGrace = loanAmount * Math.pow(1 + r, p.grace_months);
  const monthlyAmortization = loanAmount > 0 ? round2((afterGrace * r) / (1 - Math.pow(1 + r, -n))) : 0;
  const totalPayable = round2(monthlyAmortization * n);
  return {
    entitlement,
    loanAmount,
    monthlyRate: r,
    graceMonths: p.grace_months,
    graceInterest: round2(afterGrace - loanAmount),
    termMonths: n,
    monthlyAmortization,
    totalPayable,
    totalInterest: round2(totalPayable - loanAmount),
    firstPaymentMonth: p.first_payment_month,
  };
}
