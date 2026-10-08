import { useState } from 'preact/hooks';
import wagesJson from '../data/wages/2026.json';
import laborJson from '../data/labor/2026.json';
import sssJson from '../data/sss/2026.json';
import philhealthJson from '../data/philhealth/2026.json';
import pagibigJson from '../data/pagibig/2026.json';
import type { LaborRules, PagibigRules, PhilhealthRules, SssRules, WageRules } from '../lib/rules/types';
import { kasambahayCosts } from '../lib/engine/kasambahay';
import { kasambahayAsOf } from '../lib/engine/wages';
import { todayInManila } from '../lib/today.mjs';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, SelectField, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

// Rows as of the Philippine calendar day, so a published domestic-worker order shows up on its effectivity date.
const TODAY = todayInManila();
const wages = wagesJson as unknown as WageRules;
const ROWS = kasambahayAsOf(wages, TODAY);
const law = (laborJson as unknown as LaborRules).kasambahay;
const RULES = {
  sss: sssJson as unknown as SssRules,
  philhealth: philhealthJson as unknown as PhilhealthRules,
  pagibig: pagibigJson as unknown as PagibigRules,
  employerPaysAllBelow: law.employer_pays_all_premiums_below,
  householdMscFloor: law.sss_household_msc_floor,
};
const REGION_OPTIONS = ROWS.map((r) => ({ value: r.region, label: `${r.region} — ${peso(r.monthly)}` }));
const META = {
  rule_version: 'RA 10361 (Batas Kasambahay) · NWPC domestic-worker wage orders · SSS Circular 2024-007 · PhilHealth Circular 2020-0005 · HDMF Circular 460',
  effective_from: wages.meta.effective_from,
  effective_to: null,
  last_verified: (laborJson as unknown as LaborRules).meta.last_verified,
  official_source_url: law.law_url,
  official_source_label: 'RA 10361 — Domestic Workers Act (lawphil.net)',
};
const longDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

export default function KasambahayCalculator() {
  const [region, setRegion] = useState('NCR');
  const [wageRaw, setWageRaw] = useState('');
  const [typed, wageError] = useAmount(wageRaw, 'Monthly wage');

  const row = ROWS.find((r) => r.region === region) ?? ROWS[0]!;
  const wage = typed !== null && typed > 0 ? typed : row.monthly;
  const c = kasambahayCosts(wage, RULES);
  const below = wage < row.monthly ? row.monthly - wage : 0;
  if (typed !== null || region !== 'NCR') trackCalculatorUse('kasambahay');

  const rows = [
    { label: `Monthly cash wage${typed === null ? ' (regional minimum)' : ''}`, value: peso(wage), strong: true },
    { label: `SSS (MSC ${peso(c.sssMsc)}) — kasambahay / employer incl. EC`, value: `${peso(c.sss.worker)} / ${peso(c.sss.employer)}`, indent: true },
    { label: 'PhilHealth — kasambahay / employer', value: `${peso(c.philhealth.worker)} / ${peso(c.philhealth.employer)}`, indent: true },
    { label: 'Pag-IBIG — kasambahay / employer', value: `${peso(c.pagibig.worker)} / ${peso(c.pagibig.employer)}`, indent: true },
    { label: 'Deducted from the kasambahay’s pay', value: peso(c.workerTotal) },
    { label: 'Kasambahay take-home pay', value: peso(c.netPay), strong: true },
    { label: 'Employer premiums on top of the wage', value: peso(c.employerTotal) },
    { label: '13th month pay for a full year (due by December 24)', value: peso(wage) },
  ];

  return (
    <CalculatorShell title="Kasambahay Salary & Contributions Calculator">
      <SelectField id="kb-region" label="Region where the household lives" options={REGION_OPTIONS} value={region} onChange={setRegion} />
      <CurrencyInput
        id="kb-wage"
        label="Monthly cash wage (leave blank for the regional minimum)"
        value={wageRaw}
        onChange={setWageRaw}
        error={wageError}
        placeholder={row.monthly.toLocaleString('en-PH')}
        hint="Cash wage only. Meals and lodging are the employer’s duty under RA 10361 and are not deducted."
      />
      <ResultCard
        headline={`Household’s monthly cost — ${row.region}`}
        amount={peso(c.employerCost)}
        amountNote={`Wage plus the employer’s SSS, PhilHealth and Pag-IBIG. Regional minimum ${peso(row.monthly)} a month${row.wage_order ? ` (Wage Order ${row.wage_order}${row.effectivity ? `, since ${longDate(row.effectivity)}` : ''})` : ''}.`}
        rows={rows}
        meta={META}
        effectiveText="Rates in force today (Philippine date)"
        copyText={rows.map((r) => `${r.label}: ${r.value}`).join('\n')}
        onReset={() => {
          setRegion('NCR');
          setWageRaw('');
        }}
      >
        {below > 0 && (
          <p class="mt-3 rounded-lg border border-red-300 bg-red-50 p-2 text-xs font-medium text-red-700" role="alert">
            {peso(wage)} is {peso(below)} below the {row.region} kasambahay minimum of {peso(row.monthly)}. Domestic-worker wage orders allow no exemptions.
          </p>
        )}
        {c.employerPaysAll && (
          <p class="mt-2 text-xs text-ink-soft">
            Below {peso(RULES.employerPaysAllBelow)} a month the employer pays every premium in full (RA 10361 Sec. 30).
          </p>
        )}
        {row.upcoming && (
          <p class="mt-2 text-xs text-ink-soft">
            {row.region} rises to {peso(row.upcoming.monthly)} on {longDate(row.upcoming.effectivity)} (Wage Order {row.upcoming.wage_order}).
          </p>
        )}
      </ResultCard>
    </CalculatorShell>
  );
}
