/**
 * SSS benefit computations: retirement pension (RA 11199 Sec. 12/12-A/12-B),
 * maternity benefit (RA 11210 + RA 11199 Sec. 8(n)/14-A) and salary loan
 * (SSS Circular No. 2025-004). Parameters live in src/data/sss/<year>.json →
 * benefits; the MSC cap for benefit computation is the Regular SS cap
 * (rules.msc.regular_cap = ₱20,000 under RA 11199 Sec. 8(g)) — contributions
 * above it go to the MPF provident account, not into these formulas.
 */
import type { SssRules } from '../rules/types';
import { round2 } from '../format';

/* ------------------------------ Retirement pension ------------------------------ */

export interface PensionInput {
  /** Average monthly salary credit (AMSC), ₱. Capped at the Regular SS MSC ceiling. */
  amsc: number;
  /** Credited years of service (calendar years with at least six posted contributions). */
  cys: number;
  /** Qualified dependent children (minor / incapacitated), 0–5 count. */
  dependents?: number;
}

export interface PensionResult {
  amsc: number;
  cys: number;
  /** Formula (a): ₱300 + 20% AMSC + 2% AMSC × (CYS − 10). */
  formulaA: number;
  /** Formula (b): 40% AMSC. */
  formulaB: number;
  /** Formula (c): flat floor. */
  formulaC: number;
  /** Highest of the three before the CYS minimum. */
  highest: number;
  /** Statutory minimum applied for the member's CYS (₱1,200 ≥10 CYS, ₱2,400 ≥20 CYS). */
  minimumApplied: number | null;
  /** Basic monthly pension after the minimum. */
  basicPension: number;
  /** Additional monthly benefit allowance on top of the basic pension (RA 11199 Sec. 12(c)). */
  additionalBenefit: number;
  /** Dependents' pension: 10% of basic pension or ₱250 per child, whichever is higher, max 5. */
  dependentsPension: number;
  dependentsCounted: number;
  /** Basic + additional + dependents. */
  monthlyTotal: number;
  /** 13th-month pension (paid every December) = basic pension. */
  thirteenthMonth: number;
  /** 12 monthly totals + 13th month. */
  annualTotal: number;
  /** True when the AMSC entered was above the Regular SS cap and was capped. */
  amscCapped: boolean;
  /** False when CYS < 10 (fewer than 120 contributions → lump sum, not a pension). */
  eligibleForPension: boolean;
}

/** The MSC ceiling that applies to benefit formulas (Regular SS program). */
export function benefitMscCap(rules: SssRules): number {
  return rules.msc.regular_cap;
}

export function computePension(input: PensionInput, rules: SssRules): PensionResult {
  const p = rules.benefits.pension;
  const cap = benefitMscCap(rules);
  const amscCapped = input.amsc > cap;
  const amsc = Math.min(Math.max(input.amsc, 0), cap);
  const cys = Math.max(0, Math.floor(input.cys));
  const extraYears = Math.max(0, cys - p.cys_threshold);

  const formulaA = round2(p.base + p.amsc_pct * amsc + p.per_cys_pct * amsc * extraYears);
  const formulaB = round2(p.flat_pct * amsc);
  const formulaC = p.floor;
  const highest = Math.max(formulaA, formulaB, formulaC);

  const minimum = cys >= 20 ? p.min_cys20 : cys >= p.cys_threshold ? p.min_cys10 : null;
  const basicPension = minimum !== null ? Math.max(highest, minimum) : highest;
  const minimumApplied = minimum !== null && minimum > highest ? minimum : null;

  const dependentsCounted = Math.min(Math.max(0, Math.floor(input.dependents ?? 0)), p.max_dependents);
  const perDependent = Math.max(round2(p.dependent_pct * basicPension), p.dependent_min);
  const dependentsPension = round2(perDependent * dependentsCounted);

  const additionalBenefit = p.additional_benefit;
  const monthlyTotal = round2(basicPension + additionalBenefit + dependentsPension);
  const thirteenthMonth = basicPension;

  return {
    amsc,
    cys,
    formulaA,
    formulaB,
    formulaC,
    highest,
    minimumApplied,
    basicPension,
    additionalBenefit,
    dependentsPension,
    dependentsCounted,
    monthlyTotal,
    thirteenthMonth,
    annualTotal: round2(monthlyTotal * 12 + thirteenthMonth),
    amscCapped,
    eligibleForPension: cys >= p.cys_threshold,
  };
}

/* -------------------------------- Maternity benefit -------------------------------- */

export type MaternityEvent = 'live-birth' | 'live-birth-solo-parent' | 'miscarriage';

export interface MaternityInput {
  /** Monthly salary credits in the 12 months before the semester of contingency (any count; the top 6 are used). */
  mscs: number[];
  event: MaternityEvent;
}

export interface MaternityResult {
  topMscs: number[];
  sumTopMscs: number;
  /** Displayed daily rate (sum ÷ 180, to centavos). */
  averageDailySalaryCredit: number;
  days: number;
  /** sum × days ÷ 180, rounded once at the end — matches SSS's published example (₱96,000 → ₱56,000.00). */
  benefit: number;
  /** Fewer than the required posted contributions among the supplied months. */
  insufficientContributions: boolean;
  /** True when at least one supplied MSC was above the Regular SS cap and was capped. */
  mscCapped: boolean;
}

export function maternityDays(event: MaternityEvent, rules: SssRules): number {
  const m = rules.benefits.maternity;
  if (event === 'miscarriage') return m.days_miscarriage;
  if (event === 'live-birth-solo-parent') return m.days_live_birth + m.days_solo_parent_extra;
  return m.days_live_birth;
}

