import { describe, expect, it } from 'vitest';
import h2026 from '../data/holidays/2026.json';
import h2027 from '../data/holidays/2027.json';
import type { HolidayRules } from './rules/types';
import { byType, holidayDiff, sortYears, weekendHolidays } from './holidays';

const YEARS = [h2026, h2027] as unknown as HolidayRules[];
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = ['regular', 'special-non-working', 'special-working'];
const dow = (d: string) => new Date(d + 'T00:00:00Z').getUTCDay(); // 0 = Sun … 6 = Sat

describe('holidays JSON integrity', () => {
  for (const y of YEARS) {
    describe(`${y.year}`, () => {
      it('has meta and a proclamation block', () => {
        expect(y.meta.last_verified).toMatch(ISO);
        expect(y.meta.effective_from).toBe(`${y.year}-01-01`);
        expect(y.meta.effective_to).toBe(`${y.year}-12-31`);
        expect(y.meta.official_source_url).toMatch(/^https:\/\/pco\.gov\.ph\/issuances\/proclamation-no-\d+/);
        expect(y.proclamation?.number).toBeGreaterThan(0);
        expect(y.proclamation?.series).toBe(y.year - 1);
        expect(y.proclamation?.signed).toMatch(ISO);
        expect(y.proclamation!.signed < y.meta.effective_from).toBe(true);
      });

      it('lists valid, sorted, unique dates inside the year with known types', () => {
        const dates = y.holidays.map((h) => h.date);
        for (const h of y.holidays) {
          expect(h.date).toMatch(ISO);
          expect(h.date.startsWith(`${y.year}-`)).toBe(true);
          expect(TYPES).toContain(h.type);
          expect(h.name.length).toBeGreaterThan(3);
        }
        expect(dates).toEqual([...dates].sort());
        expect(new Set(dates).size).toBe(dates.length);
      });

      it('has the fixed-date holidays on their statutory dates', () => {
        const on = (name: string) => y.holidays.find((h) => h.name === name)?.date.slice(5);
        expect(on("New Year's Day")).toBe('01-01');
        expect(on('Labor Day')).toBe('05-01');
        expect(on('Independence Day')).toBe('06-12');
        expect(on('Bonifacio Day')).toBe('11-30');
        expect(on('Christmas Day')).toBe('12-25');
        expect(on('Rizal Day')).toBe('12-30');
        expect(on('Ninoy Aquino Day')).toBe('08-21');
        expect(on("All Saints' Day")).toBe('11-01');
        expect(on('Feast of the Immaculate Conception of Mary')).toBe('12-08');
        expect(on('Last Day of the Year')).toBe('12-31');
      });

      it('has the movable holidays on the right weekdays', () => {
        const date = (name: string) => y.holidays.find((h) => h.name === name)!.date;
        expect(dow(date('Maundy Thursday'))).toBe(4);
        expect(dow(date('Good Friday'))).toBe(5);
        expect(dow(date('Black Saturday'))).toBe(6);
        // National Heroes Day = last Monday of August
        const heroes = date('National Heroes Day');
        expect(dow(heroes)).toBe(1);
        expect(heroes.startsWith(`${y.year}-08-`)).toBe(true);
        expect(Number(heroes.slice(8)) + 7).toBeGreaterThan(31);
      });

      it('keeps pending holidays out of the dated list', () => {
        const dated = new Set(y.holidays.map((h) => h.name));
        for (const p of y.pending ?? []) {
          expect(dated.has(p.name)).toBe(false);
          expect(TYPES).toContain(p.type);
          expect(p.note.length).toBeGreaterThan(10);
        }
      });
    });
  }
});

describe('2027 (Proclamation No. 1427)', () => {
  it('matches the proclamation counts: 10 regular, 8 special non-working, 1 special working, 2 Eid pending', () => {
    expect(h2027.proclamation).toEqual({ number: 1427, series: 2026, signed: '2026-09-08' });
    expect(byType(h2027.holidays as HolidayRules['holidays'], 'regular')).toHaveLength(10);
    expect(byType(h2027.holidays as HolidayRules['holidays'], 'special-non-working')).toHaveLength(8);
    expect(byType(h2027.holidays as HolidayRules['holidays'], 'special-working')).toHaveLength(1);
    expect(h2027.pending.map((p) => p.name)).toEqual([
      "Eid'l Fitr (Feast of Ramadhan)",
      "Eid'l Adha (Feast of Sacrifice)",
    ]);
  });

  it('puts six days off on a weekend', () => {
    expect(weekendHolidays(h2027.holidays as HolidayRules['holidays']).map((h) => h.date)).toEqual([
      '2027-02-06', // Chinese New Year, Sat
      '2027-03-27', // Black Saturday
      '2027-05-01', // Labor Day, Sat
      '2027-06-12', // Independence Day, Sat
      '2027-08-21', // Ninoy Aquino Day, Sat
      '2027-12-25', // Christmas Day, Sat
    ]);
  });
});

describe('holidayDiff', () => {
  it('2026 → 2027: same set, only movable dates shift; pending Eid is not "removed"', () => {
    const d = holidayDiff(h2026 as unknown as HolidayRules, h2027 as unknown as HolidayRules);
    expect(d.added).toEqual([]);
    expect(d.removed).toEqual([]);
    expect(d.retyped).toEqual([]);
    expect(d.moved.map((m) => [m.name, m.from, m.to])).toEqual([
      ['Chinese New Year', '2026-02-17', '2027-02-06'],
      ['Maundy Thursday', '2026-04-02', '2027-03-25'],
      ['Good Friday', '2026-04-03', '2027-03-26'],
      ['Black Saturday', '2026-04-04', '2027-03-27'],
      ['National Heroes Day', '2026-08-31', '2027-08-30'],
    ]);
  });

  it('reports additions, removals and reclassifications by name', () => {
    const prev: HolidayRules = {
      meta: h2026.meta,
      year: 2030,
      holidays: [
        { date: '2030-01-01', name: "New Year's Day", type: 'regular' },
        { date: '2030-02-25', name: 'EDSA', type: 'special-working' },
        { date: '2030-11-02', name: "All Souls' Day", type: 'special-non-working' },
      ],
    };
    const next: HolidayRules = {
      meta: h2026.meta,
      year: 2031,
      holidays: [
        { date: '2031-01-01', name: "New Year's Day", type: 'regular' },
        { date: '2031-02-25', name: 'EDSA', type: 'special-non-working' },
        { date: '2031-09-03', name: 'Yamashita Surrender Day', type: 'special-non-working' },
      ],
    };
    const d = holidayDiff(prev, next);
    expect(d.added.map((h) => h.name)).toEqual(['Yamashita Surrender Day']);
    expect(d.removed.map((h) => h.name)).toEqual(["All Souls' Day"]);
    expect(d.retyped).toEqual([{ name: 'EDSA', from: 'special-working', to: 'special-non-working' }]);
    expect(d.moved).toEqual([]);
  });
});

describe('sortYears', () => {
  it('puts the newest proclamation first', () => {
    expect(sortYears(YEARS).map((y) => y.year)).toEqual([2027, 2026]);
  });
});
