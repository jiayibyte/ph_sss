import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DATASETS, PAGE_DATA, datasetLastVerified, pageDates, pageSourceFile } from './lastmod.mjs';
import { ALL_TOOLS } from './pages';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe('lastmod', () => {
  it('every dataset directory has a newest <year>.json with meta.last_verified', () => {
    for (const key of DATASETS) expect(datasetLastVerified(key)).toMatch(ISO);
  });

  it('PAGE_DATA only references real pages and real datasets', () => {
    for (const [p, keys] of Object.entries(PAGE_DATA)) {
      expect(existsSync(pageSourceFile(p)), `${p} → ${pageSourceFile(p)}`).toBe(true);
      for (const k of keys) expect(DATASETS).toContain(k);
    }
  });

  it('every calculator/schedule page that renders rule data is registered', () => {
    // The OEC guide is prose-only; everything else in TOOL_PAGES renders a dataset.
    const expected = ALL_TOOLS.map((t) => t.href).filter((h) => h !== '/oec-exemption/');
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
});
