import type { TaxRules } from '../rules/types';
import { round2 } from '../format';

export interface TaxResult {
  taxableIncome: number;
  bracketIndex: number;
  baseTax: number;
  rate: number;
  excess: number;
  tax: number;
}

/** BIR monthly withholding tax on compensation (TRAIN, 2023-onwards table). */
export function computeWithholdingTax(monthlyTaxable: number, rules: TaxRules): TaxResult {
  const taxable = Math.max(monthlyTaxable, 0);
  let idx = rules.brackets.findIndex(
    (b) => taxable > b.over && (b.up_to === null || taxable <= b.up_to),
  );
  if (idx === -1) idx = 0; // taxable == 0 falls in the zero bracket
  const b = rules.brackets[idx]!;
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
