import { describe, expect, it } from 'vitest';
import holidaysJson from '../data/holidays/2026.json';
import holidays2027 from '../data/holidays/2027.json';
import { longWeekends } from './longWeekends';

describe('longWeekends', () => {
  it('joins holidays with adjacent weekends and ignores special working days', () => {
    const list = [
      { date: '2026-02-25', name: 'EDSA', type: 'special-working' }, // Wed — never a day off
      { date: '2026-04-02', name: 'Maundy Thursday', type: 'regular' },
      { date: '2026-04-03', name: 'Good Friday', type: 'regular' },
      { date: '2026-04-04', name: 'Black Saturday', type: 'special-non-working' },
      { date: '2026-06-12', name: 'Independence Day', type: 'regular' }, // Fri
      { date: '2026-02-17', name: 'Chinese New Year', type: 'special-non-working' }, // Tue — isolated
    ];
    const lw = longWeekends(list);
    expect(lw.map((w) => [w.start, w.end, w.days])).toEqual([
      ['2026-04-02', '2026-04-05', 4],
      ['2026-06-12', '2026-06-14', 3],
    ]);
    expect(lw[0].holidays.map((h) => h.name)).toEqual([
      'Maundy Thursday',
      'Good Friday',
      'Black Saturday',
    ]);
  });

  it('never emits a plain weekend without a holiday', () => {
    for (const w of longWeekends(holidaysJson.holidays)) {
      expect(w.holidays.length).toBeGreaterThan(0);
      expect(w.days).toBeGreaterThanOrEqual(3);
    }
  });

  it('finds Holy Week and Undas in the official 2026 list', () => {
    const starts = longWeekends(holidaysJson.holidays).map((w) => w.start);
    expect(starts).toContain('2026-04-02'); // Holy Week
    expect(starts).toContain('2026-10-31'); // Undas (Sat 31 → Mon Nov 2)
    expect(starts).toContain('2026-12-24'); // Christmas (Thu 24 → Sun 27)
  });

  it('derives the six 2027 long weekends from Proclamation No. 1427', () => {
    expect(longWeekends(holidays2027.holidays).map((w) => [w.start, w.end, w.days])).toEqual([
      ['2027-01-01', '2027-01-03', 3], // New Year (Fri → Sun)
      ['2027-03-25', '2027-03-28', 4], // Holy Week (Maundy Thu → Easter Sun)
      ['2027-04-09', '2027-04-11', 3], // Araw ng Kagitingan (Fri → Sun)
      ['2027-08-28', '2027-08-30', 3], // National Heroes Day (Sat → Mon)
      ['2027-10-30', '2027-11-02', 4], // Undas (Sat → Tue)
      ['2027-12-24', '2027-12-26', 3], // Christmas (Fri → Sun)
    ]);
  });
});
