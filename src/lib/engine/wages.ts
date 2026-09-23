/**
 * Daily ↔ monthly conversions for minimum-wage figures, using the DOLE
 * Handbook factors (365 / 395 / 313 / 261). Parameters come from
 * src/data/wages/<year>.json → divisors.
 */
import type { WageRegion, WageRules, WageTier } from '../rules/types';
import { peso, round2 } from '../format';

/**
 * The wage data as of a Philippine calendar day. A region whose `upcoming`
 * change has reached its effectivity date gets it applied: a tranche swaps in
 * the new rates under the same order (and records the tranche date); a new
 * order replaces the order, its dates and PDF. The nightly rebuild therefore
 * flips pages on the right morning without anyone editing the JSON
 * (NCR-28 on Sept 26, 2026; Bicol and BARMM tranches on Dec 1, 2026).
 */
export function wagesAsOf(rules: WageRules, today: string): WageRules {
  const regions = rules.regions.map((r): WageRegion => {
    const up = r.upcoming;
    if (!up?.effectivity || today < up.effectivity) return r;
    const next: WageRegion = up.tranche
      ? { ...r, tiers: up.rates, second_tranche_effectivity: up.effectivity }
      : {
          ...r,
          wage_order: up.wage_order,
          date_issued: up.date_issued ?? null,
          date_published: up.date_published,
          effectivity: up.effectivity,
          tiers: up.rates,
          wage_order_url: up.wage_order_url ?? r.wage_order_url,
        };
    delete next.upcoming;
    if (!up.tranche) delete next.second_tranche_effectivity;
    return next;
  });
  return { ...rules, regions };
}

/** Date the region's current rates started: the latest tranche already in effect, else the order's effectivity. */
export function currentRateSince(region: WageRegion, today: string): string | null {
  const t = region.second_tranche_effectivity;
  return t && t <= today ? t : region.effectivity;
}

/** Is WO NCR-28 (rules.ncr.upcoming) in force on `today`? */
export function ncrUpcomingInForce(rules: WageRules, today: string): boolean {
  const eff = rules.ncr.upcoming.effectivity;
  return eff !== null && today >= eff;
}

/** The NCR order in force on `today`: NCR-28 from its effectivity date, NCR-26 before. */
export function ncrInForce(rules: WageRules, today: string): { wage_order: string; effectivity: string; non_agriculture: number; other_tier: number; url: string } {
  const { in_force: n26, upcoming: n28 } = rules.ncr;
  return ncrUpcomingInForce(rules, today)
    ? { wage_order: n28.wage_order, effectivity: n28.effectivity!, non_agriculture: n28.non_agriculture, other_tier: n28.other_tier, url: n28.url }
    : { wage_order: n26.wage_order, effectivity: n26.effectivity, non_agriculture: n26.non_agriculture, other_tier: n26.other_tier, url: n26.url };
}

/**
 * One line for a set of rates, grouped by area when the order splits the
 * region: "Cotabato City, …: Non-agriculture ₱461, Agriculture ₱436; …".
 */
export function describeRates(rates: WageTier[]): string {
  const groups: Array<{ group?: string; parts: string[] }> = [];
  for (const t of rates) {
    const part = `${t.label} ${peso(t.rate)}`;
    const last = groups.at(-1);
    if (last && last.group === t.group) last.parts.push(part);
    else groups.push({ group: t.group, parts: [part] });
  }
  return groups.map((g) => (g.group ? `${g.group}: ` : '') + g.parts.join(', ')).join('; ');
}

/** Estimated equivalent monthly rate: daily × factor ÷ 12. */
export function monthlyEquivalent(daily: number, factor: number): number {
  return round2((daily * factor) / 12);
}

/** Daily rate implied by a monthly salary under a given factor: monthly × 12 ÷ factor. */
export function dailyEquivalent(monthly: number, factor: number): number {
  return round2((monthly * 12) / factor);
}

/** Highest and lowest daily tier across all regions with a wage order (pass a wagesAsOf() view for "current"). */
export function rateRange(rules: WageRules): { high: number; low: number } {
  const rates = rules.regions.flatMap((r) => r.tiers.map((t) => t.rate));
  return { high: Math.max(...rates), low: Math.min(...rates) };
}

/** Hourly rate from a daily rate (normal hours per day, default 8). */
export function hourlyFromDaily(daily: number, hoursPerDay = 8): number {
  return round2(daily / hoursPerDay);
}

/** Is a given daily pay at or above a tier's minimum? Returns the shortfall (0 if compliant). */
export function shortfall(dailyPay: number, minimum: number): number {
  return round2(Math.max(0, minimum - dailyPay));
}
