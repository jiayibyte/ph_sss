import { describe, expect, it } from 'vitest';
import sssRules from '../../data/sss/2026.json';
import type { SssRules } from '../rules/types';
import {
  benefitMscCap,
  computeMaternity,
  computePension,
  computeSalaryLoan,
  computeSickness,
  computeUnemployment,
  maternityDays,
  roundUpToMsc,
} from './sssBenefits';

const sss = sssRules as unknown as SssRules;
const CAP = benefitMscCap(sss); // ₱20,000 — RA 11199 Sec. 8(g), SSS Circular 2024-006 II.B

describe('computePension (RA 11199 Sec. 12)', () => {
  it('AMSC 20,000 / 30 CYS → formula (a): 300 + 4,000 + 8,000 = 12,300; +₱1,000 allowance = 13,300', () => {
    const r = computePension({ amsc: 20000, cys: 30 }, sss);
    expect(r.formulaA).toBe(12300);
    expect(r.formulaB).toBe(8000);
    expect(r.basicPension).toBe(12300);
    expect(r.minimumApplied).toBeNull();
    expect(r.additionalBenefit).toBe(1000);
    expect(r.monthlyTotal).toBe(13300);
    expect(r.thirteenthMonth).toBe(12300);
    expect(r.annualTotal).toBe(13300 * 12 + 12300);
    expect(r.eligibleForPension).toBe(true);
  });

  it('AMSC 5,000 / 10 CYS → (a) 1,300, (b) 2,000, minimum 1,200 → 2,000', () => {
    const r = computePension({ amsc: 5000, cys: 10 }, sss);
    expect(r.formulaA).toBe(1300);
    expect(r.formulaB).toBe(2000);
    expect(r.basicPension).toBe(2000);
    expect(r.minimumApplied).toBeNull();
  });

  it('applies the ₱1,200 minimum at 10–19 CYS and ₱2,400 at ≥20 CYS', () => {
    const low = computePension({ amsc: 2000, cys: 12 }, sss);
    expect(low.highest).toBe(1000); // (a) 300+400+80=780, (b) 800, (c) 1,000
    expect(low.basicPension).toBe(1200);
    expect(low.minimumApplied).toBe(1200);
    const twenty = computePension({ amsc: 4000, cys: 20 }, sss);
    expect(twenty.highest).toBe(1900); // (a) 300+800+800
    expect(twenty.basicPension).toBe(2400);
    expect(twenty.minimumApplied).toBe(2400);
  });

  it('caps the AMSC at the Regular SS ceiling (₱20,000), not the ₱35,000 contribution ceiling', () => {
    expect(CAP).toBe(20000);
    const r = computePension({ amsc: 35000, cys: 40 }, sss);
    expect(r.amsc).toBe(20000);
    expect(r.amscCapped).toBe(true);
    // 300 + 4,000 + 0.02 × 20,000 × 30 = 16,300
    expect(r.basicPension).toBe(16300);
  });

  it("dependents' pension is 10% of the basic pension (not incl. the ₱1,000) or ₱250, max five", () => {
    const r = computePension({ amsc: 20000, cys: 30, dependents: 7 }, sss);
    expect(r.dependentsCounted).toBe(5);
    expect(r.dependentsPension).toBe(1230 * 5);
    const small = computePension({ amsc: 2000, cys: 12, dependents: 1 }, sss);
    expect(small.dependentsPension).toBe(250); // 10% of 1,200 = 120 < 250
  });

  it('flags members below 10 CYS as not pension-eligible (lump sum instead)', () => {
    const r = computePension({ amsc: 15000, cys: 7 }, sss);
    expect(r.eligibleForPension).toBe(false);
    expect(r.minimumApplied).toBeNull();
  });
});

describe('computeMaternity (RA 11210 / RA 11199 Sec. 8(n))', () => {
  it('reproduces the SSS published example: MSC ₱16,000 × 6 = 96,000 ÷ 180 × 105 = ₱56,000.00', () => {
    const r = computeMaternity({ mscs: Array(12).fill(16000), event: 'live-birth' }, sss);
    expect(r.topMscs).toHaveLength(6);
    expect(r.sumTopMscs).toBe(96000);
    expect(r.averageDailySalaryCredit).toBe(533.33);
    expect(r.days).toBe(105);
    expect(r.benefit).toBe(56000);
    expect(r.insufficientContributions).toBe(false);
  });

  it('picks the highest six out of a mixed year and caps each at the Regular SS ceiling', () => {
    const mscs = [5000, 5000, 5000, 5000, 5000, 5000, 15000, 15000, 15000, 30000, 30000, 30000];
    const r = computeMaternity({ mscs, event: 'live-birth' }, sss);
    expect(r.topMscs).toEqual([20000, 20000, 20000, 15000, 15000, 15000]);
    expect(r.sumTopMscs).toBe(105000);
    expect(r.mscCapped).toBe(true);
  });

  it('day counts: 105 live birth, 120 solo parent, 60 miscarriage; rounds once at the end', () => {
    expect(maternityDays('live-birth', sss)).toBe(105);
    expect(maternityDays('live-birth-solo-parent', sss)).toBe(120);
    expect(maternityDays('miscarriage', sss)).toBe(60);
    const mc = computeMaternity({ mscs: [10000, 10000, 10000], event: 'miscarriage' }, sss);
    expect(mc.averageDailySalaryCredit).toBe(166.67);
    expect(mc.benefit).toBe(10000); // 30,000 × 60 ÷ 180 exactly
  });

  it('flags fewer than three posted contributions', () => {
    expect(computeMaternity({ mscs: [10000, 0, 0], event: 'live-birth' }, sss).insufficientContributions).toBe(true);
  });
});

