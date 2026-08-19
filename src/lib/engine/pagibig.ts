import type { PagibigRules } from '../rules/types';
import { round2 } from '../format';

export type PagibigMemberType = 'employee' | 'self-paying';

export interface PagibigResult {
  memberType: PagibigMemberType;
  salary: number;
  /** Monthly Fund Salary actually used (capped at the MFS ceiling). */
  fundSalary: number;
  employeeRate: number;
  employeeShare: number;
  employerShare: number;
  total: number;
  /** What the member personally pays each month. */
  memberPays: number;
  clamped: 'ceiling' | null;
}

export function computePagibig(
  salary: number,
  memberType: PagibigMemberType,
  rules: PagibigRules,
): PagibigResult {
  const fundSalary = Math.min(salary, rules.mfs_ceiling);
  const eeRate =
    salary <= rules.low_threshold ? rules.employee_rate_low : rules.employee_rate;
  const ee = round2(fundSalary * eeRate);
  const er = memberType === 'employee' ? round2(fundSalary * rules.employer_rate) : 0;
  return {
    memberType,
    salary,
    fundSalary,
    employeeRate: eeRate,
    employeeShare: ee,
    employerShare: er,
    total: round2(ee + er),
    memberPays: ee,
    clamped: salary > rules.mfs_ceiling ? 'ceiling' : null,
  };
}
