#!/usr/bin/env node
/**
 * Generate per-page Open Graph cards (1200×630) into public/og/.
 *
 *   node scripts/generate-og.mjs            # all tool pages + home
 *   node scripts/generate-og.mjs --only sss-contribution-table
 *
 * Renders an HTML card per page with headless Chrome (same approach as the
 * FB cards in marketing/fb-cards), then palette-optimises the PNG with Pillow
 * when python3 + PIL are available. Re-run whenever a page label/blurb in
 * src/lib/pages.ts changes. Node ≥ 22.18 (type-stripping) required.
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOL_PAGES } from '../src/lib/pages.ts';
import { SITE } from '../site.config.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public/og');
const CHROME =
  process.env.CHROME_BIN ??
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(
    existsSync,
  );
if (!CHROME) {
  console.error('generate-og: no Chrome binary found — set CHROME_BIN');
  process.exit(1);
}

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const { accent, accentStrong, accentSoft } = SITE.palette;

const LOGO = `<svg width="64" height="64" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="7" fill="${accent}"/><path d="M12 7 h7.2 a5.8 5.8 0 0 1 0 11.6 H15 V25 h-3 Z M15 10 v5.6 h4.2 a2.8 2.8 0 0 0 0-5.6 Z" fill="#fff"/><rect x="9" y="11" width="14" height="1.9" fill="#fff"/><rect x="9" y="14.4" width="14" height="1.9" fill="#fff"/></svg>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card({ kicker, title, blurb, url }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
         background: linear-gradient(160deg, ${accentSoft} 0%, #ffffff 48%, ${accentSoft} 100%);
         padding: 64px 72px 56px; display: flex; flex-direction: column; position: relative; color: #1c2733; }
  .band { position: absolute; top: 0; left: 0; right: 0; height: 14px; background: ${accent}; }
  .kicker { font-size: 24px; font-weight: 700; color: ${accent}; letter-spacing: 2px; text-transform: uppercase; }
  h1 { font-size: 66px; font-weight: 800; line-height: 1.08; margin-top: 18px; letter-spacing: -0.5px; }
  .blurb { font-size: 30px; line-height: 1.4; color: #5b6b7b; margin-top: 22px; max-width: 980px; }
  .footer { margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand .name { font-size: 36px; font-weight: 800; }
  .brand .tag { font-size: 20px; color: #5b6b7b; margin-top: 2px; }
  .url { font-size: 26px; font-weight: 700; color: ${accentStrong}; }
</style></head><body>
  <div class="band"></div>
  <div class="kicker">${esc(kicker)}</div>
  <h1>${esc(title)}</h1>
  <div class="blurb">${esc(blurb)}</div>
  <div class="footer">
    <div class="brand">${LOGO}<div><div class="name">${esc(SITE.name)}</div><div class="tag">Independent Philippine payroll calculators</div></div></div>
    <div class="url">${esc(url)}</div>
  </div>
</body></html>`;
}

const jobs = [
  {
    slug: 'home',
    kicker: 'Free · Independent · Official 2026 rates',
    title: 'Philippines Payroll & Contribution Calculators',
    blurb: SITE.description,
    url: SITE.domain,
  },
  ...Object.values(TOOL_PAGES).map((t) => ({
    slug: t.href.replace(/\//g, ''),
    kicker: 'Free · Independent · Official 2026 rates',
    title: t.label,
    blurb: t.blurb,
    url: `${SITE.domain}${t.href}`,
  })),
].filter((j) => !only || j.slug === only);


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Headless Chrome on macOS often lingers after writing the screenshot: poll for a
 *  stable PNG, then kill the process ourselves. */
async function shoot(html, png, profile) {
  rmSync(png, { force: true });
  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--user-data-dir=${profile}`,
      '--window-size=1200,630',
      `--screenshot=${png}`,
      `file://${html}`,
    ],
    { stdio: 'ignore' },
  );
  const deadline = Date.now() + 20_000;
  let lastSize = -1;
  try {
    while (Date.now() < deadline) {
      await sleep(250);
      if (!existsSync(png)) continue;
      const size = statSync(png).size;
      if (size > 0 && size === lastSize) return;
      lastSize = size;
    }
    throw new Error(`generate-og: Chrome did not produce ${png} within 20s`);
  } finally {
    proc.kill('SIGKILL');
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const work = mkdtempSync(path.join(tmpdir(), 'aytool-og-'));
const profile = path.join(work, 'profile');

for (const job of jobs) {
  const html = path.join(work, `${job.slug}.html`);
  const png = path.join(OUT_DIR, `${job.slug}.png`);
  writeFileSync(html, card(job));
  await shoot(html, png, profile);
  try {
    execFileSync(
      'python3',
      [
        '-c',
        'import sys;from PIL import Image;p=sys.argv[1];im=Image.open(p).convert("RGB").quantize(colors=96,method=Image.Quantize.MEDIANCUT);im.save(p,optimize=True)',
        png,
      ],
      { stdio: 'ignore' },
    );
  } catch {
    /* Pillow unavailable — keep Chrome's PNG as-is */
  }
  console.log(`og: ${path.relative(ROOT, png)}`);
}
rmSync(work, { recursive: true, force: true });
