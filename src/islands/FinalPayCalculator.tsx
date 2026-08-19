import { useState } from 'preact/hooks';
import laborJson from '../data/labor/2026.json';
import type { LaborRules } from '../lib/rules/types';
import { computeFinalPay } from '../lib/engine/finalPay';
import { parseAmount, peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, Tabs, ResultCard } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const labor = laborJson as unknown as LaborRules;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FIELDS = [
  { key: 'unpaidSalary', label: 'Unpaid earned salary' },
  { key: 'leaveConversion', label: 'Unused SIL / leave conversion' },
  { key: 'otherLeave', label: 'Other convertible leave' },
  { key: 'separationPay', label: 'Separation pay (if applicable)' },
  { key: 'retirementPay', label: 'Retirement pay (if applicable)' },
  { key: 'taxRefund', label: 'Tax refund / adjustment' },
  { key: 'depositsReturn', label: 'Cash bond / deposit return' },
  { key: 'otherCompensation', label: 'Other compensation' },
  { key: 'deductions', label: 'Deductions (loans, accountabilities…)' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

export default function FinalPayCalculator() {
  const [values, setValues] = useState<Record<FieldKey, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, ''])) as Record<FieldKey, string>,
  );
  const [thmMode, setThmMode] = useState<'auto' | 'manual'>('auto');
  const [thmManual, setThmManual] = useState('');
  const [monthly, setMonthly] = useState<string[]>(Array(12).fill(''));

  const num = (k: FieldKey) => parseAmount(values[k]) ?? 0;
  const anyInput =
    FIELDS.some((f) => num(f.key) > 0) ||
    (thmMode === 'manual' ? (parseAmount(thmManual) ?? 0) > 0 : monthly.some((m) => (parseAmount(m) ?? 0) > 0));

  const result = anyInput
    ? computeFinalPay({
        unpaidSalary: num('unpaidSalary'),
        leaveConversion: num('leaveConversion'),
        otherLeave: num('otherLeave'),
        thirteenthMonthMode: thmMode,
        thirteenthMonthMonthlyBasics: monthly.map((m) => parseAmount(m) ?? 0),
        thirteenthMonthManual: parseAmount(thmManual) ?? 0,
        separationPay: num('separationPay'),
        retirementPay: num('retirementPay'),
        taxRefund: num('taxRefund'),
        depositsReturn: num('depositsReturn'),
        otherCompensation: num('otherCompensation'),
        deductions: num('deductions'),
      })
    : null;
  if (result) trackCalculatorUse('final-pay');

  const rows = result
    ? [
        ...result.items.map((i) => ({ label: `+ ${i.label}`, value: peso(i.amount) })),
        ...(result.deductions > 0
          ? [{ label: '− Deductions', value: peso(result.deductions) }]
          : []),
        { label: 'Estimated final / back pay', value: peso(result.total), strong: true },
      ]
    : [];

  return (
    <CalculatorShell title="Final Pay / Back Pay Calculator">
      <p class="mb-3 text-sm text-ink-soft">
        Fill in only the items that apply to you — every field is optional.
      </p>
      <div class="grid gap-x-4 sm:grid-cols-2">
        {FIELDS.slice(0, 3).map((f) => (
          <CurrencyInput
            key={f.key}
            id={`fp-${f.key}`}
            label={f.label}
            value={values[f.key]}
            onChange={(v) => setValues({ ...values, [f.key]: v })}
          />
        ))}
      </div>

      <div class="mb-3 rounded-lg border border-line bg-surface-soft p-3">
        <p class="mb-2 text-sm font-medium text-ink">Pro-rated 13th month pay</p>
        <Tabs
          label="13th month mode"
          options={[
            { value: 'auto', label: 'Compute for me' },
            { value: 'manual', label: 'I know the amount' },
          ]}
          value={thmMode}
          onChange={setThmMode}
        />
        {thmMode === 'manual' ? (
          <CurrencyInput
            id="fp-thm-manual"
            label="Pro-rated 13th month amount"
            value={thmManual}
            onChange={setThmManual}
          />
        ) : (
          <div>
            <p class="mb-2 text-xs text-ink-soft">
              Enter the basic salary you earned each month of this calendar year up to your last
              day (blank = not worked).
            </p>
            <div class="grid grid-cols-3 gap-x-2 sm:grid-cols-4">
              {MONTHS.map((m, i) => (
                <CurrencyInput
                  key={m}
                  id={`fp-m-${m.toLowerCase()}`}
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
      </div>

      <div class="grid gap-x-4 sm:grid-cols-2">
        {FIELDS.slice(3).map((f) => (
          <CurrencyInput
            key={f.key}
            id={`fp-${f.key}`}
            label={f.label}
            value={values[f.key]}
            onChange={(v) => setValues({ ...values, [f.key]: v })}
          />
        ))}
      </div>

      {result && (
        <ResultCard
          headline="Estimated final / back pay"
          amount={peso(result.total)}
          amountNote="Estimate only — your employer's payroll and clearance process determines the final figure."
          rows={rows}
          meta={labor.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => {
            setValues(
              Object.fromEntries(FIELDS.map((f) => [f.key, ''])) as Record<FieldKey, string>,
            );
            setThmManual('');
            setMonthly(Array(12).fill(''));
          }}
        />
      )}
    </CalculatorShell>
  );
}
