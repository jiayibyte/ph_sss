import { useMemo, useRef, useState } from 'preact/hooks';
import rulesJson from '../data/sss/2026.json';
import type { SssMemberType, SssRules } from '../lib/rules/types';
import { computeSss, findSssRow } from '../lib/engine/sss';
import { peso } from '../lib/format';
import { CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as SssRules;

const MEMBER_OPTIONS = (Object.keys(rules.member_types) as SssMemberType[]).map((k) => ({
  value: k,
  label: rules.member_types[k].label,
}));

function rangeLabel(min: number, max: number | null): string {
  if (min === 0) return `Below ${peso(max ?? 0)}`;
  if (max === null) return `${peso(min)} and above`;
  return `${peso(min)} – ${peso(max - 0.01)}`;
}

/**
 * Salary lookup + full contribution table with member-type tabs.
 * Only the active member type's table is rendered (DOM budget, design.md §5.5).
 */
export default function SssTable() {
  const [memberType, setMemberType] = useState<SssMemberType>('employee');
  const [salaryRaw, setSalaryRaw] = useState('');
  const [salary, error] = useAmount(salaryRaw, 'Monthly salary');
  const tableRef = useRef<HTMLDivElement>(null);

  const result =
    salary !== null && salary > 0 ? computeSss(salary, memberType, rules) : null;
  if (result) trackCalculatorUse('sss-table-lookup');

  const highlightMsc = result?.msc ?? null;
  const activeRows = useMemo(() => rules.table[memberType], [memberType]);
  const split = rules.member_types[memberType].split;

  const lookupRows = result
    ? [
        { label: 'Monthly salary', value: peso(result.salary) },
        { label: 'Monthly Salary Credit (MSC)', value: peso(result.msc), strong: true },
        ...(split
          ? [
              { label: 'Employee contribution', value: peso(result.employeeShare) },
              { label: 'Employer contribution (incl. EC)', value: peso(result.employerShare) },
            ]
          : [{ label: 'Member contribution', value: peso(result.employeeShare) }]),
        { label: 'Total', value: peso(result.total), strong: true },
      ]
    : [];

  const scrollToRow = () => {
    if (!result || !tableRef.current) return;
    const el = tableRef.current.querySelector(`[data-msc="${result.msc}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div>
      <div class="rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
        <h2 class="mb-3 text-base font-bold text-ink">Find Your SSS Contribution</h2>
        <Tabs
          label="Member type"
          options={MEMBER_OPTIONS}
          value={memberType}
          onChange={setMemberType}
        />
        <CurrencyInput
          id="sss-lookup-salary"
          label="Monthly salary / income"
          value={salaryRaw}
          onChange={setSalaryRaw}
          error={error}
        />
        {result && (
          <ResultCard
            headline={`Your monthly SSS contribution — ${rules.member_types[memberType].label}`}
            amount={peso(result.employeeShare)}
            amountNote={
              split
                ? `Your share as employee. Total with employer share: ${peso(result.total)}.`
                : 'You pay the full amount as a member.'
            }
            rows={lookupRows}
            meta={rules.meta}
            copyText={lookupRows.map((r) => `${r.label}: ${r.value}`).join('\n')}
            onReset={() => setSalaryRaw('')}
          >
            <button
              type="button"
              onClick={scrollToRow}
              class="mt-2 text-sm font-medium text-accent underline hover:text-accent-strong"
            >
              Show my row in the table ↓
            </button>
          </ResultCard>
        )}
      </div>

      <div class="mt-8" ref={tableRef}>
        <h2 class="text-xl font-bold text-ink">
          {rules.member_types[memberType].label} Contribution Table 2026
        </h2>
        <p class="mt-1 text-sm text-ink-soft">
          {split
            ? 'Employee share is 5% of the MSC; employer share is 10% plus the EC contribution.'
            : memberType === 'self-employed'
              ? 'Self-employed members pay the full 15% of the MSC plus the EC contribution.'
              : 'Members pay the full 15% of the MSC.'}
        </p>
        <div class="table-scroll mt-3">
          <table class="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr>
                <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-left">
                  Monthly Salary Range
                </th>
                <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-right">MSC</th>
                {split ? (
                  <>
                    <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-right">
                      Employee
                    </th>
                    <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-right">
                      Employer
                    </th>
                    <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-right">EC</th>
                  </>
                ) : (
                  <>
                    <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-right">
                      Member Pays
                    </th>
                    {memberType === 'self-employed' && (
                      <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-right">
                        EC
                      </th>
                    )}
                  </>
                )}
                <th class="border-b-2 border-line bg-surface-soft px-2 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row) => (
                <tr
                  key={row.msc}
                  data-msc={row.msc}
                  class={
                    row.msc === highlightMsc
                      ? 'bg-accent-soft font-semibold'
                      : 'odd:bg-surface even:bg-surface-soft'
                  }
                >
                  <td class="border-b border-line px-2 py-1.5">
                    {rangeLabel(row.range_min, row.range_max)}
                  </td>
                  <td class="border-b border-line px-2 py-1.5 text-right">{peso(row.msc)}</td>
                  {split ? (
                    <>
                      <td class="border-b border-line px-2 py-1.5 text-right">
                        {peso(row.employee_share)}
                      </td>
                      <td class="border-b border-line px-2 py-1.5 text-right">
                        {peso(row.employer_share)}
                      </td>
                      <td class="border-b border-line px-2 py-1.5 text-right">{peso(row.ec)}</td>
                    </>
                  ) : (
                    <>
                      <td class="border-b border-line px-2 py-1.5 text-right">
                        {peso(row.employee_share)}
                      </td>
                      {memberType === 'self-employed' && (
                        <td class="border-b border-line px-2 py-1.5 text-right">{peso(row.ec)}</td>
                      )}
                    </>
                  )}
                  <td class="border-b border-line px-2 py-1.5 text-right font-medium">
                    {peso(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { findSssRow };
