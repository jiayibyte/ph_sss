import { describe, expect, it } from 'vitest';
import taxJson from '../../data/tax/2026.json';
import type { TaxBracket, TaxRules } from '../rules/types';
import { annualIncomeTax, bracketTax, compensationTax, selfEmployedTax, withholdingTable, withholdingTax } from './tax';

const tax = taxJson as unknown as TaxRules;

/** Each bracket's formula must land exactly on the next bracket's base tax (catches transcription slips). */
function expectContinuous(brackets: TaxBracket[], tolerance: number) {
  for (let i = 0; i < brackets.length - 1; i++) {
    const b = brackets[i]!;
    const next = brackets[i + 1]!;
    expect(b.up_to).toBe(next.over);
    expect(Math.abs(b.base_tax + (b.up_to! - b.over) * b.rate - next.base_tax)).toBeLessThanOrEqual(tolerance);
  }
}

describe('BIR tax tables (Annex E RR 11-2018 and NIRC Sec. 24(A)(2)(a), 2023 onwards)', () => {
  it('annual graduated table: ₱250k/₱400k/₱800k/₱2M/₱8M breakpoints give ₱0/₱22,500/₱102,500/₱402,500/₱2,202,500', () => {
    expectContinuous(tax.annual_brackets, 0);
    expect(annualIncomeTax(250000, tax).tax).toBe(0);
    expect(annualIncomeTax(400000, tax).tax).toBe(22500);
    expect(annualIncomeTax(800000, tax).tax).toBe(102500);
    expect(annualIncomeTax(2000000, tax).tax).toBe(402500);
    expect(annualIncomeTax(8000000, tax).tax).toBe(2202500);
    expect(annualIncomeTax(500000, tax).tax).toBe(42500);
  });

  it('the four withholding tables are continuous, as printed (daily top base 6,034.30, not the PDF typo)', () => {
    expectContinuous(withholdingTable('daily', tax), 0.01);
    expectContinuous(withholdingTable('weekly', tax), 0.05);
    expectContinuous(withholdingTable('semi_monthly', tax), 0.05);
    expectContinuous(withholdingTable('monthly', tax), 0.2);
    expect(withholdingTable('daily', tax)[5]!.base_tax).toBe(6034.3);
  });

  it('per-period withholding: ₱30,000/mo → ₱1,375.05; ₱15,000 semi-monthly → ₱687.45; ₱6,000/wk → ₱178.80; ₱1,000/day → ₱47.25', () => {
    expect(withholdingTax(30000, 'monthly', tax).tax).toBe(1375.05);
    expect(withholdingTax(15000, 'semi_monthly', tax).tax).toBe(687.45);
    expect(withholdingTax(6000, 'weekly', tax).tax).toBe(178.8);
    expect(withholdingTax(1000, 'daily', tax).tax).toBe(47.25);
    expect(withholdingTax(20833, 'monthly', tax).tax).toBe(0);
    expect(bracketTax(0, tax.brackets).tax).toBe(0);
  });

  it('twelve months of the monthly table ≈ the annual table (₱50,000 taxable a month → ₱62,500.80 vs ₱62,500)', () => {
    expect(withholdingTax(50000, 'monthly', tax).tax * 12).toBeCloseTo(62500.8, 2);
    expect(annualIncomeTax(600000, tax).tax).toBe(62500);
  });
});

