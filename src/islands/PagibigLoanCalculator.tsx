import { useState } from 'preact/hooks';
import pagibigJson from '../data/pagibig/2026.json';
import type { PagibigRules } from '../lib/rules/types';
import { computeShortTermLoan, type StlType } from '../lib/engine/pagibigLoans';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = pagibigJson as unknown as PagibigRules;
const L = rules.short_term_loans;
const TERMS = L.terms_months.map((m) => ({ value: String(m), label: `${m} months (${m / 12} year${m > 12 ? 's' : ''})` }));
const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;
const pct = (r: number, dp = 2) => `${+(r * 100).toFixed(dp)}%`;

export default function PagibigLoanCalculator() {
  const [type, setType] = useState<StlType>('mpl');
  const [tavRaw, setTavRaw] = useState('');
  const [outRaw, setOutRaw] = useState('');
  const [wantRaw, setWantRaw] = useState('');
  const [term, setTerm] = useState(String(L.default_term_months));
  const [tav, tavError] = useAmount(tavRaw, 'Total savings');
  const [outstanding, outError] = useAmount(outRaw, 'Outstanding loan balance');
  const [want, wantError] = useAmount(wantRaw, 'Amount applied for');

  const r = tav !== null && tav > 0 ? computeShortTermLoan({ type, tav, outstanding: outstanding ?? 0, desired: want, termMonths: Number(term) }, rules) : null;
  if (r) trackCalculatorUse('pagibig-salary-loan');
  const p = type === 'mpl' ? L.mpl : L.calamity;
  const rateLabel = type === 'mpl' ? `${pct(L.mpl.rate_monthly, 4)} a month` : `${pct(L.calamity.rate_annual)} a year`;

  const rows = r
    ? [
        { label: `Loan entitlement: ${Math.round(L.tav_share * 100)}% of your savings${outstanding ? ' less outstanding MPL/Calamity/HELPs' : ''}`, value: peso(r.entitlement) },
        { label: 'Loan amount', value: peso(r.loanAmount), strong: true },
        { label: `Monthly amortization × ${r.termMonths}`, value: peso(r.monthlyAmortization), strong: true },
        { label: `Interest: ${rateLabel}, diminishing balance`, value: peso(r.totalInterest) },
        { label: `of which interest during the ${r.graceMonths}-month grace period`, value: peso(r.graceInterest), indent: true },
        { label: 'Total to repay', value: peso(r.totalPayable) },
        { label: 'First payment', value: `${ord(r.firstPaymentMonth)} month after release, by the 15th` },
        ...(type === 'mpl'
          ? [{ label: 'Earliest renewal', value: `after ${L.mpl.renewal_after_amortizations} payments and the ${ord(L.mpl.renewal_not_before_month)} month` }]
          : [{ label: 'Apply within', value: `${L.calamity.apply_within_days} days of the calamity declaration` }]),
        { label: 'Late payment penalty', value: `${pct(L.penalty_per_day, 2)} of the unpaid amount per day` },
      ]
    : [];

  return (
    <CalculatorShell title="Pag-IBIG Salary Loan & Calamity Loan Calculator">
      <Tabs
        label="Loan"
        options={[
          { value: 'mpl', label: `Multi-Purpose (salary) Loan — ${pct(L.mpl.rate_monthly, 4)}/month` },
          { value: 'calamity', label: `Calamity Loan — ${pct(L.calamity.rate_annual)}/year` },
        ]}
        value={type}
        onChange={setType}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="pl-tav"
            label="Your total Pag-IBIG Regular Savings (TAV)"
            value={tavRaw}
            onChange={setTavRaw}
            error={tavError}
            hint="Your contributions + employer's + dividends, as shown in Virtual Pag-IBIG. 24 months at ₱200 + ₱200 ≈ ₱9,600 before dividends."
          />
        </div>
        <div class="sm:flex-1">
          <CurrencyInput
            id="pl-want"
            label="Amount you want to borrow (optional)"
            value={wantRaw}
            onChange={setWantRaw}
            error={wantError}
            hint="Leave blank to borrow the maximum."
          />
        </div>
      </div>
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="pl-out"
            label="Outstanding MPL / Calamity / HELPs balance (optional)"
            value={outRaw}
            onChange={setOutRaw}
            error={outError}
            hint="Deducted from what you can borrow."
          />
        </div>
        <div class="sm:flex-1">
          <SelectField id="pl-term" label="Payment term" options={TERMS} value={term} onChange={setTerm} />
        </div>
      </div>
      {r && (
        <ResultCard
          headline={type === 'mpl' ? 'Estimated monthly amortization — Multi-Purpose Loan' : 'Estimated monthly amortization — Calamity Loan'}
          amount={peso(r.monthlyAmortization)}
          amountNote={`${peso(r.loanAmount)} over ${r.termMonths} months at ${rateLabel}, with interest during the ${p.grace_months}-month grace period (${type === 'mpl' ? 'Circular No. 469' : 'Circular No. 470'}). Your Pag-IBIG disclosure statement shows the exact figure; capacity to pay (your net take-home pay) can lower the amount.`}
          rows={rows}
          meta={{ ...rules.meta, rule_version: p.circular, official_source_url: p.page_url, official_source_label: `Pag-IBIG Fund — ${type === 'mpl' ? 'Multi-Purpose Loan' : 'Calamity Loan'} (pagibigfund.gov.ph)` }}
          effectiveText="15 days after publication of the circular (signed April 30, 2025)"
          copyText={rows.map((x) => `${x.label}: ${x.value}`).join('\n')}
          onReset={() => {
            setTavRaw('');
            setOutRaw('');
            setWantRaw('');
            setTerm(String(L.default_term_months));
          }}
        />
      )}
    </CalculatorShell>
  );
}
