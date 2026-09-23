import { describe, expect, it } from 'vitest';
import laborJson from '../../data/labor/2026.json';
import type { LaborRules } from '../rules/types';
import { computeRetirementPay, computeSeparationPay, creditedYears } from './terminalPay';

const labor = laborJson as unknown as LaborRules;

describe('creditedYears (fraction of ≥6 months = one year)', () => {
  it('rounds 3 years 6 months up, 3 years 5 months down', () => {
    expect(creditedYears(3, 6, 6)).toBe(4);
    expect(creditedYears(3, 5, 6)).toBe(3);
    expect(creditedYears(0, 7, 6)).toBe(1);
  });
});

describe('computeSeparationPay (Arts. 298–299)', () => {
  it('redundancy: one month per year — ₱25,000 × 1 × 7 years = ₱175,000', () => {
    const r = computeSeparationPay({ monthlyPay: 25000, years: 7, cause: 'one-month' }, labor);
    expect(r.creditedYears).toBe(7);
    expect(r.separationPay).toBe(175000);
    expect(r.minimumApplied).toBe(false);
  });
  it('retrenchment: half month per year — ₱25,000 × 0.5 × 7 = ₱87,500; 7y7m counts as 8', () => {
    expect(computeSeparationPay({ monthlyPay: 25000, years: 7, cause: 'half-month' }, labor).separationPay).toBe(87500);
    expect(computeSeparationPay({ monthlyPay: 25000, years: 7, extraMonths: 7, cause: 'half-month' }, labor).separationPay).toBe(100000);
  });
  it('never below one month pay', () => {
    const r = computeSeparationPay({ monthlyPay: 20000, years: 1, cause: 'half-month' }, labor);
    expect(r.computed).toBe(10000);
    expect(r.separationPay).toBe(20000);
    expect(r.minimumApplied).toBe(true);
  });
});

describe('computeRetirementPay (Art. 302 / RA 7641)', () => {
  it('daily rate × 22.5 × years: ₱800 × 22.5 × 20 = ₱360,000', () => {
    const r = computeRetirementPay({ dailyRate: 800, years: 20, age: 60 }, labor);
    expect(r.halfMonthSalary).toBe(18000);
    expect(r.retirementPay).toBe(360000);
    expect(r.components.salary + r.components.sil + r.components.thirteenth).toBe(360000);
    expect(r.components.salary).toBe(240000); // 15 days
    expect(r.components.sil).toBe(80000); // 5 days
    expect(r.components.thirteenth).toBe(40000); // 2.5 days
    expect(r.eligibleByService).toBe(true);
    expect(r.eligibleByAge).toBe(true);
  });
  it('flags service under five years and ages outside 60–65', () => {
    expect(computeRetirementPay({ dailyRate: 800, years: 4, extraMonths: 11, age: 62 }, labor).eligibleByService).toBe(false);
    expect(computeRetirementPay({ dailyRate: 800, years: 10, age: 58 }, labor).eligibleByAge).toBe(false);
    expect(computeRetirementPay({ dailyRate: 800, years: 10, age: 66 }, labor).eligibleByAge).toBe(false);
    expect(computeRetirementPay({ dailyRate: 800, years: 10 }, labor).eligibleByAge).toBeNull();
  });
});
