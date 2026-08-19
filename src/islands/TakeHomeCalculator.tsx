import { useState } from 'preact/hooks';
import sssJson from '../data/sss/2026.json';
import phJson from '../data/philhealth/2026.json';
import pagibigJson from '../data/pagibig/2026.json';
import taxJson from '../data/tax/2026.json';
import type { PagibigRules, PhilhealthRules, SssRules, TaxRules } from '../lib/rules/types';
import { computeTakeHome } from '../lib/engine/takeHome';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = {
  sss: sssJson as unknown as SssRules,
  philhealth: phJson as unknown as PhilhealthRules,
  pagibig: pagibigJson as unknown as PagibigRules,
  tax: taxJson as unknown as TaxRules,
};

export default function TakeHomeCalculator() {
  const [salaryRaw, setSalaryRaw] = useState('');
  const [salary, error] = useAmount(salaryRaw, 'Monthly gross salary');

  const result = salary !== null && salary > 0 ? computeTakeHome(salary, rules) : null;
  if (result) trackCalculatorUse('take-home-pay');

  const rows = result
    ? [
        { label: 'Monthly gross salary', value: peso(result.grossMonthly), strong: true },
        {
          label: 'SSS contribution (employee share)',
          value: `− ${peso(result.sss.employeeShare)}`,
          href: '/sss-contribution-calculator/',
        },
        {
          label: 'PhilHealth premium (employee share)',
          value: `− ${peso(result.philhealth.employeeShare)}`,
          href: '/philhealth-contribution/',
        },
        {
          label: 'Pag-IBIG contribution (employee share)',
          value: `− ${peso(result.pagibig.employeeShare)}`,
          href: '/pagibig-contribution/',
        },
        { label: 'Taxable income', value: peso(result.taxableIncome) },
        { label: 'Withholding tax (BIR)', value: `− ${peso(result.tax.tax)}` },
        { label: 'Estimated monthly take-home pay', value: peso(result.netMonthly), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="Take-Home Pay Calculator">
      <CurrencyInput
        id="th-salary"
        label="Monthly gross salary"
        value={salaryRaw}
        onChange={setSalaryRaw}
        error={error}
        hint="For private-sector employees paid monthly. Result updates as you type."
      />
      {result && (
        <ResultCard
          headline="Estimated monthly take-home pay"
          amount={peso(result.netMonthly)}
          amountNote={`Total deductions: ${peso(result.totalDeductions)} (${peso(result.totalContributions)} contributions + ${peso(result.tax.tax)} tax).`}
          rows={rows}
          meta={rules.tax.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => setSalaryRaw('')}
        >
          <p class="mt-2 text-xs leading-relaxed text-ink-soft">
            Contribution schedules used: SSS {rules.sss.meta.rule_version}; PhilHealth 5% (floor
            ₱10,000 / ceiling ₱100,000); Pag-IBIG 2% on fund salary capped at ₱10,000. Each line
            above links to the dedicated calculator with the full table and source.
          </p>
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
