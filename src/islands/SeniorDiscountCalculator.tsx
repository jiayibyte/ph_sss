import { useState } from 'preact/hooks';
import taxJson from '../data/tax/2026.json';
import type { TaxRules } from '../lib/rules/types';
import { privilegedDiscount } from '../lib/engine/discounts';
import { peso } from '../lib/format';
import { CalculatorShell, CurrencyInput, ResultCard, Tabs, useAmount } from './shared/ui';
import { trackCalculatorUse } from './shared/track';

const tax = taxJson as unknown as TaxRules;
const D = tax.privileged_discounts;
type Holder = 'senior' | 'pwd';
type Seller = 'vat' | 'nonvat';
const pct = (r: number) => `${Math.round(r * 100)}%`;

export default function SeniorDiscountCalculator() {
  const [holder, setHolder] = useState<Holder>('senior');
  const [seller, setSeller] = useState<Seller>('vat');
  const [priceRaw, setPriceRaw] = useState('');
  const [compRaw, setCompRaw] = useState('');
  const [price, priceError] = useAmount(priceRaw, 'Price');
  const [comp, compError] = useAmount(compRaw, "Companions' items");

  const r = price !== null && price > 0 ? privilegedDiscount({ price, vatRegistered: seller === 'vat', holder, companions: comp ?? 0 }, tax) : null;
  if (r) trackCalculatorUse('senior-discount');
  const who = holder === 'senior' ? 'senior citizen' : 'PWD';

  const rows = r
    ? [
        { label: `Price of the ${who}'s own items`, value: peso(r.price) },
        ...(seller === 'vat' ? [{ label: `Less ${pct(D.vat_rate)} VAT (price ÷ ${1 + D.vat_rate})`, value: `− ${peso(r.vatExempted)}` }, { label: 'VAT-exempt price', value: peso(r.vatExemptPrice) }] : []),
        { label: `Less ${pct(r.rate)} ${holder === 'senior' ? 'senior citizen' : 'PWD'} discount`, value: `− ${peso(r.discount)}` },
        { label: `Amount the ${who} pays`, value: peso(r.amountDue), strong: true },
        ...(r.companions > 0 ? [{ label: "Companions' items (no discount)", value: peso(r.companions) }, { label: 'Total bill', value: peso(r.totalBill), strong: true }] : []),
        { label: `Total saved (${r.price > 0 ? ((r.savings / r.price) * 100).toFixed(2) : '0'}% of the price)`, value: peso(r.savings) },
      ]
    : [];

  return (
    <CalculatorShell title="Senior Citizen & PWD Discount Calculator">
      <Tabs
        label="Discount holder"
        options={[
          { value: 'senior', label: `Senior citizen (${D.senior_min_age}+, RA 9994)` },
          { value: 'pwd', label: 'Person with disability (RA 10754)' },
        ]}
        value={holder}
        onChange={setHolder}
      />
      <Tabs
        label="Seller"
        options={[
          { value: 'vat', label: 'VAT-registered seller (receipt shows VAT)' },
          { value: 'nonvat', label: 'Non-VAT seller' },
        ]}
        value={seller}
        onChange={setSeller}
      />
      <div class="sm:flex sm:gap-4">
        <div class="sm:flex-1">
          <CurrencyInput
            id="sd-price"
            label={`Price of the ${who}'s own items`}
            value={priceRaw}
            onChange={setPriceRaw}
            error={priceError}
            hint="Menu or shelf price, VAT included — their own meal, medicine or ticket only."
          />
        </div>
        <div class="sm:flex-1">
          <CurrencyInput
            id="sd-comp"
            label="Companions' items (optional)"
            value={compRaw}
            onChange={setCompRaw}
            error={compError}
            hint="Billed separately at the normal price."
          />
        </div>
      </div>
      {r && (
        <ResultCard
          headline={`Amount the ${who} pays`}
          amount={peso(r.amountDue)}
          amountNote={seller === 'vat' ? `VAT is removed first, then ${pct(r.rate)} is taken off the VAT-exempt price (BIR RR 7-2010) — ${peso(r.savings)} less than the menu price.` : `${pct(r.rate)} off the price; a non-VAT seller has no VAT to remove.`}
          rows={rows}
          meta={{ ...tax.meta, rule_version: holder === 'senior' ? 'RA 9994 (Expanded Senior Citizens Act of 2010), Sec. 4; BIR RR 7-2010' : 'RA 10754 (amending RA 7277, Sec. 32); computed as in BIR RR 7-2010', official_source_url: holder === 'senior' ? D.sources[0]!.url : D.sources[1]!.url, official_source_label: holder === 'senior' ? 'RA 9994 on lawphil.net' : 'RA 10754 on lawphil.net' }}
          effectiveText={holder === 'senior' ? 'since 2010 (RA 9994)' : 'since 2016 (RA 10754)'}
          copyText={rows.map((x) => `${x.label}: ${x.value}`).join('\n')}
          onReset={() => {
            setPriceRaw('');
            setCompRaw('');
          }}
        />
      )}
    </CalculatorShell>
  );
}
