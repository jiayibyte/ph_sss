/**
 * Crawl-facing audit of dist/ — run after `astro build`.
 *
 * Every finding here corresponds to a row that would otherwise show up in the
 * Search Console "Page indexing" report:
 *
 *   - a link or schema URL that is missing its trailing slash / carries
 *     /index.html / has a duplicate slash  -> "Page with redirect"
 *   - a link or schema URL with no file behind it                -> "Not found (404)"
 *   - a noindex page that still advertises its own URL (canonical,
 *     og:url, WebPage.url, BreadcrumbList item)                  -> "Not found (404)",
 *     because rel=canonical and schema URLs are crawl hints and /404/ is
 *     not a routable URL (the 404 page is served as /404.html)
 *   - an indexable page missing from the sitemap, or a sitemap URL that is
 *     noindex                                                    -> silently missing from the index
 *
 * Exits non-zero on any finding, so `make build` fails before a deploy.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.cwd(), 'dist');
const ORIGIN = 'https://aytool.com';

const findings = [];
const fail = (file, msg) => findings.push(`${file}: ${msg}`);

/** Every .html file in dist, as { file: relative path, url: the URL it serves }. */
function htmlPages(dir = DIST) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) {
      out.push(...htmlPages(abs));
    } else if (name.endsWith('.html')) {
      const rel = path.relative(DIST, abs);
      // index.html is served as the directory URL; any other .html as itself.
      const url = rel === 'index.html' ? '/' : '/' + rel.replace(/index\.html$/, '');
      out.push({ file: rel, url });
    }
  }
  return out;
}

/** Does a URL path resolve to something dist actually serves? */
function resolves(urlPath) {
  const p = urlPath.replace(/[?#].*$/, '');
  const abs = path.join(DIST, p);
  if (p.endsWith('/')) return existsSync(path.join(abs, 'index.html'));
  return existsSync(abs);
}

/** Would nginx 301 this URL path instead of serving it? */
function redirectReason(urlPath) {
  const p = urlPath.replace(/[?#].*$/, '');
  if (p.includes('//')) return 'duplicate slash';
  if (p.endsWith('/index.html')) return '/index.html suffix';
  // Extension-less and not directory-style -> nginx appends the trailing slash.
  if (p !== '/' && !p.endsWith('/') && !path.basename(p).includes('.')) return 'missing trailing slash';
  return null;
}

const pages = htmlPages();
const indexable = [];

for (const { file, url } of pages) {
  const html = readFileSync(path.join(DIST, file), 'utf8');
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;
  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1] ?? null;

  // --- Self-URL advertising ---
  if (noindex) {
    if (canonical) fail(file, `noindex page advertises rel=canonical (${canonical})`);
    if (ogUrl) fail(file, `noindex page advertises og:url (${ogUrl})`);
    for (const m of html.matchAll(/"(?:url|item)":"([^"]+)"/g)) {
      if (m[1] === `${ORIGIN}${url}` || m[1] === `${ORIGIN}/404/`) {
        fail(file, `noindex page advertises its own URL in JSON-LD (${m[1]})`);
      }
    }
  } else {
    indexable.push(url);
    if (canonical !== `${ORIGIN}${url}`)
      fail(file, `canonical is ${canonical ?? 'missing'}, expected ${ORIGIN}${url}`);
    if (ogUrl !== `${ORIGIN}${url}`)
      fail(file, `og:url is ${ogUrl ?? 'missing'}, expected ${ORIGIN}${url}`);
  }

  // --- Every URL this page points at must be canonical and must resolve ---
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src|content|contentUrl)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/"(?:url|item|contentUrl|logo|isPartOf)":"([^"]+)"/g)) refs.add(m[1]);

  for (const ref of refs) {
    let p;
    if (ref.startsWith(`${ORIGIN}/`)) p = ref.slice(ORIGIN.length);
    else if (ref === ORIGIN) {
      fail(file, `origin without trailing slash (${ref}) — must be ${ORIGIN}/ to match the home canonical`);
      continue;
    } else if (ref.startsWith('/')) p = ref;
    else continue; // external, #fragment, mailto:, data:

    const reason = redirectReason(p);
    if (reason) fail(file, `link would 301 (${reason}): ${ref}`);
    else if (!resolves(p)) fail(file, `link has no file behind it (404): ${ref}`);
  }
}

// --- Sitemap must be exactly the indexable set ---
const sitemapFile = path.join(DIST, 'sitemap-0.xml');
if (!existsSync(sitemapFile)) {
  fail('sitemap-0.xml', 'missing');
} else {
  const locs = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const inSitemap = new Set(locs.map((l) => l.replace(ORIGIN, '')));
  const shouldBe = new Set(indexable);
  for (const url of shouldBe) if (!inSitemap.has(url)) fail('sitemap-0.xml', `indexable page missing: ${url}`);
  for (const url of inSitemap) if (!shouldBe.has(url)) fail('sitemap-0.xml', `lists a non-indexable URL: ${url}`);
  if (locs.length !== new Set(locs).size) fail('sitemap-0.xml', 'contains duplicate <loc> entries');
}

if (findings.length > 0) {
  console.error(`\n✗ dist audit: ${findings.length} finding(s)\n`);
  for (const f of findings) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}
console.log(`✓ dist audit: ${pages.length} pages, ${indexable.length} indexable, all crawl-facing URLs canonical`);
