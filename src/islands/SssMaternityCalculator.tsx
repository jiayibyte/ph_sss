import { useState } from 'preact/hooks';
import rulesJson from '../data/sss/2026.json';
import type { SssRules } from '../lib/rules/types';
import { findSssRow } from '../lib/engine/sss';
import { benefitMscCap, computeMaternity, maternityDays, type MaternityEvent } from '../lib/engine/sssBenefits';
import { parseAmount, peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as SssRules;
const M = rules.benefits.maternity;
const CAP = benefitMscCap(rules);
type Mode = 'simple' | 'detailed';

const EVENT_OPTIONS: Array<{ value: MaternityEvent; label: string }> = [
  { value: 'live-birth', label: `Live birth (${M.days_live_birth} days)` },
  { value: 'live-birth-solo-parent', label: `Live birth, solo parent (${M.days_live_birth + M.days_solo_parent_extra} days)` },
  { value: 'miscarriage', label: `Miscarriage / emergency termination (${M.days_miscarriage} days)` },
];

export default function SssMaternityCalculator() {
  const [mode, setMode] = useState<Mode>('simple');
  const [event, setEvent] = useState<MaternityEvent>('live-birth');
  const [salaryRaw, setSalaryRaw] = useState('');
  const [mscRaws, setMscRaws] = useState<string[]>(Array(M.top_msc_count).fill(''));
  const [salary, salaryError] = useAmount(salaryRaw, 'Monthly salary');

  let mscs: number[] = [];
  if (mode === 'simple' && salary !== null && salary > 0) {
    const msc = findSssRow(salary, 'employee', rules).msc;
    mscs = Array(M.top_msc_count).fill(msc);
  } else if (mode === 'detailed') {
    mscs = mscRaws.map((r) => parseAmount(r) ?? 0).filter((v) => v > 0);
  }
  const result = mscs.length > 0 ? computeMaternity({ mscs, event }, rules) : null;
  if (result) trackCalculatorUse('sss-maternity');

  const rows = result
    ? [
        ...(mode === 'simple'
          ? [{ label: 'Monthly salary credit (MSC) for your salary', value: peso(result.topMscs[0]!) }]
          : []),
        { label: `Sum of the ${result.topMscs.length} highest MSCs`, value: peso(result.sumTopMscs) },
        { label: `÷ ${M.divisor} = average daily salary credit`, value: peso(result.averageDailySalaryCredit) },
        { label: `× ${result.days} days`, value: '' },
        { label: 'SSS maternity benefit', value: peso(result.benefit), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="SSS Maternity Benefit Calculator">
      <Tabs label="Type of contingency" options={EVENT_OPTIONS} value={event} onChange={setEvent} />
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
        <CurrencyInput
          id="mat-salary"
          label="Monthly salary (before the semester of contingency)"
          value={salaryRaw}
          onChange={setSalaryRaw}
          error={salaryError}
          hint={`Converted to the MSC on the 2026 schedule and assumed constant for the six months. Benefits count the MSC only up to ${peso(CAP)} (Regular SS cap).`}
        />
      ) : (
        <div>
          <p class="mb-2 text-sm text-ink-soft">
            Enter your six highest monthly salary credits from the 12 months before the semester of contingency
            (check the posted MSCs in My.SSS). Leave a box blank if you have fewer than six.
          </p>
          <div class="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
            {mscRaws.map((v, i) => (
              <CurrencyInput
                key={i}
                id={`mat-msc-${i + 1}`}
                label={`MSC ${i + 1}`}
                value={v}
                onChange={(nv) => {
                  const next = [...mscRaws];
                  next[i] = nv;
                  setMscRaws(next);
                }}
              />
            ))}
          </div>
        </div>
      )}
      {result && result.insufficientContributions && (
        <p class="mt-2 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">
          SSS requires at least {M.min_contributions} posted monthly contributions in the 12 months before the semester
          of contingency. You entered fewer — the amount below assumes you qualify.
        </p>
      )}
      {result && (
        <ResultCard
          headline={`Estimated SSS maternity benefit — ${maternityDays(event, rules)} days`}
          amount={peso(result.benefit)}
          amountNote="Paid by SSS (advanced by your employer if you are employed). Employed members also receive the salary differential from their employer under RA 11210."
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => {
            setSalaryRaw('');
            setMscRaws(Array(M.top_msc_count).fill(''));
          }}
        >
          {result.mscCapped && (
            <p class="mt-2 text-xs text-ink-soft">
              Monthly salary credits above {peso(CAP)} were counted at {peso(CAP)}: SSS computes Regular SS benefits on
              the MSC up to that cap (RA 11199, Sec. 8(g)); the excess is MPF savings.
            </p>
          )}
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
