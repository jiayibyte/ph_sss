/**
 * Subscribable calendar feeds, one per exam page: /data/prc/feed/<slug>.ics.
 *
 * The per-exam .ics files (prcCalendar.ts) are one-off downloads. A feed is a
 * subscription: the calendar app re-fetches it (Google roughly daily), so when
 * PRC publishes next year's schedule and src/data/prc/<year>.json lands, every
 * subscriber gets the new filing deadlines, exam days and results dates without
 * coming back to the site. Feeds read every year file under src/data/prc/, so
 * nothing here changes at rollover.
 */
import type { PrcExamEntry, PrcRules } from './rules/types';
import { PRC_PROFESSIONS, examSlug, resolveGroup } from './prcProfessions';
import { PROFESSION_PAGES } from './prcProfessionPages';
import { esc, fold, icsDate, nextDay, vevent } from './prcCalendar';
import { SITE } from '../../site.config';

export interface PrcFeed {
  /** File name under /data/prc/feed/ — the exam page's slug. */
  slug: string;
  /** Calendar name shown in the subscriber's calendar list. */
  label: string;
  /** PRC_PROFESSIONS group that supplies the exam rows. */
  groupId: string;
  /** Only these exam rows of the group (same override as the exam page). */
  exams?: string[];
  /** Site-relative path of the exam page the events link back to. */
  pagePath: string;
}

export const PRC_FEEDS: PrcFeed[] = [
  {
    slug: 'nursing',
    label: 'PNLE (Nursing Board Exam)',
    groupId: 'nursing',
    pagePath: '/nursing-board-exam-schedule/',
  },
  ...PROFESSION_PAGES.map((p) => ({
    slug: p.slug,
    label: p.examName,
    groupId: p.groupId,
    exams: p.exams,
    pagePath: `/${p.slug}-board-exam-schedule/`,
  })),
];

const YEAR_FILES = import.meta.glob<{ default: PrcRules }>('../data/prc/*.json', { eager: true });

/** Every PRC schedule year on disk (src/data/prc/<yyyy>.json), oldest first. */
export const PRC_YEARS: PrcRules[] = Object.entries(YEAR_FILES)
  .filter(([file]) => /\/\d{4}\.json$/.test(file))
  .map(([, mod]) => mod.default)
  .sort((a, b) => a.year - b.year);

export function feedPath(slug: string): string {
  return `/data/prc/feed/${slug}.ics`;
}

export function findFeed(slug: string): PrcFeed {
  const feed = PRC_FEEDS.find((f) => f.slug === slug);
  if (!feed) throw new Error(`No PRC calendar feed "${slug}" — add it to PRC_FEEDS in src/lib/prcFeeds.ts.`);
  return feed;
}

/** Subscribe links: webcal:// for Apple Calendar / Outlook, and Google Calendar's add-by-URL. */
export function feedLinks(slug: string): { https: string; webcal: string; google: string } {
  const https = `${SITE.url}${feedPath(slug)}`;
  const webcal = https.replace(/^https?:/, 'webcal:');
  return { https, webcal, google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}` };
}

/**
 * The feed's exam rows across every year file, by date. The newest year must
 * resolve in full (a stale matcher fails the build, like the pages do); older
 * years keep whichever exam names still match.
 */
export function feedRows(feed: PrcFeed, years: PrcRules[] = PRC_YEARS): { rules: PrcRules; exam: PrcExamEntry }[] {
  const group = PRC_PROFESSIONS.find((g) => g.id === feed.groupId);
  if (!group) throw new Error(`PRC feed "${feed.slug}" references unknown PRC group "${feed.groupId}".`);
  const names = feed.exams ?? group.exams;
  const latest = years.at(-1)?.year;
  return years
    .flatMap((rules) => {
      const byName = new Map((rules.exams as PrcExamEntry[]).map((e) => [e.exam, e]));
      const rows =
        rules.year === latest
          ? resolveGroup({ ...group, exams: names }, byName, rules.year)
          : names.flatMap((n) => byName.get(n) ?? []);
      return rows.map((exam) => ({ rules, exam }));
    })
    .sort((a, b) => a.exam.first_date.localeCompare(b.exam.first_date));
}

const pct = (passers: number, examinees: number): string => ((passers / examinees) * 100).toFixed(2);

function allDay(date: string): Record<string, string> {
  return { 'DTSTART;VALUE=DATE': icsDate(date), 'DTEND;VALUE=DATE': icsDate(nextDay(date)) };
}

/** The subscribable VCALENDAR for one feed. */
export function feedIcs(feed: PrcFeed, rows = feedRows(feed)): string {
  const pageUrl = `${SITE.url}${feed.pagePath}`;
  const events = rows.flatMap(({ rules, exam }) => {
    const slug = examSlug(exam.exam);
    const stamp = `${icsDate(rules.meta.last_verified)}T000000Z`;
    const source = `Source: ${rules.meta.rule_version}. Dates can move by PRC advisory — verify on prc.gov.ph.`;
    const out: string[] = [];
    if (exam.application_deadline) {
      out.push(
        vevent({
          UID: `${slug}-${rules.year}-deadline@aytool.com`,
          DTSTAMP: stamp,
          ...allDay(exam.application_deadline),
          SUMMARY: esc(`Filing deadline: ${exam.exam} board exam`),
          DESCRIPTION: esc(
            `Last day to file through LERIS (online.prc.gov.ph) for the ${exam.exam} licensure examination on ${exam.dates_display}. ${source}`,
          ),
          URL: pageUrl,
        }),
      );
    }
    out.push(
      vevent({
        UID: `${slug}-${rules.year}-exam@aytool.com`,
        DTSTAMP: stamp,
        ...allDay(exam.first_date),
        SUMMARY: esc(`${exam.exam} board exam — ${exam.dates_display}`),
        DESCRIPTION: esc(
          `${exam.exam} licensure examination, ${exam.dates_display}${exam.note ? ` (${exam.note})` : ''}. ${source}`,
        ),
        URL: pageUrl,
      }),
    );
    const resultsDay = exam.results_released ?? exam.results_target;
    if (resultsDay) {
      const detail = exam.results_released
        ? exam.passers && exam.examinees
          ? `PRC released the results: ${exam.passers.toLocaleString('en-PH')} of ${exam.examinees.toLocaleString('en-PH')} passed (${pct(exam.passers, exam.examinees)}%).`
          : 'PRC released the results.'
        : "PRC's target release date for the results; the actual release is announced on prc.gov.ph.";
      out.push(
        vevent({
          UID: `${slug}-${rules.year}-results@aytool.com`,
          DTSTAMP: stamp,
          ...allDay(resultsDay),
          SUMMARY: esc(
            exam.results_released ? `${exam.exam} results released` : `${exam.exam} results (PRC target date)`,
          ),
          DESCRIPTION: esc(`${detail} ${source}`),
          URL: pageUrl,
        }),
      );
    }
    return out;
  });

  return (
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AyTool//PRC exam calendar feed//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      fold(`X-WR-CALNAME:${esc(`${feed.label} — PRC dates`)}`),
      fold(
        `X-WR-CALDESC:${esc(`Filing deadlines, exam days and results dates from PRC's schedule of examination, kept up to date by AyTool (${pageUrl}). Next year's dates are added when PRC publishes them.`)}`,
      ),
      'X-WR-TIMEZONE:Asia/Manila',
      'REFRESH-INTERVAL;VALUE=DURATION:P1D',
      'X-PUBLISHED-TTL:P1D',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n') + '\r\n'
  );
}
