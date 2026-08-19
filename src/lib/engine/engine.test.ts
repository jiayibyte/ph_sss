import { describe, expect, it } from 'vitest';
import sssRules from '../../data/sss/2026.json';
import philhealthRules from '../../data/philhealth/2026.json';
import pagibigRules from '../../data/pagibig/2026.json';
import laborRules from '../../data/labor/2026.json';
import taxRules from '../../data/tax/2026.json';
import type {
  LaborRules,
  PagibigRules,
  PhilhealthRules,
  SssMemberType,
  SssRules,
  TaxRules,
} from '../rules/types';
import { computeSss } from './sss';
import { computePhilhealth } from './philhealth';
import { computePagibig } from './pagibig';
import { compute13thMonth, compute13thMonthSimple } from './thirteenthMonth';
import { computeHolidayPay, computeNightDiff, computeOvertime, nightHoursBetween } from './labor';
import { computeWithholdingTax } from './tax';
import { computeTakeHome } from './takeHome';
import { computeFinalPay } from './finalPay';

const sss = sssRules as unknown as SssRules;
const ph = philhealthRules as unknown as PhilhealthRules;
const pagibig = pagibigRules as unknown as PagibigRules;
const labor = laborRules as unknown as LaborRules;
const tax = taxRules as unknown as TaxRules;

/* Official example values from SSS Circulars 2024-006/008/009/010 (Jan 2025 schedule, in force 2026) */
describe('computeSss', () => {
  it('employee ₱20,000 → MSC 20,000, EE 1,000, ER 2,030 (incl EC 30), total 3,030', () => {
    const r = computeSss(20000, 'employee', sss);
    expect(r.msc).toBe(20000);
    expect(r.employeeShare).toBe(1000);
    expect(r.employerShare).toBe(2030);
    expect(r.ec).toBe(30);
    expect(r.total).toBe(3030);
  });
  it('employee ₱4,000 clamps to MSC floor 5,000 → total 760', () => {
    const r = computeSss(4000, 'employee', sss);
    expect(r.msc).toBe(5000);
    expect(r.employeeShare).toBe(250);
    expect(r.employerShare).toBe(510);
    expect(r.total).toBe(760);
    expect(r.clamped).toBe('floor');
  });
  it('employee ₱40,000 clamps to MSC ceiling 35,000 → EE 1,750 / ER 3,530 / MPF split 15,000', () => {
    const r = computeSss(40000, 'employee', sss);
    expect(r.msc).toBe(35000);
    expect(r.regularMsc).toBe(20000);
    expect(r.mpfMsc).toBe(15000);
    expect(r.employeeShare).toBe(1750);
    expect(r.employerShare).toBe(3530);
    expect(r.total).toBe(5280);
    expect(r.clamped).toBe('ceiling');
  });
  it('bracket edges follow official ranges (x,250 boundary)', () => {
    expect(computeSss(5249.99, 'employee', sss).msc).toBe(5000);
    expect(computeSss(5250, 'employee', sss).msc).toBe(5500);
    expect(computeSss(34749.99, 'employee', sss).msc).toBe(34500);
    expect(computeSss(34750, 'employee', sss).msc).toBe(35000);
  });
  it('self-employed ₱5,000 → 760 incl ₱10 EC paid by member (Circular 2024-008)', () => {
    const r = computeSss(5000, 'self-employed', sss);
    expect(r.memberPays).toBe(760);
    expect(r.ec).toBe(10);
    expect(r.ecPayer).toBe('member');
  });
  it('voluntary ₱35,000 → 5,250, no EC (Circular 2024-009)', () => {
    const r = computeSss(35000, 'voluntary', sss);
    expect(r.memberPays).toBe(5250);
    expect(r.ec).toBe(0);
  });
  it('OFW minimum MSC is 8,000 → 1,200 (Circular 2024-010)', () => {
    const r = computeSss(5000, 'ofw', sss);
    expect(r.msc).toBe(8000);
    expect(r.memberPays).toBe(1200);
    expect(r.ec).toBe(0);
  });
  it('engine agrees with every row of the official table (all member types)', () => {
    for (const type of Object.keys(sss.table) as SssMemberType[]) {
      for (const row of sss.table[type]) {
        const midpoint =
          row.range_max === null ? row.range_min + 100 : (row.range_min + row.range_max) / 2;
        const r = computeSss(Math.max(midpoint, 1), type, sss);
        expect(r.msc).toBe(row.msc);
        expect(r.employeeShare).toBe(row.employee_share);
        expect(r.employerShare).toBe(row.employer_share);
        expect(r.total).toBe(row.total);
      }
    }
  });
});

