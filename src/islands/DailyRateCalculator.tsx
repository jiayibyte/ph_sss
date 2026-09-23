import { useState } from 'preact/hooks';
import wagesJson from '../data/wages/2026.json';
import type { WageRules } from '../lib/rules/types';
import { dailyEquivalent, hourlyFromDaily, monthlyEquivalent } from '../lib/engine/wages';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const wages = wagesJson as unknown as WageRules;
type Basis = 'monthly' | 'daily' | 'hourly';
const DIVISORS = wages.divisors.options.map((d) => ({ value: d.id, label: `${d.factor} — ${d.label}` }));
const numInput = 'w-full rounded-lg border border-line px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent';

export default function DailyRateCalculator() {
  const [basis, setBasis] = useState<Basis>('monthly');
  const [raw, setRaw] = useState('');
  const [divisorId, setDivisorId] = useState('313');
  const [hoursRaw, setHoursRaw] = useState('8');
  const [amount, error] = useAmount(raw, 'Amount');
  const divisor = wages.divisors.options.find((d) => d.id === divisorId) ?? wages.divisors.options[0]!;
  const hours = Number(hoursRaw);
  const hoursOk = Number.isFinite(hours) && hours > 0 && hours <= 24;
  let daily: number | null = null;
  if (amount !== null && amount > 0 && hoursOk) {
    daily = basis === 'daily' ? amount : basis === 'hourly' ? Math.round(amount * hours * 100) / 100 : dailyEquivalent(amount, divisor.factor);
  }
  const monthly = daily !== null ? monthlyEquivalent(daily, divisor.factor) : null;
  const hourly = daily !== null ? hourlyFromDaily(daily, hours) : null;
  if (daily !== null) trackCalculatorUse('daily-rate');
  const rows = daily !== null
    ? [
        { label: `Monthly (daily × ${divisor.factor} ÷ 12)`, value: peso(monthly!), strong: basis !== 'monthly' },
        { label: 'Daily', value: peso(daily), strong: basis !== 'daily' },
        { label: `Hourly (daily ÷ ${hours} hours)`, value: peso(hourly!), strong: basis !== 'hourly' },
        { label: 'Overtime hour at 125% (ordinary day)', value: peso(Math.round(hourly! * 1.25 * 100) / 100) },
        { label: 'Night differential hour at 110%', value: peso(Math.round(hourly! * 1.1 * 100) / 100) },
      ]
    : [];
  return (
    <CalculatorShell title="Daily Rate & Hourly Rate Calculator">
      <Tabs label="I know my" options={[{ value: 'monthly', label: 'Monthly salary' }, { value: 'daily', label: 'Daily rate' }, { value: 'hourly', label: 'Hourly rate' }]} value={basis} onChange={setBasis} />
      <CurrencyInput id="rate-amount" label={basis === 'monthly' ? 'Monthly basic salary' : basis === 'daily' ? 'Daily rate' : 'Hourly rate'} value={raw} onChange={setRaw} error={error} />
      <SelectField id="rate-divisor" label="Days paid per year (DOLE factor)" options={DIVISORS} value={divisorId} onChange={setDivisorId} />
      <div class="mb-3 sm:w-52">
        <label htmlFor="rate-hours" class="mb-1 block text-sm font-medium text-ink">Normal hours per day</label>
        <input id="rate-hours" type="text" inputMode="decimal" class={numInput} value={hoursRaw} onInput={(e) => setHoursRaw((e.target as HTMLInputElement).value.trim())} />
        {!hoursOk && <p class="mt-1 text-xs font-medium text-red-600" role="alert">Enter hours between 1 and 24.</p>}
      </div>
      {daily !== null && (
        <ResultCard
          headline={`Equivalent ${basis === 'monthly' ? 'daily rate' : basis === 'daily' ? 'monthly salary' : 'daily rate'}`}
          amount={peso(basis === 'daily' ? monthly! : daily)}
          amountNote={`Factor ${divisor.factor}: ${divisor.breakdown}. Change the factor if your rest days or special days are paid differently.`}
          rows={rows}
          meta={wages.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => { setRaw(''); setHoursRaw('8'); }}
        />
      )}
    </CalculatorShell>
  );
}
