import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import type { DayType, LaborRules } from '../lib/rules/types';
import { computeHolidayPay } from '../lib/engine/labor';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const labor = laborJson as unknown as LaborRules;

const DAY_OPTIONS: Array<{ value: DayType; label: string }> = [
  { value: 'regular-holiday', label: 'Regular Holiday' },
  { value: 'regular-holiday-rest-day', label: 'Regular Holiday + Rest Day' },
  { value: 'special', label: 'Special (Non-Working) Day' },
  { value: 'special-rest-day', label: 'Special Day + Rest Day' },
];

export default function HolidayPayCalculator() {
  const [dayType, setDayType] = useState<DayType>('regular-holiday');
  const [worked, setWorked] = useState<'yes' | 'no'>('yes');
  const [rateRaw, setRateRaw] = useState('');
  const [hoursRaw, setHoursRaw] = useState('8');

  const [rate, rateError] = useAmount(rateRaw, 'Hourly rate');
  const hours = Number(hoursRaw);
  const hoursError =
    hoursRaw !== '' && (!Number.isFinite(hours) || hours < 0 || hours > 24)
      ? 'Hours must be between 0 and 24.'
      : null;

  const result =
    rate !== null && rate > 0 && !hoursError
      ? computeHolidayPay(dayType, worked === 'yes', rate, worked === 'yes' ? hours || 0 : 0, labor)
      : null;
  if (result) trackCalculatorUse('holiday-pay');

  const pct = (m: number) => `${Math.round(m * 100)}%`;
  const rows = result
    ? [
        { label: 'Hourly rate', value: peso(result.hourlyRate) },
        { label: 'Day type multiplier', value: pct(result.multiplier) },
        ...(result.worked
          ? [
              {
                label: `Pay for first ${result.baseHours} hour${result.baseHours === 1 ? '' : 's'}`,
                value: peso(result.basePay),
              },
              ...(result.otHours > 0
                ? [
                    {
                      label: `Overtime (${result.otHours}h × ${pct(result.otMultiplier)})`,
                      value: peso(result.otPay),
                    },
                  ]
                : []),
            ]
          : [{ label: 'Unworked holiday pay (8h × 100%)', value: peso(result.basePay) }]),
        { label: 'Total estimated pay for the day', value: peso(result.total), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="Holiday Pay Calculator">
      <SelectField
        id="hp-daytype"
        label="Holiday / day type"
        options={DAY_OPTIONS}
        value={dayType}
        onChange={setDayType}
      />
      <Tabs
        label="Did you work on this day?"
        options={[
          { value: 'yes', label: 'Worked' },
          { value: 'no', label: 'Did not work' },
        ]}
        value={worked}
        onChange={setWorked}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="hp-rate"
            label="Hourly rate"
            value={rateRaw}
            onChange={setRateRaw}
            error={rateError}
            hint="Daily rate ÷ 8 if you are paid daily."
          />
        </div>
        {worked === 'yes' && (
          <div class="sm:w-44">
            <label htmlFor="hp-hours" class="mb-1 block text-sm font-medium text-ink">
              Hours worked
            </label>
            <input
              id="hp-hours"
              type="text"
              inputMode="decimal"
              class={`w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent ${hoursError ? 'border-red-500' : 'border-line'}`}
              value={hoursRaw}
              aria-invalid={hoursError ? 'true' : undefined}
              onInput={(e) => setHoursRaw((e.target as HTMLInputElement).value)}
            />
            {hoursError && (
              <p class="mt-1 text-xs font-medium text-red-600" role="alert">
                {hoursError}
              </p>
            )}
          </div>
        )}
      </div>
      {result && (
        <ResultCard
          headline="Estimated pay for the day"
          amount={peso(result.total)}
          amountNote={
            !result.worked && result.total === 0
              ? 'Special days follow "no work, no pay" unless a company policy or CBA says otherwise.'
              : undefined
          }
          rows={rows}
          meta={labor.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => {
            setRateRaw('');
            setHoursRaw('8');
          }}
        />
      )}
    </CalculatorShell>
  );
}
