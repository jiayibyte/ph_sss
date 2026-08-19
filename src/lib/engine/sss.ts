import type { SssMemberType, SssRules, SssTableRow } from '../rules/types';
import { round2 } from '../format';

export interface SssResult {
  memberType: SssMemberType;
  salary: number;
  msc: number;
  regularMsc: number;
  mpfMsc: number;
  employeeShare: number;
  employerShare: number;
  ec: number;
  ecPayer: 'employer' | 'member' | null;
  total: number;
  /** What the member personally pays each month. */
  memberPays: number;
  clamped: 'floor' | 'ceiling' | null;
}

/** Find the official table row a salary falls into (single source of truth). */
export function findSssRow(
  salary: number,
  memberType: SssMemberType,
  rules: SssRules,
): SssTableRow {
  const rows = rules.table[memberType];
  const row = rows.find(
    (r) => salary >= r.range_min && (r.range_max === null || salary < r.range_max),
  );
  // Salaries below the first bracket's floor fall into the first row by
  // official rule (range_min of the first row is 0), so `row` always exists.
  return row ?? rows[rows.length - 1]!;
}

export function computeSss(
  salary: number,
  memberType: SssMemberType,
  rules: SssRules,
): SssResult {
  const cfg = rules.member_types[memberType];
  const row = findSssRow(salary, memberType, rules);
  const clamped =
    row.msc === cfg.msc_min && salary < cfg.msc_min
      ? 'floor'
      : row.range_max === null && salary >= rules.msc.max
        ? 'ceiling'
        : null;
  const memberPays = cfg.split ? row.employee_share : round2(row.employee_share);
  return {
    memberType,
    salary,
    msc: row.msc,
    regularMsc: row.regular_msc,
    mpfMsc: row.mpf_msc,
    employeeShare: row.employee_share,
    employerShare: row.employer_share,
    ec: row.ec,
    ecPayer: cfg.ec_payer,
    total: row.total,
    memberPays,
    clamped,
  };
}
