import { useState } from 'preact/hooks';
import pagibigJson from '../data/pagibig/2026.json';
import type { PagibigRules } from '../lib/rules/types';
import { maxTermYears, scheduleSummary } from '../lib/engine/pagibigSavings';
import { peso } from '../lib/format';
import { todayInManila } from '../lib/today.mjs';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const rules = pagibigJson as unknown as PagibigRules;
const H = rules.housing_loan;
const A = H.affordable;
const pct = (r: number) => `${(r * 100).toFixed(r * 1000 % 1 === 0 ? 1 : 3).replace(/0+$/, '').replace(/\.$/, '')}%`;
type Plan = string; // 'reg-5', 'promo', 'ahp'
const PLAN_OPTIONS = [
  { value: 'promo', label: `Promo — ${pct(H.promo[0]!.rate)} (up to ₱4.9M) / ${pct(H.promo[1]!.rate)} (above), first ${H.promo[0]!.years} years` },
  ...H.regular_rates.map((r) => ({ value: `reg-${r.years}`, label: `Regular — ${pct(r.rate)} fixed for ${r.years} years` })),
  { value: 'ahp', label: `Affordable Housing (socialized) — ${pct(A.rate)} for the first ${A.rate_years} years` },
];
const TERMS = Array.from({ length: H.max_term_years }, (_, i) => H.max_term_years - i).map((y) => ({ value: String(y), label: `${y} years` }));
const UNTIL = new Date(H.rates_valid_until + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
/** Past the published validity date (Philippine calendar): keep computing, but say the rates may be out of date. */
const RATES_EXPIRED = todayInManila() > H.rates_valid_until;
const numInput = 'w-full rounded-lg border border-line px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-1 focus:ring-accent';

export default function PagibigHousingLoanCalculator() {
  const [loanRaw, setLoanRaw] = useState('');
  const [plan, setPlan] = useState<Plan>('promo');
  const [termRaw, setTermRaw] = useState('30');
  const [ageRaw, setAgeRaw] = useState('');
  const [loan, loanError] = useAmount(loanRaw, 'Loan amount');
  const age = ageRaw === '' ? null : Number(ageRaw);
  const ageOk = age === null || (Number.isInteger(age) && age >= 18 && age <= 80);
  const cap = maxTermYears(age, H.max_term_years, H.max_age_at_maturity);
  const term = Math.min(Number(termRaw), cap);
  const tooOld = age !== null && age > H.max_age_at_application;
  const overMax = loan !== null && loan > H.max_loan;
  const ahpCap = Math.max(...A.caps.map((c) => c.max_loan));

  let rate = 0;
  let periodYears = 0;
  let planLabel = '';
  if (loan !== null && loan > 0) {
    if (plan === 'promo') {
      const tier = H.promo.find((p) => loan <= p.max_loan) ?? H.promo[H.promo.length - 1]!;
      rate = tier.rate;
      periodYears = tier.years;
      planLabel = `promo rate for the first ${tier.years} years`;
    } else if (plan === 'ahp') {
      rate = A.rate;
      periodYears = A.rate_years;
      planLabel = `subsidized Affordable Housing rate for the first ${A.rate_years} years`;
    } else {
      const years = Number(plan.split('-')[1]);
      const r = H.regular_rates.find((x) => x.years === years)!;
      rate = r.rate;
      periodYears = r.years;
      planLabel = `rate fixed for ${r.years} years`;
    }
  }
  const valid = loan !== null && loan > 0 && !overMax && ageOk && term > 0;
  const s = valid ? scheduleSummary(loan!, rate, term, Math.min(periodYears, term)) : null;
  if (s) trackCalculatorUse('pagibig-housing-loan');
  const rows = s
    ? [
        { label: 'Loan amount', value: peso(loan!) },
        { label: `Interest rate (${planLabel})`, value: pct(rate) },
        { label: 'Loan term', value: `${term} years (${s.months} months)` },
        { label: 'Monthly amortization (principal + interest)', value: peso(s.monthly), strong: true },
        { label: `Interest paid in the first ${Math.min(periodYears, term)} years`, value: peso(s.interestInPeriod), indent: true },
        { label: `Principal repaid in the first ${Math.min(periodYears, term)} years`, value: peso(s.principalInPeriod), indent: true },
        { label: `Balance when the rate reprices`, value: peso(s.balanceAfterPeriod), indent: true },
        { label: 'Housing Loan Reserve Payment deducted from proceeds (one amortization)', value: peso(s.monthly) },
      ]
    : [];
  return (
    <CalculatorShell title="Pag-IBIG Housing Loan Calculator">
      <CurrencyInput id="hl-loan" label="Loan amount" value={loanRaw} onChange={setLoanRaw} error={loanError ?? (overMax ? `The maximum Pag-IBIG housing loan is ${peso(H.max_loan)}.` : null)} hint={`Up to ${peso(H.max_loan)}; loans above ₱6M are limited to ${H.ltv_above_6m * 100}% of the appraised value (Circular No. 491).`} />
      <SelectField id="hl-plan" label={`Interest rate (Pag-IBIG rates until ${UNTIL})`} options={PLAN_OPTIONS} value={plan} onChange={setPlan} />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <SelectField id="hl-term" label="Loan term" options={TERMS.filter((t) => Number(t.value) <= cap)} value={String(term)} onChange={setTermRaw} />
        </div>
        <div class="mb-3 sm:w-48">
          <label htmlFor="hl-age" class="mb-1 block text-sm font-medium text-ink">Your age (optional)</label>
          <input id="hl-age" type="text" inputMode="numeric" class={numInput} placeholder="e.g. 35" value={ageRaw} onInput={(e) => setAgeRaw((e.target as HTMLInputElement).value.trim())} />
          <p class="mt-1 text-xs text-ink-soft">The loan must end by age {H.max_age_at_maturity}.</p>
        </div>
      </div>
      {tooOld && <p class="mt-1 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">Applicants must be not more than {H.max_age_at_application} years old at the date of application.</p>}
      {plan === 'ahp' && loan !== null && loan > ahpCap && (
        <p class="mt-1 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink" role="alert">The Affordable Housing Program covers socialized homes only — up to {peso(A.caps[0]!.max_loan)} for a house and lot or {peso(A.caps[2]!.max_loan)} for a condominium unit (27 sqm and above). Your amount would be priced at the regular or promo rate.</p>
      )}
      {s && (
        <ResultCard
          headline="Estimated monthly amortization"
          amount={peso(s.monthly)}
          amountNote={`At ${pct(rate)} over ${term} years. The rate reprices after ${Math.min(periodYears, term)} years at Pag-IBIG's prevailing rate, so later payments can change. Excludes Mortgage Redemption and fire insurance premiums.${RATES_EXPIRED ? ` These are the rates Pag-IBIG published for loans until ${UNTIL}; check pagibigfund.gov.ph for the rates in force now.` : ''}`}
          rows={rows}
          meta={rules.meta}
          copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
          onReset={() => { setLoanRaw(''); setAgeRaw(''); setTermRaw('30'); }}
        />
      )}
    </CalculatorShell>
  );
}
