/**
 * Calendar exports and Event structured data for PRC exam rows.
 *
 *   - examIcs():        one .ics per exam (filing deadline + first exam day, all-day
 *                       events) served from /data/prc/<year>/<slug>.ics
 *   - educationEvents(): schema.org EducationEvent for upcoming exams — an
 *                       experiment for date-bearing rich results, capped so the
 *                       JSON-LD does not outweigh the page.
 *
 * Everything is derived from the rule JSON; nothing here carries a date of its own.
 */
import type { PrcExamEntry, PrcRules } from './rules/types';
import { examSlug } from './prcProfessions';

/** Site-relative path of an exam's .ics file. */
export function icsPath(year: number, exam: Pick<PrcExamEntry, 'exam'>): string {
  return `/data/prc/${year}/${examSlug(exam.exam)}.ics`;
}

const icsDate = (iso: string): string => iso.replace(/-/g, '');

/** ISO date + 1 day (DTEND of an all-day event is exclusive). */
export function nextDay(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** RFC 5545 text escaping. */
const esc = (s: string): string =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** RFC 5545 line folding (75 octets; we fold at 70 chars to stay under with UTF-8). */
function fold(line: string): string {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 70) {
    parts.push(rest.slice(0, 70));
    rest = ' ' + rest.slice(70);
  }
  parts.push(rest);
  return parts.join('\r\n');
}

function vevent(fields: Record<string, string>): string {
  return ['BEGIN:VEVENT', ...Object.entries(fields).map(([k, v]) => fold(`${k}:${v}`)), 'END:VEVENT'].join(
    '\r\n',
  );
}

/**
 * Build the .ics for one exam row. `pageUrl` is the absolute URL of the page
 * the calendar entry should link back to.
 */
export function examIcs(rules: PrcRules, exam: PrcExamEntry, pageUrl: string): string {
  const slug = examSlug(exam.exam);
  const stamp = `${icsDate(rules.meta.last_verified)}T000000Z`;
  const source = `Source: ${rules.meta.rule_version}. Dates can move by PRC advisory — verify on prc.gov.ph.`;
  const events: string[] = [];

  if (exam.application_deadline) {
    events.push(
      vevent({
        UID: `${slug}-${rules.year}-deadline@aytool.com`,
        DTSTAMP: stamp,
        'DTSTART;VALUE=DATE': icsDate(exam.application_deadline),
        'DTEND;VALUE=DATE': icsDate(nextDay(exam.application_deadline)),
        SUMMARY: esc(`Filing deadline: ${exam.exam} board exam (PRC ${rules.year})`),
        DESCRIPTION: esc(
          `Last day to file through LERIS (online.prc.gov.ph) for the ${exam.exam} licensure examination on ${exam.dates_display}. ${source}`,
        ),
        URL: pageUrl,
      }),
    );
  }

  events.push(
    vevent({
      UID: `${slug}-${rules.year}-exam@aytool.com`,
      DTSTAMP: stamp,
      'DTSTART;VALUE=DATE': icsDate(exam.first_date),
      'DTEND;VALUE=DATE': icsDate(nextDay(exam.first_date)),
      SUMMARY: esc(`${exam.exam} board exam — ${exam.dates_display}`),
      DESCRIPTION: esc(
        `${exam.exam} licensure examination, ${exam.dates_display}${exam.note ? ` (${exam.note})` : ''}. Results target: ${exam.results_target ?? 'to be announced'}. ${source}`,
      ),
      URL: pageUrl,
    }),
  );

  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//AyTool//PRC Board Exam Schedule ${rules.year}//EN`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      fold(`X-WR-CALNAME:${esc(`${exam.exam} — PRC ${rules.year}`)}`),
      ...events,
      'END:VCALENDAR',
    ].join('\r\n') + '\r\n'
  );
}

/** Only exams starting within this many days get Event markup (page-weight cap). */
export const EVENT_HORIZON_DAYS = 60;

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * schema.org EducationEvent objects for the exams in `exams` that start on or
 * after `today` and within EVENT_HORIZON_DAYS. Past rows produce nothing.
 */
export function educationEvents(
  rules: PrcRules,
  exams: PrcExamEntry[],
  pageUrl: string,
  today: string,
): Record<string, unknown>[] {
  const horizon = addDays(today, EVENT_HORIZON_DAYS);
  return exams
    .filter((e) => e.first_date >= today && e.first_date <= horizon)
    .map((e) => ({
      '@context': 'https://schema.org',
      '@type': 'EducationEvent',
      name: `${e.exam} Licensure Examination ${rules.year}`,
      description: `PRC ${e.exam} board exam, ${e.dates_display}. Filing through LERIS: ${e.application_start ?? 'to be announced'} to ${e.application_deadline ?? 'to be announced'}. Results target: ${e.results_target ?? 'to be announced'}. Per ${rules.meta.rule_version}.`,
      startDate: e.first_date,
      eventStatus: /reschedul/i.test(e.note ?? '')
        ? 'https://schema.org/EventRescheduled'
        : 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'PRC testing centers nationwide',
        address: { '@type': 'PostalAddress', addressCountry: 'PH' },
      },
      organizer: {
        '@type': 'GovernmentOrganization',
        name: 'Professional Regulation Commission',
        url: 'https://www.prc.gov.ph/',
      },
      url: pageUrl,
    }));
}
