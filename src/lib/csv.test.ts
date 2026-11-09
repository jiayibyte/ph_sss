import { describe, expect, it } from 'vitest';
import { csvDocument } from './csv';

describe('CSV downloads', () => {
  it('preserves commas, quotes, line breaks and Unicode inside quoted cells', () => {
    expect(csvDocument(['name', 'note'], [['PNLE, 2026', 'A "quoted" note\n₱100']]))
      .toBe('\uFEFF"name","note"\r\n"PNLE, 2026","A ""quoted"" note\n₱100"\r\n');
  });
  it('keeps missing counts distinct from zero and protects spreadsheet formula text', () => {
    expect(csvDocument(['missing', 'zero', 'text', 'number'], [[null, 0, '=1+1', -3]]))
      .toContain('"","0","\'=1+1","-3"');
  });
  it('rejects a malformed row instead of silently shifting source columns', () => {
    expect(() => csvDocument(['exam', 'source'], [['Nursing']])).toThrow('width');
  });
});
