import { describe, expect, it } from 'vitest';
import prcJson from '../data/prc/2026.json';
import type { PrcExamEntry, PrcRules } from './rules/types';
import { EVENT_HORIZON_DAYS, educationEvents, examIcs, icsPath, nextDay } from './prcCalendar';
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
  it('emits only exams from today up to the horizon, with schema.org fields', () => {
    const today = '2026-09-22';
    const events = educationEvents(prc, exams, PAGE, today);
    expect(events.length).toBeGreaterThan(0);
    for (const ev of events) {
      expect(ev['@type']).toBe('EducationEvent');
      const start = ev.startDate as string;
      expect(start >= today).toBe(true);
      expect(ev.location).toMatchObject({ '@type': 'Place' });
      expect(ev.url).toBe(PAGE);
    }
    const withinHorizon = exams.filter((e) => {
      const d = (Date.parse(e.first_date) - Date.parse(today)) / 86_400_000;
      return d >= 0 && d <= EVENT_HORIZON_DAYS;
    });
    expect(events).toHaveLength(withinHorizon.length);
  });

  it('flags rescheduled rows and produces nothing for an all-past list', () => {
    const rescheduled = educationEvents(prc, [pnle2], PAGE, '2026-08-01')[0]!;
    expect(rescheduled.eventStatus).toBe('https://schema.org/EventRescheduled');
    expect(educationEvents(prc, [pnle2], PAGE, '2026-09-22')).toEqual([]);
  });
});
