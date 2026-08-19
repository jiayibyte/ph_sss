import { useState } from 'preact/hooks';
import rulesJson from '../data/philhealth/2026.json';
import type { PhilhealthMemberType, PhilhealthRules } from '../lib/rules/types';
import { computePhilhealth } from '../lib/engine/philhealth';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as PhilhealthRules;

const OPTIONS = (Object.keys(rules.member_types) as PhilhealthMemberType[]).map((k) => ({
  value: k,
  label: rules.member_types[k].label,
}));

export default function PhilhealthCalculator() {
  const [salaryRaw, setSalaryRaw] = useState('');
  const [memberType, setMemberType] = useState<PhilhealthMemberType>('employed');
  const [salary, error] = useAmount(salaryRaw, 'Monthly basic salary');

  const result =
    salary !== null && salary > 0 ? computePhilhealth(salary, memberType, rules) : null;
  if (result) trackCalculatorUse('philhealth');

  const split = rules.member_types[memberType].split;
  const rows = result
    ? [
        { label: 'Monthly basic salary / income', value: peso(result.salary) },
        { label: 'Premium base (after floor/ceiling)', value: peso(result.premiumBase) },
        { label: 'Total monthly premium (5%)', value: peso(result.totalPremium), strong: true },
        ...(split
          ? [
              { label: 'Employee share (2.5%)', value: peso(result.employeeShare), indent: true },
              { label: 'Employer share (2.5%)', value: peso(result.employerShare), indent: true },
            ]
          : [{ label: 'You pay (full premium)', value: peso(result.memberPays), indent: true }]),
      ]
    : [];

  return (
    <CalculatorShell title="PhilHealth Contribution Calculator">
      <Tabs label="Member type" options={OPTIONS} value={memberType} onChange={setMemberType} />
      <CurrencyInput
        id="ph-salary"
        label="Monthly basic salary / income"
        value={salaryRaw}
        onChange={setSalaryRaw}
        error={error}
        hint="Premium is 5% of monthly basic salary, floor ₱10,000 / ceiling ₱100,000."
      />
      {result && (
        <ResultCard
          headline={`Estimated monthly PhilHealth premium — ${rules.member_types[memberType].label}`}
          amount={peso(result.memberPays)}
          amountNote={
            split
              ? `Your share. Total premium including employer share: ${peso(result.totalPremium)}.`
              : rules.member_types[memberType].note
          }
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => setSalaryRaw('')}
        >
          {result.clamped && (
            <p class="mt-2 text-xs text-ink-soft">
              {result.clamped === 'floor'
                ? `Incomes below ${peso(rules.income_floor)} pay the minimum premium of ${peso(rules.income_floor * rules.rate)}.`
                : `Incomes above ${peso(rules.income_ceiling)} pay the maximum premium of ${peso(rules.income_ceiling * rules.rate)}.`}
            </p>
          )}
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
