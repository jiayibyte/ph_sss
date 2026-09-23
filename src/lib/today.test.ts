import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { todayInManila } from './today.mjs';

describe('todayInManila', () => {
  // Independent of the ambient environment: a build run with AYTOOL_TODAY set
  // (previews, the server's date simulation) must not change these results.
  let saved: string | undefined;
  beforeEach(() => {
    saved = process.env.AYTOOL_TODAY;
    delete process.env.AYTOOL_TODAY;
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.AYTOOL_TODAY;
    else process.env.AYTOOL_TODAY = saved;
  });

  it('uses the Philippine calendar day, not UTC', () => {
    // 00:30 in Manila is still the previous day in UTC.
    expect(todayInManila(new Date('2026-09-22T16:30:00Z'))).toBe('2026-09-23');
    expect(todayInManila(new Date('2026-09-23T15:59:00Z'))).toBe('2026-09-23');
    expect(todayInManila(new Date('2026-12-31T16:00:00Z'))).toBe('2027-01-01');
  });

  it('honours a valid AYTOOL_TODAY override and ignores a malformed one', () => {
    process.env.AYTOOL_TODAY = '2026-09-28';
    expect(todayInManila()).toBe('2026-09-28');
    process.env.AYTOOL_TODAY = 'tomorrow';
    expect(todayInManila(new Date('2026-09-22T16:30:00Z'))).toBe('2026-09-23');
  });
});
