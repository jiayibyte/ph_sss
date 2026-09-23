import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import wagesJson from '../data/wages/2026.json';
import type { LaborRules, WageRules } from '../lib/rules/types';
import { computeRetirementPay } from '../lib/engine/terminalPay';
import { dailyEquivalent } from '../lib/engine/wages';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const labor = laborJson as unknown as LaborRules;
const wages = wagesJson as unknown as WageRules;
const RP = labor.retirement_pay;
type Basis = 'daily' | 'monthly';
const DIVISORS = wages.divisors.options.filter((d) => ['365', '313', '261'].includes(d.id)).map((d) => ({ value: d.id, label: `${d.factor} — ${d.label}` }));
const numInput = 'w-full rounded-lg border border-line px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent';

export default function RetirementPayCalculator() {
  const [basis, setBasis] = useState<Basis>('monthly');
  const [payRaw, setPayRaw] = useState('');
  const [divisorId, setDivisorId] = useState('313');
  const [yearsRaw, setYearsRaw] = useState('');
  const [monthsRaw, setMonthsRaw] = useState('0');
  const [ageRaw, setAgeRaw] = useState('');
  const [pay, payError] = useAmount(payRaw, basis === 'daily' ? 'Daily rate' : 'Monthly salary');
  const factor = wages.divisors.options.find((d) => d.id === divisorId)?.factor ?? 313;
  const years = Number(yearsRaw);
  const months = Number(monthsRaw || '0');
  const age = ageRaw === '' ? null : Number(ageRaw);
  const dailyRate = pay !== null && pay > 0 ? (basis === 'daily' ? pay : dailyEquivalent(pay, factor)) : null;
  const valid = dailyRate !== null && yearsRaw !== '' && Number.isInteger(years) && years >= 0 && Number.isInteger(months) && months >= 0 && months <= 11 && (age === null || (Number.isInteger(age) && age > 0));
  const result = valid ? computeRetirementPay({ dailyRate: dailyRate!, years, extraMonths: months, age }, labor) : null;
  if (result) trackCalculatorUse('retirement-pay');
  const rows = result
    ? [
        { label: basis === 'daily' ? 'Daily rate (basic, excl. COLA)' : `Daily rate = monthly × 12 ÷ ${factor}`, value: peso(dailyRate!) },
        { label: `× ${RP.days_per_year} days = one “half-month salary”`, value: peso(result.halfMonthSalary) },
        { label: `× ${result.creditedYears} credited year${result.creditedYears === 1 ? '' : 's'} (${years}y ${months}m)`, value: '' },
        { label: `${RP.components.salary_days} days' salary per year`, value: peso(result.components.salary), indent: true },
        { label: `${RP.components.sil_days} days' service incentive leave per year`, value: peso(result.components.sil), indent: true },
        { label: `${RP.components.thirteenth_month_days} days (1/12 of 13th month) per year`, value: peso(result.components.thirteenth), indent: true },
        { label: 'Minimum retirement pay (RA 7641)', value: peso(result.retirementPay), strong: true },
      ]
    : [];
  return (
    <CalculatorShell title="Retirement Pay Calculator (RA 7641)">
      <Tabs label="Pay basis" options={[{ value: 'monthly', label: 'Monthly salary' }, { value: 'daily', label: 'Daily rate' }]} value={basis} onChange={setBasis} />
      <CurrencyInput id="ret-pay" label={basis === 'daily' ? 'Latest daily rate (basic, excluding COLA)' : 'Latest monthly basic salary (excluding COLA)'} value={payRaw} onChange={setPayRaw} error={payError} />
      {basis === 'monthly' && <SelectField id="ret-divisor" label="Days paid per year (to derive the daily rate)" options={DIVISORS} value={divisorId} onChange={setDivisorId} />}
      <div class="sm:flex sm:gap-4">
        <div class="mb-3 sm:flex-1">
          <label htmlFor="ret-years" class="mb-1 block text-sm font-medium text-ink">Years of service</label>
          <input id="ret-years" type="text" inputMode="numeric" class={numInput} placeholder="e.g. 20" value={yearsRaw} onInput={(e) => setYearsRaw((e.target as HTMLInputElement).value.trim())} />
        </div>
        <div class="mb-3 sm:w-40">
          <label htmlFor="ret-months" class="mb-1 block text-sm font-medium text-ink">Extra months</label>
          <input id="ret-months" type="text" inputMode="numeric" class={numInput} value={monthsRaw} onInput={(e) => setMonthsRaw((e.target as HTMLInputElement).value.trim())} />
        </div>
        <div class="mb-3 sm:w-40">
          <label htmlFor="ret-age" class="mb-1 block text-sm font-medium text-ink">Age (optional)</label>
          <input id="ret-age" type="text" inputMode="numeric" class={numInput} placeholder="60–65" value={ageRaw} onInput={(e) => setAgeRaw((e.target as HTMLInputElement).value.trim())} />
        </div>
      </div>
      {result && !result.eligibleByService && (
        <p class="mt-2 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">RA 7641 requires at least {RP.min_service_years} years of service with the employer; the figure below is for reference only.</p>
      )}
      {result && result.eligibleByAge === false && (
        <p class="mt-2 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">Statutory retirement is optional from {RP.optional_age} and compulsory at {RP.compulsory_age}; outside that range the RA 7641 minimum does not apply unless a company plan or CBA says otherwise.</p>
      )}
      {result && (
        <ResultCard
          headline="Minimum retirement pay under RA 7641"
          amount={peso(result.retirementPay)}
          amountNote={`Daily rate × ${RP.days_per_year} days × ${result.creditedYears} credited years. A company retirement plan or CBA that pays more prevails; if it pays less, the employer covers the difference.`}
          rows={rows}
          meta={labor.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => { setPayRaw(''); setYearsRaw(''); setMonthsRaw('0'); setAgeRaw(''); }}
        />
      )}
    </CalculatorShell>
  );
}
