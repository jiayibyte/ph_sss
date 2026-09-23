/**
 * Embed snippets for the /embed/<slug>/ pages — shared by the "Embed this
 * calculator" box on each tool page and the /free-calculator-widgets/ hub so
 * the two never drift. The <a> line is the real backlink; the iframe alone
 * passes almost nothing. Fixed height with max-width so it degrades on phones.
 */
import { SITE } from '../../site.config';

export const EMBED_HEIGHT = 760;

/** "/sss-contribution-table/" → "sss-contribution-table" (also the OG card and embed page slug). */
export function pageSlug(pagePath: string): string {
  return pagePath.replace(/\//g, '');
}

export function embedUrl(pagePath: string): string {
  return `${SITE.url}/embed/${pageSlug(pagePath)}/`;
}

export function embedSnippet(pagePath: string, title: string): string {
  return (
    `<iframe src="${embedUrl(pagePath)}" title="${title} – AyTool" width="100%" height="${EMBED_HEIGHT}" style="max-width:720px;border:0" loading="lazy"></iframe>\n` +
    `<p><a href="${SITE.url}${pagePath}">${title}</a> by AyTool</p>`
  );
}
