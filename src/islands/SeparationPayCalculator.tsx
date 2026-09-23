import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import type { LaborRules } from '../lib/rules/types';
import { computeSeparationPay, type SeparationCause } from '../lib/engine/terminalPay';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const labor = laborJson as unknown as LaborRules;
const SP = labor.separation_pay;
const CAUSES = [
  ...SP.one_month_causes.map((c, i) => ({ value: `one-${i}`, label: `${c} — one month per year`, cause: 'one-month' as SeparationCause })),
  ...SP.half_month_causes.map((c, i) => ({ value: `half-${i}`, label: `${c} — half month per year`, cause: 'half-month' as SeparationCause })),
];
const numInput = 'w-full rounded-lg border border-line px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent';

export default function SeparationPayCalculator() {
  const [payRaw, setPayRaw] = useState('');
  const [yearsRaw, setYearsRaw] = useState('');
  const [monthsRaw, setMonthsRaw] = useState('0');
  const [causeId, setCauseId] = useState(CAUSES[0]!.value);
  const [pay, payError] = useAmount(payRaw, 'Monthly pay');
  const years = Number(yearsRaw);
  const months = Number(monthsRaw || '0');
  const cause = CAUSES.find((c) => c.value === causeId) ?? CAUSES[0]!;
  const valid = pay !== null && pay > 0 && yearsRaw !== '' && Number.isInteger(years) && years >= 0 && Number.isInteger(months) && months >= 0 && months <= 11;
  const result = valid ? computeSeparationPay({ monthlyPay: pay!, years, extraMonths: months, cause: cause.cause }, labor) : null;
  if (result) trackCalculatorUse('separation-pay');
  const rows = result
    ? [
        { label: 'Latest monthly pay (basic + regular allowances)', value: peso(pay!) },
        { label: `Years of service credited (${years}y ${months}m; ≥${SP.fraction_months_counted_as_year} months rounds up)`, value: String(result.creditedYears) },
        { label: `× ${result.monthsPerYear === 1 ? 'one month' : 'half month'} per year`, value: peso(result.computed) },
        ...(result.minimumApplied ? [{ label: `Minimum of ${SP.min_months} month's pay applied`, value: peso(result.minimum) }] : []),
        { label: 'Separation pay', value: peso(result.separationPay), strong: true },
      ]
    : [];
  return (
    <CalculatorShell title="Separation Pay Calculator">
      <SelectField id="sep-cause" label="Authorized cause of termination" options={CAUSES.map((c) => ({ value: c.value, label: c.label }))} value={causeId} onChange={setCauseId} />
      <CurrencyInput id="sep-pay" label="Latest monthly pay" value={payRaw} onChange={setPayRaw} error={payError} hint="Basic salary plus the regular allowances you receive (DOLE Handbook, Ch. 14-D)." />
      <div class="sm:flex sm:gap-4">
        <div class="mb-3 sm:flex-1">
          <label htmlFor="sep-years" class="mb-1 block text-sm font-medium text-ink">Years of service</label>
          <input id="sep-years" type="text" inputMode="numeric" class={numInput} placeholder="e.g. 7" value={yearsRaw} onInput={(e) => setYearsRaw((e.target as HTMLInputElement).value.trim())} />
        </div>
        <div class="mb-3 sm:w-44">
          <label htmlFor="sep-months" class="mb-1 block text-sm font-medium text-ink">Extra months</label>
          <input id="sep-months" type="text" inputMode="numeric" class={numInput} value={monthsRaw} onInput={(e) => setMonthsRaw((e.target as HTMLInputElement).value.trim())} />
          <p class="mt-1 text-xs text-ink-soft">{SP.fraction_months_counted_as_year} or more counts as a full year.</p>
        </div>
      </div>
      {result && (
        <ResultCard
          headline="Estimated separation pay"
          amount={peso(result.separationPay)}
          amountNote={`${result.monthsPerYear === 1 ? 'One month' : 'Half a month'} of pay for each of ${result.creditedYears} credited year${result.creditedYears === 1 ? '' : 's'}, never below one month's pay. Exempt from income tax when the separation is for a cause beyond your control (NIRC Sec. 32(B)(6)(b)).`}
          rows={rows}
          meta={labor.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => { setPayRaw(''); setYearsRaw(''); setMonthsRaw('0'); }}
        />
      )}
    </CalculatorShell>
  );
}
