/**
 * PRC exams coming up from the build date — for the "coming up" lines on the PRC
 * hub and the nursing page. Those two pages carry almost all of the exam cluster's
 * Google impressions (GSC 2026-09-28..10-04: nursing 4,783, hub 1,342, every
 * profession page 0), so in-body links from them to the next exams' pages are how
 * Google finds and weighs those pages while their own queries are live.
 */
import type { PrcExamEntry } from './rules/types';
import { PRC_PROFESSIONS, type ProfessionGroup } from './prcProfessions';
import { lastExamDate } from './prcCalendar';
import { PROFESSION_PAGES } from './prcProfessionPages';

/* Only link pages that are actually built: a group can carry an href before its
   PROFESSION_PAGES entry (and route) exists. */
const BUILT = new Set(['/nursing-board-exam-schedule/', ...PROFESSION_PAGES.map((p) => `/${p.slug}-board-exam-schedule/`)]);

export interface UpcomingExam {
  entry: PrcExamEntry;
  /** The profession's nav label ("Pharmacy", "CPA (CPALE)"), else the PRC name without its round marker. */
  label: string;
  /** The profession's own page, when it has one. */
  href?: string;
  /** First day passed, last day not yet (multi-weekend exams such as the PLE). */
  inProgress: boolean;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "Real Estate Consultants (Revalida, 2nd exam)" → "Real Estate Consultants (Revalida)". */
export function examLabel(examName: string): string {
  return examName.replace(/,\s*\d(?:st|nd|rd|th) exam\)/, ')').replace(/\s*\(\d(?:st|nd|rd|th) exam\)/, '');
}

/**
 * Exams not finished by `today` that start within `days`, in date order. A
 * profession with two rows in the window (written + practical) appears once,
 * at its first row.
 */
export function upcomingExams(exams: PrcExamEntry[], today: string, days: number): UpcomingExam[] {
  const groupOf = new Map<string, ProfessionGroup>();
  for (const g of PRC_PROFESSIONS) for (const name of g.exams) groupOf.set(name, g);
  const horizon = addDays(today, days);
  const seen = new Set<string>();
  const out: UpcomingExam[] = [];
  for (const entry of [...exams].sort((a, b) => a.first_date.localeCompare(b.first_date))) {
    if (lastExamDate(entry) < today || entry.first_date > horizon) continue;
    const group = groupOf.get(entry.exam);
    const key = group?.id ?? entry.exam;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      entry,
      label: group?.navLabel ?? examLabel(entry.exam),
      href: group?.href && BUILT.has(group.href) ? group.href : undefined,
      inProgress: entry.first_date < today,
    });
  }
  return out;
}
