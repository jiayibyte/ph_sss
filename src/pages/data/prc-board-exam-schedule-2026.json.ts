/**
 * Machine-readable copy of the PRC 2026 exam schedule — the `distribution`
 * target of the Dataset schema on /prc-board-exam-schedule/ (and the PNLE page).
 * Same JSON the page renders, so it can never disagree with the table.
 */
import type { APIRoute } from 'astro';
import prcRules from '../../data/prc/2026.json';
import { SITE } from '../../../site.config';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        about: {
          publisher: SITE.name,
          page: `${SITE.url}/prc-board-exam-schedule/`,
          official_source: prcRules.meta.official_source_url,
          note: 'Transcribed from the official PRC resolution; verify on prc.gov.ph before relying on a date.',
        },
        ...prcRules,
      },
      null,
      0,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
