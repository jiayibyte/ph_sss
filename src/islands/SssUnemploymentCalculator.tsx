import { useState } from 'preact/hooks';
import rulesJson from '../data/sss/2026.json';
import type { SssRules } from '../lib/rules/types';
import { findSssRow } from '../lib/engine/sss';
import { benefitMscCap, computeUnemployment } from '../lib/engine/sssBenefits';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as SssRules;
const U = rules.benefits.unemployment;
const CAP = benefitMscCap(rules);
type Basis = 'salary' | 'amsc';

export default function SssUnemploymentCalculator() {
  const [basis, setBasis] = useState<Basis>('salary');
  const [raw, setRaw] = useState('');
  const [amount, error] = useAmount(raw, basis === 'salary' ? 'Monthly salary' : 'AMSC');
  const amsc = amount !== null && amount > 0 ? (basis === 'salary' ? findSssRow(amount, 'employee', rules).msc : amount) : null;
  const result = amsc !== null ? computeUnemployment(amsc, rules) : null;
  if (result) trackCalculatorUse('sss-unemployment');
  const rows = result
    ? [
        { label: 'Average monthly salary credit used', value: peso(result.amsc) },
        { label: `× ${U.pct_of_amsc * 100}% = monthly cash benefit`, value: peso(result.monthlyBenefit), strong: true },
        { label: `× ${result.months} months`, value: '' },
        { label: 'Total unemployment benefit', value: peso(result.total), strong: true },
      ]
    : [];
  return (
    <CalculatorShell title="SSS Unemployment Benefit Calculator">
      <Tabs
        label="What you know"
        options={[
          { value: 'salary', label: 'My monthly salary' },
          { value: 'amsc', label: 'My average MSC (from My.SSS)' },
        ]}
        value={basis}
        onChange={setBasis}
      />
      <CurrencyInput
        id="unemp-amount"
        label={basis === 'salary' ? 'Monthly salary before separation' : 'Average monthly salary credit (AMSC)'}
        value={raw}
        onChange={setRaw}
        error={error}
        hint={basis === 'salary' ? `Converted to the MSC on the 2026 schedule and assumed constant. Benefits count the MSC only up to ${peso(CAP)}.` : `Capped at ${peso(CAP)}, the Regular SS ceiling for benefit computation.`}
      />
      {result && (
        <ResultCard
          headline="Estimated SSS unemployment benefit"
          amount={peso(result.total)}
          amountNote={`${peso(result.monthlyBenefit)} a month for ${result.months} months (RA 11199, Sec. 14-B). Paid as a lump sum to your enrolled disbursement account once approved.`}
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => setRaw('')}
        >
          <p class="mt-2 text-xs text-ink-soft">
            You must be not over {U.max_age}, have at least {U.min_contributions} posted contributions with {U.recent_contributions_required} of them in the {U.recent_window_months} months before separation, and be involuntarily separated (authorized causes, redundancy, retrenchment, closure, disease, or economic downturn). Claimable once every {U.once_every_years} years.
            {result.amscCapped ? ` Your AMSC was capped at ${peso(CAP)}.` : ''}
          </p>
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
