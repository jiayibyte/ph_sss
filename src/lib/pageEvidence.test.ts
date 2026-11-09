import { describe, expect, it } from 'vitest';
import { linkedOfficialSources, pageEvidence } from './pageEvidence';
import sss from '../data/sss/2026.json';
import holidays from '../data/holidays/2026.json';
import holidays2027 from '../data/holidays/2027.json';

describe('public source records', () => {
  it('accepts actual primary-source hosts and does not infer review dates from links', () => {
    const refs = linkedOfficialSources('<a href="https://www.prc.gov.ph/list-of-requirements">PRC list</a><a href="https://prc.gov.ph.evil.example/">fake</a><a href="https://lawphil.net/a?x=1&amp;y=2"><strong>Law</strong></a>');
    expect(refs).toHaveLength(2);
    expect(refs[1].url).toContain('x=1&y=2');
    expect(refs.every((r) => r.checkedOn === null)).toBe(true);
  });
  it('keeps the dataset check date instead of treating a rebuild as a fresh review', () => {
    const record = pageEvidence('/sss-contribution-calculator/')[0];
    expect(record.checkedOn).toBe(sss.meta.last_verified);
    expect(record.url).toBe(sss.meta.official_source_url);
  });
  it('uses the year actually shown by holiday and pay guides', () => {
    expect(pageEvidence('/philippine-holidays/')[0].url).toBe(holidays2027.meta.official_source_url);
    expect(pageEvidence('/holiday-pay-calculator/')[0].url).toBe(holidays.meta.official_source_url);
  });
  it('does not repeat a dataset source as an undated body reference', () => {
    const records = pageEvidence('/sss-contribution-calculator/', `<a href="${sss.meta.official_source_url}">SSS table</a>`);
    expect(records.filter((r) => r.url === sss.meta.official_source_url)).toHaveLength(1);
  });
});
