import { describe, expect, it } from 'vitest';
import laborJson from '../../data/labor/2026.json';
import type { LaborRules } from '../rules/types';
import { computeSil, fullMonthsBetween } from './leave';

const labor = laborJson as unknown as LaborRules;
const ex = labor.leave.sil_example;

describe('service incentive leave (DOLE Handbook 2024, Ch. 7)', () => {
  it("reproduces the Handbook's example: hired Jan 1, 2023, resigned Mar 1, 2024, ₱610 a day → 5.833 days, ₱3,558.13", () => {
    const r = computeSil({ hired: ex.hired, asOf: ex.separated, dailyRate: ex.daily_rate }, labor);
    expect(r.monthsOfService).toBe(14);
    expect(r.accruedDays).toBe(ex.days);
    expect(r.cashValue).toBe(ex.amount);
  });

  it('no SIL before one year of service; five days at exactly one year', () => {
    expect(computeSil({ months: 11, dailyRate: 700 }, labor).entitled).toBe(false);
    expect(computeSil({ months: 11, dailyRate: 700 }, labor).cashValue).toBe(0);
    expect(computeSil({ months: 12, dailyRate: 700 }, labor).accruedDays).toBe(5);
    expect(computeSil({ months: 12, dailyRate: 700 }, labor).cashValue).toBe(3500);
  });

  it('subtracts days already used or converted, never below zero', () => {
    expect(computeSil({ months: 24, usedDays: 7, dailyRate: 500 }, labor).unusedDays).toBe(3);
    expect(computeSil({ months: 24, usedDays: 12, dailyRate: 500 }, labor).unusedDays).toBe(0);
  });

  it('values unused days directly when given', () => {
    expect(computeSil({ unusedDays: 2.5, dailyRate: 800 }, labor).cashValue).toBe(2000);
  });

  it('counts whole months by day of month', () => {
    expect(fullMonthsBetween('2025-01-15', '2026-01-14')).toBe(11);
    expect(fullMonthsBetween('2025-01-15', '2026-01-15')).toBe(12);
    expect(fullMonthsBetween('2026-05-01', '2026-04-01')).toBe(0);
  });

  it('lists the six statutory leaves with their laws', () => {
    expect(labor.leave.types.map((t) => t.law)).toEqual([
      'Labor Code Art. 95',
      'RA 11210',
      'RA 8187',
      'RA 8972 as amended by RA 11861',
      'RA 9262',
      'RA 9710 (Magna Carta of Women)',
    ]);
    expect(labor.leave.sil_exclusions).toHaveLength(8);
  });
});
