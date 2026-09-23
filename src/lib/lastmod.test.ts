import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DATASETS, PAGE_DATA, PAGE_SOURCE, SCHEDULED, datasetLastVerified, pageDates, pageSourceFiles, scheduledChangesReached } from './lastmod.mjs';
import { ALL_TOOLS } from './pages';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe('lastmod', () => {
  it('every dataset directory has a newest <year>.json with meta.last_verified', () => {
    for (const key of DATASETS) expect(datasetLastVerified(key)).toMatch(ISO);
  });

  it('PAGE_DATA only references real pages and real datasets', () => {
    for (const [p, keys] of Object.entries(PAGE_DATA)) {
      for (const f of pageSourceFiles(p)) expect(existsSync(f), `${p} → ${f}`).toBe(true);
      for (const k of keys) expect(DATASETS).toContain(k);
    }
  });

  it('dynamic-route pages point at the template and the copy config', () => {
    for (const [p, files] of Object.entries(PAGE_SOURCE)) {
      expect(files.length).toBeGreaterThan(1);
      for (const f of files) expect(existsSync(f), `${p} → ${f}`).toBe(true);
    }
  });

  it('every calculator/schedule page that renders rule data is registered', () => {
    // Prose-only guides (OEC, the four "how to get a number" pages) render no dataset.
    const proseOnly = new Set([
      '/oec-exemption/',
      '/how-to-get-sss-number/',
      '/how-to-get-tin-number/',
      '/how-to-get-pagibig-mid-number/',
      '/how-to-get-philhealth-number/',
    ]);
    const expected = ALL_TOOLS.map((t) => t.href).filter((h) => !proseOnly.has(h));
    for (const href of expected) expect(Object.keys(PAGE_DATA)).toContain(href);
  });

  it('returns ISO dates with published ≤ modified', () => {
    for (const p of ['/', '/about/', '/sss-contribution-table/', '/nursing-board-exam-schedule/']) {
      const { published, modified } = pageDates(p);
      expect(published).toMatch(ISO);
      expect(modified).toMatch(ISO);
      expect(published <= modified).toBe(true);
    }
  });

  it('scheduled wage changes move lastmod on their effectivity date, not before', () => {
    for (const p of Object.keys(SCHEDULED)) expect(Object.keys(PAGE_DATA)).toContain(p);
    expect(scheduledChangesReached('/minimum-wage-philippines/', '2026-09-25')).toEqual([]);
    expect(scheduledChangesReached('/minimum-wage-philippines/', '2026-09-26')).toEqual(['2026-09-26']);
    expect(scheduledChangesReached('/minimum-wage-philippines/', '2026-12-01')).toEqual(['2026-09-26', '2026-12-01']);
    expect(scheduledChangesReached('/daily-rate-calculator/', '2026-12-01')).toEqual(['2026-09-26']);
    expect(scheduledChangesReached('/sss-contribution-table/', '2026-12-01')).toEqual([]);
    expect(scheduledChangesReached('/pagibig-housing-loan-calculator/', '2026-12-31')).toEqual([]);
    expect(scheduledChangesReached('/pagibig-housing-loan-calculator/', '2027-01-01')).toEqual(['2027-01-01']);
  });
});
