import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import type { DayType, LaborRules } from '../lib/rules/types';
import { computeOvertime } from '../lib/engine/labor';
import { peso, round2 } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const labor = laborJson as unknown as LaborRules;

const DAY_OPTIONS: Array<{ value: DayType; label: string }> = [
  { value: 'ordinary', label: 'Ordinary Day' },
  { value: 'rest-day', label: 'Rest Day' },
  { value: 'special', label: 'Special (Non-Working) Day' },
  { value: 'special-rest-day', label: 'Special Day + Rest Day' },
  { value: 'regular-holiday', label: 'Regular Holiday' },
  { value: 'regular-holiday-rest-day', label: 'Regular Holiday + Rest Day' },
];

type Basis = 'hourly' | 'daily' | 'monthly';

export default function OvertimeCalculator() {
  const [basis, setBasis] = useState<Basis>('hourly');
  const [amountRaw, setAmountRaw] = useState('');
  const [otHoursRaw, setOtHoursRaw] = useState('2');
  const [nightHoursRaw, setNightHoursRaw] = useState('0');
  const [dayType, setDayType] = useState<DayType>('ordinary');

  const [amount, amountError] = useAmount(amountRaw, 'Salary');
  const otHours = Number(otHoursRaw);
  const nightHours = Number(nightHoursRaw);
  const otError =
    otHoursRaw !== '' && (!Number.isFinite(otHours) || otHours < 0 || otHours > 16)
      ? 'OT hours must be between 0 and 16.'
      : null;
  const ndError =
    nightHoursRaw !== '' && (!Number.isFinite(nightHours) || nightHours < 0)
      ? 'Night hours must be 0 or more.'
      : null;

  // Standard conversions: daily rate ÷ 8; monthly → daily via the common
  // 313-day divisor for employees working Mon–Sat, but the widely used
  // payroll formula is (monthly × 12) ÷ 261 for Mon–Fri. We use the DOLE
  // "equivalent daily rate" = monthly × 12 ÷ 313 shown with a note; users
  // who know their exact daily/hourly rate should enter it directly.
  const hourly =
    amount === null
      ? null
      : basis === 'hourly'
        ? amount
        : basis === 'daily'
          ? round2(amount / 8)
          : round2((amount * 12) / 313 / 8);

  const result =
    hourly !== null && hourly > 0 && !otError && !ndError && otHours > 0
      ? computeOvertime(hourly, otHours, dayType, nightHours, labor)
      : null;
  if (result) trackCalculatorUse('overtime-pay');

  const pct = (m: number) => `${Math.round(m * 10000) / 100}%`;
  const rows = result
    ? [
        { label: 'Base hourly rate', value: peso(result.hourlyRate) },
        {
          label: `Applicable OT multiplier (${pct(result.dayMultiplier)} × ${pct(result.otFactor)})`,
          value: pct(result.dayMultiplier * result.otFactor),
        },
        { label: 'OT pay per hour', value: peso(result.otHourly) },
        { label: `OT pay (${result.otHours} h)`, value: peso(result.otPay), strong: true },
        ...(result.nightOtHours > 0
          ? [
              {
                label: `Night differential on OT (${result.nightOtHours} night h × 10%)`,
                value: peso(result.nightDiffOnOt),
              },
            ]
          : []),
        { label: 'Total additional pay', value: peso(result.total), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="Overtime Pay Calculator">
      <SelectField
        id="ot-basis"
        label="I know my..."
        options={[
          { value: 'hourly', label: 'Hourly rate' },
          { value: 'daily', label: 'Daily rate (÷ 8 hours)' },
          { value: 'monthly', label: 'Monthly salary (approximate conversion)' },
        ]}
        value={basis}
        onChange={setBasis}
      />
      <CurrencyInput
        id="ot-amount"
        label={basis === 'hourly' ? 'Hourly rate' : basis === 'daily' ? 'Daily rate' : 'Monthly salary'}
        value={amountRaw}
        onChange={setAmountRaw}
        error={amountError}
        hint={
          basis === 'monthly'
            ? 'Converted using the 313-day factor (Mon–Sat). Enter your exact hourly rate for precise results.'
            : undefined
        }
      />
      <SelectField
        id="ot-daytype"
        label="Day type"
        options={DAY_OPTIONS}
        value={dayType}
        onChange={setDayType}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <label htmlFor="ot-hours" class="mb-1 block text-sm font-medium text-ink">
            Overtime hours (beyond 8)
          </label>
          <input
            id="ot-hours"
            type="text"
            inputMode="decimal"
            class={`w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent ${otError ? 'border-red-500' : 'border-line'}`}
            value={otHoursRaw}
            aria-invalid={otError ? 'true' : undefined}
            onInput={(e) => setOtHoursRaw((e.target as HTMLInputElement).value)}
          />
          {otError && (
            <p class="mt-1 text-xs font-medium text-red-600" role="alert">
              {otError}
            </p>
          )}
        </div>
        <div class="mt-3 sm:mt-0 sm:flex-1">
          <label htmlFor="ot-night" class="mb-1 block text-sm font-medium text-ink">
            Of which, night hours (10PM–6AM)
          </label>
          <input
            id="ot-night"
            type="text"
            inputMode="decimal"
            class={`w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent ${ndError ? 'border-red-500' : 'border-line'}`}
            value={nightHoursRaw}
            aria-invalid={ndError ? 'true' : undefined}
            onInput={(e) => setNightHoursRaw((e.target as HTMLInputElement).value)}
          />
          {ndError && (
            <p class="mt-1 text-xs font-medium text-red-600" role="alert">
              {ndError}
            </p>
          )}
        </div>
      </div>
      {result && (
        <ResultCard
          headline="Estimated overtime pay"
          amount={peso(result.total)}
          rows={rows}
          meta={labor.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => {
            setAmountRaw('');
            setOtHoursRaw('2');
            setNightHoursRaw('0');
          }}
        />
      )}
    </CalculatorShell>
  );
}
