import type { PagibigRules, PhilhealthRules, SssRules, TaxRules } from '../rules/types';
import { round2 } from '../format';
import { computeSss, type SssResult } from './sss';
import { computePhilhealth, type PhilhealthResult } from './philhealth';
import { computePagibig, type PagibigResult } from './pagibig';
import { computeWithholdingTax, type TaxResult } from './tax';

export interface TakeHomeResult {
  grossMonthly: number;
  sss: SssResult;
  philhealth: PhilhealthResult;
  pagibig: PagibigResult;
  totalContributions: number;
  taxableIncome: number;
  tax: TaxResult;
  totalDeductions: number;
  netMonthly: number;
}

export interface TakeHomeRules {
  sss: SssRules;
  philhealth: PhilhealthRules;
  pagibig: PagibigRules;
  tax: TaxRules;
}

/**
 * Take-home pay for a private-sector EMPLOYEE: gross − (SSS EE share +
 * PhilHealth EE half + Pag-IBIG EE share) − withholding tax on the balance.
 * Mandatory contributions are excluded from taxable compensation (TRAIN).
 */
export function computeTakeHome(grossMonthly: number, rules: TakeHomeRules): TakeHomeResult {
  const sss = computeSss(grossMonthly, 'employee', rules.sss);
  const philhealth = computePhilhealth(grossMonthly, 'employed', rules.philhealth);
  const pagibig = computePagibig(grossMonthly, 'employee', rules.pagibig);
  const totalContributions = round2(
    sss.employeeShare + philhealth.employeeShare + pagibig.employeeShare,
  );
  const taxableIncome = round2(Math.max(grossMonthly - totalContributions, 0));
  const tax = computeWithholdingTax(taxableIncome, rules.tax);
  const totalDeductions = round2(totalContributions + tax.tax);
  return {
    grossMonthly,
    sss,
    philhealth,
    pagibig,
    totalContributions,
    taxableIncome,
    tax,
    totalDeductions,
    netMonthly: round2(grossMonthly - totalDeductions),
  };
}
