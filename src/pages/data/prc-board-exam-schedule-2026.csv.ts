import type { APIRoute } from 'astro';
import rules from '../../data/prc/2026.json';
import type { PrcExamEntry } from '../../lib/rules/types';
import { csvDocument } from '../../lib/csv';

export const GET: APIRoute = () => new Response(csvDocument(
  ['exam', 'exam_dates_display', 'first_exam_date', 'filing_opens', 'filing_deadline', 'results_target', 'results_released', 'passers', 'examinees', 'results_note', 'exam_note', 'calendar_source_url', 'results_source_url', 'dataset_last_verified'],
  (rules.exams as PrcExamEntry[]).map((e) => [e.exam, e.dates_display, e.first_date, e.application_start,
    e.application_deadline, e.results_target, e.results_released, e.passers, e.examinees, e.results_note, e.note,
    rules.meta.official_source_url, e.results_url, rules.meta.last_verified]),
), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="aytool-prc-exams-2026.csv"' } });
