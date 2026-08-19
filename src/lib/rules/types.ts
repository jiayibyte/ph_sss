/** Shared metadata every versioned rule file must carry (design.md §3). */
export interface RuleMeta {
  rule_version: string;
  effective_from: string;
  effective_to: string | null;
  last_verified: string;
  official_source_url: string;
  official_source_label: string;
}

/* ---------------------------------- SSS ---------------------------------- */

export type SssMemberType = 'employee' | 'self-employed' | 'voluntary' | 'ofw';

export interface SssTableRow {
  /** Inclusive lower bound of the monthly salary/compensation range. */
  range_min: number;
  /** Exclusive upper bound; null = "and above". */
  range_max: number | null;
  msc: number;
  /** Portion of MSC under the regular SS program (capped). */
  regular_msc: number;
  /** Portion of MSC under the Mandatory Provident Fund (WISP). */
  mpf_msc: number;
  employee_share: number;
  employer_share: number;
  /** Employees' Compensation contribution (0 when not applicable). */
  ec: number;
  total: number;
}

export interface SssRules {
  meta: RuleMeta;
  rate: { total: number; employee: number; employer: number };
  msc: { min: number; max: number; step: number; regular_cap: number };
  ec: { below: number; threshold: number; at_or_above: number };
  member_types: Record<
    SssMemberType,
    {
      label: string;
      /** Who pays EC: 'employer' | 'member' | null (no EC). */
      ec_payer: 'employer' | 'member' | null;
      msc_min: number;
      /** True when contribution is split employee/employer. */
      split: boolean;
    }
  >;
  table: Record<SssMemberType, SssTableRow[]>;
}

/* ------------------------------- PhilHealth ------------------------------ */

export type PhilhealthMemberType = 'employed' | 'self-earning' | 'ofw' | 'kasambahay';

export interface PhilhealthRules {
  meta: RuleMeta;
  rate: number;
  income_floor: number;
  income_ceiling: number;
  member_types: Record<
    PhilhealthMemberType,
    { label: string; split: boolean; note: string }
  >;
}

/* -------------------------------- Pag-IBIG ------------------------------- */

export interface PagibigRules {
  meta: RuleMeta;
  mfs_ceiling: number;
  employee_rate_low: number;
  employee_rate: number;
  /** Monthly compensation at or below which the low employee rate applies. */
  low_threshold: number;
  employer_rate: number;
}

/* --------------------------------- Labor --------------------------------- */

export type DayType =
  | 'ordinary'
  | 'rest-day'
  | 'special'
  | 'special-rest-day'
  | 'regular-holiday'
  | 'regular-holiday-rest-day';

export interface LaborRules {
  meta: RuleMeta;
  /** First-8-hours pay multiplier when WORKED, by day type. */
  worked_multiplier: Record<DayType, number>;
  /** Pay multiplier when UNWORKED (regular holiday 1.0; special/rest 0). */
  unworked_multiplier: Record<DayType, number>;
  /** OT premium factor applied ON TOP of the day-type rate (ordinary 1.25; others 1.30). */
  ot_factor: Record<DayType, number>;
  night_diff: { rate: number; start_hour: number; end_hour: number };
  thirteenth_month: {
    divisor: number;
    /** Minimum service (months) to be entitled. */
    min_service_months: number;
    deadline: string;
    tax_exempt_cap: number;
  };
  final_pay: { release_days: number; coe_days: number };
}

/* -------------------------------- Holidays ------------------------------- */

export type HolidayType = 'regular' | 'special-non-working' | 'special-working';

export interface HolidayEntry {
  date: string;
  name: string;
  type: HolidayType;
  note?: string;
}

export interface HolidayRules {
  meta: RuleMeta;
  year: number;
  holidays: HolidayEntry[];
}

/* ----------------------------------- Tax --------------------------------- */

export interface TaxBracket {
  /** Monthly taxable income strictly above this amount... */
  over: number;
  /** ...and at or below this (null = no cap). */
  up_to: number | null;
  base_tax: number;
  rate: number;
}

export interface TaxRules {
  meta: RuleMeta;
  period: 'monthly';
  brackets: TaxBracket[];
}

/* ----------------------------------- PRC ---------------------------------- */

export interface PrcExamEntry {
  exam: string;
  /** Display string, e.g. "March 15–16, 2026". */
  dates_display: string;
  /** First exam day, ISO — used for sorting/filter by month. */
  first_date: string;
  application_start: string | null;
  application_deadline: string | null;
  /** PRC target release date for results (target, not a guarantee). */
  results_target: string | null;
  note?: string;
}

export interface PrcRules {
  meta: RuleMeta;
  year: number;
  exams: PrcExamEntry[];
}
