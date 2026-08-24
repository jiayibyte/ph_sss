import { describe, expect, it } from 'vitest';
import prcJson from '../data/prc/2026.json';
import type { PrcExamEntry } from './rules/types';
import { PRC_PROFESSIONS, resolveGroup, scheduleSentence } from './prcProfessions';

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
