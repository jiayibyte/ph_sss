import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import type { DayType, LaborRules } from '../lib/rules/types';
import { computeNightDiff } from '../lib/engine/labor';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
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

const HOURS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { value: String(h + (i % 2) * 0.5), label: `${h12}:${m} ${ampm}` };
});

export default function NightDiffCalculator() {
  const [rateRaw, setRateRaw] = useState('');
  const [start, setStart] = useState('22');
  const [end, setEnd] = useState('6');
  const [dayType, setDayType] = useState<DayType>('ordinary');
  const [isOT, setIsOT] = useState<'no' | 'yes'>('no');

  const [rate, rateError] = useAmount(rateRaw, 'Hourly rate');
  const result =
    rate !== null && rate > 0
      ? computeNightDiff(rate, Number(start), Number(end), dayType, isOT === 'yes', labor)
      : null;
  if (result) trackCalculatorUse('night-differential');

  const rows = result
    ? [
        { label: 'Shift length', value: `${result.shiftHours} h` },
        {
          label: 'Night hours (10:00 PM – 6:00 AM)',
          value: `${result.nightHours} h`,
          strong: true,
        },
        { label: 'Applicable hourly rate', value: peso(result.premiumHourly) },
        { label: 'Base pay for the shift', value: peso(result.basePay) },
        {
          label: `Night differential (10% × ${result.nightHours} night h)`,
          value: peso(result.nightDiff),
          strong: true,
        },
        { label: 'Total estimated pay', value: peso(result.total), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="Night Differential Calculator">
      <CurrencyInput
        id="nd-rate"
        label="Hourly rate"
        value={rateRaw}
        onChange={setRateRaw}
        error={rateError}
        hint="Daily rate ÷ 8 if you are paid daily."
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <SelectField id="nd-start" label="Shift start" options={HOURS} value={start} onChange={setStart} />
        </div>
        <div class="sm:flex-1">
          <SelectField id="nd-end" label="Shift end" options={HOURS} value={end} onChange={setEnd} />
        </div>
      </div>
      <SelectField
        id="nd-daytype"
        label="Day type"
        options={DAY_OPTIONS}
        value={dayType}
        onChange={setDayType}
      />
      <Tabs
        label="Are these overtime hours?"
        options={[
          { value: 'no', label: 'Regular shift' },
          { value: 'yes', label: 'Overtime' },
        ]}
        value={isOT}
        onChange={setIsOT}
      />
      {result && (
        <ResultCard
          headline="Estimated pay with night differential"
          amount={peso(result.total)}
          amountNote={
            result.nightHours === 0
              ? 'No part of this shift falls between 10:00 PM and 6:00 AM, so no night differential applies.'
              : undefined
          }
          rows={rows}
          meta={labor.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => setRateRaw('')}
        />
      )}
    </CalculatorShell>
  );
}
