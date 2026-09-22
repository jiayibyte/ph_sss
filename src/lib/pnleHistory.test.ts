import { describe, expect, it } from 'vitest';
import history from '../data/prc/pnle-history.json';

const held = history.rounds.filter((r) => r.first_date !== null);

describe('PNLE history data', () => {
  it('is chronological and every held round has consistent counts', () => {
    const dates = held.map((r) => r.first_date as string);
    expect([...dates].sort()).toEqual(dates);
    for (const r of held) {
      expect(r.examinees).toBeGreaterThan(0);
      expect(r.passers).toBeGreaterThan(0);
      expect(r.passers).toBeLessThanOrEqual(r.examinees as number);
      expect(r.pass_rate).toBeCloseTo(((r.passers as number) / (r.examinees as number)) * 100, 2);
      expect(r.results_released as string > (r.first_date as string)).toBe(true);
      expect(r.source_url).toMatch(/^https:\/\/www\.prc\.gov\.ph\//);
      expect(['prc.gov.ph', 'archive']).toContain(r.verified_via);
    }
  });

  it('cancelled rounds carry no numbers', () => {
    for (const r of history.rounds.filter((x) => x.first_date === null)) {
      expect(r.examinees).toBeNull();
      expect(r.pass_rate).toBeNull();
      expect(r.note).toBeTruthy();
    }
  });

  it('ends with the August–September 2026 round, matching the 2026 rule data', () => {
    const last = history.rounds.at(-1)!;
    expect(last.round).toBe('August–September 2026');
    expect(last.results_released).toBe('2026-09-18');
    expect(last.passers).toBe(28652);
    expect(last.examinees).toBe(37359);
  });
});
