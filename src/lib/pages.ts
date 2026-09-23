/** Single source of truth for internal links (nav, footer, cards, related). */

export interface PageRef {
  href: string;
  label: string;
  short: string;
  blurb: string;
  priority: 'P0' | 'P1' | 'P2';
  /** Kicker line on the OG card (scripts/generate-og.mjs); defaults to the site-wide rates line. */
  ogKicker?: string;
}

export const TOOL_PAGES: Record<string, PageRef> = {
  sssTable: {
    href: '/sss-contribution-table/',
    label: 'SSS Contribution Table 2026',
    short: 'SSS Table',
    blurb: 'Full 2026 SSS schedule for Employee, Self-Employed, Voluntary and OFW members, with salary lookup.',
    priority: 'P0',
  },
  sssCalculator: {
    href: '/sss-contribution-calculator/',
    label: 'SSS Contribution Calculator',
    short: 'SSS Calculator',
    blurb: 'Compute your monthly SSS contribution from your salary and member type.',
    priority: 'P0',
  },
  sssPension: {
    href: '/sss-pension-calculator/',
    label: 'SSS Pension Calculator',
    short: 'SSS Pension',
    blurb: 'Estimate your monthly SSS retirement pension from your AMSC and credited years — the RA 11199 formula, 13th-month pension and dependents.',
    priority: 'P1',
    ogKicker: 'Free · Independent · RA 11199 formula',
  },
  sssMaternity: {
    href: '/sss-maternity-benefit-calculator/',
    label: 'SSS Maternity Benefit Calculator',
    short: 'SSS Maternity',
    blurb: 'Compute the 105-day SSS maternity benefit from your six highest MSCs, plus solo-parent and miscarriage cases and the employer salary differential.',
    priority: 'P1',
    ogKicker: 'Free · Independent · RA 11210 / RA 11199',
  },
  sssLoan: {
    href: '/sss-salary-loan-calculator/',
    label: 'SSS Salary Loan Calculator',
    short: 'SSS Salary Loan',
    blurb: 'One-month or two-month loanable amount, service fee, 10% interest and the 24-month amortization of an SSS salary loan.',
    priority: 'P1',
    ogKicker: 'Free · Independent · SSS loan terms',
  },
  sssSickness: {
    href: '/sss-sickness-benefit-calculator/',
    label: 'SSS Sickness Benefit Calculator',
    short: 'SSS Sickness',
    blurb: '90% of your average daily salary credit per day of confinement, up to 120 days a year — with the RA 11199 conditions.',
    priority: 'P1',
    ogKicker: 'Free · Independent · RA 11199 Sec. 14',
  },
  sssUnemployment: {
    href: '/sss-unemployment-benefit-calculator/',
    label: 'SSS Unemployment Benefit Calculator',
    short: 'SSS Unemployment',
    blurb: '50% of your average monthly salary credit for two months after involuntary separation — eligibility and documents.',
    priority: 'P1',
    ogKicker: 'Free · Independent · RA 11199 Sec. 14-B',
  },
  separationPay: {
    href: '/separation-pay-calculator/',
    label: 'Separation Pay Calculator',
    short: 'Separation Pay',
    blurb: 'One month or half a month per year of service by authorized cause, never below one month — Labor Code Arts. 298–299.',
    priority: 'P1',
    ogKicker: 'Free · Independent · DOLE Handbook 2024',
  },
  retirementPay: {
    href: '/retirement-pay-calculator/',
    label: 'Retirement Pay Calculator (RA 7641)',
    short: 'Retirement Pay',
    blurb: 'Minimum retirement pay: daily rate × 22.5 days × years of service, ages 60–65 with five years’ service.',
    priority: 'P1',
    ogKicker: 'Free · Independent · RA 7641',
  },
  dailyRate: {
    href: '/daily-rate-calculator/',
    label: 'Daily Rate & Hourly Rate Calculator',
    short: 'Daily Rate',
    blurb: 'Monthly ↔ daily ↔ hourly with the DOLE factors 365, 313, 261 and 395, plus overtime and night-shift hourly rates.',
    priority: 'P1',
    ogKicker: 'Free · Independent · DOLE Handbook factors',
  },
  thirteenth: {
    href: '/13th-month-pay-calculator/',
    label: '13th Month Pay Calculator',
    short: '13th Month Pay',
    blurb: 'Compute your 13th month pay — simple mode or exact month-by-month mode.',
    priority: 'P0',
  },
  philhealth: {
    href: '/philhealth-contribution/',
    label: 'PhilHealth Contribution Calculator & Table',
    short: 'PhilHealth',
    blurb: '2026 PhilHealth premium: 5% of monthly basic salary, with employee/employer split.',
    priority: 'P0',
  },
  pagibig: {
    href: '/pagibig-contribution/',
    label: 'Pag-IBIG Contribution Calculator & Table',
    short: 'Pag-IBIG',
    blurb: '2026 Pag-IBIG (HDMF) monthly savings: rates, ceiling and employer share.',
    priority: 'P0',
  },
  minimumWage: {
    href: '/minimum-wage-philippines/',
    label: 'Minimum Wage Philippines 2026',
    short: 'Minimum Wage',
    blurb: 'Current daily minimum wage in all 17 regions from the latest wage orders, the NCR ₱695 → ₱755 update, monthly equivalents and exemptions.',
    priority: 'P0',
    ogKicker: 'Free · Independent · NWPC wage orders, Sept 2026',
  },
  pagibigMp2: {
    href: '/pagibig-mp2-calculator/',
    label: 'Pag-IBIG MP2 Calculator',
    short: 'MP2 Savings',
    blurb: 'Project your MP2 savings after 5 years with the official dividend rates (7.12% for 2025), monthly or lump sum, compounded or annual payout.',
    priority: 'P1',
    ogKicker: 'Free · Independent · Official MP2 rates',
  },
  pagibigHousingLoan: {
    href: '/pagibig-housing-loan-calculator/',
    label: 'Pag-IBIG Housing Loan Calculator',
    short: 'Pag-IBIG Housing Loan',
    blurb: 'Monthly amortization at the 2026 rates — 4.5% promo, 6.5%–9.75% regular, 3% Affordable Housing — for loans up to ₱10M.',
    priority: 'P1',
    ogKicker: 'Free · Independent · Pag-IBIG rates until Dec 31, 2026',
  },
  incomeTax: {
    href: '/income-tax-calculator/',
    label: 'Income Tax Calculator (BIR Tax Table 2026)',
    short: 'Income Tax',
    blurb: 'Monthly withholding and annual income tax under the TRAIN rates, the BIR monthly to daily tables, the ₱90,000 bonus exemption and the year-end adjustment.',
    priority: 'P0',
    ogKicker: 'Free · Independent · BIR Annex E / TRAIN rates',
  },
  freelancerTax: {
    href: '/freelancer-tax-calculator/',
    label: 'Freelancer Tax Calculator (8% vs Graduated)',
    short: 'Freelancer Tax',
    blurb: 'Compare the 8% income tax option with graduated rates plus 3% percentage tax — for freelancers, professionals and employees with a side business.',
    priority: 'P1',
    ogKicker: 'Free · Independent · RR 8-2018 / TRAIN',
  },
  pagibigLoan: {
    href: '/pagibig-salary-loan-calculator/',
    label: 'Pag-IBIG Salary Loan Calculator (MPL & Calamity)',
    short: 'Pag-IBIG Salary Loan',
    blurb: 'Loanable amount (90% of your savings), monthly amortization and total interest of a Pag-IBIG Multi-Purpose or Calamity Loan, 12 to 36 months.',
    priority: 'P1',
    ogKicker: 'Free · Independent · Pag-IBIG Circulars 469 & 470',
  },
  silLeave: {
    href: '/service-incentive-leave-calculator/',
    label: 'Service Incentive Leave (SIL) Calculator',
    short: 'SIL & Leave Benefits',
    blurb: 'Cash value of unused service incentive leave (5 days a year) on resignation or at year-end, plus maternity, paternity, solo parent, VAWC and special leave rules.',
    priority: 'P1',
    ogKicker: 'Free · Independent · Labor Code Art. 95 / DOLE Handbook 2024',
  },
  salaryGrade: {
    href: '/salary-grade-table/',
    label: 'Salary Grade Table (Government, EO 64)',
    short: 'Salary Grade Table',
    blurb: 'Government salary grades 1–33, Steps 1–8, under EO No. 64 — this year and next year — with net pay after GSIS, PhilHealth, Pag-IBIG and tax, PERA and bonuses.',
    priority: 'P0',
    ogKicker: 'Free · Independent · EO No. 64 / DBM NBC 601',
  },
  takeHome: {
    href: '/take-home-pay-calculator/',
    label: 'Take-Home Pay Calculator',
    short: 'Take-Home Pay',
    blurb: 'Net salary after SSS, PhilHealth, Pag-IBIG and withholding tax — full breakdown.',
    priority: 'P1',
  },
  holidayPay: {
    href: '/holiday-pay-calculator/',
    label: 'Holiday Pay Calculator',
    short: 'Holiday Pay',
    blurb: 'Regular holiday and special day pay rules, with the 2026 Philippine holiday calendar.',
    priority: 'P1',
  },
  nightDiff: {
    href: '/night-differential-calculator/',
    label: 'Night Differential Calculator',
    short: 'Night Differential',
    blurb: '10% night shift differential for work between 10 PM and 6 AM.',
    priority: 'P1',
  },
  finalPay: {
    href: '/final-pay-calculator/',
    label: 'Final Pay / Back Pay Calculator',
    short: 'Final Pay',
    blurb: 'Estimate your final pay (back pay): unpaid salary, leave conversion, pro-rated 13th month and more.',
    priority: 'P1',
  },
  overtime: {
    href: '/overtime-pay-calculator/',
    label: 'Overtime Pay Calculator',
    short: 'Overtime Pay',
    blurb: 'Overtime rates for ordinary days, rest days, special days and regular holidays.',
    priority: 'P1',
  },
  holidays: {
    href: '/philippine-holidays/',
    label: 'Philippine Holidays 2027',
    short: 'Holidays 2027',
    blurb: 'Official 2027 holiday list under Proclamation No. 1427: regular holidays, special non-working days, long weekends and what changed from 2026.',
    priority: 'P2',
    ogKicker: 'Official list · Proclamation No. 1427, s. 2026',
  },
  oec: {
    href: '/oec-exemption/',
    label: 'OEC Exemption Guide',
    short: 'OEC Exemption',
    blurb: 'Check in five questions whether you qualify for an OEC exemption, and how to get it through official DMW channels.',
    priority: 'P2',
  },
  seniorDiscount: {
    href: '/senior-citizen-discount-calculator/',
    label: 'Senior Citizen & PWD Discount Calculator',
    short: 'Senior / PWD Discount',
    blurb: 'The 20% discount and VAT exemption the way BIR computes it — VAT off first, then 20% — for senior citizens (RA 9994) and PWDs (RA 10754).',
    priority: 'P1',
    ogKicker: 'Free · Independent · RA 9994 / RA 10754 / RR 7-2010',
  },
  firstTimeJobseeker: {
    href: '/first-time-jobseeker/',
    label: 'First Time Jobseeker Certificate (RA 11261)',
    short: 'First Time Jobseeker',
    blurb: 'Free NBI and police clearance, PSA birth certificate, barangay clearance, TIN and more for first-time jobseekers — who qualifies and how to get the barangay certificate.',
    priority: 'P1',
    ogKicker: 'Free · Independent · RA 11261 and its 2023 guidelines',
  },
  sssNumber: {
    href: '/how-to-get-sss-number/',
    label: 'How to Get an SSS Number Online',
    short: 'Get SSS Number',
    blurb: 'The official online steps, documents that make the number Permanent, fees (none), employer reporting and recovery of a forgotten number.',
    priority: 'P1',
    ogKicker: 'Free · Independent · sss.gov.ph steps',
  },
  tinNumber: {
    href: '/how-to-get-tin-number/',
    label: 'How to Get a TIN Number (BIR)',
    short: 'Get TIN',
    blurb: 'ORUS registration for employees (via employer), self-employed and one-time taxpayers; fees, Digital TIN ID and the one-TIN rule.',
    priority: 'P1',
    ogKicker: 'Free · Independent · BIR ORUS steps',
  },
  pagibigMid: {
    href: '/how-to-get-pagibig-mid-number/',
    label: 'How to Get a Pag-IBIG MID Number',
    short: 'Get Pag-IBIG MID',
    blurb: 'Virtual Pag-IBIG registration with the National ID or a valid ID, the RTN, MID verification after 2–3 days, Loyalty Card Plus and MID recovery.',
    priority: 'P1',
    ogKicker: 'Free · Independent · Virtual Pag-IBIG steps',
  },
  philhealthPin: {
    href: '/how-to-get-philhealth-number/',
    label: 'How to Get a PhilHealth Number (PIN)',
    short: 'Get PhilHealth PIN',
    blurb: 'Member Portal registration (PMRF + ID, PIN in 3–5 working days), employer route, LHIO walk-in, requirements and fees.',
    priority: 'P1',
    ogKicker: 'Free · Independent · philhealth.gov.ph steps',
  },
  prc: {
    href: '/prc-board-exam-schedule/',
    label: 'PRC Board Exam Schedule 2026',
    short: 'PRC Exam Schedule',
    blurb: 'Searchable 2026 PRC licensure exam calendar with application deadlines.',
    priority: 'P2',
  },
  prcResults: {
    href: '/board-exam-results-2026/',
    label: 'PRC Board Exam Results 2026',
    short: 'Board Exam Results',
    blurb: 'Passing rates, examinee counts and release dates for every 2026 PRC board exam already released, plus the target dates still ahead.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC results press releases',
  },
  nursingSchedule: {
    href: '/nursing-board-exam-schedule/',
    label: 'Nursing Board Exam Schedule 2026',
    short: 'Nursing (PNLE)',
    blurb: 'PNLE 2026 exam dates, application deadlines, LERIS filing steps and target result dates.',
    priority: 'P2',
  },
  letSchedule: {
    href: '/let-board-exam-schedule/',
    label: 'LET / BLEPT Schedule 2026',
    short: 'Teachers (LET)',
    blurb: 'Licensure Examination for Teachers 2026: exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  criminologySchedule: {
    href: '/criminology-board-exam-schedule/',
    label: 'Criminology Board Exam Schedule 2026',
    short: 'Criminology',
    blurb: 'Criminologist Licensure Examination 2026: exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  cpaSchedule: {
    href: '/cpa-board-exam-schedule/',
    label: 'CPA Board Exam (CPALE) Schedule 2026',
    short: 'CPA (CPALE)',
    blurb: 'CPALE 2026: exam dates, filing deadlines, passing and conditional-pass rules, results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  civilEngSchedule: {
    href: '/civil-engineering-board-exam-schedule/',
    label: 'Civil Engineering Board Exam Schedule 2026',
    short: 'Civil Engineering',
    blurb: 'Civil Engineer Licensure Examination 2026: exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  physicianSchedule: {
    href: '/physician-board-exam-schedule/',
    label: 'Physician Licensure Exam (PLE) Schedule 2026',
    short: 'Physicians (PLE)',
    blurb: 'PLE 2026: medical board exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  pharmacySchedule: {
    href: '/pharmacy-board-exam-schedule/',
    label: 'Pharmacy Board Exam Schedule 2026',
    short: 'Pharmacy',
    blurb: 'Pharmacist Licensure Examination 2026: exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  midwiferySchedule: {
    href: '/midwifery-board-exam-schedule/',
    label: 'Midwifery Board Exam Schedule 2026',
    short: 'Midwifery',
    blurb: 'Midwife Licensure Examination 2026: exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  psychometricianSchedule: {
    href: '/psychometrician-board-exam-schedule/',
    label: 'Psychometrician Board Exam Schedule 2026',
    short: 'Psychometrician',
    blurb: 'Psychometrician Licensure Examination 2026: exam dates, filing deadline, passing score and results date.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  radtechSchedule: {
    href: '/radtech-board-exam-schedule/',
    label: 'RadTech Board Exam Schedule 2026',
    short: 'RadTech',
    blurb: 'Radiologic Technologist Licensure Examination 2026: exam dates, filing deadline, passing score and results date.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  medtechSchedule: {
    href: '/medtech-board-exam-schedule/',
    label: 'MedTech Board Exam (MTLE) Schedule 2026',
    short: 'MedTech (MTLE)',
    blurb: 'Medical Technologist Licensure Examination 2026: exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  electricalSchedule: {
    href: '/electrical-engineering-board-exam-schedule/',
    label: 'Electrical Engineering Board Exam (REE) Schedule 2026',
    short: 'Electrical Eng. (REE)',
    blurb: 'Registered Electrical Engineer Licensure Examination 2026: exam dates, filing deadlines, 70%/50% passing rule and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  mechanicalSchedule: {
    href: '/mechanical-engineering-board-exam-schedule/',
    label: 'Mechanical Engineering Board Exam Schedule 2026',
    short: 'Mechanical Eng.',
    blurb: 'Mechanical Engineer Licensure Examination 2026: exam dates, filing deadlines, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  architectureSchedule: {
    href: '/architecture-board-exam-schedule/',
    label: 'Architecture Board Exam Schedule 2026',
    short: 'Architecture',
    blurb: 'Licensure Examination for Architects 2026: exam dates, filing deadlines, experience requirement, passing score and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  electronicsSchedule: {
    href: '/electronics-engineering-board-exam-schedule/',
    label: 'ECE Board Exam Schedule 2026',
    short: 'Electronics Eng. (ECE)',
    blurb: 'Electronics Engineer Licensure Examination 2026: exam dates, filing deadlines, per-subject 70% rule and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  dentistrySchedule: {
    href: '/dentistry-board-exam-schedule/',
    label: 'Dentistry Board Exam Schedule 2026',
    short: 'Dentistry',
    blurb: 'Dentist Licensure Examination 2026: written and practical phase dates, filing deadlines, 75% passing rule and results dates.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
  socialWorkSchedule: {
    href: '/social-work-board-exam-schedule/',
    label: 'Social Work Board Exam Schedule 2026',
    short: 'Social Work',
    blurb: 'Social Workers Licensure Examination 2026: exam dates, filing deadline, requirements incl. 1,000 case hours, passing score and results date.',
    priority: 'P2',
    ogKicker: 'Free · Independent · PRC Resolution No. 2113, s. 2025',
  },
};

export const TRUST_PAGES: Array<{ href: string; label: string }> = [
  { href: '/about/', label: 'About' },
  { href: '/methodology/', label: 'Methodology' },
  { href: '/sources/', label: 'Sources' },
  { href: '/free-calculator-widgets/', label: 'Free widgets for your site' },
  { href: '/privacy/', label: 'Privacy' },
  { href: '/disclaimer/', label: 'Disclaimer' },
];

export const ALL_TOOLS: PageRef[] = Object.values(TOOL_PAGES);

/* ------------------------------ Categories ------------------------------ */
/* Drives the home-page sections and the footer. Every TOOL_PAGES key must be
   listed exactly once (prcProfessionPages / pages tests enforce it). */

export type PageCategory = 'contributions' | 'pay' | 'benefits' | 'guides' | 'exams';

export const CATEGORY_LABELS: Record<PageCategory, string> = {
  contributions: 'Contribution Calculators',
  pay: 'Pay, Tax, Wage & Separation Calculators',
  benefits: 'SSS & Pag-IBIG Benefits, Loans & Savings',
  guides: 'Government IDs, Discounts, Holidays & OFW Guides',
  exams: 'PRC Board Exam Schedules & Results',
};

export const CATEGORY_KEYS: Record<PageCategory, Array<keyof typeof TOOL_PAGES>> = {
  contributions: ['sssTable', 'sssCalculator', 'philhealth', 'pagibig'],
  pay: ['takeHome', 'incomeTax', 'freelancerTax', 'salaryGrade', 'minimumWage', 'dailyRate', 'thirteenth', 'overtime', 'holidayPay', 'nightDiff', 'silLeave', 'finalPay', 'separationPay', 'retirementPay'],
  benefits: ['sssPension', 'sssMaternity', 'sssSickness', 'sssUnemployment', 'sssLoan', 'pagibigLoan', 'pagibigMp2', 'pagibigHousingLoan'],
  guides: ['firstTimeJobseeker', 'sssNumber', 'tinNumber', 'pagibigMid', 'philhealthPin', 'seniorDiscount', 'holidays', 'oec'],
  exams: [
    'prc', 'prcResults', 'nursingSchedule', 'letSchedule', 'criminologySchedule', 'cpaSchedule', 'civilEngSchedule',
    'physicianSchedule', 'medtechSchedule', 'pharmacySchedule', 'midwiferySchedule', 'psychometricianSchedule',
    'radtechSchedule', 'electricalSchedule', 'mechanicalSchedule', 'electronicsSchedule', 'architectureSchedule',
    'dentistrySchedule', 'socialWorkSchedule',
  ],
};

export function pagesIn(category: PageCategory): PageRef[] {
  return CATEGORY_KEYS[category].map((k) => {
    const p = TOOL_PAGES[k];
    if (!p) throw new Error(`CATEGORY_KEYS.${category} references unknown TOOL_PAGES key "${String(k)}"`);
    return p;
  });
}

/** Footer: every calculator and guide, plus the three hub pages of the exam cluster (profession pages link each other). */
export const FOOTER_GROUPS: Array<{ label: string; pages: PageRef[] }> = [
  { label: 'Contributions & Pay', pages: [...pagesIn('contributions'), ...pagesIn('pay')] },
  { label: 'Benefits, Loans & Guides', pages: [...pagesIn('benefits'), ...pagesIn('guides')] },
  { label: 'Board Exams', pages: pagesIn('exams').slice(0, 3) },
];
