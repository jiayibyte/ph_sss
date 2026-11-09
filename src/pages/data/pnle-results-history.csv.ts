import type { APIRoute } from 'astro';
import history from '../../data/prc/pnle-history.json';
import { csvDocument } from '../../lib/csv';

export const GET: APIRoute = () => new Response(csvDocument(
  ['round', 'first_exam_date', 'exam_dates_display', 'results_released', 'working_days_to_results', 'examinees', 'passers', 'pass_rate_percent', 'note', 'source_url', 'verified_via', 'dataset_last_verified'],
  history.rounds.map((r) => [r.round, r.first_date, r.exam_dates_display, r.results_released,
    r.working_days_to_results, r.examinees, r.passers, r.pass_rate, r.note, r.source_url, r.verified_via, history.meta.last_verified]),
), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="aytool-pnle-results-history.csv"' } });
