import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import wagesJson from '../data/wages/2026.json';
import type { LaborRules, WageRules } from '../lib/rules/types';
import { computeSil } from '../lib/engine/leave';
import { dailyEquivalent } from '../lib/engine/wages';
import { todayInManila } from '../lib/today.mjs';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const labor = laborJson as unknown as LaborRules;
const wages = wagesJson as unknown as WageRules;
const L = labor.leave;
const DIVISORS = wages.divisors.options.map((d) => ({ value: d.id, label: `${d.factor} — ${d.label}` }));
type Mode = 'dates' | 'days';
type Basis = 'daily' | 'monthly';
const inputCls =
  'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent';
const longDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

export default function SilCalculator() {
  const [mode, setMode] = useState<Mode>('dates');
  const [basis, setBasis] = useState<Basis>('daily');
  const [payRaw, setPayRaw] = useState('');
  const [divisorId, setDivisorId] = useState('261');
  const [hired, setHired] = useState('');
  const [asOf, setAsOf] = useState('');
  const [usedRaw, setUsedRaw] = useState('');
  const [unusedRaw, setUnusedRaw] = useState('');
  const [pay, payError] = useAmount(payRaw, basis === 'daily' ? 'Daily rate' : 'Monthly salary');
  const used = usedRaw === '' ? 0 : Number(usedRaw);
  const unused = unusedRaw === '' ? null : Number(unusedRaw);
  const badDays = (usedRaw !== '' && !(used >= 0)) || (unusedRaw !== '' && !(unused! >= 0));

  const factor = wages.divisors.options.find((d) => d.id === divisorId)?.factor ?? 261;
  const daily = pay !== null && pay > 0 ? (basis === 'daily' ? pay : dailyEquivalent(pay, factor)) : null;
  const end = asOf || todayInManila();
  const ready = daily !== null && !badDays && (mode === 'days' ? unused !== null : hired !== '' && hired <= end);
  const r = ready ? computeSil(mode === 'days' ? { unusedDays: unused, dailyRate: daily! } : { hired, asOf: end, usedDays: used, dailyRate: daily! }, labor) : null;
  if (r) trackCalculatorUse('sil');

  const rows = r
    ? [
        ...(basis === 'monthly' ? [{ label: `Daily rate (monthly × 12 ÷ ${factor})`, value: peso(daily!) }] : [{ label: 'Daily rate', value: peso(daily!) }]),
        ...(mode === 'dates'
          ? [
              { label: `Service from ${longDate(hired)} to ${longDate(end)}`, value: `${r.monthsOfService} months` },
              { label: r.entitled ? `SIL earned: ${L.sil_days_per_year} days × ${r.monthsOfService} ÷ 12` : `Not yet entitled: SIL starts after ${L.sil_min_service_months} months`, value: `${r.accruedDays} days` },
              ...(r.usedDays > 0 ? [{ label: 'Less days used or already converted', value: `− ${r.usedDays} days` }] : []),
            ]
          : []),
        { label: 'Unused SIL', value: `${r.unusedDays} days`, strong: true },
        { label: 'Cash value (unused days × daily rate)', value: peso(r.cashValue), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="Service Incentive Leave (SIL) Conversion Calculator">
      <Tabs
        label="What you know"
        options={[
          { value: 'dates', label: 'My hire date' },
          { value: 'days', label: 'My unused SIL days' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <Tabs
        label="Pay basis"
        options={[
          { value: 'daily', label: 'Daily rate' },
          { value: 'monthly', label: 'Monthly salary' },
        ]}
        value={basis}
        onChange={setBasis}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput id="sil-pay" label={basis === 'daily' ? 'Daily rate on the date of conversion' : 'Monthly salary'} value={payRaw} onChange={setPayRaw} error={payError} />
        </div>
        {basis === 'monthly' && (
          <div class="sm:flex-1">
            <SelectField id="sil-divisor" label="Days paid per year (factor)" options={DIVISORS} value={divisorId} onChange={setDivisorId} />
          </div>
        )}
      </div>
      {mode === 'dates' ? (
        <div class="sm:flex sm:gap-4">
          <div class="mb-3 sm:flex-1">
            <label htmlFor="sil-hired" class="mb-1 block text-sm font-medium text-ink">Date hired</label>
            <input id="sil-hired" type="date" class={inputCls} value={hired} onInput={(e) => setHired((e.target as HTMLInputElement).value)} />
          </div>
          <div class="mb-3 sm:flex-1">
            <label htmlFor="sil-asof" class="mb-1 block text-sm font-medium text-ink">Last day / conversion date (optional)</label>
            <input id="sil-asof" type="date" class={inputCls} value={asOf} onInput={(e) => setAsOf((e.target as HTMLInputElement).value)} />
            <p class="mt-1 text-xs text-ink-soft">Blank = today.</p>
          </div>
          <div class="mb-3 sm:w-40">
            <label htmlFor="sil-used" class="mb-1 block text-sm font-medium text-ink">SIL days used</label>
            <input id="sil-used" type="number" min="0" step="0.5" inputMode="decimal" class={inputCls} value={usedRaw} placeholder="0" onInput={(e) => setUsedRaw((e.target as HTMLInputElement).value)} />
          </div>
        </div>
      ) : (
        <div class="mb-3 sm:w-56">
          <label htmlFor="sil-unused" class="mb-1 block text-sm font-medium text-ink">Unused SIL days</label>
          <input id="sil-unused" type="number" min="0" step="0.5" inputMode="decimal" class={inputCls} value={unusedRaw} placeholder="5" onInput={(e) => setUnusedRaw((e.target as HTMLInputElement).value)} />
        </div>
      )}
      {badDays && <p class="mb-3 text-xs font-medium text-red-600" role="alert">Days must be zero or more.</p>}
      {hired !== '' && hired > end && <p class="mb-3 text-xs font-medium text-red-600" role="alert">The hire date is after the conversion date.</p>}
      {r && (
        <ResultCard
          headline="Cash value of your unused service incentive leave"
          amount={peso(r.cashValue)}
          amountNote={`Labor Code Art. 95: ${L.sil_days_per_year} days with pay a year after one year of service; unused days are converted at the daily rate on the date of conversion, pro rata. Many employers give more leave by policy — this is the legal minimum.`}
          rows={rows}
          meta={{ ...labor.meta, rule_version: "Labor Code Art. 95 — DOLE Handbook on Workers' Statutory Monetary Benefits (2024), Ch. 7", official_source_url: L.source_url, official_source_label: 'DOLE Handbook on Workers’ Statutory Monetary Benefits, 2024 Edition (nwpc.dole.gov.ph)' }}
          effectiveText="since the Labor Code (Art. 95); conversion rules as in the 2024 Handbook"
          copyText={rows.map((x) => `${x.label}: ${x.value}`).join('\n')}
          onReset={() => {
            setPayRaw('');
            setHired('');
            setAsOf('');
            setUsedRaw('');
            setUnusedRaw('');
          }}
        />
      )}
    </CalculatorShell>
  );
}
