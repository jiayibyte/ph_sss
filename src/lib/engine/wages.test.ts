import { describe, expect, it } from 'vitest';
import wagesJson from '../../data/wages/2026.json';
import type { WageRules } from '../rules/types';
import { currentRateSince, dailyEquivalent, hourlyFromDaily, monthlyEquivalent, ncrInForce, ncrUpcomingInForce, rateRange, shortfall, wagesAsOf } from './wages';

const wages = wagesJson as unknown as WageRules;

describe('minimum wage data', () => {
  it('has 18 rows (17 regions + NIR placeholder), each tier a positive integer', () => {
    expect(wages.regions).toHaveLength(18);
    for (const r of wages.regions) {
      for (const t of r.tiers) {
        expect(Number.isInteger(t.rate)).toBe(true);
        expect(t.rate).toBeGreaterThan(300);
      }
      if (r.id !== 'nir') expect(r.tiers.length).toBeGreaterThan(0);
    }
  });

  it('NCR: NCR-26 ₱695/₱658 on record; NCR-28 ₱755/₱718 published Sept 11, effective Sept 26', () => {
    expect(wages.ncr.in_force.non_agriculture).toBe(695);
    expect(wages.ncr.in_force.other_tier).toBe(658);
    expect(wages.ncr.upcoming.non_agriculture).toBe(755);
    expect(wages.ncr.upcoming.other_tier).toBe(718);
    expect(wages.ncr.upcoming.effectivity).toBe('2026-09-26');
    expect(wages.ncr.upcoming.non_agriculture - wages.ncr.in_force.non_agriculture).toBe(wages.ncr.upcoming.increase);
    const ncr = wages.regions.find((r) => r.id === 'ncr')!;
    expect(ncr.tiers[0]!.rate).toBe(wages.ncr.in_force.non_agriculture);
  });

  it('range across regions: high ₱695 (NCR in force), low ₱401 (BARMM agriculture, other areas)', () => {
    expect(rateRange(wages)).toEqual({ high: 695, low: 401 });
  });
});

describe('wage conversions (DOLE Handbook factors)', () => {
  it('matches NWPC press-release arithmetic with factor 313: ₱455 → ₱11,867.92 (NWPC prints ₱11,868); ₱540 → ₱14,085', () => {
    expect(monthlyEquivalent(455, 313)).toBe(11867.92);
    expect(monthlyEquivalent(540, 313)).toBe(14085);
  });
  it('factor 365 for monthly-paid: ₱695 → ₱21,139.58; factor 261 for a 5-day week: ₱695 → ₱15,116.25', () => {
    expect(monthlyEquivalent(695, 365)).toBe(21139.58);
    expect(monthlyEquivalent(695, 261)).toBe(15116.25);
  });
  it('round-trips daily ↔ monthly and computes shortfalls', () => {
    expect(dailyEquivalent(monthlyEquivalent(600, 313), 313)).toBe(600);
    expect(shortfall(650, 695)).toBe(45);
    expect(shortfall(700, 695)).toBe(0);
  });
});

describe('hourlyFromDaily', () => {
  it('divides by the normal eight hours: ₱695 → ₱86.88', () => {
    expect(hourlyFromDaily(695)).toBe(86.88);
    expect(hourlyFromDaily(600, 6)).toBe(100);
  });
});

