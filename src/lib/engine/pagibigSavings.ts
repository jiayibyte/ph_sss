/**
 * Pag-IBIG MP2 savings projection and housing-loan amortization.
 * Parameters come from src/data/pagibig/<year>.json (mp2, housing_loan).
 *
 * MP2: Pag-IBIG credits dividends once a year; the fund does not publish its
 * exact intra-year crediting method, so the projection pro-rates each deposit
 * by the months it is held in the dividend year (simple within the year,
 * compounded or paid out at year-end). It is an estimate — the rate for
 * future years is not known in advance.
 */
import { round2 } from '../format';

/* ---------------------------------- MP2 ---------------------------------- */

export type Mp2Payout = 'compounded' | 'annual';

export interface Mp2Input {
  /** Amount saved every month (0 for a lump-sum only plan). */
  monthly: number;
  /** One-time amount deposited at the start (0 if none). */
  lumpSum?: number;
  /** Annual dividend rate assumed for every year, e.g. 0.0712. */
  rate: number;
  years?: number;
  payout: Mp2Payout;
}

export interface Mp2Year {
  year: number;
  deposits: number;
  dividend: number;
  /** Balance at year-end (principal + compounded dividends; annual mode: principal only). */
  balance: number;
}

export interface Mp2Result {
  totalDeposits: number;
  totalDividends: number;
  /** Amount received at maturity (compounded: balance; annual: principal). */
  maturityValue: number;
  /** Dividends paid out along the way (annual mode). */
  paidOut: number;
  years: Mp2Year[];
}

export function projectMp2(input: Mp2Input, yearsDefault = 5): Mp2Result {
  const years = input.years ?? yearsDefault;
  const monthly = Math.max(0, input.monthly);
  const lump = Math.max(0, input.lumpSum ?? 0);
  let balance = 0;
  let totalDeposits = 0;
  let totalDividends = 0;
  let paidOut = 0;
  const rows: Mp2Year[] = [];
  for (let y = 1; y <= years; y++) {
    let weighted = balance; // held for the full year
    let deposits = 0;
    if (y === 1 && lump > 0) {
      weighted += lump;
      deposits += lump;
    }
    for (let m = 0; m < 12; m++) {
      if (monthly > 0) {
        deposits += monthly;
        weighted += (monthly * (12 - m)) / 12;
      }
    }
    const dividend = round2(weighted * input.rate);
    balance = round2(balance + deposits);
    totalDeposits = round2(totalDeposits + deposits);
    totalDividends = round2(totalDividends + dividend);
    if (input.payout === 'compounded') balance = round2(balance + dividend);
    else paidOut = round2(paidOut + dividend);
    rows.push({ year: y, deposits: round2(deposits), dividend, balance });
  }
  return { totalDeposits, totalDividends, maturityValue: balance, paidOut, years: rows };
}

/* ------------------------------ Housing loan ------------------------------ */

/** Equal monthly amortization (principal + interest) — the formula Pag-IBIG's own samples follow. */
export function monthlyAmortization(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  const i = annualRate / 12;
  if (i === 0) return round2(principal / n);
  return round2((principal * i) / (1 - Math.pow(1 + i, -n)));
}

export interface LoanScheduleSummary {
  monthly: number;
  months: number;
  /** Interest paid during the first `periodYears` (the fixing or promo period). */
  interestInPeriod: number;
  /** Principal repaid during that period. */
  principalInPeriod: number;
  /** Balance left when the period ends (it reprices then). */
  balanceAfterPeriod: number;
}

export function scheduleSummary(principal: number, annualRate: number, termYears: number, periodYears: number): LoanScheduleSummary {
  const monthly = monthlyAmortization(principal, annualRate, termYears);
  const i = annualRate / 12;
  const months = Math.round(termYears * 12);
  const periodMonths = Math.min(months, Math.round(periodYears * 12));
  let bal = principal;
  let interest = 0;
  for (let k = 0; k < periodMonths; k++) {
    const int = bal * i;
    interest += int;
    bal = bal - (monthly - int);
  }
  return {
    monthly,
    months,
    interestInPeriod: round2(interest),
    principalInPeriod: round2(principal - Math.max(0, bal)),
    balanceAfterPeriod: round2(Math.max(0, bal)),
  };
}

/** Longest term allowed: 30 years, and the loan must be paid off by age 70. */
export function maxTermYears(age: number | null | undefined, maxTerm: number, maxAgeAtMaturity: number): number {
  if (age === null || age === undefined || !Number.isFinite(age)) return maxTerm;
  return Math.max(0, Math.min(maxTerm, Math.floor(maxAgeAtMaturity - age)));
}
