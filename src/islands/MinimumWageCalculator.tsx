import { useState } from 'preact/hooks';
import wagesJson from '../data/wages/2026.json';
import type { WageRules } from '../lib/rules/types';
import { currentRateSince, dailyEquivalent, describeRates, monthlyEquivalent, shortfall, wagesAsOf } from '../lib/engine/wages';
import { todayInManila } from '../lib/today.mjs';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

// Rates as of the Philippine calendar day, so a scheduled order or tranche shows up on its effectivity date
// (at build time for the static HTML, and again in the visitor's browser).
const TODAY = todayInManila();
const rules = wagesAsOf(wagesJson as unknown as WageRules, TODAY);
const longDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
const REGIONS = rules.regions.filter((r) => r.tiers.length > 0);
const REGION_OPTIONS = REGIONS.map((r) => ({ value: r.id, label: r.name }));
const DIVISOR_OPTIONS = rules.divisors.options.map((d) => ({ value: d.id, label: `${d.factor} — ${d.label}` }));
type PayBasis = 'daily' | 'monthly';

export default function MinimumWageCalculator() {
  const [regionId, setRegionId] = useState('ncr');
  const [tierIdx, setTierIdx] = useState('0');
  const [divisorId, setDivisorId] = useState('313');
  const [basis, setBasis] = useState<PayBasis>('daily');
  const [payRaw, setPayRaw] = useState('');
  const [pay, payError] = useAmount(payRaw, basis === 'daily' ? 'Daily pay' : 'Monthly pay');

  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0]!;
  const tiers = region.tiers;
  const tier = tiers[Math.min(Number(tierIdx), tiers.length - 1)] ?? tiers[0]!;
  const divisor = rules.divisors.options.find((d) => d.id === divisorId) ?? rules.divisors.options[0]!;
  const monthly = monthlyEquivalent(tier.rate, divisor.factor);

  const dailyPay = pay !== null && pay > 0 ? (basis === 'daily' ? pay : dailyEquivalent(pay, divisor.factor)) : null;
  const gap = dailyPay !== null ? shortfall(dailyPay, tier.rate) : null;
  // Count real use only — not every page view (the result card renders with defaults).
  if (pay !== null || regionId !== 'ncr' || tierIdx !== '0' || divisorId !== '313') trackCalculatorUse('minimum-wage');

  const rows = [
    { label: `${region.name} — ${tier.label}${tier.group ? ` (${tier.group})` : ''}`, value: '' },
    { label: 'Daily minimum wage', value: peso(tier.rate), strong: true },
    { label: `× ${divisor.factor} ÷ 12 = estimated monthly equivalent`, value: peso(monthly), strong: true },
    ...(dailyPay !== null
      ? [
          { label: basis === 'daily' ? 'Your daily pay' : `Your pay per day (monthly × 12 ÷ ${divisor.factor})`, value: peso(dailyPay) },
          {
            label: gap! > 0 ? 'Below the minimum by' : 'Above or at the minimum by',
            value: peso(gap! > 0 ? gap! : dailyPay - tier.rate),
            strong: true,
          },
        ]
      : []),
  ];
  const upcoming = region.upcoming;
  const since = currentRateSince(region, TODAY);

  return (
    <CalculatorShell title="Minimum Wage Checker">
      <SelectField
        id="mw-region"
        label="Region"
        options={REGION_OPTIONS}
        value={regionId}
        onChange={(v) => {
          setRegionId(v);
          setTierIdx('0');
        }}
      />
      {tiers.length > 1 && (
        <SelectField
          id="mw-tier"
          label="Sector / area"
          options={tiers.map((t, i) => ({ value: String(i), label: `${t.label}${t.group ? ` — ${t.group}` : ''} (${peso(t.rate)})` }))}
          value={String(Math.min(Number(tierIdx), tiers.length - 1))}
          onChange={setTierIdx}
        />
      )}
      <SelectField id="mw-divisor" label="Work schedule (for the monthly equivalent)" options={DIVISOR_OPTIONS} value={divisorId} onChange={setDivisorId} />
      <Tabs
        label="Compare your pay"
        options={[
          { value: 'daily', label: 'I know my daily rate' },
          { value: 'monthly', label: 'I know my monthly salary' },
        ]}
        value={basis}
        onChange={setBasis}
      />
      <CurrencyInput
        id="mw-pay"
        label={basis === 'daily' ? 'Your daily pay (optional)' : 'Your monthly pay (optional)'}
        value={payRaw}
        onChange={setPayRaw}
        error={payError}
        hint="Basic pay only — allowances and overtime are not part of the minimum wage comparison."
      />
      <ResultCard
        headline={`Daily minimum wage — ${region.name}`}
        amount={peso(tier.rate)}
        amountNote={`${region.wage_order}${since ? `, rate in effect since ${longDate(since)}` : ''}. Estimated monthly equivalent at factor ${divisor.factor}: ${peso(monthly)}.`}
        rows={rows}
        meta={rules.meta}
        copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
        onReset={() => {
          setRegionId('ncr');
          setTierIdx('0');
          setDivisorId('313');
          setPayRaw('');
        }}
      >
        {upcoming && (
          <p class="mt-2 text-xs text-ink-soft">
            <strong>Coming up:</strong> {upcoming.wage_order} — {describeRates(upcoming.rates)}
            {upcoming.effectivity
              ? `, from ${longDate(upcoming.effectivity)}.`
              : `, expected ${upcoming.expected ?? 'soon'} (effectivity date not yet published by NWPC).`}
          </p>
        )}
        {region.notes && <p class="mt-2 text-xs text-ink-soft">{region.notes}</p>}
      </ResultCard>
    </CalculatorShell>
  );
}
