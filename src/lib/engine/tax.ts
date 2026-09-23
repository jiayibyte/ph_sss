import type { TaxBracket, TaxRules, WithholdingPeriod } from '../rules/types';
import { peso, round2 } from '../format';

export interface TaxResult {
  taxableIncome: number;
  bracketIndex: number;
  baseTax: number;
  rate: number;
  excess: number;
  tax: number;
}

/** Tax on `amount` from a bracket schedule: base tax + rate × the excess over the bracket's floor. */
export function bracketTax(amount: number, brackets: TaxBracket[]): TaxResult {
  const taxable = Math.max(amount, 0);
  let idx = brackets.findIndex((b) => taxable > b.over && (b.up_to === null || taxable <= b.up_to));
  if (idx === -1) idx = 0; // taxable == 0 falls in the zero bracket
  const b = brackets[idx]!;
  const excess = round2(Math.max(taxable - b.over, 0));
  const tax = b.rate === 0 ? 0 : round2(b.base_tax + excess * b.rate);
  return {
    taxableIncome: round2(taxable),
    bracketIndex: idx,
    baseTax: b.base_tax,
    rate: b.rate,
    excess: b.rate === 0 ? 0 : excess,
    tax,
  };
}

/** BIR monthly withholding tax on compensation (TRAIN, 2023-onwards table). */
export function computeWithholdingTax(monthlyTaxable: number, rules: TaxRules): TaxResult {
  return bracketTax(monthlyTaxable, rules.brackets);
}

/** The Annex E table for a payroll period. */
export function withholdingTable(period: WithholdingPeriod, rules: TaxRules): TaxBracket[] {
  return period === 'monthly' ? rules.brackets : rules.withholding_tables[period];
}

/** Withholding tax on the taxable compensation of one payroll period. */
export function withholdingTax(taxable: number, period: WithholdingPeriod, rules: TaxRules): TaxResult {
  return bracketTax(taxable, withholdingTable(period, rules));
}

/** Annual income tax at the graduated rates of NIRC Sec. 24(A)(2)(a), 2023 onwards. */
export function annualIncomeTax(taxableIncome: number, rules: TaxRules): TaxResult {
  return bracketTax(taxableIncome, rules.annual_brackets);
}

/* ------------------------------ Compensation ------------------------------ */

export interface CompensationTaxInput {
  /** Gross monthly basic pay. */
  monthlyBasic: number;
  /** Other taxable pay each month (taxable allowances, commissions). */
  monthlyTaxableAllowances?: number;
  /** 13th month pay and other bonuses for the whole year. */
  annualBonuses: number;
  /** Employee SSS + PhilHealth + Pag-IBIG shares per month (excluded from taxable compensation). */
  monthlyContributions: number;
  /** Minimum wage earner: statutory minimum wage (and holiday, OT, night-shift, hazard pay) is exempt. */
  minimumWageEarner?: boolean;
}

export interface CompensationTaxResult {
  monthlyTaxable: number;
  monthly: TaxResult;
  /** Semi-monthly payday: half the monthly taxable pay on the semi-monthly table. */
  semiMonthly: TaxResult;
  bonusExempt: number;
  bonusTaxable: number;
  annualGross: number;
  annualTaxable: number;
  annual: TaxResult;
  /** Twelve months of monthly withholding. */
  withheldOverYear: number;
  /** Annual tax due − twelve months of withholding: collected in the last payroll (or refunded if negative). */
  yearEndAdjustment: number;
  /** Annual tax ÷ annual gross compensation. */
  effectiveRate: number;
}

/**
 * Income tax on salary: monthly withholding from the Annex E table, and the
 * annual tax the employer settles at year-end (annualization). 13th month pay
 * and other benefits are excluded up to ₱90,000; the excess is taxable.
 */
export function compensationTax(input: CompensationTaxInput, rules: TaxRules): CompensationTaxResult {
  const allowances = Math.max(input.monthlyTaxableAllowances ?? 0, 0);
  const basic = Math.max(input.monthlyBasic, 0);
  const monthlyTaxable = input.minimumWageEarner
    ? round2(allowances)
    : round2(Math.max(basic + allowances - Math.max(input.monthlyContributions, 0), 0));
  const bonuses = Math.max(input.annualBonuses, 0);
  const cap = rules.exclusions.thirteenth_month_and_other_benefits_cap;
  const bonusExempt = Math.min(bonuses, cap);
  const bonusTaxable = round2(bonuses - bonusExempt);
  const monthly = withholdingTax(monthlyTaxable, 'monthly', rules);
  const semiMonthly = withholdingTax(round2(monthlyTaxable / 2), 'semi_monthly', rules);
  const annualTaxable = round2(monthlyTaxable * 12 + bonusTaxable);
  const annual = annualIncomeTax(annualTaxable, rules);
  const withheldOverYear = round2(monthly.tax * 12);
  const annualGross = round2((basic + allowances) * 12 + bonuses);
  return {
    monthlyTaxable,
    monthly,
    semiMonthly,
    bonusExempt,
    bonusTaxable,
    annualGross,
    annualTaxable,
    annual,
    withheldOverYear,
    yearEndAdjustment: round2(annual.tax - withheldOverYear),
    effectiveRate: annualGross > 0 ? annual.tax / annualGross : 0,
  };
}

