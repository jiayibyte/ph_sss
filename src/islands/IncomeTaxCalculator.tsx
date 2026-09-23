import { useState } from 'preact/hooks';
import taxJson from '../data/tax/2026.json';
import sssJson from '../data/sss/2026.json';
import philhealthJson from '../data/philhealth/2026.json';
import pagibigJson from '../data/pagibig/2026.json';
import type { PagibigRules, PhilhealthRules, SssRules, TaxRules } from '../lib/rules/types';
import { compensationTax } from '../lib/engine/tax';
import { computeSss } from '../lib/engine/sss';
import { computePhilhealth } from '../lib/engine/philhealth';
import { computePagibig } from '../lib/engine/pagibig';
import { peso, round2 } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const tax = taxJson as unknown as TaxRules;
const sss = sssJson as unknown as SssRules;
const philhealth = philhealthJson as unknown as PhilhealthRules;
const pagibig = pagibigJson as unknown as PagibigRules;
const CAP = tax.exclusions.thirteenth_month_and_other_benefits_cap;
const pct = (r: number) => `${Math.round(r * 100)}%`;

/** Employee shares for a private-sector employee on this basic pay. */
function privateContributions(basic: number) {
  const s = computeSss(basic, 'employee', sss).employeeShare;
  const ph = computePhilhealth(basic, 'employed', philhealth).employeeShare;
  const pi = computePagibig(basic, 'employee', pagibig).employeeShare;
  return { sss: s, philhealth: ph, pagibig: pi, total: round2(s + ph + pi) };
}

export default function IncomeTaxCalculator() {
  const [basicRaw, setBasicRaw] = useState('');
  const [allowRaw, setAllowRaw] = useState('');
  const [bonusRaw, setBonusRaw] = useState('');
  const [contribRaw, setContribRaw] = useState('');
  const [mwe, setMwe] = useState(false);
  const [basic, basicError] = useAmount(basicRaw, 'Monthly basic pay');
  const [allow, allowError] = useAmount(allowRaw, 'Other taxable pay');
  const [bonus, bonusError] = useAmount(bonusRaw, '13th month and bonuses');
  const [contribOverride, contribError] = useAmount(contribRaw, 'Contributions');

  const ready = basic !== null && basic > 0;
  const est = ready ? privateContributions(basic!) : null;
  const contributions = contribOverride ?? est?.total ?? 0;
  const bonuses = bonus ?? (ready ? basic! : 0); // default: a 13th month equal to one month's basic pay
  const r = ready
    ? compensationTax(
        { monthlyBasic: basic!, monthlyTaxableAllowances: allow ?? 0, annualBonuses: bonuses, monthlyContributions: contributions, minimumWageEarner: mwe },
        tax,
      )
    : null;
  if (r) trackCalculatorUse('income-tax');

  const adj = r?.yearEndAdjustment ?? 0;
  const rows = r
    ? [
        { label: 'Monthly basic pay', value: peso(basic!) },
        ...(allow ? [{ label: 'Other taxable pay', value: peso(allow) }] : []),
        mwe
          ? { label: 'Minimum wage earner: basic pay is exempt', value: '—' }
          : {
              label: contribOverride !== null ? 'Mandatory contributions (your figure)' : `SSS ${peso(est!.sss)} + PhilHealth ${peso(est!.philhealth)} + Pag-IBIG ${peso(est!.pagibig)}`,
              value: `− ${peso(contributions)}`,
            },
        { label: 'Taxable compensation per month', value: peso(r.monthlyTaxable), strong: true },
        { label: 'Withholding tax per month (BIR monthly table)', value: peso(r.monthly.tax), strong: true },
        { label: 'Per semi-monthly payday (semi-monthly table)', value: peso(r.semiMonthly.tax), indent: true },
        { label: `13th month & bonuses ${peso(bonuses)}: exempt up to ${peso(CAP)}`, value: r.bonusTaxable > 0 ? `${peso(r.bonusTaxable)} taxable` : 'all exempt' },
        { label: 'Taxable compensation for the year', value: peso(r.annualTaxable) },
        { label: 'Income tax for the year (graduated rates)', value: peso(r.annual.tax), strong: true },
        { label: 'Withheld over 12 months', value: peso(r.withheldOverYear), indent: true },
        {
          label: adj >= 1 ? 'Still due at year-end (withheld in the last payroll)' : adj <= -1 ? 'Refund at year-end' : 'Year-end adjustment (table rounding only)',
          value: Math.abs(adj) >= 1 ? peso(Math.abs(adj)) : '—',
          indent: true,
        },
        { label: 'Effective tax rate on gross pay', value: `${(r.effectiveRate * 100).toFixed(2)}%` },
        { label: 'Take-home per month after tax and contributions', value: peso(round2(basic! + (allow ?? 0) - contributions - r.monthly.tax)) },
      ]
    : [];

  return (
    <CalculatorShell title="Income Tax & Withholding Tax Calculator">
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput id="it-basic" label="Monthly basic pay" value={basicRaw} onChange={setBasicRaw} error={basicError} />
        </div>
        <div class="sm:flex-1">
          <CurrencyInput
            id="it-allow"
            label="Other taxable pay per month (optional)"
            value={allowRaw}
            onChange={setAllowRaw}
            error={allowError}
            hint="Taxable allowances, commissions, regular overtime."
          />
        </div>
      </div>
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="it-bonus"
            label="13th month + other bonuses this year (optional)"
            value={bonusRaw}
            onChange={setBonusRaw}
            error={bonusError}
            hint={`Blank = one month's basic pay. The first ${peso(CAP)} is tax-free.`}
          />
        </div>
        <div class="sm:flex-1">
          <CurrencyInput
            id="it-contrib"
            label="Mandatory contributions per month (optional)"
            value={contribRaw}
            onChange={setContribRaw}
            error={contribError}
            hint="Blank = SSS + PhilHealth + Pag-IBIG for a private employee. Government employees: enter GSIS + PhilHealth + Pag-IBIG from the payslip."
          />
        </div>
      </div>
      <label class="mb-3 flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" class="h-4 w-4 accent-accent" checked={mwe} onChange={(e) => setMwe((e.target as HTMLInputElement).checked)} />
        I am a minimum wage earner (paid the statutory minimum wage)
      </label>
      {r && (
        <ResultCard
          headline="Withholding tax per month"
          amount={peso(r.monthly.tax)}
          amountNote={`Income tax for the year ${peso(r.annual.tax)} — ${r.monthly.rate === 0 ? 'your monthly taxable pay is within the tax-free ₱20,833' : `${pct(r.monthly.rate)} on the excess over ${peso(tax.brackets[r.monthly.bracketIndex]!.over)}`}. TRAIN rates in force since January 1, 2023.`}
          rows={rows}
          meta={tax.meta}
          copyText={rows.map((x) => `${x.label}: ${x.value}`).join('\n')}
          onReset={() => {
            setBasicRaw('');
            setAllowRaw('');
            setBonusRaw('');
            setContribRaw('');
            setMwe(false);
          }}
        />
      )}
    </CalculatorShell>
  );
}
