/** RFC 4180 rows, UTF-8 BOM for common spreadsheet readers; null remains blank, not zero. */
export function csvDocument(headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>): string {
  const cell = (value: string | number | boolean | null | undefined) => {
    let text = value === null || value === undefined ? '' : String(value);
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  for (const row of rows) if (row.length !== headers.length) throw new Error('CSV row width does not match headers');
  return '\uFEFF' + [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
