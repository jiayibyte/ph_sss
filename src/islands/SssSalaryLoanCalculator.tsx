import { useState } from 'preact/hooks';
import rulesJson from '../data/sss/2026.json';
import type { SssRules } from '../lib/rules/types';
import { findSssRow } from '../lib/engine/sss';
import { benefitMscCap, computeSalaryLoan } from '../lib/engine/sssBenefits';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = rulesJson as unknown as SssRules;
const L = rules.benefits.salary_loan;
const CAP = benefitMscCap(rules);
type LoanType = '1' | '2';
type Basis = 'salary' | 'msc';
const pct = (n: number) => `${Math.round(n * 100)}%`;
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const longMonth = (ym: string) =>
  new Date(ym + '-01T00:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
const longDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

export default function SssSalaryLoanCalculator() {
  const [loanType, setLoanType] = useState<LoanType>('1');
  const [basis, setBasis] = useState<Basis>('salary');
  const [amountRaw, setAmountRaw] = useState('');
  const [requestedRaw, setRequestedRaw] = useState('');
  const [loanDate, setLoanDate] = useState(todayIso());
  const [condoned, setCondoned] = useState(false);
  const [amount, amountError] = useAmount(amountRaw, basis === 'salary' ? 'Monthly salary' : 'Average MSC');
  const [requested, requestedError] = useAmount(requestedRaw, 'Amount applied for');

  const averageMsc =
    amount !== null && amount > 0
      ? basis === 'salary'
        ? findSssRow(amount, 'employee', rules).regular_msc
        : amount
      : null;
  const result =
    averageMsc !== null
      ? computeSalaryLoan(
          {
            averageMsc,
            months: loanType === '2' ? 2 : 1,
            requested: requested ?? null,
            renewalWithCondonation: condoned,
            loanDate: loanDate || null,
          },
          rules,
        )
      : null;
  if (result) trackCalculatorUse('sss-salary-loan');

  const rows = result
    ? [
        { label: 'Average of last 12 MSCs (Regular SS), rounded up to the next bracket', value: peso(result.baseMsc) },
        { label: `Maximum loanable (${loanType === '2' ? 'two-month' : 'one-month'} loan)`, value: peso(result.loanableAmount) },
        { label: 'Loan amount', value: peso(result.loanAmount), strong: true },
        { label: `Service fee (${pct(L.service_fee_pct)})`, value: `− ${peso(result.serviceFee)}` },
        ...(result.proratedInterestDays > 0
          ? [
              {
                label: `Pro-rated interest deducted in advance (${result.proratedInterestDays} days at ${pct(result.interestRate)})`,
                value: `− ${peso(result.proratedInterest)}`,
              },
            ]
          : []),
        { label: 'Net proceeds released to you', value: peso(result.netProceeds), strong: true },
        { label: `Monthly amortization × ${result.termMonths}`, value: peso(result.monthlyAmortization), strong: true },
        { label: `Interest over the term (${pct(result.interestRate)} p.a., diminishing balance)`, value: peso(result.totalInterest) },
        { label: 'Total to repay', value: peso(result.totalPayable) },
        ...(result.firstAmortizationMonth && result.firstPaymentDeadline
          ? [
              { label: 'First amortization month', value: longMonth(result.firstAmortizationMonth) },
              { label: 'First payment deadline', value: longDate(result.firstPaymentDeadline) },
            ]
          : []),
      ]
    : [];

  return (
    <CalculatorShell title="SSS Salary Loan Calculator">
      <Tabs
        label="Loan type"
        options={[
          { value: '1', label: `One-month loan (≥${L.one_month_min_contributions} contributions)` },
          { value: '2', label: `Two-month loan (≥${L.two_month_min_contributions} contributions)` },
        ]}
        value={loanType}
        onChange={setLoanType}
      />
      <Tabs
        label="What you know"
        options={[
          { value: 'salary', label: 'My monthly salary' },
          { value: 'msc', label: 'My average MSC (from My.SSS)' },
        ]}
        value={basis}
        onChange={setBasis}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="loan-amount"
            label={basis === 'salary' ? 'Monthly salary' : 'Average of your 12 latest posted MSCs'}
            value={amountRaw}
            onChange={setAmountRaw}
            error={amountError}
            hint={
              basis === 'salary'
                ? `Converted to the Regular SS monthly salary credit (max ${peso(CAP)}) and assumed constant over the last 12 months.`
                : `SSS uses the Regular SS portion of the MSC (max ${peso(CAP)}), rounded up to the next bracket.`
            }
          />
        </div>
        <div class="sm:flex-1">
          <CurrencyInput
            id="loan-requested"
            label="Amount applied for (optional)"
            value={requestedRaw}
            onChange={setRequestedRaw}
            error={requestedError}
            hint="Leave blank to borrow the maximum."
          />
        </div>
      </div>
      <div class="sm:flex sm:items-end sm:gap-4">
        <div class="mb-3 sm:w-56">
          <label htmlFor="loan-date" class="mb-1 block text-sm font-medium text-ink">
            Loan approval date
          </label>
          <input
            id="loan-date"
            type="date"
            class="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            value={loanDate}
            onInput={(e) => setLoanDate((e.target as HTMLInputElement).value)}
          />
          <p class="mt-1 text-xs text-ink-soft">Sets the pro-rated advance interest and your first due date.</p>
        </div>
        <label class="mb-3 flex items-center gap-2 py-2.5 text-sm text-ink">
          <input
            type="checkbox"
            class="h-4 w-4 accent-accent"
            checked={condoned}
            onChange={(e) => setCondoned((e.target as HTMLInputElement).checked)}
          />
          Renewal, and I availed of a penalty condonation in the last 5 years ({pct(L.interest_pa_renewal_condoned)} rate)
        </label>
      </div>
      {result && (
        <ResultCard
          headline="Estimated monthly amortization"
          amount={peso(result.monthlyAmortization)}
          amountNote={`${result.termMonths} equal monthly payments at ${pct(result.interestRate)} per year on the diminishing balance. Net proceeds: ${peso(result.netProceeds)}.`}
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => {
            setAmountRaw('');
            setRequestedRaw('');
            setLoanDate(todayIso());
            setCondoned(false);
          }}
        >
          <p class="mt-2 text-xs text-ink-soft">
            Terms per SSS Circular No. 2025-004 (in force since June 16, 2025). Amortizations paid after the due date carry
            a {L.penalty_per_month * 100}% per month penalty. SSS's disclosure statement may differ by a few pesos because of
            rounding and the exact release date.
          </p>
        </ResultCard>
      )}
    </CalculatorShell>
  );
}
