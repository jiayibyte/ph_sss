import { describe, expect, it } from 'vitest';
import { headingText, slugify, withHeadingIds } from './toc';

describe('table of contents', () => {
  it('adds ids to h2s, keeps existing ones, and lists them in order', () => {
    const { html, toc } = withHeadingIds(
      '<p>x</p><h2>How It Is Calculated</h2><h2 id="ot-per-daily-rate" class="a">Overtime &amp; <em>Rates</em></h2><h3>skip</h3><h2>How It Is Calculated</h2>',
    );
    expect(toc).toEqual([
      { id: 'how-it-is-calculated', text: 'How It Is Calculated' },
      { id: 'ot-per-daily-rate', text: 'Overtime & Rates' },
      { id: 'how-it-is-calculated-2', text: 'How It Is Calculated' },
    ]);
    expect(html).toContain('<h2 id="how-it-is-calculated">How It Is Calculated</h2>');
    expect(html).toContain('<h2 id="ot-per-daily-rate" class="a">');
    expect(html).toContain('<h3>skip</h3>');
  });

  it('never reuses a reserved id', () => {
    const { toc } = withHeadingIds('<h2>FAQ</h2>', ['faq']);
    expect(toc[0]!.id).toBe('faq-2');
  });

  it('slugs peso signs, ampersands and punctuation', () => {
    expect(slugify('NCR ₱755: Rates & Rules (2026)')).toBe('ncr-php-755-rates-and-rules-2026');
    expect(headingText('  A&#39;s <strong>b</strong>\n c ')).toBe("A's b c");
  });
});
