import { describe, expect, it } from 'vitest';
import pagibigJson from '../../data/pagibig/2026.json';
import type { PagibigRules } from '../rules/types';
import { maxTermYears, monthlyAmortization, projectMp2, scheduleSummary } from './pagibigSavings';

const pagibig = pagibigJson as unknown as PagibigRules;

describe('Pag-IBIG data', () => {
  it('MP2 rates are newest first, with 2025 at 7.12% from the live official page', () => {
    const r = pagibig.mp2.dividend_rates;
    expect(r[0]).toEqual({ year: 2025, rate: 0.0712, source: 'live' });
    expect(r.map((x) => x.year)).toEqual([...r.map((x) => x.year)].sort((a, b) => b - a));
  });
});

describe('monthlyAmortization reproduces Pag-IBIG\'s published Affordable Housing samples (3%, 30 years)', () => {
  it.each(pagibig.housing_loan.affordable.caps.map((c) => [c.max_loan, c.sample_monthly]))('₱%d → ₱%d', (loan, sample) => {
    expect(monthlyAmortization(loan, pagibig.housing_loan.affordable.rate, 30)).toBeCloseTo(sample, 1);
  });
});

describe('scheduleSummary', () => {
  it('₱3M at 6.5% for 30 years: first 5 years interest + principal = 60 payments', () => {
    const s = scheduleSummary(3000000, 0.065, 30, 5);
    expect(s.monthly).toBeCloseTo(18962.04, 1);
    expect(s.interestInPeriod + s.principalInPeriod).toBeCloseTo(s.monthly * 60, 0);
    expect(s.balanceAfterPeriod).toBeGreaterThan(2800000);
  });
});

describe('maxTermYears', () => {
  it('caps the term so the loan ends by 70', () => {
    expect(maxTermYears(35, 30, 70)).toBe(30);
    expect(maxTermYears(50, 30, 70)).toBe(20);
    expect(maxTermYears(null, 30, 70)).toBe(30);
  });
});

describe('projectMp2', () => {
  it('lump sum ₱100,000 at 7% compounded for 5 years = 100,000 × 1.07^5', () => {
    const r = projectMp2({ monthly: 0, lumpSum: 100000, rate: 0.07, payout: 'compounded' });
    expect(r.maturityValue).toBeCloseTo(140255.17, 0);
    expect(r.totalDeposits).toBe(100000);
  });
  it('annual payout keeps the principal flat and pays 5 × 7,000', () => {
    const r = projectMp2({ monthly: 0, lumpSum: 100000, rate: 0.07, payout: 'annual' });
    expect(r.maturityValue).toBe(100000);
    expect(r.paidOut).toBe(35000);
  });
  it('₱500 a month for 5 years deposits ₱30,000; year-1 dividend pro-rates the months held', () => {
    const r = projectMp2({ monthly: 500, rate: 0.0712, payout: 'compounded' });
    expect(r.totalDeposits).toBe(30000);
    // weighted = 500 × (12+11+…+1)/12 = 3,250 → 3,250 × 7.12% = 231.40
    expect(r.years[0]!.dividend).toBe(231.4);
    expect(r.maturityValue).toBeGreaterThan(35000);
    expect(r.maturityValue).toBeLessThan(36000);
  });
});
