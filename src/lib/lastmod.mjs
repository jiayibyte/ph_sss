/**
 * Page freshness dates — one source for the sitemap <lastmod> and for the
 * JSON-LD datePublished / dateModified emitted by BaseLayout.
 *
 * Plain Node (no TypeScript) so both astro.config.mjs and .astro frontmatter
 * can import it at build time.
 *
 *   dateModified  = max( git commit date of the page source,
 *                        meta.last_verified of every rule dataset the page renders,
 *                        scheduled changes already reached — a wage order or
 *                        tranche whose effectivity date has come (SCHEDULED) )
 *                   — uncommitted edits to the page source count as "today".
 *   datePublished = date of the commit that added the page source.
 *
 * Adding a page that renders rule data? Register it in PAGE_DATA so a yearly
 * JSON refresh bumps its lastmod even when the .astro file is untouched.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { todayInManila } from './today.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_DIR = path.join(ROOT, 'src/data');

/** Every rule dataset directory under src/data/. */
export const DATASETS = ['sss', 'philhealth', 'pagibig', 'labor', 'tax', 'holidays', 'prc', 'wages'];

/** Rule datasets rendered by each page (path → dataset keys). */
export const PAGE_DATA = {
  '/': ['sss', 'philhealth', 'pagibig', 'tax', 'labor', 'holidays'], // "at a glance" block
  '/sss-contribution-table/': ['sss'],
  '/sss-contribution-calculator/': ['sss'],
  '/sss-pension-calculator/': ['sss'],
  '/sss-maternity-benefit-calculator/': ['sss'],
  '/sss-salary-loan-calculator/': ['sss'],
  '/sss-sickness-benefit-calculator/': ['sss'],
  '/sss-unemployment-benefit-calculator/': ['sss'],
  '/separation-pay-calculator/': ['labor'],
  '/retirement-pay-calculator/': ['labor', 'wages'],
  '/daily-rate-calculator/': ['wages'],
  '/philhealth-contribution/': ['philhealth'],
  '/pagibig-contribution/': ['pagibig'],
  '/pagibig-mp2-calculator/': ['pagibig'],
  '/pagibig-housing-loan-calculator/': ['pagibig'],
  '/take-home-pay-calculator/': ['sss', 'philhealth', 'pagibig', 'tax'],
  '/minimum-wage-philippines/': ['wages'],
  '/13th-month-pay-calculator/': ['labor'],
  '/holiday-pay-calculator/': ['holidays', 'labor'],
  '/philippine-holidays/': ['holidays', 'labor'],
  '/night-differential-calculator/': ['labor'],
  '/overtime-pay-calculator/': ['labor'],
  '/final-pay-calculator/': ['labor'],
  '/prc-board-exam-schedule/': ['prc'],
  '/board-exam-results-2026/': ['prc'],
  '/nursing-board-exam-schedule/': ['prc'],
  '/let-board-exam-schedule/': ['prc'],
  '/criminology-board-exam-schedule/': ['prc'],
  '/cpa-board-exam-schedule/': ['prc'],
  '/civil-engineering-board-exam-schedule/': ['prc'],
  '/physician-board-exam-schedule/': ['prc'],
  '/pharmacy-board-exam-schedule/': ['prc'],
  '/midwifery-board-exam-schedule/': ['prc'],
  '/psychometrician-board-exam-schedule/': ['prc'],
  '/radtech-board-exam-schedule/': ['prc'],
  '/medtech-board-exam-schedule/': ['prc'],
  '/electrical-engineering-board-exam-schedule/': ['prc'],
  '/mechanical-engineering-board-exam-schedule/': ['prc'],
  '/architecture-board-exam-schedule/': ['prc'],
  '/electronics-engineering-board-exam-schedule/': ['prc'],
  '/dentistry-board-exam-schedule/': ['prc'],
  '/social-work-board-exam-schedule/': ['prc'],
  '/sources/': DATASETS,
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const today = () => todayInManila();

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

const datasetCache = new Map();

/** Parsed newest <year>.json in src/data/<key>/, with its file name. */
function readDataset(key) {
  if (datasetCache.has(key)) return datasetCache.get(key);
  const dir = path.join(DATA_DIR, key);
  const files = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => /^\d{4}\.json$/.test(f))
        .sort()
    : [];
  const newest = files.at(-1);
  if (!newest) throw new Error(`lastmod: no <year>.json found in src/data/${key}/`);
  const result = { file: newest, data: JSON.parse(readFileSync(path.join(dir, newest), 'utf8')) };
  datasetCache.set(key, result);
  return result;
}

