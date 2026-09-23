import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { embedSnippet, embedUrl, pageSlug } from './embed';
import { ALL_TOOLS } from './pages';

const EMBED_DIR = path.join(process.cwd(), 'src/pages/embed');
const embedSlugs = readdirSync(EMBED_DIR)
  .filter((f) => f.endsWith('.astro'))
  .map((f) => f.replace(/\.astro$/, ''));

describe('embed snippets', () => {
  it('point the iframe at /embed/<slug>/ and credit the full page', () => {
    const snippet = embedSnippet('/take-home-pay-calculator/', 'Take-Home Pay Calculator');
    expect(pageSlug('/take-home-pay-calculator/')).toBe('take-home-pay-calculator');
    expect(snippet).toContain(`src="${embedUrl('/take-home-pay-calculator/')}"`);
    expect(snippet).toContain('src="https://aytool.com/embed/take-home-pay-calculator/"');
    expect(snippet).toContain('<a href="https://aytool.com/take-home-pay-calculator/">Take-Home Pay Calculator</a> by AyTool');
  });

  it('exist only for pages listed in TOOL_PAGES (the widget hub resolves every one)', () => {
    const toolSlugs = new Set(ALL_TOOLS.map((t) => pageSlug(t.href)));
    expect(embedSlugs.length).toBeGreaterThan(0);
    expect(embedSlugs.filter((s) => !toolSlugs.has(s))).toEqual([]);
  });
});
