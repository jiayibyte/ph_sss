/**
 * "On this page" table of contents for long pages. Gives every <h2> in the
 * rendered body an id (keeping ids already set) and lists them, so the page has
 * named anchors — what Google needs for "Jump to" links in a result and Bing for
 * deep links, and a shortcut on a long mobile page.
 */
export interface TocEntry {
  id: string;
  text: string;
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'" };

/** Heading HTML → plain text (tags dropped, the common entities decoded, whitespace collapsed). */
export function headingText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|#x27);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/₱/g, 'php-')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    .replace(/-$/, '');
}

/**
 * Add ids to the <h2> elements of `html` and collect them in order. `reserved`
 * are ids used elsewhere on the page (never generated twice).
 */
export function withHeadingIds(html: string, reserved: string[] = []): { html: string; toc: TocEntry[] } {
  const used = new Set(reserved);
  const toc: TocEntry[] = [];
  const out = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (_m, attrs: string | undefined, inner: string) => {
    let a = attrs ?? '';
    const text = headingText(inner);
    let id = /\sid="([^"]+)"/.exec(a)?.[1];
    if (!id) {
      const base = slugify(text) || 'section';
      id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      a = `${a} id="${id}"`;
    }
    used.add(id);
    toc.push({ id, text });
    return `<h2${a}>${inner}</h2>`;
  });
  return { html: out, toc };
}