/* PhilHealth Circular 2020-0005 Rev 1 / Advisory 2026-0042: 5%, floor 10k, ceiling 100k */
describe('computePhilhealth', () => {
  it('employed ₱25,000 → premium 1,250, split 625/625', () => {
    const r = computePhilhealth(25000, 'employed', ph);
    expect(r.totalPremium).toBe(1250);
    expect(r.employeeShare).toBe(625);
    expect(r.employerShare).toBe(625);
  });
  it('₱9,000 hits the ₱10,000 floor → 500 total', () => {
    const r = computePhilhealth(9000, 'employed', ph);
    expect(r.premiumBase).toBe(10000);
    expect(r.totalPremium).toBe(500);
    expect(r.clamped).toBe('floor');
  });
  it('₱150,000 hits the ₱100,000 ceiling → 5,000 total', () => {
    const r = computePhilhealth(150000, 'employed', ph);
    expect(r.totalPremium).toBe(5000);
    expect(r.clamped).toBe('ceiling');
  });
  it('self-earning pays the full 5%', () => {
    const r = computePhilhealth(25000, 'self-earning', ph);
    expect(r.memberPays).toBe(1250);
    expect(r.employerShare).toBe(0);
  });
});

/* HDMF Circular 460: MFS ceiling 10,000; EE 1% (≤1,500) / 2%; ER 2% */
describe('computePagibig', () => {
  it('₱1,500 → EE 1% = 15, ER 2% = 30', () => {
    const r = computePagibig(1500, 'employee', pagibig);
    expect(r.employeeShare).toBe(15);
    expect(r.employerShare).toBe(30);
  });
  it('₱5,000 → 100 + 100', () => {
    const r = computePagibig(5000, 'employee', pagibig);
    expect(r.employeeShare).toBe(100);
    expect(r.employerShare).toBe(100);
    expect(r.total).toBe(200);
  });
  it('₱30,000 caps at MFS 10,000 → 200 + 200', () => {
    const r = computePagibig(30000, 'employee', pagibig);
    expect(r.fundSalary).toBe(10000);
    expect(r.employeeShare).toBe(200);
    expect(r.employerShare).toBe(200);
    expect(r.clamped).toBe('ceiling');
  });
});

/* PD 851 / DOLE: total basic salary within calendar year ÷ 12 */
describe('compute13thMonth', () => {
  it('full year ₱20,000/mo → 20,000', () => {
    expect(compute13thMonthSimple(20000, 12).amount).toBe(20000);
  });
  it('mid-year hire (Jun–Dec, ₱18,000) → 10,500', () => {
    const months = [0, 0, 0, 0, 0, 18000, 18000, 18000, 18000, 18000, 18000, 18000];
    expect(compute13thMonth(months).amount).toBe(10500);
  });
  it('resigned end of September (₱15,000 ×9) → 11,250', () => {
    expect(compute13thMonthSimple(15000, 9).amount).toBe(11250);
  });
  it('salary increase mid-year (6×20,000 + 6×25,000) → 22,500', () => {
    const months = [...Array(6).fill(20000), ...Array(6).fill(25000)];
    expect(compute13thMonth(months).amount).toBe(22500);
  });
});

/* DOLE Handbook pay-rule multipliers */
describe('computeHolidayPay', () => {
  const rate = 100;
  it('regular holiday worked 8h → 200% = 1,600', () => {
    expect(computeHolidayPay('regular-holiday', true, rate, 8, labor).total).toBe(1600);
  });
  it('regular holiday unworked → 100% daily wage = 800', () => {
    expect(computeHolidayPay('regular-holiday', false, rate, 0, labor).total).toBe(800);
  });
  it('regular holiday worked 10h → 1,600 + 2h × 260 OT = 2,120', () => {
    const r = computeHolidayPay('regular-holiday', true, rate, 10, labor);
    expect(r.basePay).toBe(1600);
    expect(r.otPay).toBe(520);
    expect(r.total).toBe(2120);
  });
  it('special day worked 8h → 130% = 1,040; on rest day → 150% = 1,200', () => {
    expect(computeHolidayPay('special', true, rate, 8, labor).total).toBe(1040);
    expect(computeHolidayPay('special-rest-day', true, rate, 8, labor).total).toBe(1200);
  });
  it('special day unworked → no work no pay', () => {
    expect(computeHolidayPay('special', false, rate, 0, labor).total).toBe(0);
  });
  it('regular holiday on rest day worked → 260% = 2,080', () => {
    expect(computeHolidayPay('regular-holiday-rest-day', true, rate, 8, labor).total).toBe(2080);
  });
});

