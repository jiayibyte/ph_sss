import { useState } from 'preact/hooks';
import rulesJson from '../data/sss/2026.json';
import type { SssRules } from '../lib/rules/types';
import { findSssRow } from '../lib/engine/sss';
import { benefitMscCap, computeSickness } from '../lib/engine/sssBenefits';
import { parseAmount, peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as SssRules;
const S = rules.benefits.sickness;
const CAP = benefitMscCap(rules);
type Mode = 'simple' | 'detailed';
const numInput = 'w-full rounded-lg border border-line px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent';

export default function SssSicknessCalculator() {
  const [mode, setMode] = useState<Mode>('simple');
  const [salaryRaw, setSalaryRaw] = useState('');
  const [mscRaws, setMscRaws] = useState<string[]>(Array(S.top_msc_count).fill(''));
  const [daysRaw, setDaysRaw] = useState('');
  const [usedRaw, setUsedRaw] = useState('0');
  const [salary, salaryError] = useAmount(salaryRaw, 'Monthly salary');
  const days = Number(daysRaw);
  const used = Number(usedRaw || '0');

  let mscs: number[] = [];
  if (mode === 'simple' && salary !== null && salary > 0) mscs = Array(S.top_msc_count).fill(findSssRow(salary, 'employee', rules).msc);
  else if (mode === 'detailed') mscs = mscRaws.map((r) => parseAmount(r) ?? 0).filter((v) => v > 0);
  const result =
    mscs.length > 0 && daysRaw !== '' && Number.isFinite(days) && days >= 0 && Number.isFinite(used) && used >= 0
      ? computeSickness({ mscs, days, daysUsedThisYear: used }, rules)
      : null;
  if (result) trackCalculatorUse('sss-sickness');

  const rows = result
    ? [
        ...(mode === 'simple' ? [{ label: 'Monthly salary credit (MSC) for your salary', value: peso(result.topMscs[0]!) }] : []),
        { label: `Sum of the ${result.topMscs.length} highest MSCs`, value: peso(result.sumTopMscs) },
        { label: `÷ ${S.divisor} = average daily salary credit`, value: peso(result.averageDailySalaryCredit) },
        { label: `× ${S.pct_of_adsc * 100}% = daily sickness allowance`, value: peso(result.dailyBenefit), strong: true },
        { label: `Compensable days (${result.daysClaimed} claimed, ${S.max_days_per_year}-day yearly cap)`, value: String(result.daysPayable) },
        { label: 'SSS sickness benefit', value: peso(result.benefit), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="SSS Sickness Benefit Calculator">
      <Tabs
        label="Input mode"
        options={[
          { value: 'simple', label: 'Simple (same salary all year)' },
          { value: 'detailed', label: 'Detailed (enter your 6 highest MSCs)' },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'simple' ? (
        <CurrencyInput id="sick-salary" label="Monthly salary (before the semester of sickness)" value={salaryRaw} onChange={setSalaryRaw} error={salaryError} hint={`Converted to the MSC on the 2026 schedule; benefits count the MSC only up to ${peso(CAP)}.`} />
      ) : (
        <div class="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
          {mscRaws.map((v, i) => (
            <CurrencyInput key={i} id={`sick-msc-${i + 1}`} label={`MSC ${i + 1}`} value={v} onChange={(nv) => { const n = [...mscRaws]; n[i] = nv; setMscRaws(n); }} />
          ))}
        </div>
      )}
      <div class="sm:flex sm:gap-4">
        <div class="mb-3 sm:flex-1">
          <label htmlFor="sick-days" class="mb-1 block text-sm font-medium text-ink">Days of confinement claimed</label>
          <input id="sick-days" type="text" inputMode="numeric" class={numInput} placeholder="e.g. 10" value={daysRaw} onInput={(e) => setDaysRaw((e.target as HTMLInputElement).value.trim())} />
          <p class="mt-1 text-xs text-ink-soft">Home or hospital confinement of more than {S.min_confinement_days - 1} days, approved by SSS.</p>
        </div>
        <div class="mb-3 sm:w-64">
          <label htmlFor="sick-used" class="mb-1 block text-sm font-medium text-ink">Sickness days already paid this year</label>
          <input id="sick-used" type="text" inputMode="numeric" class={numInput} value={usedRaw} onInput={(e) => setUsedRaw((e.target as HTMLInputElement).value.trim())} />
          <p class="mt-1 text-xs text-ink-soft">Counts toward the {S.max_days_per_year}-day limit per calendar year.</p>
        </div>
      </div>
      {result && result.notCompensable && (
        <p class="mt-2 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">
          Confinement must be more than {S.min_confinement_days - 1} days to be compensable (RA 11199, Sec. 14(a)). Nothing is payable for {result.daysClaimed} day{result.daysClaimed === 1 ? '' : 's'}.
        </p>
      )}
      {result && result.insufficientContributions && (
        <p class="mt-2 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">
          At least {S.min_contributions} posted contributions in the 12 months before the semester of sickness are required; you entered fewer. The amount assumes you qualify.
        </p>
      )}
      {result && (
        <ResultCard
          headline="Estimated SSS sickness benefit"
          amount={peso(result.benefit)}
          amountNote={`${S.pct_of_adsc * 100}% of your average daily salary credit × ${result.daysPayable} compensable day${result.daysPayable === 1 ? '' : 's'}. Employees are paid by the employer every payday (after paid sick leave is used up); SSS reimburses the employer.`}
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => { setSalaryRaw(''); setMscRaws(Array(S.top_msc_count).fill('')); setDaysRaw(''); setUsedRaw('0'); }}
        >
          {result.mscCapped && <p class="mt-2 text-xs text-ink-soft">MSCs above {peso(CAP)} were counted at {peso(CAP)} — the Regular SS cap for benefit computation.</p>}
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
