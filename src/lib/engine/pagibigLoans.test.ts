import { describe, expect, it } from 'vitest';
import pagibigJson from '../../data/pagibig/2026.json';
import type { PagibigRules } from '../rules/types';
import { computeShortTermLoan, stlMonthlyRate } from './pagibigLoans';

const rules = pagibigJson as unknown as PagibigRules;
const L = rules.short_term_loans;

describe('Pag-IBIG short-term loan data (Circulars 469 and 470)', () => {
  it('records the circular terms: 90% of TAV, 12 savings, 12/24/36 months, 1.4583%/month MPL, 5.95%/year calamity', () => {
    expect(L.tav_share).toBe(0.9);
    expect(L.min_monthly_savings).toBe(12);
    expect(L.terms_months).toEqual([12, 24, 36]);
    expect(L.default_term_months).toBe(24);
    expect(L.mpl.rate_monthly).toBe(0.014583);
    expect(L.mpl.grace_months).toBe(2);
    expect(L.calamity.rate_annual).toBe(0.0595);
    expect(L.calamity.grace_months).toBe(3);
    expect(L.penalty_per_day).toBe(0.0005);
  });
});

describe('computeShortTermLoan', () => {
  it('entitlement is 90% of TAV less outstanding loans; the amount applied for caps the loan', () => {
    const full = computeShortTermLoan({ type: 'mpl', tav: 50000, termMonths: 24 }, rules);
    expect(full.entitlement).toBe(45000);
    expect(full.loanAmount).toBe(45000);
    const withBalance = computeShortTermLoan({ type: 'mpl', tav: 50000, outstanding: 20000, termMonths: 24 }, rules);
    expect(withBalance.entitlement).toBe(25000);
    const desired = computeShortTermLoan({ type: 'mpl', tav: 50000, desired: 10000, termMonths: 24 }, rules);
    expect(desired.loanAmount).toBe(10000);
    const tooMuch = computeShortTermLoan({ type: 'mpl', tav: 50000, desired: 90000, termMonths: 24 }, rules);
    expect(tooMuch.loanAmount).toBe(45000);
    expect(computeShortTermLoan({ type: 'mpl', tav: 10000, outstanding: 20000, termMonths: 24 }, rules).loanAmount).toBe(0);
  });

  it('MPL amortization = annuity at 1.4583%/month on the balance after two grace months', () => {
    const r = 0.014583;
    const expected = Math.round(((45000 * (1 + r) ** 2 * r) / (1 - (1 + r) ** -24)) * 100) / 100;
    const res = computeShortTermLoan({ type: 'mpl', tav: 50000, termMonths: 24 }, rules);
    expect(res.monthlyAmortization).toBe(expected);
    expect(res.totalPayable).toBeCloseTo(expected * 24, 2);
    expect(res.graceInterest).toBeCloseTo(45000 * ((1 + r) ** 2 - 1), 2);
    expect(res.firstPaymentMonth).toBe(3);
  });

  it('calamity loan is cheaper: 5.95% a year, three grace months, payments from the 4th month', () => {
    expect(stlMonthlyRate('calamity', rules)).toBeCloseTo(0.0595 / 12, 10);
    const mpl = computeShortTermLoan({ type: 'mpl', tav: 50000, termMonths: 36 }, rules);
    const cal = computeShortTermLoan({ type: 'calamity', tav: 50000, termMonths: 36 }, rules);
    expect(cal.monthlyAmortization).toBeLessThan(mpl.monthlyAmortization);
    expect(cal.graceMonths).toBe(3);
    expect(cal.firstPaymentMonth).toBe(4);
    expect(cal.totalInterest).toBeGreaterThan(0);
  });

  it('longer terms lower the payment and raise the total interest', () => {
    const t12 = computeShortTermLoan({ type: 'mpl', tav: 100000, termMonths: 12 }, rules);
    const t36 = computeShortTermLoan({ type: 'mpl', tav: 100000, termMonths: 36 }, rules);
    expect(t36.monthlyAmortization).toBeLessThan(t12.monthlyAmortization);
    expect(t36.totalInterest).toBeGreaterThan(t12.totalInterest);
  });
});