/** meta.last_verified of the newest <year>.json in src/data/<key>/. */
export function datasetLastVerified(key) {
  const { file, data } = readDataset(key);
  const verified = data.meta?.last_verified ?? '';
  if (!ISO_DATE.test(verified)) {
    throw new Error(`lastmod: src/data/${key}/${file} has no ISO meta.last_verified`);
  }
  return verified;
}

/**
 * Changes the data already schedules. These pages are built "as of" the
 * Philippine date, so their content changes the day a wage order or tranche
 * takes effect — and lastmod should say so. path → [dataset, dates picker].
 */
const wageChangeDates = (w) => [w.ncr?.upcoming?.effectivity, ...(w.regions ?? []).map((r) => r.upcoming?.effectivity)];
const dayAfter = (iso) => (ISO_DATE.test(iso ?? '') ? new Date(Date.parse(iso + 'T00:00:00Z') + 86_400_000).toISOString().slice(0, 10) : null);
export const SCHEDULED = {
  '/minimum-wage-philippines/': ['wages', wageChangeDates],
  '/daily-rate-calculator/': ['wages', (w) => [w.ncr?.upcoming?.effectivity]],
  // The "rates may have changed" notice appears the day after the published rates lapse.
  '/pagibig-housing-loan-calculator/': ['pagibig', (p) => [dayAfter(p.housing_loan?.rates_valid_until)]],
};

/** Distinct scheduled change dates for a page that have been reached by `asOf` (ISO, ascending). */
export function scheduledChangesReached(pagePath, asOf = today()) {
  const entry = SCHEDULED[pagePath];
  if (!entry) return [];
  const [key, pick] = entry;
  const dates = pick(readDataset(key).data).filter((d) => typeof d === 'string' && ISO_DATE.test(d) && d <= asOf);
  return [...new Set(dates)].sort();
}

/**
 * Pages rendered by a shared dynamic route: path → the source files whose git
 * history should drive its dates (the route template and the config that
 * carries its copy). Anything not listed maps to src/pages/<slug>.astro.
 */
export const PAGE_SOURCE = Object.fromEntries(
  [
    'let', 'criminology', 'cpa', 'civil-engineering', 'physician',
    'pharmacy', 'midwifery', 'psychometrician', 'radtech', 'medtech',
    'electrical-engineering', 'mechanical-engineering', 'architecture', 'electronics-engineering', 'dentistry', 'social-work',
  ].map((slug) => [
    `/${slug}-board-exam-schedule/`,
    ['src/pages/[slug]-board-exam-schedule.astro', 'src/lib/prcProfessionPages.ts'],
  ]),
);

/** Repo-relative source files that render a page path ("/" or "/slug/"). */
export function pageSourceFiles(pagePath) {
  if (PAGE_SOURCE[pagePath]) return PAGE_SOURCE[pagePath];
  if (pagePath === '/') return ['src/pages/index.astro'];
  return [`src/pages/${pagePath.replace(/^\/|\/$/g, '')}.astro`];
}

/** First source file of a page (kept for callers that want one path). */
export function pageSourceFile(pagePath) {
  return pageSourceFiles(pagePath)[0];
}

const dateCache = new Map();

/**
 * @param {string} pagePath  e.g. "/sss-contribution-table/"
 * @returns {{ published: string, modified: string }} ISO dates (YYYY-MM-DD)
 */
export function pageDates(pagePath) {
  if (dateCache.has(pagePath)) return dateCache.get(pagePath);
  const files = pageSourceFiles(pagePath);

  // Several source files: newest commit wins for "modified", the earliest
  // addition for "published"; any dirty file counts as edited today.
  const dirty = files.some((f) => git(['status', '--porcelain', '--', f]) !== '');
  const lastCommit = files
    .map((f) => git(['log', '-1', '--format=%cs', '--', f]))
    .filter((d) => ISO_DATE.test(d))
    .sort()
    .at(-1) ?? '';
  const addedCommit =
    files
      .map((f) => git(['log', '--diff-filter=A', '--format=%cs', '--', f]).split('\n').filter(Boolean).at(-1) ?? '')
      .filter((d) => ISO_DATE.test(d))
      .sort()
      .at(0) ?? '';

  const sourceDate = dirty || !ISO_DATE.test(lastCommit) ? today() : lastCommit;
  const dataDates = (PAGE_DATA[pagePath] ?? []).map(datasetLastVerified);
  const modified = [sourceDate, ...dataDates, ...scheduledChangesReached(pagePath)].sort().at(-1);
  const published = ISO_DATE.test(addedCommit) && addedCommit <= modified ? addedCommit : modified;

  const result = { published, modified };
  dateCache.set(pagePath, result);
  return result;
}