describe('compensationTax', () => {
  it('₱40,000 basic, ₱2,000 contributions, 13th month ₱40,000: monthly ₱2,808.40, annual ₱33,700', () => {
    const r = compensationTax({ monthlyBasic: 40000, annualBonuses: 40000, monthlyContributions: 2000 }, tax);
    expect(r.monthlyTaxable).toBe(38000);
    expect(r.monthly.tax).toBe(2808.4); // 1,875 + 20% × (38,000 − 33,333)
    expect(r.bonusExempt).toBe(40000);
    expect(r.bonusTaxable).toBe(0);
    expect(r.annualTaxable).toBe(456000);
    expect(r.annual.tax).toBe(33700); // 22,500 + 20% × 56,000
    expect(r.yearEndAdjustment).toBeCloseTo(33700 - 2808.4 * 12, 2);
  });

  it('bonuses above ₱90,000 are taxed at year-end', () => {
    const r = compensationTax({ monthlyBasic: 100000, annualBonuses: 150000, monthlyContributions: 3000 }, tax);
    expect(r.bonusExempt).toBe(90000);
    expect(r.bonusTaxable).toBe(60000);
    expect(r.annualTaxable).toBe(97000 * 12 + 60000);
    expect(r.yearEndAdjustment).toBeGreaterThan(10000);
  });

  it('minimum wage earners: basic pay exempt, withholding ₱0', () => {
    const r = compensationTax({ monthlyBasic: 19692.92, annualBonuses: 19692.92, monthlyContributions: 1500, minimumWageEarner: true }, tax);
    expect(r.monthly.tax).toBe(0);
    expect(r.annual.tax).toBe(0);
  });

  it('semi-monthly withholding is half the monthly taxable pay on the semi-monthly table', () => {
    const r = compensationTax({ monthlyBasic: 30000, annualBonuses: 30000, monthlyContributions: 0 }, tax);
    expect(r.semiMonthly.tax).toBe(687.45);
    expect(r.semiMonthly.tax * 2).toBeCloseTo(r.monthly.tax, 0);
  });
});

describe('selfEmployedTax (8% vs graduated)', () => {
  const opt = (r: ReturnType<typeof selfEmployedTax>, k: string) => r.options.find((o) => o.key === k)!;

  it('purely self-employed, ₱1,000,000 gross: 8% ₱60,000 beats OSD ₱62,500 + ₱30,000 percentage tax', () => {
    const r = selfEmployedTax({ grossReceipts: 1000000, expenses: null, compensationTaxable: 0 }, tax);
    expect(opt(r, 'eight').total).toBe(60000);
    expect(opt(r, 'osd').incomeTax).toBe(62500);
    expect(opt(r, 'osd').percentageTax).toBe(30000);
    expect(opt(r, 'osd').total).toBe(92500);
    expect(opt(r, 'itemized').available).toBe(false);
    expect(r.best).toBe('eight');
  });

  it('first ₱250,000 is tax-free under 8% for the purely self-employed', () => {
    const r = selfEmployedTax({ grossReceipts: 250000, expenses: null, compensationTaxable: 0 }, tax);
    expect(opt(r, 'eight').total).toBe(0);
  });

  it('itemized deductions can win when expenses are high', () => {
    const r = selfEmployedTax({ grossReceipts: 1000000, expenses: 800000, compensationTaxable: 0 }, tax);
    expect(opt(r, 'itemized').incomeTax).toBe(0);
    expect(opt(r, 'itemized').total).toBe(30000);
    expect(r.best).toBe('itemized');
  });

  it('mixed income: no ₱250,000 deduction under 8%; graduated rates stack business on salary', () => {
    const r = selfEmployedTax({ grossReceipts: 600000, expenses: null, compensationTaxable: 400000 }, tax);
    expect(r.mixedIncome).toBe(true);
    expect(r.compensationTaxAlone).toBe(22500);
    expect(opt(r, 'eight').businessIncomeTax).toBe(48000);
    expect(opt(r, 'eight').total).toBe(70500);
    expect(opt(r, 'osd').incomeTax).toBe(94500); // 22,500 + 20% × 360,000 on ₱760,000
    expect(opt(r, 'osd').total).toBe(112500);
  });

  it('above the ₱3M VAT threshold the 8% option is unavailable and no percentage tax is computed', () => {
    const r = selfEmployedTax({ grossReceipts: 3500000, expenses: null, compensationTaxable: 0 }, tax);
    expect(r.overVatThreshold).toBe(true);
    expect(opt(r, 'eight').available).toBe(false);
    expect(opt(r, 'osd').percentageTax).toBe(0);
    expect(r.best).toBe('osd');
  });
});
