/**
 * Senior citizen (RA 9994) and PWD (RA 10754) discounts: 20% plus VAT
 * exemption where the seller is VAT-registered. BIR RR 7-2010: the discount
 * is computed on the VAT-exempt price, and no VAT may be billed.
 * Parameters come from src/data/tax/<year>.json → privileged_discounts.
 */
import type { TaxRules } from '../rules/types';
import { round2 } from '../format';

export interface DiscountInput {
  /** Menu or shelf price of the senior citizen's / PWD's own items (VAT-inclusive if the seller is VAT-registered). */
  price: number;
  vatRegistered: boolean;
  /** Companions' items, billed normally (VAT-inclusive). */
  companions?: number;
  /** 'senior' or 'pwd' — both 20% under current law. */
  holder: 'senior' | 'pwd';
}

export interface DiscountResult {
  price: number;
  /** VAT removed (0 for non-VAT sellers). */
  vatExempted: number;
  /** Price without VAT — the base of the discount. */
  vatExemptPrice: number;
  rate: number;
  discount: number;
  /** What the senior citizen / PWD pays for their own items. */
  amountDue: number;
  companions: number;
  totalBill: number;
  /** Total saved against paying the menu price. */
  savings: number;
}

export function privilegedDiscount(input: DiscountInput, rules: TaxRules): DiscountResult {
  const D = rules.privileged_discounts;
  const price = Math.max(input.price, 0);
  const vatExemptPrice = input.vatRegistered ? round2(price / (1 + D.vat_rate)) : round2(price);
  const vatExempted = round2(price - vatExemptPrice);
  const rate = input.holder === 'senior' ? D.senior_rate : D.pwd_rate;
  const discount = round2(vatExemptPrice * rate);
  const amountDue = round2(vatExemptPrice - discount);
  const companions = round2(Math.max(input.companions ?? 0, 0));
  return {
    price,
    vatExempted,
    vatExemptPrice,
    rate,
    discount,
    amountDue,
    companions,
    totalBill: round2(amountDue + companions),
    savings: round2(price - amountDue),
  };
}
