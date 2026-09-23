import { describe, expect, it } from 'vitest';
import taxJson from '../../data/tax/2026.json';
import type { TaxRules } from '../rules/types';
import { privilegedDiscount } from './discounts';

const tax = taxJson as unknown as TaxRules;

describe('senior citizen / PWD discount (RA 9994, RA 10754, RR 7-2010)', () => {
  it("reproduces RR 7-2010's example: VAT-exempt ₱50.00 less 20% = ₱40.00 (menu price ₱56.00 with VAT)", () => {
    const r = privilegedDiscount({ price: 56, vatRegistered: true, holder: 'senior' }, tax);
    expect(r.vatExemptPrice).toBe(50);
    expect(r.discount).toBe(10);
    expect(r.amountDue).toBe(40);
    expect(r.savings).toBe(16);
  });

  it('₱1,120 at a VAT-registered restaurant: ₱1,000 without VAT, ₱200 off, pay ₱800', () => {
    const r = privilegedDiscount({ price: 1120, vatRegistered: true, holder: 'pwd' }, tax);
    expect(r.vatExempted).toBe(120);
    expect(r.amountDue).toBe(800);
  });

  it('non-VAT seller: 20% off the price only', () => {
    const r = privilegedDiscount({ price: 500, vatRegistered: false, holder: 'senior' }, tax);
    expect(r.vatExempted).toBe(0);
    expect(r.amountDue).toBe(400);
  });

  it("companions' items are added at the normal price", () => {
    const r = privilegedDiscount({ price: 1120, vatRegistered: true, holder: 'senior', companions: 560 }, tax);
    expect(r.totalBill).toBe(1360);
  });
});
