import { useState } from 'preact/hooks';
import rulesJson from '../data/sss/2026.json';
import type { SssMemberType, SssRules } from '../lib/rules/types';
import { computeSss } from '../lib/engine/sss';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as SssRules;

const MEMBER_OPTIONS = (Object.keys(rules.member_types) as SssMemberType[]).map((k) => ({
  value: k,
  label: rules.member_types[k].label,
}));

export default function SssCalculator() {
  const [salaryRaw, setSalaryRaw] = useState('');
  const [memberType, setMemberType] = useState<SssMemberType>('employee');
  const [salary, error] = useAmount(salaryRaw, 'Monthly salary');

  const result = salary !== null && salary > 0 ? computeSss(salary, memberType, rules) : null;
  if (result) trackCalculatorUse('sss-calculator');

  const split = rules.member_types[memberType].split;
  const rows = result
    ? [
        { label: 'Monthly salary / income', value: peso(result.salary) },
        { label: 'Monthly Salary Credit (MSC)', value: peso(result.msc), strong: true },
        ...(result.mpfMsc > 0
          ? [
              { label: 'Regular SSS portion of MSC', value: peso(result.regularMsc), indent: true },
              { label: 'MPF (WISP) portion of MSC', value: peso(result.mpfMsc), indent: true },
            ]
          : []),
        ...(split
          ? [
              { label: 'Employee share (5%)', value: peso(result.employeeShare) },
              {
                label: `Employer share (10%${result.ec > 0 ? ' + EC' : ''})`,
                value: peso(result.employerShare),
              },
            ]
          : [
              {
                label: `Member pays (15%${result.ec > 0 ? ' + EC' : ''})`,
                value: peso(result.employeeShare),
              },
            ]),
        ...(result.ec > 0
          ? [{ label: 'Employees’ Compensation (EC)', value: peso(result.ec), indent: true }]
          : []),
        { label: 'Total monthly contribution', value: peso(result.total), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="SSS Contribution Calculator">
      <Tabs
        label="Member type"
        options={MEMBER_OPTIONS}
        value={memberType}
        onChange={setMemberType}
      />
      <CurrencyInput
        id="sss-salary"
        label={memberType === 'employee' ? 'Monthly salary' : 'Monthly income / declared earnings'}
        value={salaryRaw}
        onChange={setSalaryRaw}
        error={error}
        hint="Result updates as you type."
      />
      {result && (
        <ResultCard
          headline={`Estimated monthly SSS contribution — ${rules.member_types[memberType].label}`}
          amount={peso(split ? result.employeeShare : result.employeeShare)}
          amountNote={
            split
              ? `Your share as employee. Total with employer share: ${peso(result.total)}.`
              : 'You pay the full amount as a member.'
          }
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => setSalaryRaw('')}
        >
          {result.clamped && (
            <p class="mt-2 text-xs text-ink-soft">
              {result.clamped === 'floor'
                ? `Salaries below the minimum fall into the lowest MSC bracket (${peso(rules.member_types[memberType].msc_min)}).`
                : `Salaries above ${peso(rules.msc.max)} are capped at the maximum MSC.`}
            </p>
          )}
        </ResultCard>
      )}
      <p class="mt-3 text-sm">
        <a href="/sss-contribution-table/" class="font-medium text-accent underline hover:text-accent-strong">
          View the full SSS Contribution Table 2026 →
        </a>
      </p>
    </CalculatorShell>
  );
}
