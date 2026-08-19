import { round2 } from '../format';
import { compute13thMonth } from './thirteenthMonth';

export interface FinalPayInput {
  unpaidSalary: number;
  leaveConversion: number;
  otherLeave: number;
  /** Pro-rated 13th month: pass per-month basics earned this calendar year to auto-compute, or a manual amount. */
  thirteenthMonthMode: 'auto' | 'manual';
  thirteenthMonthMonthlyBasics?: number[];
  thirteenthMonthManual?: number;
  separationPay: number;
  retirementPay: number;
  taxRefund: number;
  depositsReturn: number;
  otherCompensation: number;
  deductions: number;
}

export interface FinalPayResult {
  items: Array<{ label: string; amount: number }>;
  thirteenthMonth: number;
  additions: number;
  deductions: number;
  total: number;
}

export function computeFinalPay(input: FinalPayInput): FinalPayResult {
  const thirteenth =
    input.thirteenthMonthMode === 'auto'
      ? compute13thMonth(input.thirteenthMonthMonthlyBasics ?? []).amount
      : round2(input.thirteenthMonthManual ?? 0);
  const items = [
    { label: 'Unpaid earned salary', amount: round2(input.unpaidSalary) },
    { label: 'Unused SIL / leave conversion', amount: round2(input.leaveConversion) },
    { label: 'Other convertible leave', amount: round2(input.otherLeave) },
    { label: 'Pro-rated 13th month pay', amount: thirteenth },
    { label: 'Separation pay', amount: round2(input.separationPay) },
    { label: 'Retirement pay', amount: round2(input.retirementPay) },
    { label: 'Tax refund / adjustment', amount: round2(input.taxRefund) },
    { label: 'Cash bond / deposit return', amount: round2(input.depositsReturn) },
    { label: 'Other compensation', amount: round2(input.otherCompensation) },
  ].filter((i) => i.amount > 0);
  const additions = round2(items.reduce((a, i) => a + i.amount, 0));
  const deductions = round2(Math.max(input.deductions, 0));
  return {
    items,
    thirteenthMonth: thirteenth,
    additions,
    deductions,
    total: round2(additions - deductions),
  };
}
