import { describe, expect, it } from 'vitest';
import prcJson from '../data/prc/2026.json';
import type { PrcExamEntry } from './rules/types';
import { examLabel, upcomingExams } from './prcUpcoming';

const exams = prcJson.exams as PrcExamEntry[];

describe('upcomingExams', () => {
  const list = upcomingExams(exams, '2026-10-08', 30);

  it('keeps an exam until its last day and flags it as under way', () => {
    const ple = list.find((u) => u.entry.exam === 'Physicians (PLE, 2nd exam)');
    expect(ple).toMatchObject({ inProgress: true, href: '/physician-board-exam-schedule/' });
    expect(upcomingExams(exams, '2026-10-12', 30).some((u) => u.entry.exam.startsWith('Physicians'))).toBe(false);
  });

  it('is in date order, inside the window, one row per profession', () => {
    const firsts = list.map((u) => u.entry.first_date);
    expect([...firsts].sort()).toEqual(firsts);
    expect(firsts.every((d) => d <= '2026-11-07')).toBe(true);
    const labels = list.map((u) => u.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(list.find((u) => u.entry.exam.startsWith('Certified Public Accountants'))?.href).toBe('/cpa-board-exam-schedule/');
  });

  it('labels exams without a profession page by their PRC name, minus the round marker', () => {
    expect(examLabel('Real Estate Consultants (Revalida, 2nd exam)')).toBe('Real Estate Consultants (Revalida)');
    expect(examLabel('Electronics Technicians (2nd exam)')).toBe('Electronics Technicians');
    expect(examLabel('Naval Architects')).toBe('Naval Architects');
  });
});
