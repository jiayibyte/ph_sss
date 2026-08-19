/**
 * Generates src/data/sss/2026.json — the full SSS Schedule of Contributions
 * in the official table structure (RA 11199 final tranche, in force since
 * January 2025 and unchanged for 2026).
 *
 * Official parameters (SSS Circulars 2024-006 [employers/employees],
 * 2024-008 [self-employed], 2024-009 [voluntary/NWS], 2024-010 [OFW]):
 *   - Total rate 15% of MSC (Employee 5% / Employer 10% for employed members)
 *   - MSC ₱5,000 → ₱35,000 in ₱500 steps; regular program covers MSC up to
 *     ₱20,000, the portion above goes to the Mandatory Provident Fund (WISP)
 *   - EC: ₱10/month (MSC < ₱15,000) or ₱30/month (MSC ≥ ₱15,000);
 *     paid by the employer for employed members, by the member for
 *     self-employed members; no EC for voluntary and OFW members
 *   - OFW minimum MSC ₱8,000
 *
 * Re-run with: node scripts/generate-sss-2026.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/sss/2026.json');

const RATE = { total: 0.15, employee: 0.05, employer: 0.1 };
const MSC = { min: 5000, max: 35000, step: 500, regular_cap: 20000 };
const EC = { below: 10, threshold: 15000, at_or_above: 30 };

const MEMBER_TYPES = {
  employee: { label: 'Employee', ec_payer: 'employer', msc_min: MSC.min, split: true },
  'self-employed': { label: 'Self-Employed', ec_payer: 'member', msc_min: MSC.min, split: false },
  voluntary: { label: 'Voluntary', ec_payer: null, msc_min: MSC.min, split: false },
  ofw: { label: 'OFW', ec_payer: null, msc_min: 8000, split: false },
};

const round2 = (n) => Math.round(n * 100) / 100;

function buildRows(type) {
  const cfg = MEMBER_TYPES[type];
  const rows = [];
  for (let msc = cfg.msc_min; msc <= MSC.max; msc += MSC.step) {
    const first = msc === cfg.msc_min;
    const last = msc === MSC.max;
    const range_min = first ? 0 : msc - MSC.step / 2;
    const range_max = last ? null : msc + MSC.step / 2;
    const regular_msc = Math.min(msc, MSC.regular_cap);
    const mpf_msc = msc - regular_msc;
    const ec = cfg.ec_payer ? (msc < EC.threshold ? EC.below : EC.at_or_above) : 0;
    let employee_share;
    let employer_share;
    if (cfg.split) {
      employee_share = round2(msc * RATE.employee);
      employer_share = round2(msc * RATE.employer + ec);
    } else {
      // Member shoulders the whole 15% (+ EC for self-employed)
      employee_share = round2(msc * RATE.total + ec);
      employer_share = 0;
    }
    rows.push({
      range_min,
      range_max,
      msc,
      regular_msc,
      mpf_msc,
      employee_share,
      employer_share,
      ec,
      total: round2(msc * RATE.total + ec),
    });
  }
  return rows;
}

const data = {
  meta: {
    rule_version: 'RA 11199 (15% tranche) — SSS Circulars 2024-006, 2024-008, 2024-009, 2024-010',
    effective_from: '2025-01-01',
    effective_to: null,
    last_verified: '2026-08-19',
    official_source_url: 'https://www.sss.gov.ph/sss-contribution-table/',
    official_source_label: 'SSS — Schedule of Contributions (sss.gov.ph)',
  },
  rate: RATE,
  msc: MSC,
  ec: EC,
  member_types: MEMBER_TYPES,
  table: Object.fromEntries(Object.keys(MEMBER_TYPES).map((t) => [t, buildRows(t)])),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(`Wrote ${OUT}: ${Object.values(data.table).reduce((n, r) => n + r.length, 0)} rows`);
