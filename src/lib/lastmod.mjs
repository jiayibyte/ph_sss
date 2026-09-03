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
export const DATASETS = ['sss', 'philhealth', 'pagibig', 'labor', 'tax', 'holidays', 'prc'];

/** Rule datasets rendered by each page (path → dataset keys). */
export const PAGE_DATA = {
  '/': ['sss', 'philhealth', 'pagibig', 'tax', 'labor', 'holidays'], // "at a glance" block
  '/sss-contribution-table/': ['sss'],
  '/sss-contribution-calculator/': ['sss'],
  '/philhealth-contribution/': ['philhealth'],
  '/pagibig-contribution/': ['pagibig'],
  '/take-home-pay-calculator/': ['sss', 'philhealth', 'pagibig', 'tax'],
  '/13th-month-pay-calculator/': ['labor'],
  '/holiday-pay-calculator/': ['holidays', 'labor'],
  '/night-differential-calculator/': ['labor'],
  '/overtime-pay-calculator/': ['labor'],
  '/final-pay-calculator/': ['labor'],
  '/prc-board-exam-schedule/': ['prc'],
  '/nursing-board-exam-schedule/': ['prc'],
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

/** Repo-relative source file that renders a page path ("/" or "/slug/"). */
export function pageSourceFile(pagePath) {
  if (pagePath === '/') return 'src/pages/index.astro';
  return `src/pages/${pagePath.replace(/^\/|\/$/g, '')}.astro`;
}

const dateCache = new Map();

/**
 * @param {string} pagePath  e.g. "/sss-contribution-table/"
 * @returns {{ published: string, modified: string }} ISO dates (YYYY-MM-DD)
 */
export function pageDates(pagePath) {
  if (dateCache.has(pagePath)) return dateCache.get(pagePath);
  const file = pageSourceFile(pagePath);

  const dirty = git(['status', '--porcelain', '--', file]) !== '';
  const lastCommit = git(['log', '-1', '--format=%cs', '--', file]);
  const addedCommit =
    git(['log', '--diff-filter=A', '--format=%cs', '--', file])
      .split('\n')
      .filter(Boolean)
      .at(-1) ?? '';

  const sourceDate = dirty || !ISO_DATE.test(lastCommit) ? today() : lastCommit;
  const dataDates = (PAGE_DATA[pagePath] ?? []).map(datasetLastVerified);
  const modified = [sourceDate, ...dataDates].sort().at(-1);
  const published = ISO_DATE.test(addedCommit) && addedCommit <= modified ? addedCommit : modified;

  const result = { published, modified };
  dateCache.set(pagePath, result);
  return result;
}
