/**
 * Machine-readable copy of the regional minimum wage data — the `distribution`
 * target of the Dataset schema on /minimum-wage-philippines/.
 */
import type { APIRoute } from 'astro';
import wagesJson from '../../data/wages/2026.json';
import type { WageRules } from '../../lib/rules/types';
import { wagesAsOf } from '../../lib/engine/wages';
import { todayInManila } from '../../lib/today.mjs';
import { SITE } from '../../../site.config';

const wages = wagesJson as unknown as WageRules;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        about: {
          publisher: SITE.name,
          page: `${SITE.url}/minimum-wage-philippines/`,
          official_source: wages.meta.official_source_url,
          note: 'Transcribed from NWPC summaries and the regional wage orders; verify with the regional board before relying on a rate.',
          regions_note: 'regions[] lists the rates in force when this file was built (rebuilt daily); a region\'s upcoming entry takes over on its effectivity date. The ncr block keeps the record of NCR-26, NCR-27 and NCR-28.',
        },
        ...wagesAsOf(wages, todayInManila()),
      },
      null,
      0,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
