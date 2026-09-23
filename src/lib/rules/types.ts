/** Shared metadata every versioned rule file must carry (design.md §3). */
export interface RuleMeta {
  rule_version: string;
  effective_from: string;
  effective_to: string | null;
  last_verified: string;
  official_source_url: string;
  official_source_label: string;
}

/* ------------------------------- Minimum wage ------------------------------ */

export interface WageTier {
  label: string;
  rate: number;
  /** Sub-area / class the tier applies to, when the order splits the region geographically. */
  group?: string;
}

export interface WageRegion {
  id: string;
  name: string;
  wage_order: string;
  date_issued: string | null;
  /** Newspaper publication; orders take effect 15 days after it (the effectivity date itself is recorded as announced). */
  date_published?: string;
  effectivity: string | null;
  second_tranche_effectivity?: string;
  tiers: WageTier[];
  notes?: string;
  coverage?: string;
  /**
   * Next change already decided. `tranche: true` = a later tranche of the order above (same order, new rates);
   * otherwise a new wage order, which brings its own dates and PDF. wagesAsOf() applies it on `effectivity`.
   */
  upcoming?: {
    wage_order: string;
    rates: WageTier[];
    effectivity: string | null;
    expected?: string;
    tranche?: boolean;
    date_issued?: string;
    date_published?: string;
    wage_order_url?: string;
  };
  wage_order_url: string;
  rtwpb_url: string;
}

export interface WageDivisor {
  id: string;
  factor: number;
  label: string;
  breakdown: string;
}

export interface WageRules {
  meta: RuleMeta & { sources: Record<string, string> };
  ncr: {
    in_force: { wage_order: string; effectivity: string; date_published?: string; non_agriculture: number; other_tier: number; other_tier_label: string; url: string };
    upcoming: {
      wage_order: string;
      date_issued: string;
      date_published: string;
      effectivity: string | null;
      effectivity_rule: string;
      effectivity_source_url?: string;
      effectivity_source_label?: string;
      non_agriculture: number;
      other_tier: number;
      increase: number;
      url: string;
    };
    enjoined: { wage_order: string; date_issued: string; date_published?: string; nominal_effectivity: string; non_agriculture: number; other_tier: number; status: string; url: string; nwpc_statement_url: string };
    cola_note: string;
    rtwpb_url: string;
  };
  regions: WageRegion[];
  kasambahay_monthly: Array<{ region: string; monthly: number; wage_order?: string; effectivity?: string; note?: string }>;
  divisors: { source: string; source_label: string; options: WageDivisor[]; alternates_note: string; nwpc_practice: string };
  coverage: Record<string, string>;
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
  /** Benefit computation parameters (RA 11199 / RA 11210 / SSS loan terms). */
  benefits: {
    pension: {
      base: number;
      amsc_pct: number;
      per_cys_pct: number;
      cys_threshold: number;
      flat_pct: number;
      floor: number;
      min_cys10: number;
      min_cys20: number;
      min_contributions: number;
      dependent_pct: number;
      dependent_min: number;
      max_dependents: number;
      /** Additional monthly benefit paid on top of the computed pension (0 if none). */
      additional_benefit: number;
      source_note: string;
      source_url: string;
    };
    maternity: {
      days_live_birth: number;
      days_solo_parent_extra: number;
      days_miscarriage: number;
      top_msc_count: number;
      divisor: number;
      min_contributions: number;
      source_note: string;
      source_url: string;
    };
    salary_loan: {
      /** Initial loans and renewals without penalty condonation in the past five years. */
      interest_pa: number;
      /** Renewals with a penalty condonation availed within the past five years. */
      interest_pa_renewal_condoned: number;
      service_fee_pct: number;
      term_months: number;
      one_month_min_contributions: number;
      two_month_min_contributions: number;
      recent_contributions_required: number;
      penalty_per_month: number;
      /** First amortization month = approval month + this offset. */
      amortization_start_offset_months: number;
      min_net_proceeds: number;
      source_note: string;
      source_url: string;
    };
    sickness: {
      pct_of_adsc: number;
      min_confinement_days: number;
      max_days_per_year: number;
      max_days_same_confinement: number;
      min_contributions: number;
      notify_within_days: number;
      top_msc_count: number;
      divisor: number;
      source_note: string;
      source_url: string;
    };
    unemployment: {
      pct_of_amsc: number;
      months: number;
      min_contributions: number;
      recent_contributions_required: number;
      recent_window_months: number;
      max_age: number;
      once_every_years: number;
      source_note: string;
      source_url: string;
    };
  };
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
  mp2: {
    min_remittance: number;
    maturity_years: number;
    max_principal: number;
    check_threshold: number;
    proof_of_income_threshold: number;
    active_member_rule: string;
    /** Newest first. source 'live' = current official page; 'archive' = the official page's earlier version. */
    dividend_rates: Array<{ year: number; rate: number; source: 'live' | 'archive' }>;
    source_note: string;
    source_url: string;
  };
  housing_loan: {
    max_loan: number;
    ltv_above_6m: number;
    max_term_years: number;
    max_age_at_application: number;
    max_age_at_maturity: number;
    min_monthly_savings: number;
    rates_valid_until: string;
    regular_rates: Array<{ years: number; rate: number }>;
    promo: Array<{ max_loan: number; rate: number; years: number }>;
    affordable: {
      rate: number;
      rate_years: number;
      rate_10y: number;
      min_contributions: number;
      income_ceiling_ncr: number;
      income_ceiling_outside_ncr: number;
      caps: Array<{ type: string; max_loan: number; sample_monthly: number }>;
      extension_note: string;
      source_url: string;
    };
    source_note: string;
    source_url: string;
    circular_491_url: string;
  };
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
  separation_pay: {
    min_months: number;
    half_month_causes: string[];
    one_month_causes: string[];
    fraction_months_counted_as_year: number;
    source_note: string;
    source_url: string;
  };
  retirement_pay: {
    days_per_year: number;
    components: { salary_days: number; sil_days: number; thirteenth_month_days: number };
    optional_age: number;
    compulsory_age: number;
    min_service_years: number;
    fraction_months_counted_as_year: number;
    exempt_headcount: number;
    source_note: string;
    source_url: string;
  };
}

/* -------------------------------- Holidays ------------------------------- */

export type HolidayType = 'regular' | 'special-non-working' | 'special-working';

export interface HolidayEntry {
  date: string;
  name: string;
  type: HolidayType;
  note?: string;
}

/** A holiday the proclamation declares but whose date a later proclamation fixes (Eid'l Fitr / Eid'l Adha). */
export interface PendingHoliday {
  name: string;
  type: HolidayType;
  note: string;
}

export interface HolidayRules {
  meta: RuleMeta;
  year: number;
  /** The year's omnibus proclamation (number, series year, signing date). */
  proclamation?: { number: number; series: number; signed: string };
  holidays: HolidayEntry[];
  pending?: PendingHoliday[];
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
  /** Actual release date once PRC publishes the results — pages show it in place of the target. */
  results_released?: string | null;
  /** From PRC's results press release (counts as printed; pass rate = passers ÷ examinees). */
  passers?: number;
  examinees?: number;
  /** "Released in N working days" as stated in PRC's headline (counted by PRC from the last sitting, excluding holidays). */
  results_working_days?: number;
  results_note?: string;
  /** PRC press release the results figures were transcribed from. */
  results_url?: string;
  note?: string;
}

export interface PrcRules {
  meta: RuleMeta;
  year: number;
  exams: PrcExamEntry[];
}
