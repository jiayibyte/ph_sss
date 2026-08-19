import type { PhilhealthMemberType, PhilhealthRules } from '../rules/types';
import { round2 } from '../format';

export interface PhilhealthResult {
  memberType: PhilhealthMemberType;
  salary: number;
  /** Salary after applying the income floor/ceiling. */
  premiumBase: number;
  totalPremium: number;
  employeeShare: number;
  employerShare: number;
  /** What the member personally pays each month. */
  memberPays: number;
  clamped: 'floor' | 'ceiling' | null;
}

export function computePhilhealth(
  salary: number,
  memberType: PhilhealthMemberType,
  rules: PhilhealthRules,
): PhilhealthResult {
  const base = Math.min(Math.max(salary, rules.income_floor), rules.income_ceiling);
  const total = round2(base * rules.rate);
  const split = rules.member_types[memberType].split;
  const half = round2(total / 2);
  return {
    memberType,
    salary,
    premiumBase: base,
    totalPremium: total,
    employeeShare: split ? half : total,
    employerShare: split ? round2(total - half) : 0,
    memberPays: split ? half : total,
    clamped:
      salary < rules.income_floor ? 'floor' : salary > rules.income_ceiling ? 'ceiling' : null,
  };
}
