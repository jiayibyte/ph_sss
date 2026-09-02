/**
 * AyTool site-wide configuration — single point of truth.
 *
 * Accent palette: pick ONE of the three pre-checked (WCAG AA on white) palettes
 * by changing `ACCENT_PALETTE`. Components never hardcode colors; they consume
 * the CSS variables emitted by BaseLayout from this file.
 *
 * Hard rule (design.md §7): never combine blue + red + yellow (PH flag /
 * government visual identity). All three palettes below are single-accent.
 */

export type PaletteName = 'teal' | 'indigo' | 'green';

interface Palette {
  /** Primary accent — links, buttons, highlights. AA on white for normal text. */
  accent: string;
  /** Darker accent — hover states, big result numbers. */
  accentStrong: string;
  /** Very light tint — card washes, table row highlight. */
  accentSoft: string;
}

const PALETTES: Record<PaletteName, Palette> = {
  teal: { accent: '#0f766e', accentStrong: '#115e59', accentSoft: '#f0fdfa' },
  indigo: { accent: '#4338ca', accentStrong: '#3730a3', accentSoft: '#eef2ff' },
  green: { accent: '#15803d', accentStrong: '#166534', accentSoft: '#f0fdf4' },
};

export const ACCENT_PALETTE: PaletteName = 'teal';

export const SITE = {
  name: 'AyTool',
  domain: 'aytool.com',
  url: 'https://aytool.com',
  /** Slogan — hero / footer / OG image ONLY. Never in SEO positions (Title/H1/description). */
  slogan: 'Ay! May tool para diyan.',
  /** Descriptive positioning line used in SEO positions & entity consistency (GEO §5.4). */
  tagline: 'AyTool, an independent Philippine payroll calculator',
  description:
    'Free, independent calculators for SSS, PhilHealth, Pag-IBIG, 13th month pay, take-home pay and other Philippine payroll computations.',
  contactEmail: 'contact@aytool.com',
  /** Public profiles of the AyTool entity — emitted as Organization.sameAs (GEO §5.4). */
  sameAs: ['https://github.com/jiayibyte/ph_sss'],
  /**
   * GA4 measurement ID. Leave empty to disable analytics injection entirely
   * (no GA script is emitted when empty). Fill in e.g. 'G-XXXXXXXXXX' before launch.
   */
  ga4Id: 'G-DLZNSD7T6C',
  palette: PALETTES[ACCENT_PALETTE],
} as const;

/** The not-affiliated statement shown site-wide (footer) and on tool pages. */
export const NOT_AFFILIATED =
  'AyTool is an independent website. It is not affiliated with, operated by, or endorsed by the SSS, PhilHealth, Pag-IBIG Fund, BIR, DOLE, DMW, PRC, or any other Philippine government agency.';
