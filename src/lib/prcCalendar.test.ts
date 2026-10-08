import { describe, expect, it } from 'vitest';
import prcJson from '../data/prc/2026.json';
import type { PrcExamEntry, PrcRules } from './rules/types';
import { EVENT_HORIZON_DAYS, educationEvents, examIcs, icsPath, lastExamDate, nextDay } from './prcCalendar';
import { examSlug } from './prcProfessions';

const prc = prcJson as unknown as PrcRules;
const exams = prc.exams as PrcExamEntry[];
const pnle2 = exams.find((e) => e.exam === 'Nurses (PNLE, 2nd exam)')!;
const PAGE = 'https://aytool.com/prc-board-exam-schedule/';

describe('exam slugs', () => {
  it('are unique and URL-safe across the whole schedule', () => {
    const slugs = exams.map((e) => examSlug(e.exam));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(examSlug('Nurses (PNLE, 2nd exam)')).toBe('nurses-pnle-2nd-exam');
    expect(icsPath(2026, pnle2)).toBe('/data/prc/2026/nurses-pnle-2nd-exam.ics');
  });
});

describe('examIcs', () => {
  const ics = examIcs(prc, pnle2, PAGE);

  it('is a well-formed VCALENDAR with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/);
    for (const line of ics.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
  });

  it('carries the filing deadline and the exam day as all-day events from the rule data', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260715'); // application_deadline
    expect(ics).toContain('DTSTART;VALUE=DATE:20260829'); // first_date
    expect(ics).toContain('DTEND;VALUE=DATE:20260830'); // exclusive end
    expect(ics).toContain('UID:nurses-pnle-2nd-exam-2026-exam@aytool.com');
    expect(ics).toContain(`URL:${PAGE}`);
  });

  it('escapes commas in free text and skips the deadline event when there is none', () => {
    expect(ics).toContain('SUMMARY:Nurses (PNLE\\, 2nd exam) board exam');
    const noDeadline = { ...pnle2, application_deadline: null };
    expect(examIcs(prc, noDeadline, PAGE).match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it('nextDay crosses month and year boundaries', () => {
    expect(nextDay('2026-01-31')).toBe('2026-02-01');
    expect(nextDay('2026-12-31')).toBe('2027-01-01');
  });
});

describe('educationEvents', () => {
  it('emits only exams not yet finished, up to the horizon, with schema.org fields', () => {
    const today = '2026-09-22';
    const events = educationEvents(prc, exams, PAGE, today);
    expect(events.length).toBeGreaterThan(0);
    for (const ev of events) {
      expect(ev['@type']).toBe('EducationEvent');
      expect((ev.endDate as string) >= today).toBe(true);
      expect((ev.startDate as string) <= (ev.endDate as string)).toBe(true);
      expect(ev.location).toMatchObject({ '@type': 'Place' });
      expect(ev.url).toBe(PAGE);
    }
    const withinHorizon = exams.filter((e) => {
      const d = (Date.parse(e.first_date) - Date.parse(today)) / 86_400_000;
      return lastExamDate(e) >= today && d <= EVENT_HORIZON_DAYS;
    });
    expect(events).toHaveLength(withinHorizon.length);
  });

  it('keeps a multi-weekend exam until its last day, with endDate', () => {
    const ple = exams.find((e) => e.exam === 'Physicians (PLE, 2nd exam)')!;
    const [ev] = educationEvents(prc, [ple], PAGE, '2026-10-08');
    expect(ev).toMatchObject({ startDate: '2026-10-03', endDate: '2026-10-11' });
    expect(educationEvents(prc, [ple], PAGE, '2026-10-12')).toEqual([]);
  });

  it('flags rescheduled rows and produces nothing for an all-past list', () => {
    const rescheduled = educationEvents(prc, [pnle2], PAGE, '2026-08-01')[0]!;
    expect(rescheduled.eventStatus).toBe('https://schema.org/EventRescheduled');
    expect(educationEvents(prc, [pnle2], PAGE, '2026-09-22')).toEqual([]);
  });
});

describe('lastExamDate', () => {
  const row = (dates_display: string, first_date: string) => ({ exam: 'Test', dates_display, first_date });

  it('reads every wording used in the rule data', () => {
    for (const e of exams) {
      const last = lastExamDate(e);
      expect(last >= e.first_date).toBe(true);
      expect(Date.parse(last) - Date.parse(e.first_date)).toBeLessThanOrEqual(31 * 86_400_000);
    }
  });

  it('handles ranges, second weekends, month spans and weekday notes', () => {
    expect(lastExamDate(row('Oct 3–4 & 10–11, 2026', '2026-10-03'))).toBe('2026-10-11');
    expect(lastExamDate(row('Oct 5–9 & 12, 2026', '2026-10-05'))).toBe('2026-10-12');
    expect(lastExamDate(row('Nov 28 – Dec 5, 2026', '2026-11-28'))).toBe('2026-12-05');
    expect(lastExamDate(row('Jan 20 & 22, 2026', '2026-01-20'))).toBe('2026-01-22');
    expect(lastExamDate(row('Sep 20, 2026 (Sun)', '2026-09-20'))).toBe('2026-09-20');
    expect(lastExamDate(row('Dec 30 – Jan 2, 2026', '2026-12-30'))).toBe('2027-01-02');
  });

  it('fails loudly on a wording it cannot read', () => {
    expect(() => lastExamDate(row('to be announced', '2026-10-01'))).toThrow(/dates_display/);
  });
});