describe('wagesAsOf (orders switch on their effectivity date)', () => {
  const region = (w: typeof wages, id: string) => w.regions.find((r) => r.id === id)!;
  const tier = (w: typeof wages, id: string, i = 0) => region(w, id).tiers[i]!.rate;

  it('every recorded order took effect 15–16 days after publication (sanity bound on transcribed dates)', () => {
    const day = 86_400_000;
    const orders = [
      ...wages.regions.filter((r) => r.date_published && r.effectivity).map((r) => [r.date_published!, r.effectivity!]),
      [wages.ncr.enjoined.date_published!, wages.ncr.enjoined.nominal_effectivity],
      [wages.ncr.upcoming.date_published, wages.ncr.upcoming.effectivity!],
    ];
    expect(orders.length).toBeGreaterThanOrEqual(18);
    for (const [pub, eff] of orders) expect([15, 16]).toContain((Date.parse(eff!) - Date.parse(pub!)) / day);
  });

  it('NCR: ₱695 through September 25, ₱755/₱718 from September 26 (WO NCR-28, as DOLE announced)', () => {
    expect(tier(wagesAsOf(wages, '2026-09-25'), 'ncr')).toBe(695);
    expect(ncrUpcomingInForce(wages, '2026-09-25')).toBe(false);
    expect(ncrInForce(wages, '2026-09-25')).toMatchObject({ wage_order: 'NCR-26', non_agriculture: 695, other_tier: 658 });
    const after = wagesAsOf(wages, '2026-09-26');
    expect(tier(after, 'ncr')).toBe(755);
    expect(tier(after, 'ncr', 1)).toBe(718);
    expect(ncrUpcomingInForce(wages, '2026-09-26')).toBe(true);
    expect(ncrInForce(wages, '2026-09-26')).toMatchObject({ wage_order: 'NCR-28', effectivity: '2026-09-26', non_agriculture: 755, other_tier: 718 });
    expect(region(after, 'ncr')).toMatchObject({ wage_order: 'NCR-28', date_published: '2026-09-11', effectivity: '2026-09-26' });
    expect(region(after, 'ncr').wage_order_url).toBe(wages.ncr.upcoming.url);
    expect(region(after, 'ncr').upcoming).toBeUndefined();
    expect(currentRateSince(region(after, 'ncr'), '2026-09-26')).toBe('2026-09-26');
  });

  it('Bicol ₱455 → ₱480 and the BARMM second tranche on December 1, 2026, under the same orders', () => {
    const before = wagesAsOf(wages, '2026-11-30');
    const after = wagesAsOf(wages, '2026-12-01');
    expect(tier(before, 'r5')).toBe(455);
    expect(tier(after, 'r5')).toBe(480);
    expect(tier(before, 'barmm')).toBe(436);
    expect(tier(after, 'barmm')).toBe(461);
    for (const id of ['r5', 'barmm']) {
      expect(region(after, id).wage_order).toBe(region(wages, id).wage_order);
      expect(region(after, id).effectivity).toBe(region(wages, id).effectivity);
      expect(region(after, id).upcoming).toBeUndefined();
      expect(currentRateSince(region(before, id), '2026-11-30')).toBe(region(wages, id).effectivity);
      expect(currentRateSince(region(after, id), '2026-12-01')).toBe('2026-12-01');
    }
    // Area names carry over, so the table still says which cities/provinces each rate covers.
    expect(region(after, 'barmm').tiers.map((t) => t.group)).toEqual(region(wages, 'barmm').tiers.map((t) => t.group));
  });

  it('untouched regions pass through unchanged; Davao shows its September 1 tranche', () => {
    const view = wagesAsOf(wages, '2026-12-01');
    expect(region(view, 'r4a')).toEqual(region(wages, 'r4a'));
    expect(currentRateSince(region(view, 'r11'), '2026-09-23')).toBe('2026-09-01');
  });

  it('range moves with the orders', () => {
    expect(rateRange(wagesAsOf(wages, '2026-09-23'))).toEqual({ high: 695, low: 401 });
    expect(rateRange(wagesAsOf(wages, '2026-09-26')).high).toBe(755);
    expect(rateRange(wagesAsOf(wages, '2026-12-01')).low).toBe(426);
  });

  it('the NCR region row and the NCR block describe the same orders', () => {
    const row = region(wages, 'ncr');
    expect(row.wage_order).toBe(wages.ncr.in_force.wage_order);
    expect(row.tiers[0]!.rate).toBe(wages.ncr.in_force.non_agriculture);
    expect(row.tiers[1]!.rate).toBe(wages.ncr.in_force.other_tier);
    expect(row.upcoming!.wage_order).toBe(wages.ncr.upcoming.wage_order);
    expect(row.upcoming!.effectivity).toBe(wages.ncr.upcoming.effectivity);
    expect(row.upcoming!.date_published).toBe(wages.ncr.upcoming.date_published);
    expect(row.upcoming!.wage_order_url).toBe(wages.ncr.upcoming.url);
    expect(row.upcoming!.rates[0]!.rate).toBe(wages.ncr.upcoming.non_agriculture);
    expect(row.upcoming!.rates[1]!.rate).toBe(wages.ncr.upcoming.other_tier);
  });
});

describe('NCR wage history (NWPC per-wage-order summary)', () => {
  const r = wagesJson as unknown as WageRules;
  const orders = r.ncr.history!.orders;
  it('runs oldest to newest with rising rates and ends at the order in force before NCR-28', () => {
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]!.effectivity > orders[i - 1]!.effectivity).toBe(true);
      expect(orders[i]!.non_agriculture).toBeGreaterThan(orders[i - 1]!.non_agriculture);
      expect(orders[i]!.other_tier).toBeLessThan(orders[i]!.non_agriculture);
    }
    const last = orders.at(-1)!;
    expect(last.wage_order).toBe(r.ncr.in_force.wage_order);
    expect(last.effectivity).toBe(r.ncr.in_force.effectivity);
    expect(last.non_agriculture).toBe(r.ncr.in_force.non_agriculture);
    expect(last.other_tier).toBe(r.ncr.in_force.other_tier);
    expect(r.ncr.upcoming.non_agriculture - last.non_agriculture).toBe(r.ncr.upcoming.increase);
  });
});

describe('Region VII: ROVII-27 switches on October 14, 2026', () => {
  const r = wagesJson as unknown as WageRules;
  const r7 = (today: string) => wagesAsOf(r, today).regions.find((x) => x.id === 'r7')!;
  it('keeps ROVII-26 until the day before and moves to ROVII-27 on its effectivity', () => {
    expect(r7('2026-10-13').wage_order).toBe('ROVII-26');
    expect(r7('2026-10-13').tiers.map((t) => t.rate)).toEqual([540, 500]);
    const after = r7('2026-10-14');
    expect(after.wage_order).toBe('ROVII-27');
    expect(after.tiers.map((t) => t.rate)).toEqual([582, 542]);
    expect(after.effectivity).toBe('2026-10-14');
    expect(after.upcoming).toBeUndefined();
    // the order grants the same ₱42 to both classes
    expect(after.tiers.map((t, i) => t.rate - r7('2026-10-13').tiers[i]!.rate)).toEqual([42, 42]);
  });
});