/* ----------------------------- Self-employed ------------------------------ */

export type SelfEmployedOptionKey = 'eight' | 'osd' | 'itemized';

export interface SelfEmployedOption {
  key: SelfEmployedOptionKey;
  available: boolean;
  /** Income that the rate is applied to (8%: gross less ₱250,000 when purely self-employed). */
  base: number;
  /** Income tax on the business income (for mixed income earners: the whole return minus the tax on salary alone). */
  businessIncomeTax: number;
  /** Total income tax on the return, salary included. */
  incomeTax: number;
  percentageTax: number;
  /** incomeTax + percentageTax. */
  total: number;
  reason?: string;
}

export interface SelfEmployedInput {
  /** Gross sales or receipts for the year (plus other non-operating income). */
  grossReceipts: number;
  /** Deductible business expenses for the year; null = not entered (itemized option skipped). */
  expenses: number | null;
  /** Taxable compensation for the year if you also have a job (mixed income earner); 0 if none. */
  compensationTaxable: number;
}

export interface SelfEmployedResult {
  mixedIncome: boolean;
  overVatThreshold: boolean;
  compensationTaxAlone: number;
  options: SelfEmployedOption[];
  /** Cheapest available option. */
  best: SelfEmployedOptionKey;
}

/**
 * Freelancers, professionals and sole proprietors: the 8% option (NIRC Sec.
 * 24(A)(2)(b)–(c), in lieu of graduated rates and the 3% percentage tax)
 * against the graduated rates with the 40% optional standard deduction or
 * itemized deductions, each plus the 3% percentage tax of Sec. 116.
 * Above the ₱3M VAT threshold the 8% option is gone and VAT replaces the
 * percentage tax (VAT is not computed here).
 */
export function selfEmployedTax(input: SelfEmployedInput, rules: TaxRules): SelfEmployedResult {
  const S = rules.self_employed;
  const gross = Math.max(input.grossReceipts, 0);
  const comp = Math.max(input.compensationTaxable, 0);
  const mixedIncome = comp > 0;
  const overVatThreshold = gross > S.vat_threshold;
  const compensationTaxAlone = annualIncomeTax(comp, rules).tax;
  const percentageTax = overVatThreshold ? 0 : round2(gross * S.percentage_tax_rate);

  const eightBase = round2(Math.max(gross - (mixedIncome ? 0 : S.eight_percent_exempt_portion), 0));
  const eightBusiness = round2(eightBase * S.eight_percent_rate);
  const eight: SelfEmployedOption = {
    key: 'eight',
    available: !overVatThreshold,
    base: eightBase,
    businessIncomeTax: eightBusiness,
    incomeTax: round2(eightBusiness + compensationTaxAlone),
    percentageTax: 0,
    total: round2(eightBusiness + compensationTaxAlone),
    reason: overVatThreshold ? `Not available: gross sales or receipts above the ${peso(S.vat_threshold)} VAT threshold.` : undefined,
  };

  const graduated = (key: 'osd' | 'itemized', businessTaxable: number, available: boolean, reason?: string): SelfEmployedOption => {
    const incomeTax = annualIncomeTax(round2(comp + businessTaxable), rules).tax;
    return {
      key,
      available,
      base: round2(businessTaxable),
      businessIncomeTax: round2(incomeTax - compensationTaxAlone),
      incomeTax,
      percentageTax,
      total: round2(incomeTax + percentageTax),
      reason,
    };
  };
  const osd = graduated('osd', gross * (1 - S.osd_rate), true);
  const itemized =
    input.expenses === null
      ? graduated('itemized', gross, false, 'Enter your business expenses to compare itemized deductions.')
      : graduated('itemized', Math.max(gross - Math.max(input.expenses, 0), 0), true);

  const options = [eight, osd, itemized];
  const best = options.filter((o) => o.available).sort((a, b) => a.total - b.total)[0]!.key;
  return { mixedIncome, overVatThreshold, compensationTaxAlone, options, best };
}
