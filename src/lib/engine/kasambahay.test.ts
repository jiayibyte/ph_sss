import { describe, expect, it } from 'vitest';
import sssJson from '../../data/sss/2026.json';
import philhealthJson from '../../data/philhealth/2026.json';
import pagibigJson from '../../data/pagibig/2026.json';
import laborJson from '../../data/labor/2026.json';
import wagesJson from '../../data/wages/2026.json';
import type { PagibigRules, PhilhealthRules, SssRules } from '../rules/types';
import { kasambahayCosts } from './kasambahay';

const rules = {
  sss: sssJson as unknown as SssRules,
  philhealth: philhealthJson as unknown as PhilhealthRules,
  pagibig: pagibigJson as unknown as PagibigRules,
  employerPaysAllBelow: laborJson.kasambahay.employer_pays_all_premiums_below,
  householdMscFloor: laborJson.kasambahay.sss_household_msc_floor,
};

describe('kasambahay premiums (RA 10361 Sec. 30; SSS Cir. 2024-007; PhilHealth Cir. 2020-0005; HDMF Cir. 460)', () => {
  it('NCR ₱7,800: SSS on the ₱8,000 MSC (EC inside the employer share), PhilHealth at the floor, Pag-IBIG 2% each', () => {
    const c = kasambahayCosts(7800, rules);
    expect(c.employerPaysAll).toBe(false);
    expect(c.sssMsc).toBe(8000);
    expect(c.sss).toEqual({ worker: 400, employer: 810 });
    expect(c.philhealth).toEqual({ worker: 250, employer: 250 });
    expect(c.pagibig).toEqual({ worker: 156, employer: 156 });
    expect(c.workerTotal).toBe(806);
    expect(c.employerTotal).toBe(1216);
    expect(c.netPay).toBe(6994);
    expect(c.employerCost).toBe(9016);
  });

  it('₱6,000 (Bicol, SOCCSKSARGEN): worker ₱670, employer ₱980', () => {
    const c = kasambahayCosts(6000, rules);
    expect(c.workerTotal).toBe(670);
    expect(c.employerTotal).toBe(980);
    expect(c.netPay).toBe(5330);
  });

  it('matches the household-schedule figures for every regional minimum', () => {
    const expected: Record<number, [number, number]> = {
      5500: [920, 635], 5800: [976, 666], 6400: [1038, 703], 6500: [1040, 705], 6600: [1042, 707],
      6700: [1044, 709], 6750: [1095, 735], 7000: [1100, 740], 7500: [1160, 775],
    };
    for (const [wage, [employer, worker]] of Object.entries(expected)) {
      const c = kasambahayCosts(Number(wage), rules);
      expect([c.employerTotal, c.workerTotal], `₱${wage}`).toEqual([employer, worker]);
    }
  });

  it('every regional minimum is at or above the ₱5,000 threshold, so minimum-wage kasambahay pay their share', () => {
    for (const k of wagesJson.kasambahay_monthly) {
      expect(k.monthly).toBeGreaterThanOrEqual(rules.employerPaysAllBelow);
    }
  });

  it('below ₱5,000 the employer pays everything, SSS on the lower household brackets', () => {
    const c = kasambahayCosts(4500, rules);
    expect(c.employerPaysAll).toBe(true);
    expect(c.sssMsc).toBe(4500);
    expect(c.sss).toEqual({ worker: 0, employer: 685 });
    expect(c.philhealth).toEqual({ worker: 0, employer: 500 });
    expect(c.pagibig).toEqual({ worker: 0, employer: 180 });
    expect(c.netPay).toBe(4500);
    expect(kasambahayCosts(1000, rules).sssMsc).toBe(1000);
    expect(kasambahayCosts(1249.99, rules).sssMsc).toBe(1000);
    expect(kasambahayCosts(1250, rules).sssMsc).toBe(1500);
    expect(kasambahayCosts(4749.99, rules).sssMsc).toBe(4500);
    expect(kasambahayCosts(4750, rules).sssMsc).toBe(5000);
  });

  it('the threshold itself is the boundary: at ₱5,000 the shares split', () => {
    expect(kasambahayCosts(5000, rules).employerPaysAll).toBe(false);
    expect(kasambahayCosts(4999.99, rules).employerPaysAll).toBe(true);
  });
});
