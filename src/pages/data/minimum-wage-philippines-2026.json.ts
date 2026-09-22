/**
 * Machine-readable copy of the regional minimum wage data — the `distribution`
 * target of the Dataset schema on /minimum-wage-philippines/.
 */
import type { APIRoute } from 'astro';
import wages from '../../data/wages/2026.json';
import { SITE } from '../../../site.config';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        about: {
          publisher: SITE.name,
          page: `${SITE.url}/minimum-wage-philippines/`,
          official_source: wages.meta.official_source_url,
          note: 'Transcribed from NWPC summaries and the regional wage orders; verify with the regional board before relying on a rate.',
        },
        ...wages,
      },
      null,
      0,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
