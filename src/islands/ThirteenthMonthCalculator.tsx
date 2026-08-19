import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import type { LaborRules } from '../lib/rules/types';
import { compute13thMonth, compute13thMonthSimple } from '../lib/engine/thirteenthMonth';
import { parseAmount, peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const labor = laborJson as unknown as LaborRules;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Mode = 'simple' | 'accurate';

export default function ThirteenthMonthCalculator() {
  const [mode, setMode] = useState<Mode>('simple');
  const [salaryRaw, setSalaryRaw] = useState('');
  const [monthsRaw, setMonthsRaw] = useState('12');
  const [monthly, setMonthly] = useState<string[]>(Array(12).fill(''));

  const [salary, salaryError] = useAmount(salaryRaw, 'Monthly basic salary');
  const monthsWorked = Number(monthsRaw);
  const monthsError =
    monthsRaw !== '' && (!Number.isFinite(monthsWorked) || monthsWorked < 0 || monthsWorked > 12)
      ? 'Months worked must be between 0 and 12.'
      : null;

  let result = null;
  if (mode === 'simple' && salary !== null && salary > 0 && !monthsError && monthsRaw !== '') {
    result = compute13thMonthSimple(salary, monthsWorked, labor.thirteenth_month.divisor);
  } else if (mode === 'accurate') {
    const values = monthly.map((m) => parseAmount(m) ?? 0);
    if (values.some((v) => v > 0)) {
      result = compute13thMonth(values, labor.thirteenth_month.divisor);
    }
  }
  if (result) trackCalculatorUse('13th-month-pay');

  const countedMonths = result ? result.months.filter((m) => m > 0).length : 0;
  const rows = result
    ? [
        {
          label: `Total basic salary earned (${countedMonths} month${countedMonths === 1 ? '' : 's'})`,
          value: peso(result.totalBasicSalary),
        },
        { label: '÷ 12', value: '' },
        { label: 'Estimated 13th month pay', value: peso(result.amount), strong: true },
      ]
    : [];

  const reset = () => {
    setSalaryRaw('');
    setMonthsRaw('12');
    setMonthly(Array(12).fill(''));
  };

  return (
    <CalculatorShell title="13th Month Pay Calculator">
      <Tabs
        label="Calculator mode"
        options={[
          { value: 'simple', label: 'Simple (fixed salary)' },
          { value: 'accurate', label: 'Accurate (month by month)' },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'simple' ? (
        <div class="sm:flex sm:gap-4">
          <div class="sm:flex-1">
            <CurrencyInput
              id="thm-salary"
              label="Monthly basic salary"
              value={salaryRaw}
              onChange={setSalaryRaw}
              error={salaryError}
            />
          </div>
          <div class="sm:w-44">
            <label htmlFor="thm-months" class="mb-1 block text-sm font-medium text-ink">
              Months worked this year
            </label>
            <input
              id="thm-months"
              type="text"
              inputMode="decimal"
              class={`w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent ${monthsError ? 'border-red-500' : 'border-line'}`}
              value={monthsRaw}
              aria-invalid={monthsError ? 'true' : undefined}
              onInput={(e) => setMonthsRaw((e.target as HTMLInputElement).value)}
            />
            {monthsError && (
              <p class="mt-1 text-xs font-medium text-red-600" role="alert">
                {monthsError}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p class="mb-2 text-sm text-ink-soft">
            Enter the basic salary you actually earned each month. Leave blank (or 0) for months
            you did not work — this handles mid-year hiring, resignation and salary increases.
          </p>
          <div class="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
            {MONTHS.map((m, i) => (
              <CurrencyInput
                key={m}
                id={`thm-${m.toLowerCase()}`}
                label={m}
                value={monthly[i]!}
                onChange={(v) => {
                  const next = [...monthly];
                  next[i] = v;
                  setMonthly(next);
                }}
              />
            ))}
          </div>
        </div>
      )}
      {result && (
        <ResultCard
          headline="Estimated 13th month pay"
          amount={peso(result.amount)}
          amountNote="Total basic salary earned during the calendar year ÷ 12 (PD 851 / DOLE)."
          rows={rows}
          meta={labor.meta}
          copyText={`Total basic salary earned: ${peso(result.totalBasicSalary)}\n13th month pay: ${peso(result.amount)}`}
          onReset={reset}
        >
          <details class="mt-2 text-sm text-ink-soft">
            <summary class="cursor-pointer font-medium text-ink">
              What was included / not included
            </summary>
            <ul class="ml-5 mt-2 list-disc space-y-1">
              <li>
                <strong>Included:</strong> basic salary actually earned in the calendar year.
              </li>
              <li>
                <strong>Not included:</strong> overtime pay, holiday premium, night differential,
                allowances and monetary benefits not integrated into basic salary (COLA), unless
                your company policy or agreement treats them as part of basic salary.
              </li>
              <li>Company policy or CBA can be more generous than the legal minimum.</li>
            </ul>
          </details>
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
