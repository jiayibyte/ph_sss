/** Single source of truth for internal links (nav, footer, cards, related). */

export interface PageRef {
  href: string;
  label: string;
  short: string;
  blurb: string;
  priority: 'P0' | 'P1' | 'P2';
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
  oec: {
    href: '/oec-exemption/',
    label: 'OEC Exemption Guide',
    short: 'OEC Exemption',
    blurb: 'Who qualifies for an OEC exemption and how to get it through official DMW channels.',
    priority: 'P2',
  },
  prc: {
    href: '/prc-board-exam-schedule/',
    label: 'PRC Board Exam Schedule 2026',
    short: 'PRC Exam Schedule',
    blurb: 'Searchable 2026 PRC licensure exam calendar with application deadlines.',
    priority: 'P2',
  },
  nursingSchedule: {
    href: '/nursing-board-exam-schedule/',
    label: 'Nursing Board Exam Schedule 2026',
    short: 'Nursing (PNLE)',
    blurb: 'PNLE 2026 exam dates, application deadlines, LERIS filing steps and target result dates.',
    priority: 'P2',
  },
};

export const TRUST_PAGES: Array<{ href: string; label: string }> = [
  { href: '/about/', label: 'About' },
  { href: '/methodology/', label: 'Methodology' },
  { href: '/sources/', label: 'Sources' },
  { href: '/privacy/', label: 'Privacy' },
  { href: '/disclaimer/', label: 'Disclaimer' },
];

export const ALL_TOOLS: PageRef[] = Object.values(TOOL_PAGES);
