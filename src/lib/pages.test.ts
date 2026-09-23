import { describe, expect, it } from 'vitest';
import { CATEGORY_KEYS, TOOL_PAGES } from './pages';

describe('page categories', () => {
  it('list every TOOL_PAGES entry exactly once', () => {
    const listed = Object.values(CATEGORY_KEYS).flat();
    expect(new Set(listed).size).toBe(listed.length);
    expect([...listed].sort()).toEqual(Object.keys(TOOL_PAGES).sort());
  });
});
