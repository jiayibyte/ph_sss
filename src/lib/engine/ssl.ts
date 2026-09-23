/**
 * Government salary grades (Salary Standardization Law, EO No. 64 s. 2024
 * tranches). Parameters come from src/data/ssl/<year>.json. The tranche in
 * force is picked by the Philippine calendar day, so the nightly rebuild moves
 * the site to the next tranche on January 1 without a data edit.
 */
import type { PagibigRules, PhilhealthRules, SslRules, SslTranche, TaxRules } from '../rules/types';
import { round2 } from '../format';
import { computePhilhealth } from './philhealth';
import { computePagibig } from './pagibig';
import { computeWithholdingTax } from './tax';

/** The tranche in force on `today` (the latest one already effective; the earliest if none yet). */
export function trancheAsOf(rules: SslRules, today: string): SslTranche {
  const sorted = [...rules.tranches].sort((a, b) => a.effective.localeCompare(b.effective));
  return [...sorted].reverse().find((t) => t.effective <= today) ?? sorted[0]!;
}

/** The next scheduled tranche after `today`, if any. */
export function nextTranche(rules: SslRules, today: string): SslTranche | null {
  return [...rules.tranches].sort((a, b) => a.effective.localeCompare(b.effective)).find((t) => t.effective > today) ?? null;
}

/** The tranche for a calendar year, if the order has one. */
export function trancheForYear(rules: SslRules, year: number): SslTranche | null {
  return rules.tranches.find((t) => t.year === year) ?? null;
}

/** Monthly basic salary for a grade and step (null if that step does not exist, e.g. SG 33). */
export function monthlySalary(tranche: SslTranche, grade: number, step: number): number | null {
  const row = tranche.grades[String(grade)];
  return row?.[step - 1] ?? null;
}

export interface GovPayResult {
  basic: number;
  gsis: number;
  philhealth: number;
  pagibig: number;
  totalDeductions: number;
  taxable: number;
  withholdingTax: number;
  netBasic: number;
}

/**
 * Monthly take-home on the basic salary of a government employee: GSIS
 * personal share, PhilHealth employee half, Pag-IBIG, and withholding tax on
 * the rest. Allowances (PERA and others) are shown separately by the page.
 */
export function governmentNetPay(
  basic: number,
  rules: SslRules,
  deps: { tax: TaxRules; philhealth: PhilhealthRules; pagibig: PagibigRules },
): GovPayResult {
  const gsis = round2(basic * rules.contributions.gsis_personal);
  const philhealth = computePhilhealth(basic, 'employed', deps.philhealth).employeeShare;
  const pagibig = computePagibig(basic, 'employee', deps.pagibig).employeeShare;
  const totalDeductions = round2(gsis + philhealth + pagibig);
  const taxable = round2(Math.max(basic - totalDeductions, 0));
  const withholdingTax = computeWithholdingTax(taxable, deps.tax).tax;
  return { basic, gsis, philhealth, pagibig, totalDeductions, taxable, withholdingTax, netBasic: round2(basic - totalDeductions - withholdingTax) };
}