describe('computeNightDiff', () => {
  it('10PM–6AM shift → 8 night hours, ND 10% = 80 on ₱100/h', () => {
    const r = computeNightDiff(100, 22, 6, 'ordinary', false, labor);
    expect(r.nightHours).toBe(8);
    expect(r.basePay).toBe(800);
    expect(r.nightDiff).toBe(80);
    expect(r.total).toBe(880);
  });
  it('2PM–11PM shift → only 1 night hour', () => {
    expect(nightHoursBetween(14, 23, labor)).toBe(1);
  });
  it('2AM–7AM shift → 4 night hours', () => {
    expect(nightHoursBetween(2, 7, labor)).toBe(4);
  });
  it('rest-day OT shift 10PM–6AM: ND applies on premium hourly (100×1.3×1.3=169)', () => {
    const r = computeNightDiff(100, 22, 6, 'rest-day', true, labor);
    expect(r.premiumHourly).toBe(169);
    expect(r.nightDiff).toBe(135.2);
  });
});

describe('computeOvertime', () => {
  it('ordinary day 2h OT at ₱100/h → 125% = 250', () => {
    expect(computeOvertime(100, 2, 'ordinary', 0, labor).otPay).toBe(250);
  });
  it('rest day 2h OT → 130%×130% = 169/h → 338', () => {
    expect(computeOvertime(100, 2, 'rest-day', 0, labor).otPay).toBe(338);
  });
  it('regular holiday 2h OT → 200%×130% = 260/h → 520', () => {
    expect(computeOvertime(100, 2, 'regular-holiday', 0, labor).otPay).toBe(520);
  });
  it('night OT hours add 10% ND on the OT rate', () => {
    const r = computeOvertime(100, 2, 'ordinary', 2, labor);
    expect(r.nightDiffOnOt).toBe(25);
    expect(r.total).toBe(275);
  });
});

/* BIR Annex E, RR 11-2018 monthly table */
describe('computeWithholdingTax', () => {
  it('₱20,000 → 0', () => {
    expect(computeWithholdingTax(20000, tax).tax).toBe(0);
  });
  it('₱25,000 → 15% of excess over 20,833 = 625.05', () => {
    expect(computeWithholdingTax(25000, tax).tax).toBe(625.05);
  });
  it('₱50,000 → 1,875 + 20% × 16,667 = 5,208.40', () => {
    expect(computeWithholdingTax(50000, tax).tax).toBe(5208.4);
  });
  it('₱100,000 → 8,541.80 + 25% × 33,333 = 16,875.05', () => {
    expect(computeWithholdingTax(100000, tax).tax).toBe(16875.05);
  });
  it('₱700,000 → 183,541.80 + 35% × 33,333 = 195,208.35', () => {
    expect(computeWithholdingTax(700000, tax).tax).toBe(195208.35);
  });
});

describe('computeTakeHome', () => {
  const rules = { sss, philhealth: ph, pagibig, tax };
  it('₱30,000 gross → contributions 2,450, tax 1,007.55, net 26,542.45', () => {
    const r = computeTakeHome(30000, rules);
    expect(r.sss.employeeShare).toBe(1500);
    expect(r.philhealth.employeeShare).toBe(750);
    expect(r.pagibig.employeeShare).toBe(200);
    expect(r.totalContributions).toBe(2450);
    expect(r.tax.tax).toBe(1007.55);
    expect(r.netMonthly).toBe(26542.45);
  });
  it('matches the four single engines exactly (acceptance 8.2)', () => {
    for (const salary of [4000, 12000, 20000, 34999, 50000, 120000]) {
      const r = computeTakeHome(salary, rules);
      expect(r.sss).toEqual(computeSss(salary, 'employee', sss));
      expect(r.philhealth).toEqual(computePhilhealth(salary, 'employed', ph));
      expect(r.pagibig).toEqual(computePagibig(salary, 'employee', pagibig));
    }
  });
});

describe('computeFinalPay', () => {
  it('sums modules and subtracts deductions; auto pro-rated 13th month', () => {
    const r = computeFinalPay({
      unpaidSalary: 10000,
      leaveConversion: 3000,
      otherLeave: 0,
      thirteenthMonthMode: 'auto',
      thirteenthMonthMonthlyBasics: [20000, 20000, 20000, 20000, 20000, 0, 0, 0, 0, 0, 0, 0],
      separationPay: 0,
      retirementPay: 0,
      taxRefund: 500,
      depositsReturn: 2000,
      otherCompensation: 0,
      deductions: 1500,
    });
    expect(r.thirteenthMonth).toBe(8333.33);
    expect(r.additions).toBe(23833.33);
    expect(r.total).toBe(22333.33);
  });
});
