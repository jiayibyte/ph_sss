import type { PagibigRules, PhilhealthRules, SssRules } from '../rules/types';
import { round2 } from '../format';
import { computePagibig } from './pagibig';
import { computePhilhealth } from './philhealth';
import { computeSss } from './sss';

export interface KasambahayCosts {
  monthly: number;
  /** RA 10361 Sec. 30: below this wage the household employer pays every premium. */
  employerPaysAll: boolean;
  /** SSS monthly salary credit used. */
  sssMsc: number;
  sss: { worker: number; employer: number };
  philhealth: { worker: number; employer: number };
  pagibig: { worker: number; employer: number };
  /** Total premiums deducted from the kasambahay's pay. */
  workerTotal: number;
  /** Total premiums (SSS EC included) paid by the household employer on top of the wage. */
  employerTotal: number;
  /** Cash wage after the worker's share of premiums. */
  netPay: number;
  /** Wage + employer premiums: the household's monthly cost. */
  employerCost: number;
}

export interface KasambahayRules {
  sss: SssRules;
  philhealth: PhilhealthRules;
  pagibig: PagibigRules;
  /** RA 10361 Sec. 30 threshold (₱5,000). */
  employerPaysAllBelow: number;
  /** SSS Circular 2024-007 household schedule floor (₱1,000 MSC). */
  householdMscFloor: number;
}

/**
 * SSS for a household employer. From the ₱5,000 credit up the household
 * schedule (SSS Circular 2024-007) matches the regular employee table, whose
 * employer share already includes EC. Below it the household schedule keeps
 * going down in ₱500 steps to a ₱1,000 credit, all paid by the employer with
 * the ₱10 EC.
 */
function householdSss(monthly: number, rules: KasambahayRules): { msc: number; worker: number; employer: number } {
  const step = rules.sss.msc.step;
  const firstRowStart = rules.sss.msc.min - step / 2; // ₱4,750: start of the ₱5,000 bracket
  if (monthly >= firstRowStart) {
    const s = computeSss(monthly, 'employee', rules.sss);
    return { msc: s.msc, worker: s.employeeShare, employer: s.employerShare };
  }
  const floor = rules.householdMscFloor;
  const msc = monthly < floor + step / 2 ? floor : Math.floor((monthly - (floor + step / 2)) / step) * step + floor + step;
  return {
    msc,
    worker: round2(msc * rules.sss.rate.employee),
    employer: round2(msc * rules.sss.rate.employer + rules.sss.ec.below),
  };
}

/**
 * Monthly premiums for a kasambahay paid `monthly` pesos in cash: SSS on the
 * household schedule, PhilHealth on its kasambahay member type (5% of the
 * ₱10,000 floor, split 50/50), Pag-IBIG at the employee rates. Under RA 10361
 * Sec. 30 the employer pays all three in full when the wage is below
 * `employerPaysAllBelow`.
 */
export function kasambahayCosts(monthly: number, rules: KasambahayRules): KasambahayCosts {
  const s = householdSss(monthly, rules);
  const p = computePhilhealth(monthly, 'kasambahay', rules.philhealth);
  const g = computePagibig(monthly, 'employee', rules.pagibig);
  const employerPaysAll = monthly < rules.employerPaysAllBelow;
  const split = (worker: number, employer: number) =>
    employerPaysAll ? { worker: 0, employer: round2(worker + employer) } : { worker, employer };
  const sss = split(s.worker, s.employer);
  const philhealth = split(p.employeeShare, p.employerShare);
  const pagibig = split(g.employeeShare, g.employerShare);
  const workerTotal = round2(sss.worker + philhealth.worker + pagibig.worker);
  const employerTotal = round2(sss.employer + philhealth.employer + pagibig.employer);
  return {
    monthly,
    employerPaysAll,
    sssMsc: s.msc,
    sss,
    philhealth,
    pagibig,
    workerTotal,
    employerTotal,
    netPay: round2(monthly - workerTotal),
    employerCost: round2(monthly + employerTotal),
  };
}
