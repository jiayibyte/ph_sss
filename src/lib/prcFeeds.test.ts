import { describe, expect, it } from 'vitest';
import prcJson from '../data/prc/2026.json';
import type { PrcRules } from './rules/types';
import { PRC_FEEDS, PRC_YEARS, feedIcs, feedLinks, feedPath, feedRows, findFeed } from './prcFeeds';
import { PROFESSION_PAGES } from './prcProfessionPages';

const prc = prcJson as unknown as PrcRules;

describe('PRC calendar feeds', () => {
  it('cover the nursing page and every profession page, with unique slugs', () => {
    const slugs = PRC_FEEDS.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(['nursing', ...PROFESSION_PAGES.map((p) => p.slug)]);
    expect(feedPath('nursing')).toBe('/data/prc/feed/nursing.ics');
    expect(() => findFeed('no-such-exam')).toThrow(/PRC_FEEDS/);
  });

  it('read every year file on disk', () => {
    expect(PRC_YEARS.map((r) => r.year)).toContain(2026);
    expect(PRC_YEARS.map((r) => r.year)).toEqual([...PRC_YEARS.map((r) => r.year)].sort());
  });

  it('are well-formed subscribable calendars for every feed', () => {
    for (const feed of PRC_FEEDS) {
      const ics = feedIcs(feed);
      expect(ics.startsWith('BEGIN:VCALENDAR\r\n'), feed.slug).toBe(true);
      expect(ics.endsWith('END:VCALENDAR\r\n'), feed.slug).toBe(true);
      expect(ics).not.toMatch(/[^\r]\n/);
      for (const line of ics.split('\r\n')) expect(line.length, feed.slug).toBeLessThanOrEqual(75);
      expect(ics).toContain('REFRESH-INTERVAL;VALUE=DURATION:P1D');
      expect(ics.match(/BEGIN:VEVENT/g)!.length, feed.slug).toBeGreaterThan(0);
    }
  });

  it('carry deadline, exam day and results for each round, from the rule data', () => {
    const ics = feedIcs(findFeed('nursing'));
    expect(ics).toContain('UID:nurses-pnle-2nd-exam-2026-deadline@aytool.com');
    expect(ics).toContain('UID:nurses-pnle-2nd-exam-2026-exam@aytool.com');
    expect(ics).toContain('UID:nurses-pnle-2nd-exam-2026-results@aytool.com');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260918');
    expect(ics.replace(/\r\n /g, '')).toContain('28\\,652 of 37\\,359 passed (76.69%)');
    // psychometrician page uses only the Psychometricians row of the psychology group
    const psych = feedRows(findFeed('psychometrician'));
    expect(psych.map((r) => r.exam.exam)).toEqual(['Psychometricians']);
  });

  it('resolve the newest year strictly and older years leniently', () => {
    const feed = findFeed('nursing');
    const older = { ...prc, year: 2025, exams: [] } as unknown as PrcRules;
    expect(feedRows(feed, [older, prc]).every((r) => r.rules.year === 2026)).toBe(true);
    const newer = { ...prc, year: 2027, exams: [] } as unknown as PrcRules;
    expect(() => feedRows(feed, [prc, newer])).toThrow(/2027\.json/);
  });

  it('build webcal and Google Calendar subscribe links', () => {
    const l = feedLinks('let');
    expect(l.https).toBe('https://aytool.com/data/prc/feed/let.ics');
    expect(l.webcal).toBe('webcal://aytool.com/data/prc/feed/let.ics');
    expect(l.google).toBe(
      'https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Faytool.com%2Fdata%2Fprc%2Ffeed%2Flet.ics',
    );
  });
});

describe('next-year titles on profession pages', () => {
  it('fit in 65 characters for every page', () => {
    for (const p of PROFESSION_PAGES) {
      const t = (p.titleNextYear ?? `${p.headingName} {next} Schedule & {year} Results`)
        .replaceAll('{year}', '2026')
        .replaceAll('{next}', '2027');
      expect(t.length, `${p.slug}: ${t}`).toBeLessThanOrEqual(65);
      expect(t, p.slug).toMatch(/2027/);
    }
  });
});
