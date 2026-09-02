import { describe, expect, it } from 'vitest';
import holidaysJson from '../data/holidays/2026.json';
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
});
