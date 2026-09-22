/**
 * Page freshness dates — one source for the sitemap <lastmod> and for the
 * JSON-LD datePublished / dateModified emitted by BaseLayout.
 *
 * Plain Node (no TypeScript) so both astro.config.mjs and .astro frontmatter
 * can import it at build time.
 *
 *   dateModified  = max( git commit date of the page source,
 *                        meta.last_verified of every rule dataset the page renders )
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
  '/philhealth-contribution/': ['philhealth'],
  '/pagibig-contribution/': ['pagibig'],
  '/take-home-pay-calculator/': ['sss', 'philhealth', 'pagibig', 'tax'],
  '/minimum-wage-philippines/': ['wages'],
  '/13th-month-pay-calculator/': ['labor'],
  '/holiday-pay-calculator/': ['holidays', 'labor'],
  '/philippine-holidays/': ['holidays', 'labor'],
  '/night-differential-calculator/': ['labor'],
  '/overtime-pay-calculator/': ['labor'],
  '/final-pay-calculator/': ['labor'],
  '/prc-board-exam-schedule/': ['prc'],
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
const today = () => new Date().toISOString().slice(0, 10);

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

const verifiedCache = new Map();

/** meta.last_verified of the newest <year>.json in src/data/<key>/. */
export function datasetLastVerified(key) {
  if (verifiedCache.has(key)) return verifiedCache.get(key);
  const dir = path.join(DATA_DIR, key);
  const files = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => /^\d{4}\.json$/.test(f))
        .sort()
    : [];
  const newest = files.at(-1);
  if (!newest) throw new Error(`lastmod: no <year>.json found in src/data/${key}/`);
  const meta = JSON.parse(readFileSync(path.join(dir, newest), 'utf8')).meta ?? {};
  if (!ISO_DATE.test(meta.last_verified ?? '')) {
    throw new Error(`lastmod: src/data/${key}/${newest} has no ISO meta.last_verified`);
  }
  verifiedCache.set(key, meta.last_verified);
  return meta.last_verified;
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
  const modified = [sourceDate, ...dataDates].sort().at(-1);
  const published = ISO_DATE.test(addedCommit) && addedCommit <= modified ? addedCommit : modified;

  const result = { published, modified };
  dateCache.set(pagePath, result);
  return result;
}
