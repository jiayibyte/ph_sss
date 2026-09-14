/**
 * Year-over-year holiday helpers for the /philippine-holidays/ page. Pure and
 * data-driven like longWeekends.ts: the page feeds in whichever holidays JSON
 * files exist, so a new year's proclamation is a new JSON file, not new copy.
 */
import type { HolidayEntry, HolidayRules, HolidayType } from './rules/types';

export const TYPE_LABEL: Record<HolidayType, string> = {
  regular: 'Regular Holiday',
  'special-non-working': 'Special (Non-Working) Day',
  'special-working': 'Special (Working) Day',
};

/** Newest year first — the featured year is always the latest proclamation on file. */
export function sortYears(years: HolidayRules[]): HolidayRules[] {
  return [...years].sort((a, b) => b.year - a.year);
}

export function byType(holidays: HolidayEntry[], type: HolidayType): HolidayEntry[] {
  return holidays.filter((h) => h.type === type);
}

const weekday = (date: string): number => new Date(date + 'T00:00:00Z').getUTCDay();

/** Days off (not special-working) that land on a Saturday or Sunday. */
export function weekendHolidays(holidays: HolidayEntry[]): HolidayEntry[] {
  return holidays.filter((h) => {
    if (h.type === 'special-working') return false;
    const d = weekday(h.date);
    return d === 0 || d === 6;
  });
}

export interface HolidayDiff {
  /** In the new year but not the previous one. */
  added: HolidayEntry[];
  /** In the previous year but gone from the new one (pending-dated holidays excluded). */
  removed: HolidayEntry[];
  /** Same name, different holiday type. */
  retyped: Array<{ name: string; from: HolidayType; to: HolidayType }>;
  /** Same name and type, different month/day (movable feasts, last-Monday rules, lunar dates). */
  moved: Array<{ name: string; from: string; to: string }>;
}

/** Holidays are matched across years by name, case-insensitively. */
const key = (name: string): string => name.trim().toLowerCase();

/** Month-day part of an ISO date, so a fixed-date holiday never counts as "moved". */
const monthDay = (date: string): string => date.slice(5);

/**
 * What changed between two proclamations, matched by holiday name. Holidays
 * listed under `next.pending` (declared, date to follow) are not "removed".
 */
export function holidayDiff(prev: HolidayRules, next: HolidayRules): HolidayDiff {
  const prevByName = new Map(prev.holidays.map((h) => [key(h.name), h]));
  const nextByName = new Map(next.holidays.map((h) => [key(h.name), h]));
  const pending = new Set((next.pending ?? []).map((p) => key(p.name)));

  const diff: HolidayDiff = { added: [], removed: [], retyped: [], moved: [] };
  for (const h of next.holidays) {
    const before = prevByName.get(key(h.name));
    if (!before) diff.added.push(h);
    else if (before.type !== h.type) diff.retyped.push({ name: h.name, from: before.type, to: h.type });
    else if (monthDay(before.date) !== monthDay(h.date)) diff.moved.push({ name: h.name, from: before.date, to: h.date });
  }
  for (const h of prev.holidays) {
    if (!nextByName.has(key(h.name)) && !pending.has(key(h.name))) diff.removed.push(h);
  }
  return diff;
}
