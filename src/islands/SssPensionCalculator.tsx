import { useState } from 'preact/hooks';
import rulesJson from '../data/sss/2026.json';
import type { SssRules } from '../lib/rules/types';
import { benefitMscCap, computePension } from '../lib/engine/sssBenefits';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as SssRules;
const P = rules.benefits.pension;
const CAP = benefitMscCap(rules);
const DEPENDENT_OPTIONS = Array.from({ length: P.max_dependents + 1 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? 'None' : `${i} child${i === 1 ? '' : 'ren'}`,
}));

export default function SssPensionCalculator() {
  const [amscRaw, setAmscRaw] = useState('');
  const [cysRaw, setCysRaw] = useState('');
  const [dependents, setDependents] = useState('0');
  const [amsc, amscError] = useAmount(amscRaw, 'Average monthly salary credit');
  const cys = Number(cysRaw);
  const cysError =
    cysRaw !== '' && (!Number.isInteger(cys) || cys < 0 || cys > 60)
      ? 'Credited years must be a whole number between 0 and 60.'
      : null;

  const result =
    amsc !== null && amsc > 0 && cysRaw !== '' && !cysError
      ? computePension({ amsc, cys, dependents: Number(dependents) }, rules)
      : null;
  if (result) trackCalculatorUse('sss-pension');

  const rows = result
    ? [
        { label: 'Average monthly salary credit (AMSC)', value: peso(result.amsc) },
        { label: 'Credited years of service (CYS)', value: String(result.cys) },
        { label: '(a) ₱300 + 20% AMSC + 2% AMSC × years over 10', value: peso(result.formulaA), indent: true },
        { label: '(b) 40% of AMSC', value: peso(result.formulaB), indent: true },
        { label: '(c) Flat floor', value: peso(result.formulaC), indent: true },
        ...(result.minimumApplied
          ? [{ label: `Statutory minimum for ${result.cys >= 20 ? '20+' : '10+'} CYS applied`, value: peso(result.minimumApplied), indent: true }]
          : []),
        { label: 'Basic monthly pension', value: peso(result.basicPension), strong: true },
        ...(result.additionalBenefit > 0
          ? [{ label: 'Additional monthly benefit (RA 11199)', value: peso(result.additionalBenefit) }]
          : []),
        ...(result.dependentsCounted > 0
          ? [{ label: `Dependents' pension (${result.dependentsCounted})`, value: peso(result.dependentsPension) }]
          : []),
        { label: 'Total per month', value: peso(result.monthlyTotal), strong: true },
        { label: '13th-month pension (every December)', value: peso(result.thirteenthMonth) },
        { label: 'Estimated total per year', value: peso(result.annualTotal), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="SSS Pension Calculator">
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="pen-amsc"
            label="Average monthly salary credit (AMSC)"
            value={amscRaw}
            onChange={setAmscRaw}
            error={amscError}
            hint={`Average of your last 60 monthly salary credits (or of your whole membership, whichever is higher). For the pension formula the MSC counts only up to ${peso(CAP)} — the Regular SS cap.`}
          />
        </div>
        <div class="sm:w-52">
          <label htmlFor="pen-cys" class="mb-1 block text-sm font-medium text-ink">
            Credited years of service
          </label>
          <input
            id="pen-cys"
            type="text"
            inputMode="numeric"
            class={`w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent ${cysError ? 'border-red-500' : 'border-line'}`}
            placeholder="e.g. 25"
            value={cysRaw}
            aria-invalid={cysError ? 'true' : undefined}
            onInput={(e) => setCysRaw((e.target as HTMLInputElement).value.trim())}
          />
          {cysError ? (
            <p class="mt-1 text-xs font-medium text-red-600" role="alert">{cysError}</p>
          ) : (
            <p class="mt-1 text-xs text-ink-soft">Calendar years with at least six posted contributions.</p>
          )}
        </div>
      </div>
      <SelectField
        id="pen-dependents"
        label="Qualified dependent children (below 21, unmarried, not employed)"
        options={DEPENDENT_OPTIONS}
        value={dependents}
        onChange={setDependents}
      />
      {result && !result.eligibleForPension && (
        <p class="mt-2 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">
          With fewer than {P.min_contributions} monthly contributions ({P.cys_threshold} credited years) SSS pays a
          <strong> lump sum</strong> — your contributions plus interest — instead of a monthly pension. The figures below
          show what the pension formula would give for reference only.
        </p>
      )}
      {result && (
        <ResultCard
          headline="Estimated basic monthly pension"
          amount={peso(result.basicPension)}
          amountNote={`Highest of the three formulas in RA 11199, Sec. 12${result.minimumApplied ? ', lifted to the statutory minimum' : ''}. Total with additional benefit${result.dependentsCounted > 0 ? " and dependents' pension" : ''}: ${peso(result.monthlyTotal)} per month.`}
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => {
            setAmscRaw('');
            setCysRaw('');
            setDependents('0');
          }}
        >
          {result.amscCapped && (
            <p class="mt-2 text-xs text-ink-soft">
              For benefit computation the MSC is capped at {peso(CAP)} (RA 11199, Sec. 8(g)); contributions on salary
              credits above that go to your MPF provident account and are paid out separately, not through this formula.
            </p>
          )}
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
