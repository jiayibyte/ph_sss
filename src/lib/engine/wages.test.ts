import { describe, expect, it } from 'vitest';
import wagesJson from '../../data/wages/2026.json';
import type { WageRules } from '../rules/types';
import { dailyEquivalent, monthlyEquivalent, rateRange, shortfall } from './wages';

const wages = wagesJson as unknown as WageRules;

describe('minimum wage data', () => {
  it('has 18 rows (17 regions + NIR placeholder), each tier a positive integer', () => {
    expect(wages.regions).toHaveLength(18);
    for (const r of wages.regions) {
      for (const t of r.tiers) {
        expect(Number.isInteger(t.rate)).toBe(true);
        expect(t.rate).toBeGreaterThan(300);
      }
      if (r.id !== 'nir') expect(r.tiers.length).toBeGreaterThan(0);
    }
  });

  it('NCR: in-force NCR-26 ₱695/₱658; NCR-28 ₱755/₱718 published but not yet effective', () => {
    expect(wages.ncr.in_force.non_agriculture).toBe(695);
    expect(wages.ncr.in_force.other_tier).toBe(658);
    expect(wages.ncr.upcoming.non_agriculture).toBe(755);
    expect(wages.ncr.upcoming.other_tier).toBe(718);
    expect(wages.ncr.upcoming.effectivity).toBeNull();
    expect(wages.ncr.upcoming.non_agriculture - wages.ncr.in_force.non_agriculture).toBe(wages.ncr.upcoming.increase);
    const ncr = wages.regions.find((r) => r.id === 'ncr')!;
    expect(ncr.tiers[0]!.rate).toBe(wages.ncr.in_force.non_agriculture);
  });

  it('range across regions: high ₱695 (NCR in force), low ₱401 (BARMM agriculture, other areas)', () => {
    expect(rateRange(wages)).toEqual({ high: 695, low: 401 });
  });
});

describe('wage conversions (DOLE Handbook factors)', () => {
  it('matches NWPC press-release arithmetic with factor 313: ₱455 → ₱11,867.92 (NWPC prints ₱11,868); ₱540 → ₱14,085', () => {
    expect(monthlyEquivalent(455, 313)).toBe(11867.92);
    expect(monthlyEquivalent(540, 313)).toBe(14085);
  });
  it('factor 365 for monthly-paid: ₱695 → ₱21,139.58; factor 261 for a 5-day week: ₱695 → ₱15,116.25', () => {
    expect(monthlyEquivalent(695, 365)).toBe(21139.58);
    expect(monthlyEquivalent(695, 261)).toBe(15116.25);
  });
  it('round-trips daily ↔ monthly and computes shortfalls', () => {
    expect(dailyEquivalent(monthlyEquivalent(600, 313), 313)).toBe(600);
    expect(shortfall(650, 695)).toBe(45);
    expect(shortfall(700, 695)).toBe(0);
  });
});
