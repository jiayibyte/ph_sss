import { useState } from 'preact/hooks';
import pagibigJson from '../data/pagibig/2026.json';
import type { PagibigRules } from '../lib/rules/types';
import { projectMp2, type Mp2Payout } from '../lib/engine/pagibigSavings';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = pagibigJson as unknown as PagibigRules;
const M = rules.mp2;
const pct = (r: number) => `${(r * 100).toFixed(2)}%`;
const RATE_OPTIONS = [
  ...M.dividend_rates.slice(0, 5).map((r) => ({ value: String(r.rate), label: `${pct(r.rate)} — ${r.year} rate` })),
  { value: String(M.dividend_rates.slice(0, 5).reduce((s, r) => s + r.rate, 0) / 5), label: `${pct(M.dividend_rates.slice(0, 5).reduce((s, r) => s + r.rate, 0) / 5)} — average ${M.dividend_rates[4]!.year}–${M.dividend_rates[0]!.year}` },
];

export default function Mp2Calculator() {
  const [monthlyRaw, setMonthlyRaw] = useState('');
  const [lumpRaw, setLumpRaw] = useState('');
  const [rate, setRate] = useState(RATE_OPTIONS[0]!.value);
  const [payout, setPayout] = useState<Mp2Payout>('compounded');
  const [monthly, monthlyError] = useAmount(monthlyRaw, 'Monthly savings');
  const [lump, lumpError] = useAmount(lumpRaw, 'One-time savings');
  const m = monthly ?? 0;
  const l = lump ?? 0;
  const minError =
    (m > 0 && m < M.min_remittance) || (l > 0 && l < M.min_remittance) ? `Each MP2 remittance must be at least ${peso(M.min_remittance)}.` : null;
  const result = (m > 0 || l > 0) && !minError ? projectMp2({ monthly: m, lumpSum: l, rate: Number(rate), payout }, M.maturity_years) : null;
  if (result) trackCalculatorUse('mp2');
  const rows = result
    ? [
        { label: 'Total savings over 5 years', value: peso(result.totalDeposits) },
        ...result.years.map((y) => ({ label: `Year ${y.year} dividend${payout === 'annual' ? ' (paid out)' : ''}`, value: peso(y.dividend), indent: true })),
        { label: 'Total dividends (tax-free)', value: peso(result.totalDividends), strong: true },
        {
          label: payout === 'compounded' ? 'Amount at maturity (savings + compounded dividends)' : 'Savings returned at maturity',
          value: peso(result.maturityValue),
          strong: true,
        },
      ]
    : [];
  return (
    <CalculatorShell title="Pag-IBIG MP2 Calculator">
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput id="mp2-monthly" label="Monthly MP2 savings" value={monthlyRaw} onChange={setMonthlyRaw} error={monthlyError} hint={`Minimum ${peso(M.min_remittance)} per remittance.`} />
        </div>
        <div class="sm:flex-1">
          <CurrencyInput id="mp2-lump" label="One-time savings at the start (optional)" value={lumpRaw} onChange={setLumpRaw} error={lumpError} hint="A lump sum for the whole 5 years is allowed." />
        </div>
      </div>
      {minError && <p class="mb-3 text-xs font-medium text-red-600" role="alert">{minError}</p>}
      <SelectField id="mp2-rate" label="Dividend rate to assume (future rates are declared yearly)" options={RATE_OPTIONS} value={rate} onChange={setRate} />
      <Tabs
        label="Dividend payout"
        options={[
          { value: 'compounded', label: 'Compounded, paid at maturity' },
          { value: 'annual', label: 'Paid out every year' },
        ]}
        value={payout}
        onChange={setPayout}
      />
      {result && (
        <ResultCard
          headline={payout === 'compounded' ? 'Estimated MP2 value after 5 years' : 'Estimated MP2 dividends over 5 years'}
          amount={peso(payout === 'compounded' ? result.maturityValue : result.totalDividends)}
          amountNote={`Assumes ${pct(Number(rate))} every year. Each deposit earns dividends for the months it is held in that year; Pag-IBIG declares the actual rate annually, so treat this as an estimate.`}
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => { setMonthlyRaw(''); setLumpRaw(''); }}
        />
      )}
    </CalculatorShell>
  );
}
