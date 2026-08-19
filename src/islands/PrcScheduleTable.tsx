import { useMemo, useState } from 'preact/hooks';
import prcJson from '../data/prc/2026.json';
import type { PrcRules } from '../lib/rules/types';
import { trackCalculatorUse } from './shared/track';

const prc = prcJson as unknown as PrcRules;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PrcScheduleTable() {
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState('all');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = prc.exams;
    if (q !== '') {
      rows = rows.filter((e) => e.exam.toLowerCase().includes(q));
      trackCalculatorUse('prc-schedule-search');
    }
    if (month !== 'all') {
      rows = rows.filter((e) => new Date(e.first_date + 'T00:00:00').getMonth() === Number(month));
    }
    return [...rows].sort((a, b) =>
      sortAsc ? a.first_date.localeCompare(b.first_date) : b.first_date.localeCompare(a.first_date),
    );
  }, [query, month, sortAsc]);

  return (
    <div>
      <div class="flex flex-wrap items-end gap-3">
        <div class="min-w-48 flex-1">
          <label htmlFor="prc-search" class="mb-1 block text-sm font-medium text-ink">
            Search exam / profession
          </label>
          <input
            id="prc-search"
            type="search"
            placeholder="e.g. Nursing, Civil Engineer, LET…"
            class="w-full rounded-lg border border-line px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
        </div>
        <div>
          <label htmlFor="prc-month" class="mb-1 block text-sm font-medium text-ink">
            Month
          </label>
          <select
            id="prc-month"
            class="rounded-lg border border-line bg-surface px-3 py-2.5 text-base outline-none focus:border-accent"
            value={month}
            onChange={(e) => setMonth((e.target as HTMLSelectElement).value)}
          >
            <option value="all">All months</option>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={String(i)}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          class="rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink-soft hover:border-accent hover:text-accent-strong"
          onClick={() => setSortAsc(!sortAsc)}
          aria-label="Toggle sort order by exam date"
        >
          Date {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      <p class="mt-3 text-sm text-ink-soft" role="status">
        {filtered.length} of {prc.exams.length} scheduled examinations shown.
      </p>

      <div class="table-scroll mt-2">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-left">Examination</th>
              <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-left">Exam Date(s)</th>
              <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-left">Filing Opens</th>
              <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-left">Deadline</th>
              <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-left">
                Results (target)
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={`${e.exam}-${e.first_date}`} class="odd:bg-surface even:bg-surface-soft">
                <td class="border-b border-line px-2 py-1.5 font-medium">
                  {e.exam}
                  {e.note && <span class="ml-1 text-xs font-normal text-ink-soft">({e.note})</span>}
                </td>
                <td class="border-b border-line px-2 py-1.5 whitespace-nowrap">{e.dates_display}</td>
                <td class="border-b border-line px-2 py-1.5 whitespace-nowrap">
                  {fmtDate(e.application_start)}
                </td>
                <td class="border-b border-line px-2 py-1.5 whitespace-nowrap">
                  {fmtDate(e.application_deadline)}
                </td>
                <td class="border-b border-line px-2 py-1.5 whitespace-nowrap">
                  {fmtDate(e.results_target)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