export function computeMaternity(input: MaternityInput, rules: SssRules): MaternityResult {
  const m = rules.benefits.maternity;
  const cap = benefitMscCap(rules);
  const posted = input.mscs.filter((v) => v > 0);
  const mscCapped = posted.some((v) => v > cap);
  const topMscs = posted
    .map((v) => Math.min(v, cap))
    .sort((a, b) => b - a)
    .slice(0, m.top_msc_count);
  const sumTopMscs = round2(topMscs.reduce((a, b) => a + b, 0));
  const days = maternityDays(input.event, rules);
  return {
    topMscs,
    sumTopMscs,
    averageDailySalaryCredit: round2(sumTopMscs / m.divisor),
    days,
    benefit: round2((sumTopMscs * days) / m.divisor),
    insufficientContributions: posted.length < m.min_contributions,
    mscCapped,
  };
}

/* ---------------------------------- Salary loan ---------------------------------- */

export interface SalaryLoanInput {
  /** Average of the member's 12 latest posted monthly salary credits, ₱ (Regular SS portion). */
  averageMsc: number;
  /** 1 = one-month loan, 2 = two-month loan. */
  months: 1 | 2;
  /** Amount applied for; the loan is the lower of this and the loanable amount. */
  requested?: number | null;
  /** Renewal with a penalty condonation availed in the past five years → higher rate. */
  renewalWithCondonation?: boolean;
  /** Loan approval date (ISO yyyy-mm-dd). Drives the pro-rated advance interest. */
  loanDate?: string | null;
}

export interface SalaryLoanResult {
  /** Average MSC after the Regular SS cap and rounding up to the next MSC bracket. */
  baseMsc: number;
  loanableAmount: number;
  loanAmount: number;
  interestRate: number;
  serviceFee: number;
  /** Interest from the day after the loan date to the end of the month before the first amortization month. */
  proratedInterestDays: number;
  proratedInterest: number;
  netProceeds: number;
  monthlyAmortization: number;
  totalInterest: number;
  totalPayable: number;
  termMonths: number;
  /** First amortization month (yyyy-mm) and its payment deadline (yyyy-mm-dd), when a loan date is given. */
  firstAmortizationMonth: string | null;
  firstPaymentDeadline: string | null;
}

/** Round up to the next MSC bracket (₱500 steps), capped at the Regular SS ceiling. */
export function roundUpToMsc(avg: number, rules: SssRules): number {
  const cap = benefitMscCap(rules);
  const step = rules.msc.step;
  const floor = rules.msc.min;
  if (avg <= 0) return 0;
  const rounded = Math.ceil(avg / step) * step;
  return Math.min(Math.max(rounded, floor), cap);
}

const lastDayOfMonth = (y: number, m0: number): Date => new Date(Date.UTC(y, m0 + 1, 0));
const iso = (d: Date): string => d.toISOString().slice(0, 10);

export function computeSalaryLoan(input: SalaryLoanInput, rules: SssRules): SalaryLoanResult {
  const l = rules.benefits.salary_loan;
  const baseMsc = roundUpToMsc(input.averageMsc, rules);
  const loanableAmount = round2(baseMsc * input.months);
  const requested = input.requested ?? null;
  const loanAmount =
    requested !== null && requested > 0 ? round2(Math.min(requested, loanableAmount)) : loanableAmount;
  const interestRate = input.renewalWithCondonation ? l.interest_pa_renewal_condoned : l.interest_pa;
  const serviceFee = round2(loanAmount * l.service_fee_pct);

  // Pro-rated interest: day after the loan date through the last day of the
  // month before the first amortization month (Circular 2025-004, IV.D.2).
  let proratedInterestDays = 0;
  let firstAmortizationMonth: string | null = null;
  let firstPaymentDeadline: string | null = null;
  if (input.loanDate && /^\d{4}-\d{2}-\d{2}$/.test(input.loanDate)) {
    const d = new Date(input.loanDate + 'T00:00:00Z');
    const y = d.getUTCFullYear();
    const m0 = d.getUTCMonth();
    const interestEnd = lastDayOfMonth(y, m0 + l.amortization_start_offset_months - 1);
    proratedInterestDays = Math.max(0, Math.round((interestEnd.getTime() - d.getTime()) / 86_400_000));
    const first = new Date(Date.UTC(y, m0 + l.amortization_start_offset_months, 1));
    firstAmortizationMonth = iso(first).slice(0, 7);
    // Deadline: last day of the month following the applicable month.
    firstPaymentDeadline = iso(lastDayOfMonth(first.getUTCFullYear(), first.getUTCMonth() + 1));
  }
  const proratedInterest = round2((loanAmount * interestRate * proratedInterestDays) / 365);

  const i = interestRate / 12;
  const n = l.term_months;
  const monthlyAmortization = loanAmount > 0 ? round2((loanAmount * i) / (1 - Math.pow(1 + i, -n))) : 0;
  const totalPayable = round2(monthlyAmortization * n);
  return {
    baseMsc,
    loanableAmount,
    loanAmount,
    interestRate,
    serviceFee,
    proratedInterestDays,
    proratedInterest,
    netProceeds: round2(loanAmount - serviceFee - proratedInterest),
    monthlyAmortization,
    totalInterest: round2(totalPayable - loanAmount),
    totalPayable,
    termMonths: n,
    firstAmortizationMonth,
    firstPaymentDeadline,
  };
}
