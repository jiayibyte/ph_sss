import { describe, expect, it } from 'vitest';
import sslJson from '../../data/ssl/2026.json';
import taxJson from '../../data/tax/2026.json';
import philhealthJson from '../../data/philhealth/2026.json';
import pagibigJson from '../../data/pagibig/2026.json';
import type { PagibigRules, PhilhealthRules, SslRules, TaxRules } from '../rules/types';
import { governmentNetPay, monthlySalary, nextTranche, trancheAsOf, trancheForYear } from './ssl';

const ssl = sslJson as unknown as SslRules;
const deps = {
  tax: taxJson as unknown as TaxRules,
  philhealth: philhealthJson as unknown as PhilhealthRules,
  pagibig: pagibigJson as unknown as PagibigRules,
};

describe('EO No. 64 salary schedule data', () => {
  it('three tranches, 33 grades, 8 steps (SG 33: 2), rising across steps, grades and years', () => {
    expect(ssl.tranches.map((t) => t.year)).toEqual([2025, 2026, 2027]);
    for (const t of ssl.tranches) {
      expect(Object.keys(t.grades)).toHaveLength(33);
      for (let g = 1; g <= 33; g++) {
        const row = t.grades[String(g)]!;
        expect(row).toHaveLength(g === 33 ? 2 : 8);
        for (let i = 1; i < row.length; i++) expect(row[i]!).toBeGreaterThan(row[i - 1]!);
        if (g > 1) expect(row[0]!).toBeGreaterThan(t.grades[String(g - 1)]![0]!);
      }
    }
  });

  it('matches the independent cross-checks: SG 1 ₱14,634 (2026); Teacher I SG 11 ₱31,705 (2026) and ₱33,387 (2027); SG 15 Step 8 ₱47,172 (2027)', () => {
    expect(monthlySalary(trancheForYear(ssl, 2026)!, 1, 1)).toBe(14634);
    expect(monthlySalary(trancheForYear(ssl, 2026)!, 11, 1)).toBe(31705);
    expect(monthlySalary(trancheForYear(ssl, 2027)!, 11, 1)).toBe(33387);
    expect(monthlySalary(trancheForYear(ssl, 2027)!, 15, 8)).toBe(47172);
    expect(monthlySalary(trancheForYear(ssl, 2026)!, 33, 3)).toBeNull();
  });

  it('positions carry their DBM grades', () => {
    const sg = (title: string) => ssl.positions.find((p) => p.title === title)!.sg;
    expect(sg('Teacher I')).toBe(11);
    expect(sg('Nurse I')).toBe(15);
    expect(sg('Administrative Aide I')).toBe(1);
  });
});

describe('tranche by date (January 1 switch)', () => {
  it('2026 tranche through December 31, 2026; 2027 tranche from January 1, 2027', () => {
    expect(trancheAsOf(ssl, '2026-09-23').year).toBe(2026);
    expect(trancheAsOf(ssl, '2026-12-31').year).toBe(2026);
    expect(trancheAsOf(ssl, '2027-01-01').year).toBe(2027);
    expect(nextTranche(ssl, '2026-09-23')!.year).toBe(2027);
    expect(nextTranche(ssl, '2027-01-01')).toBeNull();
  });
});

describe('governmentNetPay', () => {
  it('Teacher I 2026 (₱31,705): GSIS 9% ₱2,853.45, PhilHealth ₱792.63, Pag-IBIG ₱200, tax on the rest', () => {
    const r = governmentNetPay(31705, ssl, deps);
    expect(r.gsis).toBe(2853.45);
    expect(r.philhealth).toBe(792.63);
    expect(r.pagibig).toBe(200);
    expect(r.taxable).toBe(27858.92);
    expect(r.withholdingTax).toBe(1053.89); // 15% × (27,858.92 − 20,833)
    expect(r.netBasic).toBeCloseTo(31705 - 2853.45 - 792.63 - 200 - 1053.89, 2);
  });
});
