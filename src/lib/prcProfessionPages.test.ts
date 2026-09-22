import { describe, expect, it } from 'vitest';
import prcJson from '../data/prc/2026.json';
import type { PrcExamEntry } from './rules/types';
import { PAGE_DATA, PAGE_SOURCE } from './lastmod.mjs';
import { TOOL_PAGES } from './pages';
import { PROFESSION_PAGES } from './prcProfessionPages';
import { PRC_PROFESSIONS, resolveGroup } from './prcProfessions';

const byName = new Map((prcJson.exams as PrcExamEntry[]).map((e) => [e.exam, e]));

describe('profession pages config', () => {
  it('covers exactly the dynamic routes lastmod knows about, each with a TOOL_PAGES entry', () => {
    const paths = PROFESSION_PAGES.map((p) => `/${p.slug}-board-exam-schedule/`).sort();
    expect(paths).toEqual(Object.keys(PAGE_SOURCE).sort());
    for (const p of PROFESSION_PAGES) {
      const path = `/${p.slug}-board-exam-schedule/`;
      expect(TOOL_PAGES[p.toolKey]?.href, `${p.slug} toolKey`).toBe(path);
      expect((PAGE_DATA as Record<string, string[]>)[path], `${p.slug} PAGE_DATA`).toContain('prc');
      const group = PRC_PROFESSIONS.find((g) => g.id === p.groupId);
      expect(group, `${p.slug} groupId`).toBeDefined();
      expect(group!.href, `${p.slug} group href`).toBe(path);
      expect(() => resolveGroup(group!, byName, prcJson.year)).not.toThrow();
    }
  });

  it('keeps SEO fields within limits and every legal statement cited', () => {
    for (const p of PROFESSION_PAGES) {
      expect(p.title.length, `${p.slug} title`).toBeLessThanOrEqual(60);
      if (p.description) expect(p.description.length, `${p.slug} description`).toBeLessThanOrEqual(158);
      for (const c of [p.law, p.passing.cite, p.parts.cite, p.requirements.cite, p.retake?.cite].filter(Boolean)) {
        expect(c!.url).toMatch(
          /^https:\/\/(lawphil\.net|www\.officialgazette\.gov\.ph|www\.prc\.gov\.ph|elibrary\.judiciary\.gov\.ph)\//,
        );
        expect(c!.label.length).toBeGreaterThan(3);
      }
      expect(p.requirements.items.length).toBeGreaterThanOrEqual(2);
      expect(p.passing.text).toMatch(/\d{2}%/);
    }
  });

  it('has unique slugs and tool keys', () => {
    const slugs = PROFESSION_PAGES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const keys = PROFESSION_PAGES.map((p) => p.toolKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
