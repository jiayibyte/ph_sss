/**
 * Long weekends derived from a year's holiday list: runs of consecutive days
 * off (Saturday, Sunday, or any holiday that is not a "special working" day)
 * that contain at least one holiday. Pure and data-driven — next year's
 * holidays JSON produces next year's list with no copy changes.
 */

export interface HolidayLike {
  date: string; // YYYY-MM-DD
  name: string;
  type: string; // 'regular' | 'special-non-working' | 'special-working'
}

export interface LongWeekend {
  start: string;
  end: string;
  days: number;
  holidays: HolidayLike[];
}

const DAY_MS = 86_400_000;
const iso = (t: number): string => new Date(t).toISOString().slice(0, 10);
const isWeekend = (t: number): boolean => {
  const d = new Date(t).getUTCDay();
  return d === 0 || d === 6;
};

export function longWeekends(holidays: HolidayLike[], minDays = 3): LongWeekend[] {
  const dayOff = new Map<string, HolidayLike>();
  for (const h of holidays) {
    if (h.type !== 'special-working') dayOff.set(h.date, h);
  }
  if (holidays.length === 0) return [];

  const year = Number(holidays[0].date.slice(0, 4));
  const first = Date.UTC(year, 0, 1);
  const last = Date.UTC(year, 11, 31);

  const out: LongWeekend[] = [];
  let run: string[] = [];
  const flush = () => {
    const hs = run.map((d) => dayOff.get(d)).filter((h): h is HolidayLike => h !== undefined);
    if (run.length >= minDays && hs.length > 0) {
      out.push({ start: run[0], end: run[run.length - 1], days: run.length, holidays: hs });
    }
    run = [];
  };

  for (let t = first; t <= last; t += DAY_MS) {
    const d = iso(t);
    if (isWeekend(t) || dayOff.has(d)) run.push(d);
    else flush();
  }
  flush();
  return out;
}
