import { useState } from 'preact/hooks';
import taxJson from '../data/tax/2026.json';
import type { TaxRules } from '../lib/rules/types';
import { selfEmployedTax, type SelfEmployedOptionKey } from '../lib/engine/tax';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const tax = taxJson as unknown as TaxRules;
const S = tax.self_employed;
const pct = (r: number) => `${Math.round(r * 100)}%`;
type Kind = 'pure' | 'mixed';
/** The rules this calculator applies (the dataset's own meta describes the withholding table). */
const META = {
  ...tax.meta,
  rule_version: `NIRC Sec. 24(A)(2) as amended by TRAIN — graduated rates (2023 onwards), ${pct(S.eight_percent_rate)} option, ${pct(S.osd_rate)} OSD; ${pct(S.percentage_tax_rate)} percentage tax (Sec. 116)`,
  official_source_url: S.sources[0]!.url,
  official_source_label: 'NIRC as amended by RA 10963 (TRAIN), on lawphil.net; BIR RR 8-2018 and RMO 23-2018',
};
const NAMES: Record<SelfEmployedOptionKey, string> = {
  eight: `${pct(S.eight_percent_rate)} income tax on gross`,
  osd: `Graduated rates, ${pct(S.osd_rate)} optional standard deduction`,
  itemized: 'Graduated rates, itemized expenses',
};

export default function FreelancerTaxCalculator() {
  const [kind, setKind] = useState<Kind>('pure');
  const [grossRaw, setGrossRaw] = useState('');
  const [expRaw, setExpRaw] = useState('');
  const [compRaw, setCompRaw] = useState('');
  const [gross, grossError] = useAmount(grossRaw, 'Gross receipts');
  const [expenses, expError] = useAmount(expRaw, 'Business expenses');
  const [comp, compError] = useAmount(compRaw, 'Taxable salary');

  const ready = gross !== null && gross > 0;
  const r = ready ? selfEmployedTax({ grossReceipts: gross!, expenses: expenses ?? null, compensationTaxable: kind === 'mixed' ? comp ?? 0 : 0 }, tax) : null;
  if (r) trackCalculatorUse('freelancer-tax');

  const best = r?.options.find((o) => o.key === r.best);
  const ranked = r ? r.options.filter((o) => o.available).sort((a, b) => a.total - b.total) : [];
  const saving = ranked.length > 1 ? ranked[1]!.total - ranked[0]!.total : 0;
  const rows = r
    ? [
        ...r.options.flatMap((o) =>
          o.available
            ? [
                { label: `${NAMES[o.key]}${o.key === r.best ? ' ← lowest' : ''}`, value: peso(o.total), strong: o.key === r.best },
                {
                  label:
                    o.key === 'eight'
                      ? `${pct(S.eight_percent_rate)} × ${peso(o.base)}${r.mixedIncome ? ' (no ₱250,000 deduction for mixed income)' : ` (gross less ${peso(S.eight_percent_exempt_portion)})`}; no percentage tax`
                      : `Income tax ${peso(o.incomeTax)} on ${peso(o.base)} business income${r.mixedIncome ? ' + salary' : ''}${o.percentageTax > 0 ? ` + ${pct(S.percentage_tax_rate)} percentage tax ${peso(o.percentageTax)}` : ''}`,
                  value: '',
                  indent: true,
                },
              ]
            : [{ label: `${NAMES[o.key]}: ${o.reason ?? 'not available'}`, value: '—' }],
        ),
        ...(r.mixedIncome ? [{ label: 'Of which tax on your salary alone (graduated rates)', value: peso(r.compensationTaxAlone) }] : []),
      ]
    : [];

  return (
    <CalculatorShell title="Freelancer Tax Calculator: 8% vs Graduated">
      <Tabs
        label="Your income"
        options={[
          { value: 'pure', label: 'Freelance / business only' },
          { value: 'mixed', label: 'I also have a job (mixed income)' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="ft-gross"
            label="Gross receipts or sales for the year"
            value={grossRaw}
            onChange={setGrossRaw}
            error={grossError}
            hint="Everything clients paid you before expenses, local and foreign."
          />
        </div>
        <div class="sm:flex-1">
          <CurrencyInput
            id="ft-exp"
            label="Business expenses for the year (optional)"
            value={expRaw}
            onChange={setExpRaw}
            error={expError}
            hint="Only for the itemized option; you need receipts for every peso."
          />
        </div>
      </div>
      {kind === 'mixed' && (
        <CurrencyInput
          id="ft-comp"
          label="Taxable salary for the year (BIR Form 2316)"
          value={compRaw}
          onChange={setCompRaw}
          error={compError}
          hint="Gross salary minus SSS/GSIS, PhilHealth, Pag-IBIG and the tax-free part of the 13th month."
        />
      )}
      {r && best && (
        <ResultCard
          headline={r.mixedIncome ? 'Lowest total income tax for the year (salary + business)' : 'Lowest tax for the year'}
          amount={peso(best.total)}
          amountNote={`${NAMES[best.key]}${saving > 0 ? `, ${peso(saving)} less than the next option` : ''}. ${r.overVatThreshold ? `Above ${peso(S.vat_threshold)} you must register for VAT (12%, not computed here) and the 8% option is not available.` : 'The 8% option must be chosen in your first-quarter return (or at registration) and cannot be changed for the year.'}`}
          rows={rows}
          meta={META}
          copyText={rows.map((x) => `${x.label}${x.value ? `: ${x.value}` : ''}`).join('\n')}
          onReset={() => {
            setGrossRaw('');
            setExpRaw('');
            setCompRaw('');
            setKind('pure');
          }}
        />
      )}
    </CalculatorShell>
  );
}
