import { useState } from 'preact/hooks';
import rulesJson from '../data/pagibig/2026.json';
import type { PagibigRules } from '../lib/rules/types';
import { computePagibig, type PagibigMemberType } from '../lib/engine/pagibig';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as PagibigRules;

export default function PagibigCalculator() {
  const [salaryRaw, setSalaryRaw] = useState('');
  const [memberType, setMemberType] = useState<PagibigMemberType>('employee');
  const [salary, error] = useAmount(salaryRaw, 'Monthly salary');

  const result = salary !== null && salary > 0 ? computePagibig(salary, memberType, rules) : null;
  if (result) trackCalculatorUse('pagibig');

  const rows = result
    ? [
        { label: 'Monthly salary / income', value: peso(result.salary) },
        { label: 'Monthly Fund Salary used (max ₱10,000)', value: peso(result.fundSalary) },
        {
          label: `Employee / member share (${result.employeeRate * 100}%)`,
          value: peso(result.employeeShare),
        },
        ...(memberType === 'employee'
          ? [{ label: 'Employer share (2%)', value: peso(result.employerShare) }]
          : []),
        { label: 'Total monthly Pag-IBIG savings', value: peso(result.total), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="Pag-IBIG Contribution Calculator">
      <Tabs
        label="Member type"
        options={[
          { value: 'employee', label: 'Employee' },
          { value: 'self-paying', label: 'Self-Employed / Voluntary' },
        ]}
        value={memberType}
        onChange={setMemberType}
      />
      <CurrencyInput
        id="pagibig-salary"
        label="Monthly salary / income"
        value={salaryRaw}
        onChange={setSalaryRaw}
        error={error}
        hint="Contributions are computed on a Monthly Fund Salary capped at ₱10,000 (HDMF Circular 460)."
      />
      {result && (
        <ResultCard
          headline="Estimated monthly Pag-IBIG contribution"
          amount={peso(result.memberPays)}
          amountNote={
            memberType === 'employee'
              ? `Your share. Total with employer share: ${peso(result.total)}.`
              : 'Your mandatory member savings. You may voluntarily save more (MP2 or upgraded savings).'
          }
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => setSalaryRaw('')}
        >
          {result.clamped && (
            <p class="mt-2 text-xs text-ink-soft">
              Salaries above {peso(rules.mfs_ceiling)} are capped: the maximum mandatory
              contribution is {peso(rules.mfs_ceiling * rules.employee_rate)} employee +{' '}
              {peso(rules.mfs_ceiling * rules.employer_rate)} employer.
            </p>
          )}
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