describe('computeSalaryLoan (SSS Circular 2025-004)', () => {
  it('rounds the average MSC up to the next bracket and caps at ₱20,000', () => {
    expect(roundUpToMsc(15200, sss)).toBe(15500);
    expect(roundUpToMsc(15000, sss)).toBe(15000);
    expect(roundUpToMsc(4000, sss)).toBe(5000);
    expect(roundUpToMsc(25000, sss)).toBe(20000);
  });

  it('one-month loan of ₱20,000 at 8%: 1% fee, 24 equal amortizations ≈ ₱904.55', () => {
    const r = computeSalaryLoan({ averageMsc: 20000, months: 1 }, sss);
    expect(r.loanableAmount).toBe(20000);
    expect(r.loanAmount).toBe(20000);
    expect(r.interestRate).toBe(0.08);
    expect(r.serviceFee).toBe(200);
    expect(r.termMonths).toBe(24);
    // annuity: 20,000 × (0.08/12) / (1 − (1 + 0.08/12)^−24)
    expect(r.monthlyAmortization).toBeCloseTo(904.55, 1);
    expect(r.totalInterest).toBeGreaterThan(1700);
    expect(r.totalInterest).toBeLessThan(1710);
    expect(r.proratedInterest).toBe(0); // no loan date given
    expect(r.netProceeds).toBe(19800);
  });

  it('pro-rated advance interest matches the circular: 15 Apr 2025 loan → 46 days → ₱201.64 at 8%, ₱252.05 at 10%', () => {
    const r8 = computeSalaryLoan({ averageMsc: 20000, months: 1, loanDate: '2025-04-15' }, sss);
    expect(r8.proratedInterestDays).toBe(46);
    expect(r8.proratedInterest).toBe(201.64);
    expect(r8.firstAmortizationMonth).toBe('2025-06');
    expect(r8.firstPaymentDeadline).toBe('2025-07-31');
    expect(r8.netProceeds).toBe(20000 - 200 - 201.64);
    const r10 = computeSalaryLoan({ averageMsc: 20000, months: 1, loanDate: '2025-04-15', renewalWithCondonation: true }, sss);
    expect(r10.interestRate).toBe(0.1);
    expect(r10.proratedInterest).toBe(252.05);
  });

  it('two-month loan doubles the base, honours a smaller requested amount, and never exceeds ₱40,000', () => {
    const r = computeSalaryLoan({ averageMsc: 15000, months: 2, requested: 12000 }, sss);
    expect(r.loanableAmount).toBe(30000);
    expect(r.loanAmount).toBe(12000);
    expect(r.serviceFee).toBe(120);
    const max = computeSalaryLoan({ averageMsc: 50000, months: 2, requested: 100000 }, sss);
    expect(max.loanableAmount).toBe(40000);
    expect(max.loanAmount).toBe(40000);
  });
});

describe('computeSickness (RA 11199 Sec. 14)', () => {
  it('90% of ADSC per day: MSC ₱20,000 → ADSC 666.67 → ₱600 a day; 10 days = ₱6,000', () => {
    const r = computeSickness({ mscs: Array(12).fill(20000), days: 10 }, sss);
    expect(r.averageDailySalaryCredit).toBe(666.67);
    expect(r.dailyBenefit).toBe(600);
    expect(r.daysPayable).toBe(10);
    expect(r.benefit).toBe(6000);
    expect(r.notCompensable).toBe(false);
  });
  it('confinement of three days or less is not compensable; the 120-day annual cap applies', () => {
    expect(computeSickness({ mscs: [20000, 20000, 20000], days: 3 }, sss).notCompensable).toBe(true);
    const capped = computeSickness({ mscs: Array(6).fill(20000), days: 100, daysUsedThisYear: 50 }, sss);
    expect(capped.daysPayable).toBe(70);
    expect(capped.benefit).toBe(42000);
  });
});

describe('computeUnemployment (RA 11199 Sec. 14-B)', () => {
  it('50% of AMSC for two months, AMSC capped at ₱20,000 → max ₱20,000 total', () => {
    const r = computeUnemployment(15000, sss);
    expect(r.monthlyBenefit).toBe(7500);
    expect(r.total).toBe(15000);
    const max = computeUnemployment(35000, sss);
    expect(max.amsc).toBe(20000);
    expect(max.total).toBe(20000);
    expect(max.amscCapped).toBe(true);
  });
});
