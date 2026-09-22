import { describe, expect, it } from 'vitest';
import prcJson from '../data/prc/2026.json';
import type { PrcExamEntry } from './rules/types';
import { PRC_PROFESSIONS, matchesExamQuery, resolveGroup, scheduleSentence } from './prcProfessions';

const exams = prcJson.exams as PrcExamEntry[];
const byName = new Map(exams.map((e) => [e.exam, e]));

describe('PRC profession sections', () => {
  it('resolves every featured exam against the rule data', () => {
    for (const group of PRC_PROFESSIONS) {
      expect(() => resolveGroup(group, byName, prcJson.year)).not.toThrow();
    }
  });

  it('throws a pointed error when the data no longer has a referenced exam', () => {
    const stale = { ...PRC_PROFESSIONS[0], exams: ['Nurses (PNLE, 3rd exam)'] };
    expect(() => resolveGroup(stale, byName, prcJson.year)).toThrow(/prcProfessions\.ts/);
  });

  it('keeps anchor ids and nav labels unique', () => {
    const ids = PRC_PROFESSIONS.map((g) => g.id);
    const labels = PRC_PROFESSIONS.map((g) => g.navLabel);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('builds schedule sentences from the data, not hardcoded dates', () => {
    const nursing = PRC_PROFESSIONS.find((g) => g.id === 'nursing')!;
    const sentence = scheduleSentence(resolveGroup(nursing, byName, prcJson.year));
    const [first, second] = resolveGroup(nursing, byName, prcJson.year);
    expect(sentence).toContain(first.dates_display);
    expect(sentence).toContain(second.dates_display);
    expect(sentence).toMatch(/application deadline/);
    expect(sentence.endsWith('.')).toBe(true);
  });

  it('renders a single-round profession without a dangling conjunction', () => {
    const social = PRC_PROFESSIONS.find((g) => g.id === 'social-work')!;
    const sentence = scheduleSentence(resolveGroup(social, byName, prcJson.year));
    expect(sentence).not.toContain(' and ');
  });
});

describe('PRC table search', () => {
  const hits = (q: string) => exams.filter((e) => matchesExamQuery(e, q)).map((e) => e.exam);

  it('finds exams by the names people type, not only PRC wording', () => {
    // The search box's own placeholder examples must all return rows.
    expect(hits('Nursing')).toEqual(['Nurses (PNLE)', 'Nurses (PNLE, 2nd exam)']);
    expect(hits('Civil Engineer')).toEqual(['Civil Engineers', 'Civil Engineers (2nd exam)']);
    expect(hits('LET')).toContain('Professional Teachers (LET / BLEPT)');
    // Profession aliases from PRC_PROFESSIONS.
    expect(hits('pharmacy')).toEqual(['Pharmacists', 'Pharmacists (2nd exam)']);
    expect(hits('dentistry')).toContain('Dentists (Written)');
    expect(hits('radtech')).toContain('Radiologic Technologists');
    expect(hits('accountancy')).toContain('Certified Public Accountants (CPALE)');
    expect(hits('PNLE')).toHaveLength(2);
  });

  it('ignores spacing, punctuation and case', () => {
    expect(hits('medtech')).toEqual(hits('Med Tech'));
    expect(hits('med-tech')).toEqual(hits('MED TECH'));
    expect(hits('medtech')).toContain('Medical Technologists');
  });

  it('still matches exams that have no profession group, by PRC name', () => {
    expect(hits('geodetic')).toEqual(['Geodetic Engineers']);
    expect(hits('customs')).toEqual(['Customs Brokers']);
  });

  it('returns everything for a blank query and nothing for a miss', () => {
    expect(hits('')).toHaveLength(exams.length);
    expect(hits('   ')).toHaveLength(exams.length);
    expect(hits('no such exam')).toEqual([]);
  });
});
