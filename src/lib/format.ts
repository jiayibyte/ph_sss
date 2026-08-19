/** Currency & number helpers shared by engines and islands. */

export const round2 = (n: number): number => Math.round(n * 100) / 100;

/** ₱12,345.67 — always two decimals. */
export function peso(n: number): string {
  return (
    '₱' +
    n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

/** Parse a user-typed amount ("12,345.50") → number, or null when invalid. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[,\s₱]/g, '');
  if (cleaned === '') return null;
  if (!/^\d*\.?\d*$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Format with thousands separators while typing (keeps at most 2 decimals). */
export function formatWhileTyping(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (cleaned === '') return '';
  const [int, ...rest] = cleaned.split('.');
  const dec = rest.join('').slice(0, 2);
  const intFmt = int === '' ? '0' : Number(int).toLocaleString('en-PH');
  return rest.length > 0 ? `${intFmt}.${dec}` : intFmt;
}
